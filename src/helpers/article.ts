import fs from 'fs';
import matter from 'gray-matter';
import hljs from 'highlight.js';
import marked from 'marked';
import path from 'path';

const renderer = new marked.Renderer();
const linkRenderer = renderer.link.bind(renderer);

renderer.link = (href, title, text) => {
  const html = linkRenderer(href, title, text);
  return html.replace(/^<a /, '<a target="_blank" rel="noopener noreferrer" ');
};

export type Article = {
  id: string;
  title: string;
  published: string;
  tags: string[];
  content: string;
};

marked.setOptions({
  highlight(code, lang) {
    return hljs.highlightAuto(code, [lang]).value;
  },
});

const articlesPath = path.join(process.cwd(), 'articles');

function readArticle(filePath: string): Article {
  const md = matter.read(filePath);

  return {
    id: path.basename(filePath, '.md'),
    content: marked(md.content, { renderer }),
    ...(md.data as Omit<Article, 'id' | 'content'>),
  };
}

export function getArticleFileNames(): string[] {
  return fs.readdirSync(articlesPath);
}

export function getArticles(): Article[] {
  const fileNames = getArticleFileNames();
  const paths = fileNames.map((fileName) => path.join(articlesPath, fileName));
  const articles = paths.map(readArticle);

  return articles.reverse();
}

export function getArticle(id: string): Article {
  return readArticle(path.join(articlesPath, id));
}
