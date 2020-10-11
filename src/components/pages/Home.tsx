import dayjs from 'dayjs';
import Link from 'next/link';
import React from 'react';

import { Article } from '@/helpers/article';

export type Props = {
  articles: Article[];
};

export const Home: React.FC<Props> = ({ articles }) => {
  return (
    <div className="max-w-5xl px-2 lg:px-0 mx-auto">
      <div className="flex flex-wrap divide-y divide-gray-700">
        {articles.map((article, i) => (
          <div className="w-full pt-6 pb-6" key={i}>
            <Link href="/articles/[id]" as={`articles/${article.id}`}>
              <a className="text-lg lg:text-xl font-bold">{article.title}</a>
            </Link>
            <div className="mt-2">
              <time className="text-md lg:text-lg text-gray-600">
                {dayjs(article.published).format('YYYY/MM/DD')}
              </time>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
