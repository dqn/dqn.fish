---
title: 役に立つかもしれない TypeScript の Extract の使い方
published: 2020-11-23T22:26:46+0900
---

TypeScript で、特定の型であることが明確なのに推論されないことがあります。

```ts
type Foo = {
  value: number;
};

type TopFooValueType<A extends Foo[]> = A extends [infer F, ...infer _]
  ? F["value"]
  : never;

// Type '"value"' cannot be used to index type 'F'.ts(2536)
// F は Foo 型のはずなのにエラーになる。
```

このようなケースでは、 次のようにして F が Foo を満たすことを確認することでエラーはなくなります。

```ts
type TopFooValueType<A extends Foo[]> = A extends [infer F, ...infer _]
  ? F extends Foo
    ? F["value"]
    : never
  : never;
```

また、次の `Must` のような型を用意を用意すると簡潔に書くことができます。

```ts
type Must<T, ToBe> = T extends ToBe ? T : never;

type TopFooValueType<A extends Foo[]> = A extends [infer F, ...infer _]
  ? Must<F, Foo>["value"]
  : never;
```

この `Must`、よく見ると TypeScript の Utility Types である `Extract` と同じです。

```ts
type Extract<T, U> = T extends U ? T : never;
```

`Extract` を使うと、冒頭のコードは次のように書くことができます。

```ts
type TopFooValueType<A extends Foo[]> = A extends [infer F, ...infer _]
  ? Extract<F, Foo>["value"]
  : never;

type T = TopFooValueType<[{ value: 1 }, { value: 2 }]>; // 1
```

あまり役に立つのか分からない小技の紹介でした（個人的にはよく使う）。
