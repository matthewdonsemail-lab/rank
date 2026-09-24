# http.ts

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

`convex/http.ts` allows you to define [**HTTP actions**](/functions/http-actions.md), which serve requests on your deployment’s `.convex.site` domain. They are useful for receiving webhooks or exposing a public HTTP API.

convex/http.ts

```
import { httpRouter } from "convex/server";

import { httpAction } from "./_generated/server";

import { internal } from "./_generated/api";



const http = httpRouter();



// Serves `https://<deployment>.convex.site/postMessage`

http.route({

  path: "/postMessage",

  method: "POST",

  handler: httpAction(async (ctx, request) => {

    const { author, body } = await request.json();

    await ctx.runMutation(internal.messages.send, { author, body });

    return new Response(null, { status: 200 });

  }),

});



// Serves `https://<deployment>.convex.site/getMessages/<author>`

http.route({

  pathPrefix: "/getMessages/",

  method: "GET",

  handler: httpAction(async (ctx, request) => {

    const author = new URL(request.url).pathname.slice("/getMessages/".length);

    const messages = await ctx.runQuery(internal.messages.listByAuthor, {

      author,

    });

    return Response.json(messages);

  }),

});



export default http;
```

## Learn More[​](#learn-more "Direct link to Learn More")

* [HTTP Actions](/functions/http-actions.md)
* [Upload Files via HTTP](/file-storage/upload-files.md#uploading-files-via-an-http-action)
* [`HttpRouter` API reference](/api/classes/server.HttpRouter.md)
