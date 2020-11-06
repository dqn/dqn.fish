import Link from 'next/link';
import * as React from 'react';

import { name as title } from '@/../package.json';

export const NavigationBar: React.FC = () => {
  return (
    <header className="text-white bg-theme-color px-3 py-2">
      <div className="text-xl font-bold flex items-center max-w-5xl mx-auto">
        <div>
          <Link href="/">
            <a>{title}</a>
          </Link>
        </div>
        <div className="text-right flex-grow">
          <Link href="/about">
            <a>About</a>
          </Link>
        </div>
      </div>
    </header>
  );
};
