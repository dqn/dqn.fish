import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { NextSeo } from 'next-seo';

import { Props as TagProps, Tag } from '@/components/pages/Tag';
import { getArticle, getArticleFileNames } from '@/helpers/article';

const ArticlePage: NextPage<TagProps> = (props) => {
  return (
    <>
      <NextSeo title={props.tag} />
      <Tag {...props} />
    </>
  );
};

type Params = {
  id: string;
};

export const getStaticProps: GetStaticProps<TagProps, Params> = async ({
  params,
}) => {
  if (!params) {
    throw new TypeError('params must not be undefined');
  }

  const fileNames = await getArticleFileNames();
  const articles = await Promise.all(fileNames.map(getArticle));
  const tagArticles = articles.filter((article) =>
    article.tags.includes(params.id),
  );

  return {
    props: {
      tag: params.id,
      articles: tagArticles,
    },
  };
};

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const fileNames = await getArticleFileNames();
  const articles = await Promise.all(fileNames.map(getArticle));
  const tags = articles.flatMap((article) => article.tags);
  const uniqueTags = [...new Set(tags)];
  const paths = uniqueTags.map((tag) => ({ params: { id: tag } }));

  return { paths, fallback: false };
};

export default ArticlePage;
