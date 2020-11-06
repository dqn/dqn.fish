---
title: RSS フィードに対応した
published: 2020-11-06T01:46:52+0900
tags:
  - RSS
---

このサイトの記事が RSS フィードで購読できるようになりました。次の URL をフィードリーダーに追加することで購読できます。

https://dqn.fish/feed.xml

## 実装の話など

Nuxt.js には [feed-module](https://github.com/nuxt-community/feed-module)、Gatsby には [gatsby-plugin-feed](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-feed) などのライブラリがあり比較的簡単に RSS フィードを導入できるようですが、Next.js にそのようなものは見当たらず、自前で XML を作成し public ディレクトリに吐くスクリプトを用意しました。Gatsby の存在があるので Next.js ではこのあたりはあまり充実していないのでしょうか。

[Zenn](https://zenn.dev/) も Next.js で実装されており RSS フィードに対応しているので、XML の `generator` タグを見てどうしているのか確認してみたところ、ライブラリは使っていなさそうでした。
