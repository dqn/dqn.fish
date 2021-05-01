import Link from "next/link";
import * as React from "react";

export const NavigationBar: React.VFC = () => {
  return (
    <header className="text-white bg-theme-color px-3 py-2">
      <div className="text-xl font-bold flex items-center max-w-3xl mx-auto">
        <div>
          <Link href="/">
            <a className="hover:underline">dqn.fish</a>
          </Link>
        </div>
        <div className="text-right flex-grow">
          <Link href="/about">
            <a className="hover:underline">About</a>
          </Link>
        </div>
      </div>
    </header>
  );
};
