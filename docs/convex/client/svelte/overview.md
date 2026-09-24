# Convex Svelte

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[Convex Svelte](https://www.npmjs.com/package/convex-svelte) is the client library enabling your Svelte application to interact with your Convex backend. It enhances the [`ConvexClient`](/api/classes/browser.ConvexClient.md) with declarative subscriptions for [Svelte 5](https://svelte.dev/), so your frontend code can:

1. Receive live updates to your [queries](/functions/query-functions.md) with automatic reactivity
2. Call your [mutations](/functions/mutation-functions.md) and [actions](/functions/actions.md)
3. [Paginate](/database/pagination.md) through large datasets
4. [Authenticate users](/auth/overview.md)
5. [Server-side render](/client/svelte/sveltekit-server-rendering.md) data in SvelteKit

Source & issues

Source: [get-convex/convex-svelte](https://github.com/get-convex/convex-svelte).

<br />Found a bug or have a feature request? Open an issue in its [issue tracker](https://github.com/get-convex/convex-svelte/issues).

Follow the [Svelte Quickstart](/quickstart/svelte.md) to get started, or read on for the full setup.

## Installation[​](#installation "Direct link to Installation")

Install the Convex client and server library:

* npm
* pnpm
* yarn
* bun

```
npm install convex convex-svelte
```

```
pnpm add convex convex-svelte
```

```
yarn add convex convex-svelte
```

```
bun add convex convex-svelte
```

Svelte doesn't like referencing code outside of `src/`, so customize the Convex functions directory. Create a `convex.json` in your project root:

convex.json

```
{

  "functions": "src/convex/"

}
```

Set up a Convex dev deployment:

```
npx convex dev
```

This will prompt you to log in, create a project, and save your deployment URLs. It also creates a `src/convex/` folder for your backend API functions.

## Setup[​](#setup "Direct link to Setup")

Call `setupConvex()` once in a root layout component (e.g. `+layout.svelte`). This initializes a [`ConvexClient`](/api/classes/browser.ConvexClient.md) and stores it in Svelte context so child components can access it. The client is app-scoped: it stays open for the lifetime of the app (remounts and HMR reuse the same connection) and supports a single deployment URL. For explicit teardown — e.g. in tests — call `closeConvex()`.

src/routes/+layout.svelte

```
<script lang="ts">

  import { setupConvex } from "convex-svelte";

  import { PUBLIC_CONVEX_URL } from "$env/static/public";



  const client = setupConvex(PUBLIC_CONVEX_URL);

</script>
```

`setupConvex()` returns the `ConvexClient` instance, which you can use directly in the layout for mutations or actions (e.g. an auth nav bar). In child components and `.ts` files, use `getConvexClient()` to retrieve it — see [Client access](/client/svelte/reactivity.md#client-access).

You can pass `ConvexClientOptions` as the second argument to configure the [`ConvexClient`](/api/classes/browser.ConvexClient.md).

Non-SvelteKit usage

If you're using plain Vite + Svelte (no SvelteKit), replace `$env/static/public` with `import.meta.env.VITE_CONVEX_URL` and set `VITE_CONVEX_URL` in your `.env` file.

## Fetching data[​](#fetching-data "Direct link to Fetching data")

Use `useQuery()` to subscribe to a Convex query with automatic real-time updates. When the data changes on the server, your component re-renders automatically.

src/routes/+page.svelte

```
<script lang="ts">

  import { useQuery } from "convex-svelte";

  import { api } from "../convex/_generated/api.js";



  const messages = useQuery(api.messages.list, () => ({ searchWords: [] }));

</script>



{#if messages.isLoading}

  Loading...

{:else if messages.error != null}

  failed to load: {messages.error.toString()}

{:else}

  <ul>

    {#each messages.data as message}

      <li>

        <span>{message.author}</span>

        <span>{message.body}</span>

      </li>

    {/each}

  </ul>

{/if}
```

See [Queries, Mutations & Actions](/client/svelte/reactivity.md) for the full reactive API — query options, skipping, mutations, actions, optimistic updates, pagination, and accessing the client outside of components.

## Next steps[​](#next-steps "Direct link to Next steps")

* [Queries, Mutations & Actions](/client/svelte/reactivity.md) — the core reactive API
* [Authentication](/client/svelte/authentication.md) — wire up auth providers
* [SvelteKit Server Rendering](/client/svelte/sveltekit-server-rendering.md) — SSR with `convexLoad`
* [Why server-side rendering with Convex?](/client/svelte/why-server-rendering.md) — performance deep dive
* [Troubleshooting](/client/svelte/troubleshooting.md) — common errors and fixes
