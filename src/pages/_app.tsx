import "@/styles/index.css";
import "highlight.js/styles/vs2015.css";

import { DefaultSeo } from "next-seo";
import { AppProps } from "next/app";
import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";

import { NavigationBar } from "@/components/templates/NavigationBar";
import * as gtag from "@/helpers/gtag";

const App: React.VFC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();

  useEffect(() => {
    router.events.on("routeChangeComplete", gtag.pageview);
    return () => {
      router.events.off("routeChangeComplete", gtag.pageview);
    };
  }, [router.events]);

  return (
    <>
      <DefaultSeo
        titleTemplate={`%s - dqn.fish`}
        description={"個人の技術ブログです。"}
        openGraph={{
          type: "website",
          title: "dqn.fish",
          description: "気ままにやっています。",
          images: [
            {
              url: "https://dqn.fish/avatar.png",
            },
          ],
        }}
        twitter={{
          cardType: "summary",
        }}
      />

      <NavigationBar />
      <Component {...pageProps} />
      <footer className="text-center text-xs py-4">© 2020 DQN</footer>

      <style global jsx>{`
        html {
          color: white;
          background-color: #21242d;
          font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue",
            "Yu Gothic", "YuGothic", Verdana, Meiryo, sans-serif;
        }
      `}</style>
    </>
  );
};

export default App;
