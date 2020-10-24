import * as React from 'react';

type Props = {
  email: string;
};

export const EmailLink: React.FC<Props> = ({ email }) => {
  return (
    <a href={`mailto:${email}`} className="underline">
      {email}
    </a>
  );
};
