import * as React from "react";
import TwitterLogo from "@/assets/hatena-bookmark.svg";
import { ExternalLink } from "../atoms/ExternalLink";

type Props = {
  url: string;
};

export const HatenaBookmarkButton: React.FC<Props> = ({ url }) => {
  const intentUrl = `https://b.hatena.ne.jp/entry/panel/?mode=confirm&url=${url}`;

  return (
    <>
      <ExternalLink href={intentUrl}>
        <div className="hatena-bookmark-button inline-block rounded pl-1 pr-2">
          <div className="flex justify-center items-center">
            <TwitterLogo width="20px" height="20px" />
            <span className="text-white">ブックマーク</span>
          </div>
        </div>
      </ExternalLink>

      <style jsx>{`
        .hatena-bookmark-button {
          background-color: #00a4de;
          font-size: 11px;
        }
      `}</style>
    </>
  );
};
