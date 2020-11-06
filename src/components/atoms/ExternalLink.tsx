import * as React from "react";

type Props = {
  href: string;
};

export const ExternalLink: React.FC<Props> = ({ href, children }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline"
    >
      {children}
    </a>
  );
};
