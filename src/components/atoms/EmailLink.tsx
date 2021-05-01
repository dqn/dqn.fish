import * as React from "react";

type Props = {
  email: string;
};

export const EmailLink: React.VFC<Props> = ({ email }) => {
  return (
    <a href={`mailto:${email}`} className="hover:underline">
      {email}
    </a>
  );
};
