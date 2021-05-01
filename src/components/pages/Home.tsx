import * as React from "react";

import { Article } from "@/helpers/article";

import { ArticleList } from "../organisms/ArticleList";

export type Props = {
  articles: Article[];
};

export const Home: React.VFC<Props> = ({ articles }) => {
  return (
    <main className="max-w-3xl px-3 lg:px-0 mx-auto">
      <ArticleList articles={articles} />
    </main>
  );
};
