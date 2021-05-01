import * as React from "react";
import TwitterLogo from "@/assets/twitter-white.svg";
import { ExternalLink } from "../atoms/ExternalLink";

type Props = {
  text: string;
  url: string;
};

export const TweetButton: React.VFC<Props> = ({ text, url }) => {
  const intentUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;

  return (
    <>
      <ExternalLink href={intentUrl}>
        <div className="tweet-button inline-block rounded pl-1 pr-2">
          <div className="flex justify-center items-center">
            <TwitterLogo width="20px" height="20px" />
            <span className="text-white">Tweet</span>
          </div>
        </div>
      </ExternalLink>

      <style jsx>{`
        .tweet-button {
          background-color: #1b95e0;
          font-size: 11px;
        }
      `}</style>
    </>
  );
};
