import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import { About } from '@/components/pages/About';

const AboutPage: NextPage = (props) => {
  return (
    <>
      <NextSeo title="About" />
      <About {...props} />
    </>
  );
};

export default AboutPage;
