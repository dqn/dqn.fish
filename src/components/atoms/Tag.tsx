import React from 'react';

type Props = {
  name: string;
};

export const Tag: React.FC<Props> = ({ name }) => {
  return (
    <>
      <div className="tag text-sm font-semibold bg-theme-color white rounded">
        {name}
      </div>

      <style jsx>{`
        .tag {
          padding: 3px 5px;
        }
      `}</style>
    </>
  );
};
