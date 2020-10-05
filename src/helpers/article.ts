import fs from 'fs/promises';
import matter from 'gray-matter';
import hljs from 'highlight.js';
import marked from 'marked';
import path from 'path';

export type Article = {
  id: string;
  title: string;
  published: string;
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
    content: marked(md.content),
    ...(md.data as Omit<Article, 'id' | 'content'>),
  };
}

export async function getArticleFileNames(): Promise<string[]> {
  return fs.readdir(articlesPath);
}

export async function getArticles(): Promise<Article[]> {
  const fileNames = await getArticleFileNames();
  const paths = fileNames.map((fileName) => path.join(articlesPath, fileName));
  const articles = paths.map(readArticle);

  return articles.reverse();
}

export async function getArticle(id: string): Promise<Article> {
  return readArticle(path.join(articlesPath, id));
}
