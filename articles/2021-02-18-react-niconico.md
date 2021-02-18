---
title: ニコニコ風にテキストを表示する React Hooks
published: 2021-02-18T13:56:24+0900
---

ニコニコ動画・ニコニコ生放送のように、テキストをオーバーレイして流す React Hooks ライブラリ [react-niconico](https://github.com/dqn/react-niconico) を作ったので紹介します。

デモ: https://react-niconico.vercel.app/

## 使い方

`useNiconico` という Hooks を提供しています。`useNiconico` は `[MutableRefObject, (text: string) => void] ` なタプルを返します。`ref` を任意の要素に設定し、`emitText` に任意のテキストを渡すことでその要素上にテキストを流すことができます。

この例では `video` 要素に `ref` を設定していますが、任意の要素に使うことができます。

```js
import { useEffect } from "react";
import { useNiconico } from "react-niconico";

export const App = () => {
  const [ref, emitText] = useNiconico();

  useEffect(() => {
    emitText("short text");
    emitText("looooooooooooong text");
  }, [emitText]);

  return <video ref={ref} src="/sample.mp4" />;
};
```

TypeScript では型引数に `HTMLElement` を満たす型を与える必要があります。

```ts
const [ref, emitText] = useNiconico<HTMLVideoElement>();
```

また、オプションとして以下を設定できます。

```js
const [ref, emitText] = useNiconico({
  displayMillis: 5_000, // テキストの表示時間
  fontSize: 36, // テキストのサイズ
  lineWidth: 4, // テキストの縁の太さ
});
```

## 実装の話

`canvas` 要素を生成し、`ref` が設定された要素に重ねています。

```ts
// 実装イメージ

const canvas = document.createElement("canvas");

canvas.width = targetWidth;
canvas.height = targetHeight;

canvas.style.position = "absolute";
canvas.style.top = `${targetOffsetTop}px`;
canvas.style.left = `${targetOffsetLeft}px`;

ref.current.parentNode.insertBefore(canvas, ref.current);
```

また、対象の要素の大きさが変更された場合に検知するために [ResizeObserver API](https://developer.mozilla.org/ja/docs/Web/API/ResizeObserver) を使っています。

### テキストの表示時間・速度について

テキストの速度は、表示時間によって決まります。同じタイミングに流されたテキストは同じ時間かけて表示されます。なので、テキストが長くなれば速度も上がります。

![0 秒後の表示](https://i.gyazo.com/ea4f7b748b6a1205408c2b86051c5b33.png)

![N 秒後の表示](https://i.gyazo.com/c0253ce94b7982a9d25d7216786d0e07.png)

### テキストの Y 軸方向の位置について

ニコニコでは、表示領域内でテキストが重なる可能性がある場合は Y 軸方向に位置をずらします。

react-niconico でも同様のことをしています。現在表示しているすべてのテキストについて、そのテキストと同じ高さでテキストを流した場合に、表示領域内で重なるタイミングがあるかどうかを判定します。重なるタイミングがある場合、そのテキストの高さを予約済みとし、余っている高さの中で最も小さい高さにテキストを流します（[詳細な実装](https://github.com/dqn/react-niconico/blob/be664d616d0d6beeed3eddc0f3450ab8b71d3dfe/src/useNiconico.ts#L60-L89)）。

![数秒後に追いつく例](https://i.gyazo.com/1881e64609817d54d1258c34529f72d2.png)

![重ならない高さで流す](https://i.gyazo.com/1baa84771a67035426862aa918039127.png)

重ならない高さが無い場合にニコニコがどういう規則でテキストを流しているか分からなかったのでそこは未実装です…

## あとがき

テキストのスタイル（フォント、色、太字・細字など）を詳細に設定したい場合もあるかもしれないので `CanvasRenderingContext2D` をカスタムできるオプションがあればいいかもというのを後から思いました。

```js
const customContext = useCallback((ctx) => {
  ctx.font = "bold 24px sans-serif";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#8c8c8c";
  ctx.fillStyle = "#fff";
}, []);

const [ref, emitText] = useNiconico({ customContext });
```
