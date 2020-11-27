import fs from "fs";
import path from "path";
import RSS from "rss";
import { getArticles } from "../../src/helpers/article";

function generate() {
  const articles = getArticles();
  const feed = new RSS({
    title: "dqn.fish",
    site_url: "https://dqn.fish",
    feed_url: "https://dqn.fish/feed.xml",
    generator: "dqn.fish",
    language: "ja",
    image_url: "https://dqn.fish/avatar.png",
    copyright: "(C) dqn",
  });

  articles.forEach((article) => {
    feed.item({
      title: article.title,
      url: `https://dqn.fish/articles/${article.id}`,
      date: article.published,
      description: article.excerpt,
      author: "dqn",
      enclosure: {
        url: "https://dqn.fish/avatar.png",
      },
    });
  });

  const rss = feed.xml({ indent: true });
  const xmlPath = path.join(process.cwd(), "public", "feed.xml");
  fs.writeFileSync(xmlPath, rss);
}

generate();
