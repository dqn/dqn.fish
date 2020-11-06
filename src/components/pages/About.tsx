import * as React from "react";

import { SwimmingFish } from "@/components/organisms/SwimmingFish";

import { EmailLink } from "../atoms/EmailLink";
import { ExternalLink } from "../atoms/ExternalLink";

export const About: React.FC = () => {
  const infomations = [
    {
      title: "Author",
      items: [<span>DQN</span>],
    },
    {
      title: "Links",
      items: [
        <ExternalLink href="https://github.com/dqn">GitHub</ExternalLink>,
      ],
    },
    {
      title: "Contact",
      items: [<EmailLink email={"dqn443@gmail.com"} />],
    },
    {
      title: "RSS",
      items: [
        <ExternalLink href={"/feed.xml"}>
          https://dqn.fish/feed.xml
        </ExternalLink>,
      ],
    },
  ];

  return (
    <>
      <header className="relative w-full h-60vh">
        <div className="absolute w-full h-60vh">
          <SwimmingFish />
        </div>

        <div className="absolute w-full h-60vh">
          <div className="h-full flex items-center">
            <div className="text-center w-full">
              <h1 className="font-bold text-3xl">dqn.fish</h1>
            </div>
          </div>
        </div>
      </header>

      <main>
        <article className="max-w-3xl p-4 lg:px-0 mx-auto">
          {infomations.map(({ title, items }, i) => (
            <section className="mt-5 first:mt-0" key={i}>
              <h3 className="text-xl font-bold">{title}</h3>
              <ul className="list-disc pl-5">
                {items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </article>
      </main>
    </>
  );
};
