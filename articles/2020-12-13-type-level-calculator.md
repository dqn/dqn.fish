---
title: TypeScript で実装する型レベル電卓
published: 2020-12-13T00:00:00+0900 # will be...
---

これは [TypeScript Advent Calendar 2020](https://qiita.com/advent-calendar/2020/typescript) の 13 日目の記事です。

何番煎じかわかりませんが、TypeScript 4.1 が正式にリリースされ [Template Literal Types](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#template-literal-types) と [Recursive Conditional Types](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#recursive-conditional-types) が追加され、より複雑な型を表現できるようになったので実装してみます。

この記事での目標は、次のような型を実装することです。

```ts
type Result1 = Calculate<"1 + 2">; // 3
type Result2 = Calculate<"4 + 12 / 3">; // 8
type Result3 = Calculate<"(2 + 3) * 3 - 5">; // 10
```

注意:

- 負の数は扱いません
- 差が負になる場合は 0 とします
- 除算の結果は常に商のみをとります
- この記事のやり方でそのまま実装しても、再帰制限の都合でコンパイルエラーになります
  - 理解しやすさを優先するため、この記事では再帰回数を抑える書き方、再帰上限を突破する書き方はしません
  - 手軽に試したい方は[再帰制限を無効化](https://qiita.com/kgtkr/items/eff20225e4bf9b159110)することをお勧めします（ただし、自己責任でお願いします）

実装の流れ:

- 整数リテラル型同士の演算
- トークナイズ（字句解析）
- パース（構文解析）
- 評価

## 整数リテラル型同士の演算

タプル型を使います。

### 加算

例えば、2 + 3 をしたい場合は要素数が 2 のタプル型と要素数が 3 のタプル型を連結し、その要素数を返すことで 5 が得られます。要素の型は `never` にしていますが、他の型でも問題ありません。

```ts
type TwoElementsTuple = [never, never];
type ThreeElementsTuple = [never, never, never];

type Result = [...TwoElementsTuple, ...ThreeElementsTuple]["length"]; // 5
```

しかし、実際には整数リテラル型から動的に任意の要素数のタプル型を生成する必要があります。これは、タプル型の要素数が目的の数と等しくなるまで再帰的に要素数を増やすことで実現できます。

```ts
type MakeTupleByLength<
  Length extends number,
  Tuple extends never[] = []
> = Tuple["length"] extends Length
  ? Tuple
  : MakeTupleByLength<Length, [...Tuple, never]>;

type TwoElementsTuple = MakeTupleByLength<2>; // [never, never]
```

これらを組み合わせて、整数リテラル型の加算は次のように表せます。

```ts
type AddTupleLength<A extends any[], B extends any[]> = [...A, ...B]["length"];

// number 型に推論させるために Extract を使っている。
type Add<A extends number, B extends number> = Extract<
  AddTupleLength<MakeTupleByLength<A>, MakeTupleByLength<B>>,
  number
>;

type Result = Add<2, 3>; // 5
```

### 減算

減算は、右辺値の要素数が 0 になるまで両辺の要素を 1 つずつ減らしていき、残った左辺値の要素数を返すことで実現できます。ただし、この方法では負の数は表せないので、結果が負になる場合は 0 とすることにします。そのため、再帰の終了条件を「右辺値が 0 になるまで」ではなく「右辺値または左辺値が 0 になるまで」にしています。

タプルの要素を 1 つ減らす `DecrementTupleLength` 型を用意します。

```ts
type DecrementTupleLength<A extends any[]> = A extends [infer _, ...infer Rest]
  ? Rest
  : never;
```

減算は次のようにして表せます。

```ts
type SubTupleLength<A extends any[], B extends any[]> = 0 extends
  | A["length"]
  | B["length"]
  ? A["length"]
  : SubTupleLength<DecrementTupleLength<A>, DecrementTupleLength<B>>;

type Sub<A extends number, B extends number> = Extract<
  SubTupleLength<MakeTupleByLength<A>, MakeTupleByLength<B>>,
  number
>;

type Result1 = Sub<3, 2>; // 1
type Result2 = Sub<2, 3>; // 0
```

### 乗算

乗算は、初期値が要素数 0 のタプル型に左辺値の要素をすべて加えて右辺値の要素を 1 つ減らすのを右辺値の要素数が 0 になるまで繰り返します。最終的に出来上がったタプル型の要素数が求めたい値になります。

```ts
type MulTupleLength<
  A extends any[],
  B extends any[],
  Result extends any[] = []
> = B["length"] extends 0
  ? Result["length"]
  : MulTupleLength<A, DecrementTupleLength<B>, [...Result, ...A]>;

type Mul<A extends number, B extends number> = Extract<
  MulTupleLength<MakeTupleByLength<A>, MakeTupleByLength<B>>,
  number
>;

type Result = Mul<3, 5>; // 15
```

### 除算

除算は、左辺値の要素数から右辺値の要素数を何回引けるかをカウントすることで実現できます。冒頭でも述べた通り、少数点以下は考慮しません。右辺値の要素数が 0 になった場合は右辺値の要素を復元しないといけないので、`BOrig` でオリジナルの `B`（右辺値）を保持しています。ゼロ除算が行われようとしたときは `never` 型を返します。

```ts
type DivTupleLength<
  A extends any[],
  B extends any[],
  Result extends any[] = [],
  BOrig extends any[] = B
> = BOrig["length"] extends 0
  ? never
  : B["length"] extends 0
  ? DivTupleLength<A, BOrig, [...Result, never], BOrig>
  : A["length"] extends 0
  ? Result["length"]
  : DivTupleLength<
      DecrementTupleLength<A>,
      DecrementTupleLength<B>,
      Result,
      BOrig
    >;

type Div<A extends number, B extends number> = Extract<
  DivTupleLength<MakeTupleByLength<A>, MakeTupleByLength<B>>,
  number
>;

type Result1 = Div<7, 3>; // 2
type Result2 = Div<3, 0>; // never
```

ここまで来たら次のような計算ができるようになっているはずです。

```ts
type Result = Mul<Add<2, 3>, Div<6, Sub<3, 1>>>; // 15
```

## トークナイズ（字句解析）

Template Literal Types を使って文字列リテラル型をトークンの配列型に変換していきます。

`Token` 型の定義を下に示します。

```ts
type Operator = "+" | "-" | "*" | "/" | "(" | ")";

type Token = { type: Operator } | { type: "number"; value: number };
```

この節では、次のように `string` 型を受け取り、`Token[]` 型に変換する `Tokenize` 型を定義します。

```ts
type Tokens = Tokenize<"(2 + 3) * 3 - 5">;
// [
//   { type: "(" },
//   { type: "number"; value: 2 },
//   { type: "+" },
//   { type: "number"; value: 3 },
//   { type: ")" },
//   { type: "*" },
//   { type: "number"; value: 3 },
//   { type: "-" },
//   { type: "number"; value: 5 }
// ]
```

整数のトークナイズは少し複雑なのでとりあえず無視して、整数以外のトークナイズを考えます。受け取った文字列を先頭の 1 文字と残りの文字列に分解し、先頭の文字を見てそれぞれのトークンを生成しています。空白文字はスキップします。有効でないトークンがきた場合は `never` 型を返します（`Tokens` を引き回しているのはこれをやりたいからです）。これを文字列が空になるまで繰り返します。文字列が空になったら、出来上がった `Tokens` を返すことで整数以外のトークナイズは実現できます。

```ts
type Tokenize<
  S extends string,
  Tokens extends Token[] = []
> = S extends `${infer C}${infer Rest}`
  ? C extends "+"
    ? Tokenize<Rest, [...Tokens, { type: "+" }]>
    : C extends "-"
    ? Tokenize<Rest, [...Tokens, { type: "-" }]>
    : C extends "*"
    ? Tokenize<Rest, [...Tokens, { type: "*" }]>
    : C extends "/"
    ? Tokenize<Rest, [...Tokens, { type: "/" }]>
    : C extends "("
    ? Tokenize<Rest, [...Tokens, { type: "(" }]>
    : C extends ")"
    ? Tokenize<Rest, [...Tokens, { type: ")" }]>
    : C extends " "
    ? Tokenize<Rest, Tokens>
    : never
  : Tokens;

type Tokens = Tokenize<"+- (*/)">;
// [
//   { type: "+" },
//   { type: "-" },
//   { type: "(" },
//   { type: "*" },
//   { type: "/" },
//   { type: ")" },
// ];
```

整数は他のトークンと違い、複数の文字から成り立っている場合があります。数字が来た場合には、その値を暫定的な値として保持しておきます。次の文字がまた数字の場合は、保持している値を 10 倍し、現在の値を加算します。これを数字以外が来るまで繰り返し、数字以外が来たところでその値を確定します。

コードに落とすと、次のようになります。

```ts
type CarryUp<N> = N extends number ? Mul<N, 10> : 0;

type Tokenize<
  S extends string,
  Tokens extends Token[] = [],
  Value extends number | null = null
> = S extends `${infer C}${infer Rest}`
  ? C extends "0"
    ? Tokenize<Rest, Tokens, CarryUp<Value>>
    : C extends "1"
    ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 1>>
    : C extends "2"
    ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 2>>
    : C extends "3"
    ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 3>>
    : C extends "4"
    ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 4>>
    : C extends "5"
    ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 5>>
    : C extends "6"
    ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 6>>
    : C extends "7"
    ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 7>>
    : C extends "8"
    ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 8>>
    : C extends "9"
    ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 9>>
    : Value extends number // 暫定的な値を持っている場合は確定する。
    ? Tokenize<S, [...Tokens, { type: "number"; value: Value }]>
    : C extends "+"
    ? Tokenize<Rest, [...Tokens, { type: "+" }]>
    : C extends "-"
    ? Tokenize<Rest, [...Tokens, { type: "-" }]>
    : C extends "*"
    ? Tokenize<Rest, [...Tokens, { type: "*" }]>
    : C extends "/"
    ? Tokenize<Rest, [...Tokens, { type: "/" }]>
    : C extends "("
    ? Tokenize<Rest, [...Tokens, { type: "(" }]>
    : C extends ")"
    ? Tokenize<Rest, [...Tokens, { type: ")" }]>
    : C extends " "
    ? Tokenize<Rest, Tokens>
    : never
  : Value extends number
  ? [...Tokens, { type: "number"; value: Value }]
  : Tokens;

type Tokens = Tokenize<"16 / 8 * (123 - 70)">;
// [
//   { type: "number"; value: 16 },
//   { type: "/" },
//   { type: "number"; value: 8 },
//   { type: "*" },
//   { type: "(" },
//   { type: "number"; value: 123 },
//   { type: "-" },
//   { type: "number"; value: 70 },
//   { type: ")" }
// ]
```

共通部分をまとめて、次のように書くこともできます。

```ts
type NumberTable = {
  "0": 0;
  "1": 1;
  "2": 2;
  "3": 3;
  "4": 4;
  "5": 5;
  "6": 6;
  "7": 7;
  "8": 8;
  "9": 9;
};

type Tokenize<
  S extends string,
  Tokens extends Token[] = [],
  Value extends number | null = null
> = S extends `${infer C}${infer Rest}`
  ? C extends keyof NumberMap
    ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, NumberMap[C]>>
    : Value extends number
    ? Tokenize<S, [...Tokens, { type: "number"; value: Value }]>
    : C extends Operator
    ? Tokenize<Rest, [...Tokens, { type: C }]>
    : C extends " "
    ? Tokenize<Rest, Tokens>
    : never
  : Value extends number
  ? [...Tokens, { type: "number"; value: Value }]
  : Tokens;
```

## パース（構文解析）

再帰下降構文解析を使ってパースし、AST をつくります。今回扱う数式を EBNF を使って表すと次のようになります。

```
expr    = term ("+" term | "-" term)*
term    = primary ("*" primary | "/" primary)*
primary = num | "(" expr ")"
```

`expr` は、最初に `term` を 1 つとり、`"+" term` または `"-" term` を 0 回以上繰り返します。加減算は左結合である（左から右へ順番に計算される）必要がありますが、愚直に再帰で実装しようとすると難しいので、繰り返しの部分は切り出しています。`ExprLoop` は部分木を返すのではなく、型引数で木全体を受け取り、それに手を加えていき、繰り返しが終わったときに完成された木を返します。また、トークンをどこまで読んだかを知る必要があるため、返される型は `[AST, Token[]]` なタプル型になっています。`lhs`、`rhs` はそれぞれ left-hand side、right-hand side を意味しています。

```ts
type ExprLoop<AST, Tokens> = Tokens extends [{ type: "+" | "-" }, ...infer Rest]
  ? Term<Rest> extends [infer Result, infer Rest]
    ? ExprLoop<{ type: Tokens[0]["type"]; lhs: AST; rhs: Result }, Rest>
    : never
  : [AST, Tokens];

type Expr<Tokens> = Term<Tokens> extends [infer Result, infer Rest]
  ? ExprLoop<Result, Rest>
  : never;
```

ちなみに `AST` は次を満たすような型を想定していますが、型引数に `extends` による制約つけると、制約満たすことを確認するために冗長なコードが生まれるので今回はつけていません。

```ts
type ASTNode =
  | { type: "+" | "-" | "*" | "/"; lhs: ASTNode; rhs: ASTNode }
  | { type: "number"; value: number };
```

`term` は `expr` とほぼ同じです。

```ts
type TermLoop<AST, Tokens> = Tokens extends [{ type: "*" | "/" }, ...infer Rest]
  ? Primary<Rest> extends [infer Result, infer Rest]
    ? TermLoop<{ type: Tokens[0]["type"]; lhs: AST; rhs: Result }, Rest>
    : never
  : [AST, Tokens];

type Term<Tokens> = Primary<Tokens> extends [infer Result, infer Rest]
  ? TermLoop<Result, Rest>
  : never;
```

`primary` は `num` または `"(" expr ")"` です。次のトークンが整数である場合、その値が結果になります。次のトークンが `"("` である場合、`expr` をパースしたあとに `")"` が来ることを確認します。

```ts
type Primary<Tokens> = Tokens extends [
  { type: "number"; value: infer Value },
  ...infer Rest
]
  ? [{ type: "number"; value: Value }, Rest]
  : Tokens extends [{ type: "(" }, ...infer Rest]
  ? Expr<Rest> extends [infer Result, [{ type: ")" }, ...infer Rest]]
    ? [Result, Rest]
    : never
  : never;
```

パースのエントリポイントも作ります。パースが終わったときにトークンが残っていないことも確認します。

```ts
type Parse<Tokens extends Token[]> = Expr<Tokens> extends [
  infer Result,
  infer Rest
]
  ? Rest extends { length: 0 }
    ? Result
    : never
  : never;
```

ここまで来たら次のようなパースができるようになっているはずです。

```ts
type AST = Parse<Tokenize<"1 + 2 * 3 / (3 - 1)">>;
// {
//   type: "+";
//   lhs: {
//     type: "number";
//     value: 1;
//   }
//   rhs: {
//     type: "/";
//     lhs: {
//       type: "*";
//       lhs: {
//         type: "number";
//         value: 2;
//       }
//       rhs: {
//         type: "number";
//         value: 3;
//       }
//     }
//     rhs: {
//       type: "-";
//       lhs: {
//         type: "number";
//         value: 3;
//       }
//       rhs: {
//         type: "number";
//         value: 1;
//       }
//     }
//   }
// }
```

## 評価

出来上がった AST を評価します。それぞれのノードを再帰的に評価しています。特に難しいことはありません。

```ts
type Eval<A> = A extends { type: "number"; value: number }
  ? A["value"]
  : A extends { type: infer Type; lhs: infer LHS; rhs: infer RHS }
  ? Type extends "+"
    ? Add<Eval<LHS>, Eval<RHS>>
    : Type extends "-"
    ? Sub<Eval<LHS>, Eval<RHS>>
    : Type extends "*"
    ? Mul<Eval<LHS>, Eval<RHS>>
    : Type extends "/"
    ? Div<Eval<LHS>, Eval<RHS>>
    : never
  : never;
```

## 完成

それぞれの型を組み合わせて、`Calculate` 型を定義します。

```ts
type Calculate<S extends string> = Eval<Parse<Tokenize<S>>>;
```

これで型レベル電卓の完成です 🎉 🎉 🎉

```ts
type Result1 = Calculate<"1 + 2">; // 3
type Result2 = Calculate<"1+2+3-4">; // 2
type Result3 = Calculate<"2 * (7 + (8))">; // 30
type Result4 = Calculate<"5 - / 9">; // never

const num1: Calculate<"1 + 4"> = 5; // OK
const num2: Calculate<"1 + 4"> = 6; // Type '6' is not assignable to type '5'.ts(2322)

type ValidExpr<S extends string> = Calculate<S> extends never ? never : S;

function safeEval<S extends string>(expr: ValidExpr<S>): Calculate<S> {
  return eval(expr);
}

const result1 = safeEval("12 + 3"); // 15
const result2 = safeEval("12 = 3"); // Argument of type 'string' is not assignable to parameter of type 'never'.ts(2345)

declare const expr: string;

const result3 = safeEval(expr); // Argument of type 'string' is not assignable to parameter of type 'never'.ts(2345)
```
