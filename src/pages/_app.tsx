import '@/styles/index.css';
import 'highlight.js/styles/vs2015.css';

import { DefaultSeo } from 'next-seo';
import { AppProps } from 'next/app';
import * as React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { name as title } from '@/../package.json';
import { NavigationBar } from '@/components/templates/NavigationBar';
import * as gtag from '@/helpers/gtag';

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();

  useEffect(() => {
    router.events.on('routeChangeComplete', gtag.pageview);
    return () => {
      router.events.off('routeChangeComplete', gtag.pageview);
    };
  }, [router.events]);

  return (
    <>
      <DefaultSeo
        openGraph={{
          type: 'website',
        }}
        titleTemplate={`%s - ${title}`}
      />

      <NavigationBar />
      <Component {...pageProps} />
      <footer className="text-center text-xs py-4">© 2020 DQN</footer>

      <style global jsx>{`
        html {
          color: white;
          background-color: #21242d;
          font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN',
            'Hiragino Sans', Meiryo, sans-serif;
        }
      `}</style>
    </>
  );
};

export default App;
