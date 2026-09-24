# Serving Files

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Files stored in Convex can be served to your users by generating a URL pointing to a given file.

## Generating file URLs in queries[​](#generating-file-urls-in-queries "Direct link to Generating file URLs in queries")

The simplest way to serve files is to return URLs along with other data required by your app from [queries](/functions/query-functions.md) and [mutations](/functions/mutation-functions.md).

A file URL can be generated from a storage ID by the [`storage.getUrl`](/api/interfaces/server.StorageReader.md#geturl) function of the [`QueryCtx`](/api/interfaces/server.GenericQueryCtx.md), [`MutationCtx`](/api/interfaces/server.GenericMutationCtx.md), or [`ActionCtx`](/api/interfaces/server.GenericActionCtx.md) object:

convex/listMessages.ts

```
import { query } from "./_generated/server";



export const list = query({

  args: {},

  handler: async (ctx) => {

    const messages = await ctx.db.query("messages").collect();

    return Promise.all(

      messages.map(async (message) => ({

        ...message,

        // If the message is an "image" its `body` is an `Id<"_storage">`

        ...(message.format === "image"

          ? { url: await ctx.storage.getUrl(message.body) }

          : {}),

      })),

    );

  },

});
```

File URLs can be used in `img` elements to render images:

src/App.tsx

```
function Image({ message }: { message: { url: string } }) {

  return <img src={message.url} height="300px" width="auto" />;

}
```

Security consideration

File IDs, like `Id<"_storage">`, are safe to store and pass through Convex functions. File URLs are different: **anyone with the URL can access the file** without further authentication from your app.

In your query you can control who receives the URL, but once shared, that URL can be reused or shared. **To revoke a shared URL, delete the file.** If you still need to serve the file, upload it again and share the new URL only with authorized users.

If you need to authenticate or authorize access each time the file is requested, use [HTTP actions](#serving-files-from-http-actions) and avoid exposing direct file URLs to the client.

## Serving files from HTTP actions[​](#serving-files-from-http-actions "Direct link to Serving files from HTTP actions")

For files requiring access control on every request, serve files directly from [HTTP actions](/functions/http-actions.md). The HTTP action should authenticate the request and check that the caller can access the file before returning bytes.

If your permissions live on another app document, use that document's ID in the URL, such as a message ID or file document ID. Then look up the storage ID server-side after checking permissions.

It is also fine for the client to pass an `Id<"_storage">` to an authenticated HTTP action, as long as the action checks that the caller can access that file. Do not use the storage ID as the only access check. HTTP action responses are [currently limited](/functions/http-actions.md#limits) to 20MB, so they aren't a fit for serving larger files through Convex.

If you need file URLs that automatically expire after some time, consider the [Cloudflare R2 component](https://www.convex.dev/components/cloudflare-r2). Use Convex File Storage URLs as described [above](#generating-file-urls-in-queries) only when bearer URL access is acceptable for your use case.

The small example below passes a storage ID in the URL so it can focus on `storage.get()`. For private files, add authentication and authorization checks before returning the file.

A file [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) object can be generated from a storage ID by the [`storage.get`](/api/interfaces/server.StorageActionWriter.md#get) function of the [`ActionCtx`](/api/interfaces/server.GenericActionCtx.md) object, which can be returned in a `Response`:

convex/http.ts

```
import { httpRouter } from "convex/server";

import { httpAction } from "./_generated/server";

import { Id } from "./_generated/dataModel";



const http = httpRouter();



http.route({

  path: "/getImage",

  method: "GET",

  handler: httpAction(async (ctx, request) => {

    const { searchParams } = new URL(request.url);

    const storageId = searchParams.get("storageId")! as Id<"_storage">;

    const blob = await ctx.storage.get(storageId);

    if (blob === null) {

      return new Response("Image not found", {

        status: 404,

      });

    }

    return new Response(blob);

  }),

});



export default http;
```

The URL of such an action can be used directly in `img` elements to render images:

src/App.tsx

```
const convexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL;



function Image({ storageId }: { storageId: string }) {

  // e.g. https://happy-animal-123.convex.site/getImage?storageId=456

  const getImageUrl = new URL(`${convexSiteUrl}/getImage`);

  getImageUrl.searchParams.set("storageId", storageId);



  return <img src={getImageUrl.href} height="300px" width="auto" />;

}
```
