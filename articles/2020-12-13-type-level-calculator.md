---
title: TypeScript で実装する型レベル電卓
published: 2020-12-13T00:00:00+0900 # will be...
---

これは [TypeScript Advent Calendar 2020](https://qiita.com/advent-calendar/2020/typescript) の 13 日目の記事です。

何番煎じかわかりませんが、TypeScript 4.1 が正式にリリースされ [Template Literal Types](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#template-literal-types) と [Recursive Conditional Types](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#recursive-conditional-types) が使えるようになったことでより複雑な型を表現できるようになったので実装してみます。

この記事の目標は、次のような型を実装することです。

```ts
type Result1 = Calculate<"1 + 2">; // 3
type Result2 = Calculate<"4 + 12 / 3">; // 8
type Result3 = Calculate<"(2 + 3) * 3 - 5">; // 10
```

[Playground](https://www.typescriptlang.org/play?ts=4.1.2#code/PTAEBUE8AcFMGUDGAnAltALqQ5gyHztQoxGCaDINEMg0eqA3DIJsMg1wyDfaYMrKAsAFAigAWGG0AzgFwgAJgEcAdgDoAZqh7tgAQ2QZUiADawewAEwAGXQFoAjFqMBmfRhix96gG6xV+xPNWIArqvkYA9shYtLOFAAJQ0PDENQAF5QAGEXd08MWAAeACJIgGpQLTSAPgBuUDZTAKsQsNUMLWi4hI8vVLSAFlBs42LQU3yitgAOMqDQnnDTWvjXBuT0gAoa7NMASlAAKi7QfVAAVh7isEMdf1YVlZY1qIvLq+ub27v7h8enh7PX5jXQT6-vn9+--9AAEkALIABQAMgBRYGQgBy4AAguBAQB5WFvU7vaLPHG4vH4p5nYBHQKwCruZA8BBuABGKXAeVq4FAsAAHslRIIeKAAN6gAD6-OQsEQfF5AqFIrFqFEklgyFAAFVQABfVUsT4AfnFguFovJbkp1LpisZKo1oDFzLZHK5Osl+plcoVyvNzC1SotVoKJPKoQpVPpjJi1vZsE53L5uqloDcogA1qJvAB3USq0Da-2GwNZo3wWlBxne31BYHyeOwcBuaDqABCkHB4YA5hh2LFfKkLY3RC32AAaC1Vmtkm3hu2iWD2ZAAbQAurU5yxgxBq+pp2l1D3W2l56OI6Bu72Ldqh+ovfa9WKyxXT7B64fW+3hSkH-3QNPxJ-b33QBOp7OzR9ZhBjJa9K1XO8G2bVsX2g9hl0hdlkHkRAMBSC1c0DMDb3vOCn1SV88jyAd3V-Sd5UXZhChLMkABERWFABbcMMFvV8UgRFkw33P8KIA2pOL3O1pwtJ15QFEjPk-cQxIVYYMBYWdj1ARCMGQ1CUnkn9eJnADzx0oCQNABFBEENi4I4rjbW5HS5x-WsrLHGzyN05cRNI6SEUk0BpNrRT103Xsd0M5hSVAfMaXMrc2w7SyhOcqc7NABz4rIxL+JiHRHIjC0AB9jICuCdzy5LCui4rSO1BEyqCpTSLFHkLW+aN9QiqLe3w9DSN+eiUFgZjRFYiD2IRYimp+XqmJY9qYNrPJxs+ajutVEKwra4aLME7jxxcpKUu2hK+OXTDO1I9bh1fTqvOS+aqNW8pgQ8GaYufC0tustK+O8-aPts2dvOGcJsp29KFzq5daxq7ddwO0BDkqioRiqKH2Aqz4GoWiVL1AR7VGeq6f0m-rpo26KUjmn8P0-QGqh-TyAKA74VXu0sntJ3s4thv77OBw7XNqE6us+XH8di665qXFm6NQWxRde0j3qcz7dO+3nlbsjDKiwVK-rB76UTQJs1d1mI-Ko2pawN1AmxRnc1fhj0dPPSGNyKmGPodjMLxjWiZbl1JxatptKekmmMG0lz-uSoOzXParXfK92lc9zMtdtur0d5TGWrFX3ZfZx9Ysxz4iYGoaLs2sblu+UuSYrsmKeLxHwm835LcNzGlqZqXQDz57Od+3ao5+pW-uOkVs1Oku-YLl6A-s26lqMkzBA4heBNM-vsIg3CydGn9t+HXeObmpfQvKCK15u2pzvUdjD7rKC9+InHy3Ao+n5Poie9xq+5tqEWs8UgP0giNF+IDj6zW-jRXuMs-7Lj7kAiBn8YL71fjeHeKD2Dk2gcBc+QQURwGQj4BUMQ0iZDSKAfKaR9CUOoSsOhoA0jAEYWkGYrDFhpB7vEZAyBICKmgCkWEy5YTGzcIxGk4ltS-1hD+A4RY4Y93AN4CsohUAAC9YAAHVUCtlhOIyRyAhaI21rDHgakZTB0HCo8M3JUryFEJADWpEABqLg3CwG8r7JsuixESPlEuJkNi1GaM6lpCAwSeA-hXikHhfCBEpDcaoDxL9vG6NwUZZRqiNHaN0ewQh8ovC+GMfJNW5i0A9m8lk2xasHFOP+haJJHjvKELVgU4hvhAkhmCTkzqmtzHeXct8aS1TRBRPGtJGYTSRxcwMVI98fJSRijSKIOZyAuGgFsO42AYppmqnnGKOcixW7iiWaAVpbpPjgyUT00JRczplIsZU6xqi7GwzqXOPWjTtm1FWaoVQXTwpqwAAY6AACQ8lkiYlUwLlJRgdFaW5uS9FrM0hocOETXk-mmT+HQsd6pAtSsCwwEKoXyRhXCrGMZRk5J0Si-xRjwmjKiaAHFoBDD4szvAEFWhSWynEuS2FCN4XYxpZoul7B9EMrRQMzFtjsXbJ-FoTllpCWw2BaYPlzpoVCo9CK6lSKJVSsMTKjFzKFXJM8V0FVYpuVEuaFqgV6KKXCqpfqMVyLJWoqZZEi1zTQDNBtWqj6wKtiOrks63VXt9XusNXk418pTU-nNayxV2wg12vVQANnDTqylOc5UhM9Qmxl6Lk2+tTZan8WaM0goAOy5sFfmhFhbaXxu9WWwtLK2V1trUSvojbI3NtFXG+lJqfVYsrf6vofb1UAE5B3mJdXqt1iLsnivbdKid8qp1WrnbOkNmRF0YGXdG1draN2tnaUU0tsqU1svIfkdUBLM0hv0Me092oY1rvDG2q9RCb1Jq7X6q1NCn2XNVa+pWwKVgfqjV+89HqJXXpIUB+9aa0gMIPdB4AcHh0GvXZ6lDxTt1jJAz+Zh4HzxQf3MCmYeHXUFqQ3k4jt6zUVofew7DtHFgMZXUx0d+SAOodI92jDnDuN2mBaAPj0bs4to9X06uXwtJNyGQCEZvqm5SU-FMn5Os1le2nIsqwyzVkMo2Vsy1uyfkqgOe+Wciwm4Zx+F3L4EHbVqzSGkZSeyDMMvGtqKm4gU0mbgGZtZlntk2ctfs8aP6xn6RcjcwjKQaN2nKZY8eAZUiKdivAIiasyXKVUupNCwQfxxkTCmUQc5bqZwMjA0EihAzMuNkPBCrJoBGOZYyVK6myVa28oN8xillKlNSnyQKrYxRZQgx6MO8XlZJanD3RC3XwTeG8IIhE8BwDltecuNr-Wws7KYRQqhTDaGqjpp+EbGAXMnnlIxU1fXYbThGy3UA92XN6qbgW9byBNvbeMf8U7CWeDTh0LOdcpJgqgFUOwfgxk9tFGQEjsUYcbvaZMU3NzTMltOwJdOXb+2u2zjW11nrkSjvPfpDTtWH3+URqRhin742J5GhSID4Hgiw4-nkkRFb8olHPd5xxPbB3bFHciYz8HTCGGXcozdnyd3mcmMe6AUEaBGKKEgK9xnn3abffV-JX7cnlOfCY2Lrbgicfy+ZVDmHaQ4cU4RxjlH4A0ce6xyqE5vx5J48Zj8ebqqieZxJ5L8novkAvd67UbXqBdd8Pp4dw3puhsm+1WbjnOX6Q25B-zkxQuCWNbwWFRPyf9fx+6a8xnFp5crMi0UKzHjpTq72X7i00l7tjYRsZ0AZym8WZb9F3dKuc8EuO+9xv7CVc94z+YzXgODf9aNxigfQ-OHz7V9n9Fs5zdBaL5P74Ypw9h+SzAyEVmOLLkVvuRv5nDFRes7+QzEGqrrlb7ANGqr792kbwoSKER2RyhXBAAAl4BvdQDTdIDn0PQYlr8XAXxICX4kDVBNJUD6s-81ZG9aFgCPcwDIDoD29s84CP9woCx0CUCCsfxqDggsC45cDB9TMFcNkQDSDxIICoDQB0cYCyDuUKDf5qDuC0Cb8GCCtsCxR-9IwWDwsmEWECD+CuDiDeDCDYDBDlI85ucb9RC6DxDGDS9L9y9ygJhEhGg0tHkKkmwEIb9msucPU0siIlogA)

注意:

- 負の数は扱いません
- 差が負になる場合は 0 とします
- 除算の結果は常に商のみをとります
- この記事のやり方でそのまま実装しても、再帰制限の都合ですぐにコンパイルエラーが発生します
  - 本題から逸れるため、この記事では再帰回数を抑える書き方、再帰上限を突破する書き方はしません
  - 再帰上限を突破する方法を知りたい方は、[TypeScript の型の再帰上限を突破する裏技](https://susisu.hatenablog.com/entry/2020/09/12/214343)か前述の Playground のソースコードを見てください

実装の流れ:

- 整数リテラル型同士の演算
- トークナイズ
- パース
- 評価

## 整数リテラル型同士の演算

タプル型を使います。

### 加算

例えば、2 + 3 をしたい場合は要素数が 2 のタプル型と要素数が 3 のタプル型を連結し、その要素数を返すことで 5 が得られます。次の例では要素の型は `never` にしていますが、他の型でも問題ありません。

```ts
type TwoElementsTuple = [never, never];
type ThreeElementsTuple = [never, never, never];

type Result = [...TwoElementsTuple, ...ThreeElementsTuple]["length"]; // 5
```

しかし、実際には整数リテラル型から動的に任意の要素数のタプル型を生成する必要があります。これは、タプル型の要素数が目的の数と等しくなるまで再帰的に要素数を増やすことで実現できます。

```ts
type MakeTupleByLength<
  Length,
  Tuple extends never[] = []
> = Tuple["length"] extends Length
  ? Tuple
  : MakeTupleByLength<Length, [...Tuple, never]>;

type TwoElementsTuple = MakeTupleByLength<2>; // [never, never]
```

これらを組み合わせて、整数リテラル型の加算は次のように表せます。

```ts
type AddTupleLength<A extends never[], B extends never[]> = [
  ...A,
  ...B
]["length"];

type Add<A, B> = AddTupleLength<MakeTupleByLength<A>, MakeTupleByLength<B>>;

type Result = Add<2, 3>; // 5
```

### 減算

両辺の要素を 1 つずつ減らすのを右辺値の要素数が 0 になるまで繰り返し、最後に残った左辺値の要素数を返すことで実現できます。ただし、この方法では負の数は表せないので、結果が負になる場合は 0 とすることにします。そのため、再帰の終了条件を「右辺値が 0 になるまで」ではなく「右辺値または左辺値が 0 になるまで」にしています。

```ts
// タプルの要素を 1 つ減らす
type DecrementTupleLength<A extends never[]> = A extends [
  infer _,
  ...infer Rest
]
  ? Rest
  : never;

type SubTupleLength<A extends never[], B extends never[]> = 0 extends
  | A["length"]
  | B["length"]
  ? A["length"]
  : SubTupleLength<DecrementTupleLength<A>, DecrementTupleLength<B>>;

type Sub<A, B> = SubTupleLength<MakeTupleByLength<A>, MakeTupleByLength<B>>;

type Result1 = Sub<3, 2>; // 1
type Result2 = Sub<2, 3>; // 0
```

### 乗算

初期値が要素数 0 のタプル型に左辺値の要素をすべて加えて右辺値の要素を 1 つ減らすのを、右辺値の要素数が 0 になるまで繰り返します。最後に出来上がったタプル型の要素数を返します。

```ts
type MulTupleLength<
  A extends never[],
  B extends never[],
  Result extends never[] = []
> = B["length"] extends 0
  ? Result["length"]
  : MulTupleLength<A, DecrementTupleLength<B>, [...Result, ...A]>;

type Mul<A, B> = MulTupleLength<MakeTupleByLength<A>, MakeTupleByLength<B>>;

type Result = Mul<3, 5>; // 15
```

### 除算

左辺値の要素数から右辺値の要素数を何回引けるかをカウントすることで商を求めることができます。右辺値の要素数が 0 になった場合は右辺値の要素を復元しないといけないので、`BOrig` で元々の `B`（右辺値）を保持します。ゼロ除算が行われようとしたときは `never` 型を返します。

```ts
type DivTupleLength<
  A extends never[],
  B extends never[],
  Result extends never[] = [],
  BOrig extends never[] = B
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

type Div<A, B> = DivTupleLength<MakeTupleByLength<A>, MakeTupleByLength<B>>;

type Result1 = Div<7, 3>; // 2
type Result2 = Div<3, 0>; // never
```

ここまで実装すると次のような計算ができるようになります。

```ts
type Result = Mul<Add<2, 3>, Div<6, Sub<3, 1>>>; // 15
```

## トークナイズ

Template Literal Types を使って文字列リテラル型をトークンの配列型に変換していきます。

トークンの型の定義を下に示します。

```ts
type Token =
  | { type: "+" | "-" | "*" | "/" | "(" | ")" }
  | { type: "number"; value: number };
```

整数のトークナイズは少し複雑なのでとりあえず無視して、整数以外のトークナイズを考えましょう。`Tokenize` は受け取った文字列の先頭を見てそれぞれのトークンを生成します。空白文字はスキップします。これを文字列が空になるまで繰り返し、出来上がった `Tokens` を返します。有効でないトークンが来た場合は `never` 型を返します。

```ts
type Tokenize<
  S extends string,
  Tokens extends Token[] = []
> = S extends `+${infer Rest}`
  ? Tokenize<Rest, [...Tokens, { type: "+" }]>
  : S extends `-${infer Rest}`
  ? Tokenize<Rest, [...Tokens, { type: "-" }]>
  : S extends `*${infer Rest}`
  ? Tokenize<Rest, [...Tokens, { type: "*" }]>
  : S extends `/${infer Rest}`
  ? Tokenize<Rest, [...Tokens, { type: "/" }]>
  : S extends `(${infer Rest}`
  ? Tokenize<Rest, [...Tokens, { type: "(" }]>
  : S extends `)${infer Rest}`
  ? Tokenize<Rest, [...Tokens, { type: ")" }]>
  : S extends ` ${infer Rest}`
  ? Tokenize<Rest, Tokens>
  : S extends ""
  ? Tokens
  : never;

type Tokens = Tokenize<"+- (*/)">;
// [
//   { type: "+" },
//   { type: "-" },
//   { type: "(" },
//   { type: "*" },
//   { type: "/" },
//   { type: ")" }
// ];
```

整数は他のトークンと違い、複数の文字から成っている場合があります。数字が来た場合には、その値を暫定的な値として保持しておきます。次の文字がまた数字の場合は、保持している値を 10 倍し、現在の値を加算します。これを数字以外が来るまで繰り返し、数字以外が来たところでその値を確定します。

```ts
type CarryUp<N> = N extends number ? Mul<N, 10> : 0;

type Tokenize<
  S extends string,
  Tokens extends Token[] = [],
  Value = null
> = S extends `0${infer Rest}`
  ? Tokenize<Rest, Tokens, CarryUp<Value>>
  : S extends `1${infer Rest}`
  ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 1>>
  : S extends `2${infer Rest}`
  ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 2>>
  : S extends `3${infer Rest}`
  ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 3>>
  : S extends `4${infer Rest}`
  ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 4>>
  : S extends `5${infer Rest}`
  ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 5>>
  : S extends `6${infer Rest}`
  ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 6>>
  : S extends `7${infer Rest}`
  ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 7>>
  : S extends `8${infer Rest}`
  ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 8>>
  : S extends `9${infer Rest}`
  ? Tokenize<Rest, Tokens, Add<CarryUp<Value>, 9>>
  : Value extends number // 次の文字が数字以外で、暫定的な値を持っている場合
  ? Tokenize<S, [...Tokens, { type: "number"; value: Value }]>
  : S extends `+${infer Rest}`
  ? Tokenize<Rest, [...Tokens, { type: "+" }]>
  : S extends `-${infer Rest}`
  ? Tokenize<Rest, [...Tokens, { type: "-" }]>
  : S extends `*${infer Rest}`
  ? Tokenize<Rest, [...Tokens, { type: "*" }]>
  : S extends `/${infer Rest}`
  ? Tokenize<Rest, [...Tokens, { type: "/" }]>
  : S extends `(${infer Rest}`
  ? Tokenize<Rest, [...Tokens, { type: "(" }]>
  : S extends `)${infer Rest}`
  ? Tokenize<Rest, [...Tokens, { type: ")" }]>
  : S extends ` ${infer Rest}`
  ? Tokenize<Rest, Tokens>
  : S extends ""
  ? Value extends number
    ? [...Tokens, { type: "number"; value: Value }]
    : Tokens
  : never;
```

ここまで実装すると次のようなトークナイズができるようになります。

```ts
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

## パース

再帰下降構文解析でパースし AST をつくります。今回扱う数式を EBNF を使って表すと次のようになります。

```
expr    = term ("+" term | "-" term)*
term    = primary ("*" primary | "/" primary)*
primary = num | "(" expr ")"
```

ノードの型の定義を下に示します。今回扱うノードは次を満たすような型を想定していますが、型引数に `extends` による制約つけると制約満たすことを確認するために冗長なコードが生まれてしまうので、今回はつけません。`lhs`、`rhs` はそれぞれ left-hand side、right-hand side を意味します。

```ts
type ASTNode =
  | { type: "+" | "-" | "*" | "/"; lhs: ASTNode; rhs: ASTNode }
  | { type: "number"; value: number };
```

準備ができたので `Expr`、`Term`、`Primary` を実装していきます。再帰下降構文解析の方法に則り、それぞれが部分木を返すような設計にします。ただし、トークンをどこまで読み進めたかを知らなければならないので、返す型は `[ASTNode, Token[]]` なタプル型にします。

`Expr` は、最初に `Term` を 1 つとり、`"+" Term` または `"-" Term` を 0 回以上繰り返します。注意点があり、加減算は左結合である（左から右へ順番に計算される）必要がありますが、愚直に再帰で実装すると右結合になってしまいます。次の例は一見正しそうに見えますが、右結合になります。

```ts
type Expr<Tokens> = Term<Tokens> extends [infer Result1, infer Rest1]
  ? Rest1 extends [{ type: "+" | "-" }, ...infer Rest2]
    ? Expr<Rest2> extends [infer Result2, infer Rest3]
      ? [{ type: Rest1[0]["type"]; lhs: Result1; rhs: Result2 }, Rest3]
      : never
    : [Result1, Rest1]
  : never;

type A = Expr<Tokenize<"1 + 2 + 3">>[0];
// {
//   type: "+";
//   lhs: {
//     type: "number";
//     value: 1;
//   };
//   rhs: {
//     type: "+";
//     lhs: {
//       type: "number";
//       value: 2;
//     };
//     rhs: {
//       type: "number";
//       value: 3;
//     };
//   };
// };
```

次が正しい実装の例です。繰り返しの部分を `ExprLoop` として切り出しています。`ExprLoop` は部分木を生成するのではなく、型引数で受け取った木に手を加えていき、繰り返しが終わったときにその木を返すようにします。

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

`Term` は `Expr` とほぼ同じです。

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

`Primary` は値または `"(" Expr ")"` です。次のトークンが整数である場合、その値が結果になります。次のトークンが `"("` である場合、`Expr` をパースしたあとに `")"` が来ることを確認します。

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

ここまで実装すると次のようなパースができるようになります。

```ts
type AST = Parse<Tokenize<"1 + 1 + 2 * 3 / (3 - 1)">>;
// {
//   type: "+";
//   lhs: {
//     type: "+";
//     lhs: {
//       type: "number";
//       value: 1;
//     };
//     rhs: {
//       type: "number";
//       value: 1;
//     };
//   };
//   rhs: {
//     type: "/";
//     lhs: {
//       type: "*";
//       lhs: {
//         type: "number";
//         value: 2;
//       };
//       rhs: {
//         type: "number";
//         value: 3;
//       };
//     };
//     rhs: {
//       type: "-";
//       lhs: {
//         type: "number";
//         value: 3;
//       };
//       rhs: {
//         type: "number";
//         value: 1;
//       };
//     };
//   };
// };
```

## 評価

出来上がった木を再帰的に評価します。末端のノードはその値を返します。それ以外のノードは、2 つの子ノードを評価した結果を演算子に合わせて `Add`、`Sub`、`Mul`、`Div` にそれぞれ渡し、その結果を返します。

```ts
type Eval<A> = A extends { type: "number"; value: number }
  ? A["value"]
  : A extends { type: "+"; lhs: infer LHS; rhs: infer RHS }
  ? Add<Eval<LHS>, Eval<RHS>>
  : A extends { type: "-"; lhs: infer LHS; rhs: infer RHS }
  ? Sub<Eval<LHS>, Eval<RHS>>
  : A extends { type: "*"; lhs: infer LHS; rhs: infer RHS }
  ? Mul<Eval<LHS>, Eval<RHS>>
  : A extends { type: "/"; lhs: infer LHS; rhs: infer RHS }
  ? Div<Eval<LHS>, Eval<RHS>>
  : never;
```

## 完成

それぞれの型を組み合わせて、`Calculate` 型を定義します。

```ts
type Calculate<S extends string> = Eval<Parse<Tokenize<S>>>;
```

型レベル電卓の完成です 🎉 🎉 🎉

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
const result2 = safeEval("12 = 3"); // Argument of type 'string' is not assignable to parameter of type 'never'. ts(2345)

declare const expr: string;

const result3 = safeEval(expr); // Argument of type 'string' is not assignable to parameter of type 'never'. ts(2345)
```
