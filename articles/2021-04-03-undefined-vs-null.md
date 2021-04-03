---
title: undefined と null、どちらに寄せるべきか
published: 2021-04-03T12:03:09+0900
---

JavaScript / TypeScript で nullish な値を表現する場合、`undefined` または `null` を使うことになると思いますが、どちらに寄せるべきなのかを考えてみます。

## 結論

可能な限り `undefined` **も** `null` **も発生させない設計**にし、どうしても nullish な値を扱いたい場合は `null` を使うのが最善だと思っています。

## undefined が発生するケース

undefined が発生するケースの例をいくつか挙げてみます。

- 変数が初期化されていない場合

```ts
let foo;

foo; // undefined
```

- オブジェクトで optional なプロパティ（未定義のプロパティ）にアクセスした場合

```ts
declare const obj: { foo?: number };

obj.foo; // number | undefined
```

- nullish な値に対して Optional chaining を使用した場合

```ts
declare const obj: null | { foo: number };

obj?.foo; // number | undefined
```

- 配列で範囲外のインデックスにアクセスした場合

```ts
// strict または strictNullChecks が true の場合

declare const foo: number[];

foo[0]; // number | undefined
```

- 関数の仮引数が optional な場合

```ts
function foo(bar?: number) {
  bar; // number | undefined
}
```

- 関数の返り値を省略した場合

```ts
function foo(bool: boolean) {
  if (bool) {
    return Math.random();
  }
}

const bar = foo(true); // number | undefined
```

- 標準組込みオブジェクトのメソッドの返り値

```ts
// Array.prototype.find()
const foo = [1, 2, 3].find((n) => n === 1); // number | undefined

// Map.prototype.get()
const map = new Map<string, number>();
const bar = map.get("key"); // number | undefined
```

言語仕様レベルで見てみると、値が存在しないことを表現する場合には `undefined` を使うことが多そうです。また、TypeScript の開発元である Microsoft も `null` ではなく `undefined` を使うことを[コーディングガイドライン](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines#null-and-undefined)で定めています。

また `null` との違いとして、オブジェクトの `undefined` なプロパティは JSON 文字列にシリアライズした際に削除されることが挙げられます。

```ts
const obj = {
  foo: 42,
  bar: void 0,
  baz: null,
} as const;

JSON.stringify(obj); // "{"foo":42,"baz":null}"
```

しかし、配列の要素として `undefined` を使用した場合は `null` として扱われるので、注意が必要です。

```ts
JSON.stringify([0, undefined, 2]); // "[0,null,2]"
```

## null が発生するケース

null が発生するケースの例をいくつか挙げてみます。

- 標準組込みオブジェクトのメソッドの返り値

```ts
// String.prototype.match()
"Hello, TypeScript!".match(/^Hello, (.+)?!$/); // RegExpMatchArray | null

// RegExp.prototype.exec()
/^Hello, (.+)?!$/.exec("Hello, TypeScript!"); // RegExpExecArray | null
```

- `Event` インターフェイスのプロパティ

```ts
const FileInput: React.VFC = () => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    event.target.files; // FileList | null
  };

  return <input type="file" onChange={handleChange} />;
};
```

素で JavaScript / TypeScript を扱う場合、`null` が発生するケースは `undefined` と比べて多くありません。

## どちらを使うべきか

引数に年齢を取り、年齢に応じた階級を返す関数を考えてみます。

- 10 歳以上 20 歳未満... `JUNIOR`
- 20 歳以上 30 歳未満... `YOUTH`
- 30 歳以上 40 歳未満... `SENIOR`

どの階級にも当てはまらなかった場合は一先ず `undefined` を返すことにします。

```ts
type AgeClass = "JUNIOR" | "YOUTH" | "SENIOR";

function getAgeClass(age: number): AgeClass | undefined {
  if (age >= 10 && age < 20) {
    return "JUNIOR";
  }

  if (age >= 20 && age < 30) {
    return "YOUTH";
  }

  if (age >= 30 && age < 40) {
    return "SENIOR";
  }

  return void 0;
}
```

`noImplicitReturns` を `true` にしていなければ最後の `return` 文は省略可能です（是非 `true` にしましょう）。

`return` 文は式を省略した場合には `undefined` が返ります。この関数では `AgeClass | undefined` が返り値の型として指定されているので、省略することができます。しかし、それは危険なことにもなり得ます。例えば、次のようにうっかり `return` 文に返り値を指定し忘れても、エラーになりません。

```ts
function getAgeClass(age: number): AgeClass | undefined {
  if (age >= 10 && age < 20) {
    return; // "JUNIOR" を返すべきなのに、エラーにならない
  }

  // ...
}
```

これは `null` を使い、階級が存在しないことを明示的に表現することで回避できます。関数の返り値において値が存在しないことを表現する場合には `undefined` より `null` を使う方が安全だといえます。

```ts
function getAgeClass(age: number): AgeClass | null {
  if (age >= 10 && age < 20) {
    return; // Type 'undefined' is not assignable to type 'AgeClass | null'.ts(2322)
  }

  // ...

  return null;
}
```

`React.FC`、`React.VFC` でもレンダリングする要素が存在しない場合には `null` を返させるようにしていますね。

```ts
type FC<P = {}> = FunctionComponent<P>;

interface FunctionComponent<P = {}> {
  (props: PropsWithChildren<P>, context?: any): ReactElement<any, any> | null;
  // ...
}
```

では `undefined` より `null` を使うべきなのかといわれると、必ずしもそうではありません。JavaScript の仕様上 `undefined` が登場する機会の方が多いですし、`undefined` を撲滅することは不可能です。それに、`undefined` の方を好む人も多く存在するはずです。個人開発では `null` を貫くのもいいかもしれませんが、チーム開発や OSS として公開するとなると、望んでいないところで `null` を扱うことになってしまう人もでてくるかもしれません。

最も良いのは、`undefined` **も** `null` **も返さなくていい設計**にすることです。

例えば、階級が存在しない場合は例外を投げるようにします。

```ts
function getAgeClass(age: number): AgeClass {
  // ...

  throw new Error(`invalid age "${age}"`);
}
```

例外がやりすぎだという場合には、「有効であるか」と「階級」を別で表現し、オブジェクトにして返します。

```ts
type GetAgeClassResult =
  | { isValid: true; ageClass: AgeClass }
  | { isValid: false };

function getAgeClass(age: number): GetAgeClassResult {
  if (age >= 10 && age < 20) {
    return {
      isValid: true,
      ageClass: "JUNIOR",
    };
  }

  if (age >= 20 && age < 30) {
    return {
      isValid: true,
      ageClass: "YOUTH",
    };
  }

  if (age >= 30 && age < 40) {
    return {
      isValid: true,
      ageClass: "SENIOR",
    };
  }

  return { isValid: false };
}

const result = getAgeClass(42);

if (result.isValid) {
  result.ageClass; // AgeClass
}

result.ageClass; // Property 'ageClass' does not exist on type 'GetAgeClassResult'.
```

## おわりに

この記事では `undefined` と `null` の相違点や望ましい付き合い方について紹介しました。この記事で紹介したような設計は、バリデーションライブラリの [Zod](https://github.com/colinhacks/zod) でも使われています。

```ts
const stringSchema = z.string();
stringSchema.parse("fish"); // => returns "fish"
stringSchema.parse(12); // throws Error('Non-string type: number');

stringSchema.safeParse(12);
// => { success: false; error: ZodError }

stringSchema.safeParse("billie");
// => { success: true; data: 'billie' }
```
