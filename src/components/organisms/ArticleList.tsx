import dayjs from "dayjs";
import Link from "next/link";
import * as React from "react";

import { Article } from "@/helpers/article";

type Props = {
  articles: Article[];
};

export const ArticleList: React.FC<Props> = ({ articles }) => {
  return (
    <div className="flex flex-wrap divide-y divide-gray-600">
      {articles.map(({ id, title, published }, i) => (
        <article className="w-full py-5" key={i}>
          <Link href={"/articles/" + id}>
            <a className="text-lg font-bold hover:underline">{title}</a>
          </Link>
          <div>
            <time className="text-sm text-gray-400">
              {dayjs(published).format("YYYY/MM/DD")}
            </time>
          </div>
        </article>
      ))}
    </div>
  );
};
