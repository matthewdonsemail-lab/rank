# Next.js Pages Router

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

This pages covers the Pages Router variant of Next.js. Alternatively see the [App Router](/client/nextjs/app-router/.md) version of this page.

## Getting started[​](#getting-started "Direct link to Getting started")

Follow the [Next.js Pages Router Quickstart](/client/nextjs/pages-router/quickstart.md) to add Convex to a new or existing Next.js project.

## Adding client-side authentication[​](#adding-client-side-authentication "Direct link to Adding client-side authentication")

The simplest approach to authentication in Next.js is to keep it client-side.

For example Auth0 describes this approach in [Next.js Authentication with Auth0 guide](https://auth0.com/blog/ultimate-guide-nextjs-authentication-auth0), describing it in "[Next.js Static Site Approach](https://auth0.com/blog/ultimate-guide-nextjs-authentication-auth0/#Next-js-Static-Site-Approach)" and "Serverless with the user on the frontend".

To require login on every page of your application you can add logic to `_app.jsx` to conditionally render page content, blocking it until the user is logged in.

If you're using Auth0, the helper component `ConvexProviderWithAuth0` can be imported from `convex/react-auth0`.

pages/\_app.tsx

```
import { ConvexReactClient } from "convex/react";

import { ConvexProviderWithAuth0 } from "convex/react-auth0";

import { Auth0Provider } from "@auth0/auth0-react";

import { AppProps } from "next/app";



const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);



export default function MyApp({ Component, pageProps }: AppProps) {

  return (

    <Auth0Provider

      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}

      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}

      authorizationParams={{

        redirect_uri:

          typeof window === "undefined" ? undefined : window.location.origin,

      }}

      useRefreshTokens={true}

      cacheLocation="localstorage"

    >

      <ConvexProviderWithAuth0 client={convex}>

        <Component {...pageProps} />

      </ConvexProviderWithAuth0>

    </Auth0Provider>

  );

}
```

Custom loading and logged out views can be built with the helper `Authenticated`, `Unauthenticated`, `AuthLoading` and `AuthRefreshing` components from `convex/react`, see the [Convex Next.js demo](https://github.com/get-convex/convex-demos/tree/main/nextjs-pages-router/pages/_app.jsx) for an example.

If only some routes of your app require login, the same helpers can be used directly in page components that do require login instead of being shared between all pages from `pages/_app.jsx`. Share a single [ConvexReactClient](/api/classes/react.ConvexReactClient.md) instance between pages to avoid needing to reconnect to Convex on client-side page navigation.

Read more about authenticating users with Convex in [Authentication](/auth/overview.md).

## API routes[​](#api-routes "Direct link to API routes")

Next.js supports building HTTP request handling routes, similar to Convex [HTTP Actions](/functions/http-actions.md). Using Next.js routes might be helpful if you need to use a dependency not supported by the Convex default runtime.

To build an [API route](https://nextjs.org/docs/api-routes/introduction) add a file to the `pages/api` directory.

To load and edit Convex data in your endpoints, use the [`fetchQuery`](/api/modules/nextjs.md#fetchquery) function from `convex/nextjs`:

pages/api/clicks.ts

```
import type { NextApiRequest, NextApiResponse } from "next";

import { fetchQuery } from "convex/nextjs";

import { api } from "../../convex/_generated/api";



export const count = async function handler(

  _req: NextApiRequest,

  res: NextApiResponse,

) {

  const clicks = await fetchQuery(api.counter.get, { counterName: "clicks" });

  res.status(200).json({ clicks });

};
```

## Server-side rendering[​](#server-side-rendering "Direct link to Server-side rendering")

**Consider client-side rendering Convex data when using Next.js.** Data from Convex is [fully reactive](/functions/query-functions.md#caching--reactivity--consistency) so Convex needs a connection from your deployment to the browser in order to push updates as data changes.

You can of course load data from Convex in [`getStaticProps`](https://nextjs.org/docs/basic-features/data-fetching/get-static-props) or [`getServerSideProps`](https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props), but it will be non-reactive. To do this, use the [`fetchQuery`](/api/modules/nextjs.md#fetchquery) function to call query functions just like you would in [API routes](#api-routes).

To make authenticated requests to Convex during server-side rendering, you need authentication info present server-side. Auth0 describes this approach in [Serverless with the user on the backend](https://auth0.com/blog/ultimate-guide-nextjs-authentication-auth0/#Serverless-with-the-user-on-the-backend). When server-side rendering, pass the authentication token as `token` to the third argument of `fetchQuery`.

To preload data on server side before rendering a reactive query on the client side use [`preloadQuery`](/api/modules/nextjs.md#preloadquery). Check out the [App Router version of these docs](/client/nextjs/app-router/server-rendering.md) for more details.
