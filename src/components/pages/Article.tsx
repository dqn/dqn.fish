import dayjs from 'dayjs';
import React from 'react';

import { Article as ArticleType } from '@/helpers/article';

export type Props = {
  article: ArticleType;
};

export const Article: React.FC<Props> = ({ article }) => {
  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="w-full text-center px-3 py-12 lg:py-24">
          <h1 className="text-left inline-block">
            <span className="text-xl lg:text-2xl font-bold">
              {article.title}
            </span>
          </h1>
          <div className="mt-2">
            <time className="text-sm text-gray-600">
              {dayjs(article.published).format('YYYY/MM/DD')}
            </time>
          </div>
        </div>

        <div
          className="markdown p-3 lg:p-8"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </>
  );
};
