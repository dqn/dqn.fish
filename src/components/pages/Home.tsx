import * as React from 'react';

import { Article } from '@/helpers/article';

import { ArticleList } from '../organisms/ArticleList';

export type Props = {
  articles: Article[];
};

export const Home: React.FC<Props> = ({ articles }) => {
  return (
    <div className="max-w-5xl px-3 lg:px-0 mx-auto">
      <ArticleList articles={articles} />
    </div>
  );
};
