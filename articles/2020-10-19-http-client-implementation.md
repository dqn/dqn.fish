---
title: HTTP クライアントを実装した話
published: 2020-10-19T02:12:22+0900
tags:
  - HTTP
  - Node.js
---

簡単な HTTP クライアントを実装してみたので、紹介します。この記事での目標は、次のことができるようになることです。

- 基本的な HTTP メソッドでのリクエスト
  - GET、POST、PUT、DELETE
- 分割されたレスポンスの読み取り
- Chunk 化されたレスポンスの読み取り
- JSON、 FormData を使ったリクエスト
- リダイレクトの対応
- HTTPS のサポート

ソースコードを概観したい方は、自分のリポジトリを見ることができます。Node.js + TypeScript で書かれています。

- [dqn/rqn](https://github.com/dqn/rqn)

## HTTP の書式

はじめに、HTTP についていくつか知っておく必要があります。HTTP は TCP を使い、定められた書式に従ってデータをやりとりするプロトコルです。また、HTTPS では TCP ではなく SSL / TLS を使っています。下記は HTTP リクエストの全文の一例です。

```
POST /foo HTTP/1.1
Host: example.com
User-Agent: My user agent

Hello!
```

このようなメッセージを TCP で送信すると、それが HTTP リクエストとして扱われます。また、メッセージ中の改行はすべて CRLF である必要があります。この章では、上記のメッセージの意味について説明していきます。

### 開始行

前述の例の最初の 1 行は次のようになっていました。

```
POST /foo HTTP/1.1
```

この行を**開始行**といいます。開始行は次のような構成になっています。

```
メソッド パス プロトコルバージョン
```

先ほどの例では、メソッドが `POST`、パスは `/foo`、プロトコルバージョンは `HTTP/1.1` となっています。プロトコルバージョンはこの記事の執筆時（2020 年 10 月 18 日）では 1.1 が主流なので、とりあえず固定することにしましょう。

クエリパラメータが必要な場合は、そのままパスに付与します。

```
POST /foo?id=42 HTTP/1.1
```

ルートを指したい場合は / を指定します。

```
POST / HTTP/1.1
```

### ヘッダー

2 行目から空行までを**ヘッダー**といいます。先ほどの例では次の部分にあたります。

```
Host: example.com
User-Agent: My user agent
```

ヘッダーは複数行記述でき、それぞれの行は次のような構成になっています。

```
フィールド: 値
```

ここで、`Host` フィールドはすべての HTTP/1.1 リクエストで**必須**となっています。

フィールド名の大文字・小文字は区別されません。また、`:` から値までの空白は無視されます。

### 本文

空行より後を**本文**といいます。ヘッダー直後の空行は本文に含まれません。先ほどの例では次の部分に当たります。

```
Hello!
```

GET メソッドのように本文が必要ないリクエストもあります（正確にいうと GET メソッドでも本文は送信できますが、ほとんどの場合そのようなことはしないでしょう）。その場合でも、ヘッダーの後の空行は**必須**です。空行を入れないと、HTTP リクエストの受信者は本文が送られるのを待ち続けるため、リクエストが終わりません。具体的に、HTTP リクエストの全文は次のようになります。

```
GET /foo HTTP/1.1
Host: example.com
User-Agent: My user agent



```

## 最小限の HTTP リクエスト

ここまで理解できれば、HTTP リクエストができるはずです。簡単な HTTP サーバーと TCP クライアントを使って、正しく HTTP リクエストができるか確認してみます。

ここでは、Node.js + TypeScript での実装例を紹介します。

### サーバー側

HTTP サーバーには Express を使用しています。`GET /hello` にリクエストがあれば、`Hello, World!` と返すだけの簡単なエンドポイントを用意しています。

```ts
import express from "express";

const app = express();

app.get("/hello", (_req, res) => {
  res.send("Hello, World!");
});

app.listen(80);
```

### クライアント側

Node.js で TCP を使い通信するためには、標準ライブラリの `net` を使うことができます。Host に localhost、ポート番号に 80 を指定し、メッセージを送信しています。メッセージは、GET メソッドで `/hello` にリクエストするという内容です。

```ts
import net from "net";

const client = net.connect(80, "localhost", () => {
  const message = "GET /hello HTTP/1.1\r\nHost: localhost\r\n\r\n";
  client.write(message);
});

client.on("data", (data) => {
  console.log(data.toString());
  client.end();
});
```

成功すると、下記のようなメッセージを受信します。これが HTTP レスポンスの全文になります。

```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 13
ETag: W/"d-CgqfKmdylCVXq1NV12r0Qvj2XgE"
Date: Wed, 22 Apr 2020 17:06:44 GMT
Connection: keep-alive

Hello, World!
```

HTTP リクエストと構成はほぼ同じですが、1 行目だけ違います。

```
HTTP/1.1 200 OK
```

HTTP レスポンスの 1 行目を**ステータス行**といいます。ステータス行の構成は次のようになっています。

```
プロトコルバージョン ステータスコード ステータス文字列
```

プロトコルバージョンは開始行と同じです。ステータスコードは説明を省きます。ステータス文字列は人間が理解しやすいようにするためのものであり、特に意味はありません。

これで、最小限の HTTP リクエストができるようになりました。しかし、このままではほとんどの HTTP レスポンスを正しく受け取ることができません。次の章からは、受け取れる HTTP レスポンスの種類を増やしていきます。

## 分割されたレスポンス

HTTP レスポンスは、1 度ですべて返るとは限りません。HTTP レスポンスのヘッダーには `Content-Length` が含まれている場合があります（HTTP リクエストの受信者はレスポンスのヘッダーに `Content-Length` を含めるべきと RFC で言及されていますが、必須とはされていません）。その場合、受信した本文のサイズの合計が `Content-Length` の値と等しくなるまで受信を続ける必要があります。`Content-Length` の値が 0 の場合もあります。値は 10 進数で表されており、単位はバイトです。

つまり、分割されたレスポンスを読み取るためには次の処理が必要です。

- レスポンスヘッダーの受信を完了させる
- 受信したヘッダーに `Content-Length` があるか確認する
  - ある場合、受信した本文の合計のバイト長が `Content-Length` と一致するまで受信を続ける
  - ない場合、受信を終了する（とりあえず）

## Chunk 化されたレスポンス

前の章で、レスポンスヘッダーに `Content-Length` がない場合は受信を完了していました。しかし、受信を完了してはいけないケースがあります。HTTP リクエストの受信者は、本文のサイズが確定していない場合、Chunk 形式で本文を返すことができます。その場合、HTTP レスポンスのヘッダーに `Transfer-Encoding: chunked` が設定されており、本文は下記のような形式で返されます。

```
HTTP/1.1 200 OK
Transfer-Encoding: chunked

2c
abcdefghij
```

```
klmnopqrstuvwxyzABCDEFGHIJKLMNOPQR
3e
STUVWXYZabcdefgh
```

```
ijklmnopqrstuvwxyzABCDEFGHIJ
```

```
KLMNOPQRSTUVWXYZAB
11
CDEFGHIJ
```

```
KLMNOPQRS
0


```

見やすいようにまとめると、次のようになっています。

```
HTTP/1.1 200 OK
Transfer-Encoding: chunked

2c
abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQR
3e
STUVWXYZabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZAB
11
CDEFGHIJKLMNOPQRS
0


```

本文の最初の行は、何バイトのデータを返すかを 16 進数で表した値になっています。この例だと、まず 0x2c バイト分のデータが返されます（例では `abc` ... `PQR` にあたる）。0x2c バイト分のデータが返された後、改行（CRLF）が返され、またサイズを表す値が返されます（ここでは 3e）。サイズを表す値が 0 になったら、本文がすべて返されたことになります。

## POST、PUT、DELETE の実装

GET と特に違いはありません。違う点は、HTTP リクエストの開始行のメソッド部がそれぞれのメソッドに変わる点だけです。

## 本文の送信

今回は JSON と FormData の送信に対応します。本文を送信する場合、ヘッダーに `Content-Length` が必須です。また、HTTP リクエストの受信者が JSON や FormData であることを知るために `Content-Type` も必要です。

### JSON

JSON の場合、JSON 文字列をそのまま本文にします。`Content-Type` には `application/json` または `text/json`、`Content-Length` には本文のバイト長を設定します。

### FormData

FormData の場合、FormData を URL エンコードした文字列を本文にします。`Content-Type` には `application/x-www-form-urlencoded`、`Content-Length` には JSON と同様、本文のバイト長を設定します。

## リダイレクト

HTTP レスポンスのステータスコードが 300 番台の場合、リダイレクトです。この場合、レスポンスヘッダーに `Location` が含まれているはずです。`Location` のフィールド値は URL になっているので、この URL に対して再帰的にリクエストをすることでリダイレクトに対応できます。

## HTTPS

HTTPS の場合、TCP クライアントではなく SSL / TSL クライアントを使用します。Node.js では標準ライブラリの `tls` が使えます。また、接続先のポート番号は 80 ではなく 443 になります。エンドポイントのプロトコルを見て TCP、SSL / TSL を選択することで、HTTP、HTTPS に対応できます。

## 参考

- https://triple-underscore.github.io/rfc-others/RFC2616-ja.html
- https://developer.mozilla.org/ja/docs/Web/HTTP/Messages
- http://www.tohoho-web.com/ex/http.htm
