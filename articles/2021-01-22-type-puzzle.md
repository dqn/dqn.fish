---
title: 最近作った型パズルの作品
published: 2021-01-22T00:20:21+0900
---

最近作った TypeScript で作った型パズルの作品を紹介します。Template Literal Types を使ってみたくて作っただけなので、特に目的や用途は無いです。

## [calc-ts](https://github.com/dqn/calc-ts)

[前回の記事](https://dqn.fish/articles/2020-12-13-type-level-calculator)で紹介した型レベル電卓です。次のような簡単な四則演算ができます。詳しくは記事を参照。

```ts
import type { Calculate } from "calc-ts";

type Result = Calculate<"12 + 4 * (15 - 12) / 6">; // 14
```

## [bfts](https://github.com/dqn/bfts)

型レベル Brainfuck インタプリタです。Brainfuck に明確な言語仕様はありませんが、[Wikipedia](https://en.wikipedia.org/wiki/Brainfuck#Array_size) によると配列（メモリ）の大きさは 30,000 以上である必要があるみたいです。30,000 ものメモリを使おうとすると TypeScript の再帰の上限の方が先に来てしまうので、bfts ではメモリの大きさは 256 としました。下記のようなプログラムであれば問題なく動きます。

```ts
import type { Interpret } from "bfts";

type Result1 = Interpret<"+++++++++[>++++++++>+++++++++++>+++>+<<<<-]>.>++.+++++++..+++.>+++++.<<+++++++++++++++.>.+++.------.--------.>+.>+.">;
// type Result1 = "Hello World!\n"

// 入力を受け取る場合
type Result2 = Interpret<",+.>,+.>,+.", "ABC">;
// type Result2 = "BCD"
```

## [@dqn/json-type](https://github.com/dqn/json-type)

型引数に与えられた JSON 文字列から型を生成します。ネストされたオブジェクトや配列も（再帰の上限に達するまでは）パースできます。

```ts
import type { JsonType } from "@dqn/json-type";

type Result1 = JsonType<'{ "foo": "aaa", "bar": 12, "piyo": { "nyaa": [null, true] } }'>;
// type Result1 = {
//   foo: "aaa";
//   bar: 12;
//   piyo: {
//     nyaa: [null, true];
//   };
// };

// 次も JSON として有効
type Result2 = JsonType<"false">; // false
type Result3 = JsonType<"42">; // 42
type Result4 = JsonType<'"foobar"'>; // "foobar"
type Result5 = JsonType<"null">; // null
```

## あとがき

TypeScript 4.1 で型の表現力がさらに強くなりより自由な型パズルができるようになりましたが、再帰の上限にはすぐに達してしまうので上限を緩和するハックを使わなければいけないのが面倒でした。
