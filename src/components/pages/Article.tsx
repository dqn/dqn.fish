import dayjs from "dayjs";
import * as React from "react";

import { Article as ArticleType } from "@/helpers/article";
import { TweetButton } from "../molecules/TweetButton";
import { HatenaBookmarkButton } from "../molecules/HatenaBookmarkButton";

export type Props = {
  article: ArticleType;
};

export const Article: React.FC<Props> = ({ article }) => {
  const pageUrl = "https://dqn.fish/articles/" + article.id;

  return (
    <div className="max-w-3xl mx-auto">
      <header className="w-full text-center px-3 py-12 lg:py-24">
        <h1 className="text-left inline-block">
          <span className="text-xl lg:text-2xl font-bold">{article.title}</span>
        </h1>
        <div className="mt-2">
          <time className="text-sm text-gray-500">
            {dayjs(article.published).format("YYYY/MM/DD")}
          </time>
        </div>
      </header>

      <div className="bg-white p-3 lg:p-8">
        <main
          className="markdown"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <article className="pt-4">
          <div className="text-gray-800 font-bold mb-1">Share</div>
          <div className="flex items-center">
            <div>
              <TweetButton text={article.title} url={pageUrl} />
            </div>
            <div className="ml-2">
              <HatenaBookmarkButton url={pageUrl} />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
