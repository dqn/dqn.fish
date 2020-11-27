import fs from "fs";
import path from "path";
import { Image, createCanvas } from "canvas";
import { getArticles } from "../../src/helpers/article";

const fontSize = 36;

async function generate() {
  const image = new Image();
  await new Promise((resolve, reject) => {
    image.onload = resolve as () => void;
    image.onerror = (err) => reject(err);
    image.src = path.join(__dirname, "ogp.png");
  });

  await getArticles().map((article) => {
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.drawImage(image, 0, 0);
    ctx.fillText(article.title, image.width / 2, image.height / 2);

    const out = fs.createWriteStream(`./public/ogp/${article.id}.png`);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    return new Promise((r) => out.on("finish", r));
  });
}

generate();
