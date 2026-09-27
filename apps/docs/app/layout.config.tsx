import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <img src="/logo.svg" alt="Rank logo" width={24} height={24} className="size-6 shrink-0" />
        Rank
      </>
    ),
  },
  links: [
    {
      text: "App",
      url: "https://rank.listeningkit.com",
      external: true,
    },
  ],
};
