---
title: VS Code でテストコードをビルド対象から除外しつつエディタ上でエラーを出す
published: 2021-05-02T18:49:59+0900
---

他の人がどうしてるのか気になって調べたんですが、それっぽい記事が見つからなかったので解決策を簡単に書いておきます。

## 目的

VS Code は TypeScript のコンパイラオプションを `./tsconfig.json` から読み込んでおり、そのパスを指定するための設定もありません。テストコードを書くとき `**/__tests__/**/*` などを `./tsconfig.json` の `exclude` に指定してビルド対象から除外すると思いますが、そうすると VS Code 上でも検出対象から外れてしまい、エラーなどが表示されなくなってしまいます。この記事ではこれを解決します。

## 方法

`./tsconfig.json` には VS Code 上で検出したい設定を記述します。このとき、テストも検出対象にしたいので `exclude` でテストを除外することはしません。

- tsconfig.json

```json
{
  "compilerOptions": {},
  "include": ["./src/**/*"]
}
```

ビルド用に新規に `./tsconfig.production.json` のようなファイルを用意し、`./tsconfig.json` を継承して、テストコードを除外します。

- tsconfig.production.json

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["**/__tests__/**/*"]
}
```

ビルド時には `./tsconfig.production.json` を使ってビルドするようにします。

- package.json

```json
{
  "scripts": {
    "build": "tsc --build ./tsconfig.production.json"
  }
}
```
