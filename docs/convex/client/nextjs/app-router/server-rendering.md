# Next.js Server Rendering

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Next.js automatically renders both Client and Server Components on the server during the initial page load.

By default Client Components will not wait for Convex data to be loaded, and your UI will render in a "loading" state. Read on to learn how to preload data during server rendering and how to interact with the Convex deployment from Next.js server-side.

**Example:** [Next.js App Router](https://github.com/get-convex/convex-demos/tree/main/nextjs-app-router)

This pages covers the App Router variant of Next.js.

Next.js Server Rendering support is in beta

Next.js Server Rendering support<!-- --> <!-- -->is<!-- --> currently a [beta feature](/production/state/.md#beta-features). If you have feedback or feature requests, [let us know on Discord](https://convex.dev/community)!

## Preloading data for Client Components[​](#preloading-data-for-client-components "Direct link to Preloading data for Client Components")

If you want to preload data from Convex and leverage Next.js [server rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#server-rendering-strategies), but still retain reactivity after the initial page load, use [`preloadQuery`](/api/modules/nextjs.md#preloadquery) from [`convex/nextjs`](/api/modules/nextjs.md).

In a [Server Component](https://nextjs.org/docs/app/building-your-application/rendering/server-components) call `preloadQuery`:

app/TasksWrapper.tsx

```
import { preloadQuery } from "convex/nextjs";

import { api } from "@/convex/_generated/api";

import { Tasks } from "./Tasks";



export async function TasksWrapper() {

  const preloadedTasks = await preloadQuery(api.tasks.list, {

    list: "default",

  });

  return <Tasks preloadedTasks={preloadedTasks} />;

}
```

In a [Client Component](https://nextjs.org/docs/app/building-your-application/rendering/client-components) call [`usePreloadedQuery`](/api/modules/react.md#usepreloadedquery):

app/TasksWrapper.tsx

```
"use client";



import { Preloaded, usePreloadedQuery } from "convex/react";

import { api } from "@/convex/_generated/api";



export function Tasks(props: {

  preloadedTasks: Preloaded<typeof api.tasks.list>;

}) {

  const tasks = usePreloadedQuery(props.preloadedTasks);

  // render `tasks`...

  return <div>...</div>;

}
```

[`preloadQuery`](/api/modules/nextjs.md#preloadquery) takes three arguments:

1. The query reference
2. Optionally the arguments object passed to the query
3. Optionally a [NextjsOptions](/api/modules/nextjs.md#nextjsoptions) object

`preloadQuery` uses the [`cache: 'no-store'` policy](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#opting-out-of-data-caching) so any Server Components using it will not be eligible for [static rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#server-rendering-strategies).

### Using the query result[​](#using-the-query-result "Direct link to Using the query result")

[`preloadQuery`](/api/modules/nextjs.md#preloadquery) returns an opaque `Preloaded` payload that should be passed through to `usePreloadedQuery`. If you want to use the return value of the query, perhaps to decide whether to even render the Client Component, you can pass the `Preloaded` payload to the [`preloadedQueryResult`](/api/modules/nextjs.md#preloadedqueryresult) function.

## Using Convex to render Server Components[​](#using-convex-to-render-server-components "Direct link to Using Convex to render Server Components")

If you need Convex data on the server, you can load data from Convex in your [Server Components](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching), but it will be non-reactive. To do this, use the [`fetchQuery`](/api/modules/nextjs.md#fetchquery) function from `convex/nextjs`:

app/StaticTasks.tsx

```
import { fetchQuery } from "convex/nextjs";

import { api } from "@/convex/_generated/api";



export async function StaticTasks() {

  const tasks = await fetchQuery(api.tasks.list, { list: "default" });

  // render `tasks`...

  return <div>...</div>;

}
```

## Server Actions and Route Handlers[​](#server-actions-and-route-handlers "Direct link to Server Actions and Route Handlers")

Next.js supports building HTTP request handling routes, similar to Convex [HTTP Actions](/functions/http-actions.md). You can use Convex from a [Server Action](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) or a [Route Handler](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) as you would any other database service.

To load and edit Convex data in your Server Action or Route Handler, you can use the `fetchQuery`, `fetchMutation` and `fetchAction` functions.

Here's an example inline Server Action calling a Convex mutation:

app/example/page.tsx

```
import { api } from "@/convex/_generated/api";

import { fetchMutation, fetchQuery } from "convex/nextjs";

import { revalidatePath } from "next/cache";



export default async function PureServerPage() {

  const tasks = await fetchQuery(api.tasks.list, { list: "default" });

  async function createTask(formData: FormData) {

    "use server";



    await fetchMutation(api.tasks.create, {

      text: formData.get("text") as string,

    });

    revalidatePath("/example");

  }

  // render tasks and task creation form

  return <form action={createTask}>...</form>;

}
```

Here's an example Route Handler calling a Convex mutation:

app/api/route.ts

```
import { NextResponse } from "next/server";

// Hack for TypeScript before 5.2

const Response = NextResponse;



import { api } from "@/convex/_generated/api";

import { fetchMutation } from "convex/nextjs";



export async function POST(request: Request) {

  const args = await request.json();

  await fetchMutation(api.tasks.create, { text: args.text });

  return Response.json({ success: true });

}
```

## Server-side authentication[​](#server-side-authentication "Direct link to Server-side authentication")

To make authenticated requests to Convex during server rendering, pass a JWT token to [`preloadQuery`](/api/modules/nextjs.md#preloadquery) or [`fetchQuery`](/api/modules/nextjs.md#fetchquery) in the third options argument:

app/TasksWrapper.tsx

```
import { preloadQuery } from "convex/nextjs";

import { api } from "@/convex/_generated/api";

import { Tasks } from "./Tasks";



export async function TasksWrapper() {

  const token = await getAuthToken();

  const preloadedTasks = await preloadQuery(

    api.tasks.list,

    { list: "default" },

    { token },

  );

  return <Tasks preloadedTasks={preloadedTasks} />;

}
```

The implementation of `getAuthToken` depends on your authentication provider.

* Clerk
* Auth0

app/auth.ts

```
import { auth } from "@clerk/nextjs/server";



export async function getAuthToken() {

  return (await (await auth()).getToken()) ?? undefined;

}
```

app/auth.ts

```
// You'll need v4.3 or later of @auth0/nextjs-auth0

import { getSession } from '@auth0/nextjs-auth0';



export async function getAuthToken() {

  const session = await getSession();

  const idToken = session.tokenSet.idToken;

  return idToken;

}
```

## Configuring Convex deployment URL[​](#configuring-convex-deployment-url "Direct link to Configuring Convex deployment URL")

Convex hooks used by Client Components are configured via the `ConvexReactClient` constructor, as shown in the [Next.js Quickstart](/quickstart/nextjs.md).

To use `preloadQuery`, `fetchQuery`, `fetchMutation` and `fetchAction` in Server Components, Server Actions and Route Handlers you must either:

1. have `NEXT_PUBLIC_CONVEX_URL` environment variable set to the Convex deployment URL
2. or pass the [`url` option](/api/modules/nextjs.md#nextjsoptions) in the third argument to `preloadQuery`, `fetchQuery`, `fetchMutation` or `fetchAction`

## Consistency[​](#consistency "Direct link to Consistency")

[`preloadQuery`](/api/modules/nextjs.md#preloadquery) and [`fetchQuery`](/api/modules/nextjs.md#fetchquery) use the `ConvexHTTPClient` under the hood. This client is stateless. This means that two calls to `preloadQuery` are not guaranteed to return consistent data based on the same database state. This is similar to more traditional databases, but is different from the [guaranteed consistency](/client/react/overview.md#consistency) provided by the `ConvexReactClient`.

To prevent rendering an inconsistent UI avoid using multiple `preloadQuery` calls on the same page.
