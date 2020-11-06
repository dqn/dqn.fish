import * as React from "react";

import { Article } from "@/helpers/article";

import { ArticleList } from "../organisms/ArticleList";

export type Props = {
  tag: string;
  articles: Article[];
};

export const Tag: React.FC<Props> = ({ tag, articles }) => {
  return (
    <div className="max-w-5xl px-3 lg:px-0 mx-auto">
      <h2 className="text-xl font-bold mt-5">
        <span className="border-b-2 border-theme-color">{tag}</span>
      </h2>
      <ArticleList articles={articles} />
    </div>
  );
};
