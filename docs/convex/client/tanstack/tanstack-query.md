# Convex with TanStack Query

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[TanStack Query](https://tanstack.com/query/latest) is an excellent, popular library for managing requests to a server.

The [`@convex-dev/react-query`](https://www.npmjs.com/package/@convex-dev/react-query) library provides [Query Option](https://tanstack.com/query/latest/docs/framework/react/guides/query-options) functions for use with TanStack Query.

Not all features of the standard [Convex React client](/client/react/overview.md) are available through the TanStack Query APIs but you can use the two alongside each other, dropping into the standard Convex React hooks as necessary.

The TanStack Query adapter is in beta

The TanStack Query adapter<!-- --> <!-- -->is<!-- --> currently a [beta feature](/production/state/.md#beta-features). If you have feedback or feature requests, [let us know on Discord](https://convex.dev/community)!

This makes subscribing to a Convex query function using the TanStack Query `useQuery` hook look like this:

```
const { data, isPending, error } = useQuery(convexQuery(api.messages.list, {}));
```

Instead of the typical polling pattern for API endpoints used with TanStack Query, the code above receives updates for this `api.messages.list` query from the Convex server reactively. New results for all relevant subscriptions are pushed to the client where they update at the same time so data is never stale and there's no need to manually invalidate queries.

Support for other frameworks

Currently only [React Query](https://tanstack.com/query/latest/docs/framework/react/overview) is supported via [`@convex-dev/react-query`](https://www.npmjs.com/package/@convex-dev/react-query). [Let us know](https://convex.dev/community) if you would find support for vue-query, svelte-query, solid-query, or angular-query helpful.

## Setup[​](#setup "Direct link to Setup")

To get live updates in TanStack Query create a `ConvexQueryClient` and connect it to the TanStack Query [QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient). After installing the adapter library with

```
npm i @convex-dev/react-query
```

wire up Convex to TanStack Query like this:

src/main.tsx

```
import { ConvexQueryClient } from "@convex-dev/react-query";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ConvexProvider, ConvexReactClient } from "convex/react";

import ReactDOM from "react-dom/client";

import App from "./App";

import "./index.css";



const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

const convexQueryClient = new ConvexQueryClient(convex);

const queryClient = new QueryClient({

  defaultOptions: {

    queries: {

      queryKeyHashFn: convexQueryClient.hashFn(),

      queryFn: convexQueryClient.queryFn(),

    },

  },

});

convexQueryClient.connect(queryClient);



ReactDOM.createRoot(document.getElementById("root")!).render(

  <ConvexProvider client={convex}>

    <QueryClientProvider client={queryClient}>

      <App />

    </QueryClientProvider>

  </ConvexProvider>,

);
```

Note that when your create your React tree you should both:

* wrap your app in the TanStack Query [`QueryClientProvider`](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider) so you can use [TanStack Query hooks](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery) and
* wrap your app in the [`ConvexProvider`](/api/modules/react.md#convexprovider) so you can also use normal [Convex React](/client/react/overview.md) hooks

## Queries[​](#queries "Direct link to Queries")

A live-updating subscription to a Convex [query](/functions/query-functions.md) is as simple as calling TanStack [`useQuery`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery) with `convexQuery`:

```
import { useQuery } from "@tanstack/react-query";

import { convexQuery } from "@convex-dev/react-query";

import { api } from "../convex/_generated/api";



export function App() {

  const { data, isPending, error } = useQuery(

    convexQuery(api.functions.myQuery, { id: 123 }),

  );

  return isPending ? "Loading..." : data;

}
```

You can spread the object returned by `convexQuery` into an object specifying additional [arguments of `useQuery`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

```
const { data, isPending, error } = useQuery({

  ...convexQuery(api.functions.myQuery, { id: 123 }),

  initialData: [], // use an empty list if no data is available yet

  gcTime: 10000, // stay subscribed for 10 seconds after this component unmounts

});
```

## Mutations[​](#mutations "Direct link to Mutations")

Your app can call Convex [mutations](/functions/mutation-functions.md) by using the TanStack [`useMutation`](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation) hook, and setting the `mutationFn` property to the result of calling `useConvexMutation`:

```
import { useMutation } from "@tanstack/react-query";

import { useConvexMutation } from "@convex-dev/react-query";

import { api } from "../convex/_generated/api";



export function App() {

  const { mutate, isPending } = useMutation({

    mutationFn: useConvexMutation(api.functions.doSomething),

  });

  return <button onClick={() => mutate({a: "Hello"})}>Click me</button>;

}
```

`useConvexMutation` is just a re-export of the [`useMutation`](/client/react/overview.md#editing-data) hook from [Convex React](/client/react/overview.md).

## Differences from using `fetch` with TanStack Query[​](#differences-from-using-fetch-with-tanstack-query "Direct link to differences-from-using-fetch-with-tanstack-query")

Convex provides stronger guarantees than other methods of fetching data with React Query, so some options and return value properties are no longer necessary.

Subscriptions to Convex queries will remain active after the last component using `useQuery` for a given function unmounts for `gcTime` milliseconds. This value is 5 minutes by default; if this results in unwanted function activity use a smaller value.

Data provided by Convex is never stale, so the `isStale` property of the return value of `useQuery` will always be false. `retry`-related options are ignored, since Convex provides its own retry mechanism over its WebSocket protocol. `refetch`-related options are similarly ignored since Convex queries are always up to date.
