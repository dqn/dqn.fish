import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { NextSeo } from 'next-seo';
import React from 'react';

import { Article, Props as ArticleProps } from '@/components/pages/Article';
import { getArticle, getArticleFileNames } from '@/helpers/article';

const ArticlePage: NextPage<ArticleProps> = (props) => {
  return (
    <>
      <NextSeo title={props.article.title} />
      <Article {...props} />
    </>
  );
};

type Params = {
  id: string;
};

export const getStaticProps: GetStaticProps<ArticleProps, Params> = async ({
  params,
}) => {
  if (!params) {
    throw new TypeError('params must not be undefined');
  }

  const article = await getArticle(params.id + '.md');
  return {
    props: {
      article,
    },
  };
};

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const fileNames = await getArticleFileNames();
  const paths = fileNames.map((fileName) => ({
    params: { id: fileName.replace(/\.md$/, '') },
  }));

  return { paths, fallback: false };
};

export default ArticlePage;
