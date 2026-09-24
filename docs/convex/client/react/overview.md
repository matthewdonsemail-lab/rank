# Convex React

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Convex React is the client library enabling your React application to interact with your Convex backend. It allows your frontend code to:

1. Call your [queries](/functions/query-functions.md), [mutations](/functions/mutation-functions.md) and [actions](/functions/actions.md)
2. Upload and display files from [File Storage](/file-storage/overview.md)
3. Authenticate users using [Authentication](/auth/overview.md)
4. Implement full text [Search](/search/overview.md) over your data

The Convex React client is open source and available on [GitHub](https://github.com/get-convex/convex-js).

Follow the [React Quickstart](/quickstart/react.md) to get started with React using [Vite](https://vitejs.dev/).

## Installation[​](#installation "Direct link to Installation")

Convex React is part of the `convex` npm package:

```
npm install convex
```

## Connecting to a backend[​](#connecting-to-a-backend "Direct link to Connecting to a backend")

The [`ConvexReactClient`](/api/classes/react.ConvexReactClient.md) maintains a connection to your Convex backend, and is used by the React hooks described below to call your functions.

First you need to create an instance of the client by giving it your backend deployment URL. See [Configuring Deployment URL](/client/react/deployment-urls.md) on how to pass in the right value:

```
import { ConvexProvider, ConvexReactClient } from "convex/react";



const convex = new ConvexReactClient("https://<your domain here>.convex.cloud");
```

And then you make the client available to your app by passing it in to a [`ConvexProvider`](/api/modules/react.md#convexprovider) wrapping your component tree:

```
reactDOMRoot.render(

  <React.StrictMode>

    <ConvexProvider client={convex}>

      <App />

    </ConvexProvider>

  </React.StrictMode>,

);
```

## Fetching data[​](#fetching-data "Direct link to Fetching data")

Your React app fetches data using the [`useQuery`](/api/modules/react.md#usequery) React hook by calling your [queries](/functions/query-functions.md) via an [`api`](/generated-api/api.md#api) object.

The `npx convex dev` command generates this api object for you in the `convex/_generated/api.js` module to provide better autocompletion in JavaScript and end-to-end type safety in [TypeScript](/understanding/best-practices/typescript.md):

src/App.tsx

```
import { useQuery } from "convex/react";

import { api } from "../convex/_generated/api";



export function App() {

  const data = useQuery(api.functions.myQuery);

  return data ?? "Loading...";

}
```

The `useQuery` hook returns `undefined` while the data is first loading and afterwards the return value of your query.

### Query arguments[​](#query-arguments "Direct link to Query arguments")

Arguments to your query follow the query name:

src/App.tsx

```
export function App() {

  const a = "Hello world";

  const b = 4;

  const data = useQuery(api.functions.myQuery, { a, b });

  //...

}
```

### Reactivity[​](#reactivity "Direct link to Reactivity")

The `useQuery` hook makes your app automatically reactive: when the underlying data changes in your database, your component rerenders with the new query result.

The first time the hook is used it creates a subscription to your backend for a given query and any arguments you pass in. When your component unmounts, the subscription is canceled.

### Consistency[​](#consistency "Direct link to Consistency")

Convex React ensures that your application always renders a consistent view of the query results based on a single state of the underlying database.

Imagine a mutation changes some data in the database, and that 2 different `useQuery` call sites rely on this data. Your app will never render in an inconsistent state where only one of the `useQuery` call sites reflects the new data.

### Experimental: query result object[​](#experimental-query-result-object "Direct link to Experimental: query result object")

If you want a richer result object to handle when querying, try `useQuery_experimental`. It always returns an object with a `status` field, and does not throw errors by default.

The `status` of the result object will be one of `"pending" | "success" | "error"`. To help ensure correct handling of query results, the return type requires that you check the `status` before accessing other fields (`data` or `error`).

src/App.tsx

```
import { useQuery_experimental as useQuery } from "convex/react";

import { api } from "../convex/_generated/api";



function TaskList() {

  const result = useQuery({

    query: api.tasks.list,

    args: { completed: false },

  });



  if (result.status === "pending") return <div>Loading...</div>;

  if (result.status === "error")

    return <div>Error: {result.error.message}</div>;

  // `status` guaranteed to be `"success"` at this point; `data` available.

  return result.data.map((task) => <div key={task._id}>{task.text}</div>);

}
```

If you're migrating existing code that leverages error boundaries, you can use the `throwOnError: true` option to maintain that behavior.

### Paginating queries[​](#paginating-queries "Direct link to Paginating queries")

See [Paginating within React Components](/database/pagination.md#paginating-within-react-components).

### Skipping queries[​](#skipping-queries "Direct link to Skipping queries")

Advanced: Loading a query conditionally

With React it can be tricky to dynamically invoke a hook, because hooks cannot be placed inside conditionals or after early returns:

src/App.tsx

```
import { useQuery } from "convex/react";

import { api } from "../convex/_generated/api";



export function App() {

  // the URL `param` might be null

  const param = new URLSearchParams(window.location.search).get("param");

  // ERROR! React Hook "useQuery" is called conditionally. React Hooks must

  // be called in the exact same order in every component render.

  const data = param !== null ? useQuery(api.functions.read, { param }) : null;

  //...

}
```

For this reason `useQuery` can be "disabled" by passing in `"skip"` instead of its arguments:

src/App.tsx

```
import { useQuery } from "convex/react";

import { api } from "../convex/_generated/api";



export function App() {

  const param = new URLSearchParams(window.location.search).get("param");

  const data = useQuery(

    api.functions.read,

    param !== null ? { param } : "skip",

  );

  //...

}
```

When `"skip"` is used the `useQuery` doesn't talk to your backend at all and returns `undefined`.

### One-off queries[​](#one-off-queries "Direct link to One-off queries")

Advanced: Fetching a query from a callback

Sometimes you might want to read state from the database in response to a user action, for example to validate given input, without making any changes to the database. In this case you can use a one-off [`query`](/api/classes/react.ConvexReactClient.md#query) call, similarly to calling mutations and actions.

The async method `query` is exposed on the `ConvexReactClient`, which you can reference in your components via the [`useConvex()`](/api/modules/react.md#useconvex) hook.

src/App.tsx

```
import { useConvex } from "convex/react";

import { api } from "../convex/_generated/api";



export function App() {

  const convex = useConvex();

  return (

    <button

      onClick={async () => {

        console.log(await convex.query(api.functions.myQuery));

      }}

    >

      Check

    </button>

  );

}
```

## Editing data[​](#editing-data "Direct link to Editing data")

Your React app edits data using the [`useMutation`](/api/modules/react.md#usemutation) React hook by calling your [mutations](/functions/mutation-functions.md).

The `convex dev` command generates this api object for you in the `convex/_generated/api.js` module to provide better autocompletion in JavaScript and end-to-end type safety in [TypeScript](/understanding/best-practices/typescript.md):

src/App.tsx

```
import { useMutation } from "convex/react";

import { api } from "../convex/_generated/api";



export function App() {

  const doSomething = useMutation(api.functions.doSomething);

  return <button onClick={() => doSomething()}>Click me</button>;

}
```

The hook returns an `async` function which performs the call to the mutation.

### Mutation arguments[​](#mutation-arguments "Direct link to Mutation arguments")

Arguments to your mutation are passed to the `async` function returned from `useMutation`:

src/App.tsx

```
export function App() {

  const a = "Hello world";

  const b = 4;

  const doSomething = useMutation(api.functions.doSomething);

  return <button onClick={() => doSomething({ a, b })}>Click me</button>;

}
```

### Mutation response and error handling[​](#mutation-response-and-error-handling "Direct link to Mutation response and error handling")

The mutation can optionally return a value or throw errors, which you can [`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await):

src/App.tsx

```
export function App() {

  const doSomething = useMutation(api.functions.doSomething);

  const onClick = () => {

    async function callBackend() {

      try {

        const result = await doSomething();

      } catch (error) {

        console.error(error);

      }

      console.log(result);

    }

    void callBackend();

  };

  return <button onClick={onClick}>Click me</button>;

}
```

Or handle as a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise):

src/App.tsx

```
export function App() {

  const doSomething = useMutation(api.functions.doSomething);

  const onClick = () => {

    doSomething()

      .catch((error) => {

        console.error(error);

      })

      .then((result) => {

        console.log(result);

      });

  };

  return <button onClick={onClick}>Click me</button>;

}
```

Learn more about [Error Handling](/functions/error-handling/.md) in functions.

### Retries[​](#retries "Direct link to Retries")

Convex React automatically retries mutations until they are confirmed to have been written to the database. The Convex backend ensures that despite multiple retries, every mutation call only executes once.

Additionally, Convex React will warn users if they try to close their browser tab while there are outstanding mutations. This means that when you call a Convex mutation, you can be sure that the user's edits won't be lost.

### Optimistic updates[​](#optimistic-updates "Direct link to Optimistic updates")

Convex queries are fully reactive, so all query results will be automatically updated after a mutation. Sometimes you may want to update the UI before the mutation changes propagate back to the client. To accomplish this, you can configure an *optimistic update* to execute as part of your mutation.

Optimistic updates are temporary, local changes to your query results which are used to make your app more responsive.

See [Optimistic Updates](/client/react/optimistic-updates.md) on how to configure them.

## Calling third-party APIs[​](#calling-third-party-apis "Direct link to Calling third-party APIs")

Your React app can read data, call third-party services, and write data with a single backend call using the [`useAction`](/api/modules/react.md#useaction) React hook by calling your [actions](/functions/actions.md).

Like `useQuery` and `useMutation`, this hook is used with the `api` object generated for you in the `convex/_generated/api.js` module to provide better autocompletion in JavaScript and end-to-end type safety in [TypeScript](/understanding/best-practices/typescript.md):

src/App.tsx

```
import { useAction } from "convex/react";

import { api } from "../convex/_generated/api";



export function App() {

  const doSomeAction = useAction(api.functions.doSomeAction);

  return <button onClick={() => doSomeAction()}>Click me</button>;

}
```

The hook returns an `async` function which performs the call to the action.

### Action arguments[​](#action-arguments "Direct link to Action arguments")

Action arguments work exactly the same as [mutation arguments](#mutation-arguments).

### Action response and error handling[​](#action-response-and-error-handling "Direct link to Action response and error handling")

Action response and error handling work exactly the same as [mutation response and error handling](#mutation-response-and-error-handling).

Actions do not support automatic retries or optimistic updates.

## Under the hood[​](#under-the-hood "Direct link to Under the hood")

The [`ConvexReactClient`](/api/classes/react.ConvexReactClient.md) connects to your Convex deployment by creating a [`WebSocket`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket). The WebSocket provides a 2-way communication channel over TCP. This allows Convex to push new query results reactively to the client without the client needing to poll for updates.

If the internet connection drops, the client will handle reconnecting and re-establishing the Convex session automatically.
