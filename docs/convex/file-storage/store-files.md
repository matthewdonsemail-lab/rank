# Storing Generated Files

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Files can be uploaded to Convex from a client and stored directly, see [Upload](/file-storage/upload-files.md).

Alternatively files can also be stored after they've been fetched or generated in [actions](/functions/actions.md) and [HTTP actions](/functions/http-actions.md). For example you might call a third-party API to generate an image based on a user prompt and then store that image in Convex.

**Example:** [Dall-E Storage & Action](https://github.com/get-convex/convex-demos/tree/main/dall-e-storage-action)

## Storing files in actions[​](#storing-files-in-actions "Direct link to Storing files in actions")

Storing files in actions is similar to [uploading a file via an HTTP action](/file-storage/upload-files.md#uploading-files-via-an-http-action).

The action takes these steps:

1. Fetch or generate an image.
2. Store the image using [`storage.store()`](/api/interfaces/server.StorageActionWriter.md#store) and receive a storage ID.
3. Save the storage ID into your data model via a mutation.

Storage IDs correspond to documents in the `"_storage"` system table (see [Metadata](/file-storage/file-metadata.md)), so they can be validated using the `v.id("_storage")` validator and typed as `Id<"_storage">` in TypeScript.

convex/images.ts

```
import { action, internalMutation, query } from "./_generated/server";

import { internal } from "./_generated/api";

import { v } from "convex/values";

import { Id } from "./_generated/dataModel";



export const generateAndStore = action({

  args: { prompt: v.string() },

  handler: async (ctx, args) => {

    // Not shown: generate imageUrl from `prompt`

    const imageUrl = "https://....";



    // Download the image

    const response = await fetch(imageUrl);

    const image = await response.blob();



    // Store the image in Convex

    const storageId: Id<"_storage"> = await ctx.storage.store(image);



    // Write `storageId` to a document

    await ctx.runMutation(internal.images.storeResult, {

      storageId,

      prompt: args.prompt,

    });

  },

});



export const storeResult = internalMutation({

  args: {

    storageId: v.id("_storage"),

    prompt: v.string(),

  },

  handler: async (ctx, args) => {

    const { storageId, prompt } = args;

    await ctx.db.insert("images", { storageId, prompt });

  },

});
```
