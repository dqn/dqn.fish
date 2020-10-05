import dayjs from 'dayjs';
import Link from 'next/link';
import React from 'react';

import { Article } from '@/helpers/article';

export type Props = {
  articles: Article[];
};

export const Home: React.FC<Props> = ({ articles }) => {
  return (
    <div className="max-w-5xl p-2 mx-auto">
      <div className="flex flex-wrap">
        {articles.map((article, i) => (
          <div className="w-full py-6" key={i}>
            <div className="text-sm text-gray-600">
              <time>{dayjs(article.published).format('YYYY/MM/DD')}</time>
            </div>
            <Link href="/articles/[id]" as={`articles/${article.id}`}>
              <a className="text-lg font-bold">{article.title}</a>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
