import dayjs from 'dayjs';
import Link from 'next/link';
import React from 'react';

import { Article } from '@/helpers/article';

import { Tag } from '../atoms/Tag';

type Props = {
  articles: Article[];
};

export const ArticleList: React.FC<Props> = ({ articles }) => {
  return (
    <div className="flex flex-wrap divide-y divide-gray-700">
      {articles.map(({ id, title, published, tags }, i) => (
        <div className="w-full pt-6 pb-6" key={i}>
          <Link href="/articles/[id]" as={'/articles/' + id}>
            <a className="text-lg lg:text-xl font-bold">{title}</a>
          </Link>
          <div>
            <time className="text-sm text-gray-600">
              {dayjs(published).format('YYYY/MM/DD')}
            </time>
          </div>
          <div className="flex mt-1">
            {tags.map((tag, i) => (
              <div className="ml-2 first:ml-0">
                <Link href="/tags/[id]" as={'/tags/' + tag}>
                  <a>
                    <Tag name={tag} key={i} />
                  </a>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
