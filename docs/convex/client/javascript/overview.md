> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# Convex JavaScript Clients

Convex applications can be accessed from Node.js or any JavaScript runtime that implements [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) or [`WebSocket`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket). The reactive [Convex Client](/api/classes/browser.ConvexClient.md) allows web applications and long-running Node.js servers to subscribe to updates on Convex queries, while the [Convex HTTP client](/api/classes/browser.ConvexHttpClient.md) is typically used for server-side rendering, migrations, administrative scripts, and serverless functions to run queries at a single point in time.

If you're using React, see the dedicated [`ConvexReactClient`](/api/classes/browser.ConvexClient.md) described in [React](/client/react/overview.md).

## Convex Client[​](#convex-client "Direct link to Convex Client")

The [`ConvexClient`](/api/classes/browser.ConvexClient.md) provides subscriptions to queries in Node.js and any JavaScript environment that supports WebSockets.

<!-- -->

script.ts

```
import { ConvexClient } from "convex/browser";

import { api } from "../convex/_generated/api";



const client = new ConvexClient(process.env.CONVEX_URL!);



// subscribe to query results

client.onUpdate(api.messages.listAll, {}, (messages) =>

  console.log(messages.map((msg) => msg.body)),

);



// execute a mutation

function hello() {

  client.mutation(api.messages.sendAnon, {

    body: `hello at ${new Date()}`,

  });

}
```

The Convex client is open source and available on [GitHub](https://github.com/get-convex/convex-js).

See the [Script Tag Quickstart](/quickstart/script-tag.md) to get started.

## HTTP client[​](#http-client "Direct link to HTTP client")

<!-- -->

The [`ConvexHttpClient`](/api/classes/browser.ConvexHttpClient.md) works in the browser, Node.js, and any JavaScript environment with `fetch`.

See the [Node.js Quickstart](/quickstart/nodejs.md).

script.ts

```
import { ConvexHttpClient } from "convex/browser";

import { api } from "./convex/_generated/api";



const client = new ConvexHttpClient(process.env["CONVEX_URL"]);



// either this

const count = await client.query(api.counter.get);

// or this

client.query(api.counter.get).then((count) => console.log(count));
```

## Using Convex without generated `convex/_generated/api.js`[​](#using-convex-without-generated-convex_generatedapijs "Direct link to using-convex-without-generated-convex_generatedapijs")

If the source code for your Convex function isn't located in the same project or in the same monorepos you can use the untyped `api` object called `anyApi`.

<!-- -->

script.ts

```
import { ConvexClient } from "convex/browser";

import { anyApi } from "convex/server";



const CONVEX_URL = "http://happy-otter-123";

const client = new ConvexClient(CONVEX_URL);

client.onUpdate(anyApi.messages.list, {}, (messages) =>

  console.log(messages.map((msg) => msg.body)),

);

setInterval(

  () =>

    client.mutation(anyApi.messages.send, {

      body: `hello at ${new Date()}`,

      author: "me",

    }),

  5000,

);
```
