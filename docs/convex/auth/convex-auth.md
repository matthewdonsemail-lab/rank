# Convex Auth

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[Convex Auth](https://labs.convex.dev/auth) is a library for implementing authentication directly within your Convex backend. This allows you to authenticate users without needing an authentication service or even a hosting server. Convex Auth currently supports client-side React web apps served from a CDN and React Native mobile apps.

**Example:** [Live Demo](https://labs.convex.dev/auth-example) ([Source](https://github.com/get-convex/convex-auth-example))

Convex Auth is in beta

Convex Auth<!-- --> <!-- -->is<!-- --> currently a [beta feature](/production/state/.md#beta-features). If you have feedback or feature requests, [let us know on Discord](https://convex.dev/community)!

Support for [authentication in Next.js](https://labs.convex.dev/auth/authz/nextjs) server components, API routes, middleware, SSR etc. is under active development. If you'd like to help test this experimental support please [let us know how it goes in Discord](https://convex.dev/community).

## Get Started[​](#get-started "Direct link to Get Started")

To start a new project from scratch with Convex and Convex Auth, run:

```
npm create convex@latest
```

and choose `React (Vite)` and `Convex Auth`.

***

To add Convex Auth to an existing project, follow the full [setup guide](https://labs.convex.dev/auth/setup).

## Overview[​](#overview "Direct link to Overview")

Convex Auth enables you to implement the following authentication methods:

1. Magic Links & OTPs - send a link or code via email
2. OAuth - sign in with GitHub / Google / Apple etc.
3. Passwords - including password reset flow and optional email verification

The library doesn't come with UI components, but you can copy code from the docs and example repo to quickly build a UI in React.

Learn more in the [Convex Auth docs](https://labs.convex.dev/auth).
