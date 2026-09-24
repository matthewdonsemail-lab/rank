# Node.js

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Convex supports point-in-time queries (see [HTTP client](/api/classes/browser.ConvexHttpClient.md)) and query subscriptions (see [ConvexClient](/api/classes/browser.ConvexClient.md)) in Node.js.

If your JavaScript code uses import/export syntax, calling Convex functions works just like in a browser.

```
import { ConvexHttpClient, ConvexClient } from "convex/browser";

import { api } from "./convex/_generated/api.js";



// HTTP client

const httpClient = new ConvexHttpClient(CONVEX_URL_GOES_HERE);

httpClient.query(api.messages.list).then(console.log);



// Subscription client

const client = new ConvexClient(CONVEX_URL_GOES_HERE);

client.onUpdate(api.messages.list, {}, (messages) => console.log(messages));
```

## TypeScript[​](#typescript "Direct link to TypeScript")

Just like bundling for the browser, bundling TypeScript code for Node.js with webpack, esbuild, rollup, vite, and others usually allow you import from code that uses import/export syntax with no extra setup.

If you use TypeScript to *compile* your code (this is rare for web projects but more common with Node.js), add `"allowJs": true` to `tsconfig.json` compiler options so that TypeScript will compile the `api.js` file as well.

## TypeScript without a compile step[​](#typescript-without-a-compile-step "Direct link to TypeScript without a compile step")

If you want to run your TypeScript script directly without a compile step, installing [ts-node-esm](https://www.npmjs.com/package/ts-node) and running your script with ts-node-esm should work if you use `"type": "module"` in your `package.json`.

## JavaScript with CommonJS (`require()` syntax)[​](#javascript-with-commonjs-require-syntax "Direct link to javascript-with-commonjs-require-syntax")

If you don't use `"type": "module"` in the `package.json` of your project you'll need to use `require()` syntax and Node.js will not be able to import the `convex/_generated/api.js` file directly.

In the same directory as your `package.json`, create or edit [`convex.json`](/production/project-configuration.md#convexjson):

```
{

  "generateCommonJSApi": true

}
```

When the `convex dev` command generates files in `convex/_generated/` a new `api_cjs.cjs` file will be created which can be imported from CommonJS code.

```
const { ConvexHttpClient, ConvexClient } = require("convex/browser");

const { api } = require("./convex/_generated/api_cjs.cjs");

const httpClient = new ConvexHttpClient(CONVEX_URL_GOES_HERE);
```

## TypeScript with CommonJS without a compile step[​](#typescript-with-commonjs-without-a-compile-step "Direct link to TypeScript with CommonJS without a compile step")

Follow the steps above for CommonJS and use [`ts-node`](https://www.npmjs.com/package/ts-node) to run you code. Be sure your `tsconfig.json` is configured for CommonJS output.

## Using Convex with Node.js without codegen[​](#using-convex-with-nodejs-without-codegen "Direct link to Using Convex with Node.js without codegen")

You can always use the `anyApi` object or strings if you don't have the Convex functions and api file handy. An api reference like `api.folder.file.exportName` becomes `anyApi.folder.file.exportName` or `"folder/file:exportName"`.
