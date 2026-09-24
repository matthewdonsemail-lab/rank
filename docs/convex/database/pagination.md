# Paginated Queries

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Paginated queries are [queries](/functions/query-functions.md) that return a list of results in incremental pages.

This can be used to build components with "Load More" buttons or "infinite scroll" UIs where more results are loaded as the user scrolls.

**Example:** [Paginated Messaging App](https://github.com/get-convex/convex-demos/tree/main/pagination)

Using pagination in Convex is as simple as:

1. Writing a paginated query function that calls [`.paginate(paginationOpts)`](/api/interfaces/server.OrderedQuery.md#paginate).
2. Using the [`usePaginatedQuery`](/api/modules/react.md#usepaginatedquery) React hook.

Like other Convex queries, paginated queries are completely reactive.

## Writing paginated query functions[​](#writing-paginated-query-functions "Direct link to Writing paginated query functions")

Convex uses cursor-based pagination. This means that paginated queries return a string called a [`Cursor`](/api/modules/server.md#cursor) that represents the point in the results that the current page ended. To load more results, you simply call the query function again, passing in the cursor.

To build this in Convex, define a query function that:

1. Takes in a single arguments object with a `paginationOpts` property of type [`PaginationOptions`](/api/interfaces/server.PaginationOptions.md).

   * Use `paginationOptsValidator` exported from `"convex/server"` to [validate](/functions/validation.md) this argument. It includes fields used by the client to manage the gap-less pagination.
   * To limit how much is read from the database, set `maximumBytesRead` and/or `maximumRowsRead` in `PaginationOptions`. If the page of data would have exceeded these values, it will return a status forcing the client to split the pages.

2. Calls [`.paginate(paginationOpts)`](/api/interfaces/server.OrderedQuery.md#paginate) on a [database query](/database/reading-data/.md), passing in the `PaginationOptions` and returning its result.

   * The returned `page` in the [`PaginationResult`](/api/interfaces/server.PaginationResult.md) is an array of documents. You may [`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) or [`filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) it before returning it.

convex/messages.ts

```
import { v } from "convex/values";

import { query, mutation } from "./_generated/server";

import { paginationOptsValidator } from "convex/server";



export const list = query({

  args: { paginationOpts: paginationOptsValidator },

  handler: async (ctx, args) => {

    const foo = await ctx.db

      .query("messages")

      .order("desc")

      .paginate(args.paginationOpts);

    return foo;

  },

});
```

### Additional arguments[​](#additional-arguments "Direct link to Additional arguments")

You can define paginated query functions that take arguments in addition to `paginationOpts`:

convex/messages.ts

```
export const listWithExtraArg = query({

  args: { paginationOpts: paginationOptsValidator, author: v.string() },

  handler: async (ctx, args) => {

    return await ctx.db

      .query("messages")

      .withIndex("by_author", (q) => q.eq("author", args.author))

      .order("desc")

      .paginate(args.paginationOpts);

  },

});
```

### Transforming results[​](#transforming-results "Direct link to Transforming results")

You can apply arbitrary [transformations](/database/reading-data/.md#more-complex-queries) to the `page` property of the object returned by `paginate`, which contains the array of documents:

convex/messages.ts

```
export const listWithTransformation = query({

  args: { paginationOpts: paginationOptsValidator },

  handler: async (ctx, args) => {

    const results = await ctx.db

      .query("messages")

      .order("desc")

      .paginate(args.paginationOpts);

    return {

      ...results,

      page: results.page.map((message) => ({

        author: message.author.slice(0, 1),

        body: message.body.toUpperCase(),

      })),

    };

  },

});
```

## Paginating within React Components[​](#paginating-within-react-components "Direct link to Paginating within React Components")

To paginate within a React component, use the [`usePaginatedQuery`](/api/modules/react.md#usepaginatedquery) hook. This hook gives you a simple interface for rendering the current items and requesting more. Internally, this hook manages the continuation cursors.

The arguments to this hook are:

* The name of the paginated query function.
* The arguments object to pass to the query function, excluding the `paginationOpts` (that's injected by the hook).
* An options object with the `initialNumItems` to load on the first page.

The hook returns an object with:

* `results`: An array of the currently loaded results.

* `isLoading` - Whether the hook is currently loading results.

* `status`: The status of the pagination. The possible statuses are:

  <!-- -->

  * `"LoadingFirstPage"`: The hook is loading the first page of results.
  * `"CanLoadMore"`: This query may have more items to fetch. Call `loadMore` to fetch another page.
  * `"LoadingMore"`: We're currently loading another page of results.
  * `"Exhausted"`: We've paginated to the end of the list.

* `loadMore(n)`: A callback to fetch more results. This will only fetch more results if the status is `"CanLoadMore"`.

src/App.tsx

```
import { usePaginatedQuery } from "convex/react";

import { api } from "../convex/_generated/api";



export function App() {

  const { results, status, loadMore } = usePaginatedQuery(

    api.messages.list,

    {},

    { initialNumItems: 5 },

  );

  return (

    <div>

      {results?.map(({ _id, body }) => (

        <div key={_id}>{body}</div>

      ))}

      <button onClick={() => loadMore(5)} disabled={status !== "CanLoadMore"}>

        Load More

      </button>

    </div>

  );

}
```

You can also pass additional arguments in the arguments object if your function expects them:

src/App.tsx

```
import { usePaginatedQuery } from "convex/react";

import { api } from "../convex/_generated/api";



export function App() {

  const { results, status, loadMore } = usePaginatedQuery(

    api.messages.listWithExtraArg,

    { author: "Alex" },

    { initialNumItems: 5 },

  );

  return (

    <div>

      {results?.map(({ _id, body }) => (

        <div key={_id}>{body}</div>

      ))}

      <button onClick={() => loadMore(5)} disabled={status !== "CanLoadMore"}>

        Load More

      </button>

    </div>

  );

}
```

### Reactivity[​](#reactivity "Direct link to Reactivity")

Like any other Convex query functions, paginated queries are **completely reactive**. Your React components will automatically rerender if items in your paginated list are added, removed or changed.

One consequence of this is that **page sizes in Convex may change!** If you request a page of 10 items and then one item is removed, this page may "shrink" to only have 9 items. Similarly if new items are added, a page may "grow" beyond its initial size.

### Experimental: paginated query result object[​](#experimental-paginated-query-result-object "Direct link to Experimental: paginated query result object")

[`usePaginatedQuery_experimental`](/api/modules/react.md#usepaginatedquery_experimental) introduces a couple of changes that may become standard in the future. First, much of the pagination logic has been pushed down into the client layer so the hook has fewer responsibilities. Second, there's an overload that accepts an object argument and returns a result object with `status` (`"pending" | "success" | "error"`), `data`, `error`, and a `canLoadMore` boolean. See the [API reference](/api/modules/react.md#usepaginatedquery_experimental) for details.

## Paginating manually[​](#paginating-manually "Direct link to Paginating manually")

If you're paginating outside of React, you can manually call your paginated function multiple times to collect the items:

download.ts

```
import { ConvexHttpClient } from "convex/browser";

import { api } from "../convex/_generated/api";

import * as dotenv from "dotenv";



dotenv.config();



const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);



/**

 * Logs an array containing all messages from the paginated query "listMessages"

 * by combining pages of results into a single array.

 */

async function getAllMessages() {

  let continueCursor = null;

  let isDone = false;

  let page;



  const results = [];



  while (!isDone) {

    ({ continueCursor, isDone, page } = await client.query(api.messages.list, {

      paginationOpts: { numItems: 5, cursor: continueCursor },

    }));

    console.log("got", page.length);

    results.push(...page);

  }



  console.log(results);

}



getAllMessages();
```
