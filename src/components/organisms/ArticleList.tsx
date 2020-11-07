import dayjs from "dayjs";
import Link from "next/link";
import * as React from "react";

import { Article } from "@/helpers/article";

type Props = {
  articles: Article[];
};

export const ArticleList: React.FC<Props> = ({ articles }) => {
  return (
    <div className="flex flex-wrap divide-y divide-gray-700">
      {articles.map(({ id, title, published }, i) => (
        <article className="w-full py-5" key={i}>
          <Link href="/articles/[id]" as={"/articles/" + id}>
            <a className="text-lg lg:text-xl font-bold">{title}</a>
          </Link>
          <div>
            <time className="text-sm text-gray-600">
              {dayjs(published).format("YYYY/MM/DD")}
            </time>
          </div>
        </article>
      ))}
    </div>
  );
};
