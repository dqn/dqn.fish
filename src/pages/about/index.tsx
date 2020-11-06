import { NextPage } from "next";
import { NextSeo } from "next-seo";

import { About } from "@/components/pages/About";

const AboutPage: NextPage = (props) => {
  return (
    <>
      <NextSeo title="About" description="このブログの管理者について。" />
      <About {...props} />
    </>
  );
};

export default AboutPage;
