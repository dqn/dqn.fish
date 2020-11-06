import { GetStaticProps, NextPage } from "next";
import { NextSeo } from "next-seo";

import { Home, Props as HomeProps } from "@/components/pages/Home";
import { getArticles } from "@/helpers/article";

const HomePage: NextPage<HomeProps> = (props) => {
  return (
    <>
      <NextSeo
        title="dqn.fish"
        titleTemplate="%s"
        description="気ままにやっていきます。"
      />
      <Home {...props} />
    </>
  );
};

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const articles = getArticles();
  return {
    props: {
      articles,
    },
  };
};

export default HomePage;
