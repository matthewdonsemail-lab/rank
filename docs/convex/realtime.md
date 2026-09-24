# Realtime

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Turns out Convex is automatically realtime! You don’t have to do anything special if you are already using [query functions](/functions/query-functions.md), [database](/database/overview.md), and [client libraries](/client/react/overview.md) in your app. Convex tracks the dependencies to your query functions, including database changes, and triggers the subscription in the client libraries.

![Convex is automatically reactive and realtime](/assets/images/realtime-3197272a21b075792f6ac922af228378.gif)

Aside from building a highly interactive app with ease, there are other benefits to the realtime architecture of Convex:

## Automatic caching[​](#automatic-caching "Direct link to Automatic caching")

Convex automatically caches the result of your query functions so that future calls just read from the cache. The cache is updated if the data ever changes. You don't get charged for database bandwidth for cached reads.

This requires no work or bookkeeping from you.

## Consistent data across your app[​](#consistent-data-across-your-app "Direct link to Consistent data across your app")

Every client subscription gets updated simultaneously to the same snapshot of the database. Your app always displays the most consistent view of your data.

This avoids bugs like increasing the number of items in the shopping cart and not showing that an item is sold out.

## Learn more[​](#learn-more "Direct link to Learn more")

Learn how to work with realtime and reactive queries in Convex on [Stack](https://stack.convex.dev/tag/Reactivity).

Related posts from

<!-- -->

[![Stack](/img/stack-logo-dark.svg)![Stack](/img/stack-logo-light.svg)](https://stack.convex.dev/)
