---
title: TypeScript で書かれたパッケージを GitHub で公開する方法を考える
published: 2020-12-07T23:18:33+0900
---

`npm` コマンド、`yarn` コマンドでは、次のようにして GitHub 上のリポジトリからパッケージをインストールできます。

```
$ npm install githubname/reponame
$ npm install githubname/reponame#branchname
```

```
$ yarn add githubname/reponame
$ yarn add githubname/reponame#branchname
```

npm には公開したくない（するほどでもない）ような自作パッケージは GitHub でのみ公開したいということもあるかと思います。しかし、TypeScript で書かれたパッケージはコンパイルされなければなりません。

このような場合、次のような解決策が想定されます。

- コンパイル後のファイルを Git 管理下に入れる
- scripts の `postinstall` を使い、インストール時にコンパイルしてもらう
- インストール用のブランチを作る

この記事では、それぞれのメリット・デメリットについて考えていきます。

## コンパイル後のファイルを Git 管理下に入れる

普通は ignore するところを、しないでコミットしてしまう方法。

### メリット

- 単純

### デメリット

- コンパイル後のファイルの差分が邪魔
- リポジトリのサイズが大きくなる
- 必要のないファイルまでインストールされる

## scripts の `postinstall` を使い、インストール時にコンパイルしてもらう

次のように package.json の scripts に `postinstall` を追加し、そのパッケージをインストールする時にコンパイルしてもらう方法。この場合、`typescript` は必須なので `devDependencies` ではなく `dependencies` でなければなりません。

```json
{
  "scripts": {
    "postinstall": "tsc"
  },
  "dependencies": {
    "typescript": "4.1.2"
  }
}
```

余談ですが、`post` という接頭辞は任意のコマンドに与えることができます。例えば、`myscript` というコマンドがあったとすれば、`postmyscript` は `myscript` の実行後に実行されるコマンドとなります。同様に `pre` という接頭辞も与えることができます。

[scripts | npm Docs](https://docs.npmjs.com/cli/v6/using-npm/scripts)

`postinstall` もその 1 つであって、そのパッケージがインストールされた後に実行されるといった特別な効果はありません。あくまで**そのパッケージの依存関係がインストールされた後に実行される**だけです。依存関係のインストール時には、その依存関係にも再帰的にインストールが走るので、`postinstall` も走っているというわけです。

### メリット

- リポジトリにコンパイル後のファイルを含めなくていい
- まあ単純

### デメリット

- `typescript` のインストールが発生するので、node_modules のサイズが大きくなる
- コンパイルがオーバーヘッドになる
- 必要のないファイルまでインストールされる

## インストール用のブランチを作る

publish したいファイルのみが含まれるブランチを作り、インストール時にそのブランチを指定してもらう方法。

### メリット

- 開発用ブランチからコンパイル後のファイルを切り離せる
- 必要のないファイルを publish しなくて済む（.npmignore と同等のことができる）

### デメリット

- インストール用ブランチの管理が面倒（更新、コンフリクトの解消など）

インストール用ブランチの管理は GitHub Actions である程度自動化できるかと思います。また、インストール用ブランチでは .npmignore の代わりに .gitignore を使って publish するファイルを管理することになります。

## 総評

インストール用のブランチを作る方法が、最も無駄が少なく npm に publish するときの感覚に近いように感じます。

けど、ここまでするくらいなら npm で公開しますってなるかもしれない…