# Deleting Files

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Files stored in Convex can be deleted from [mutations](/functions/mutation-functions.md), [actions](/functions/actions.md), and [HTTP actions](/functions/http-actions.md) via the [`storage.delete()`](/api/interfaces/server.StorageWriter.md#delete) function, which accepts a storage ID.

Storage IDs correspond to documents in the `"_storage"` system table (see [Metadata](/file-storage/file-metadata.md)), so they can be validated using the `v.id("_storage")`.

convex/images.ts

```
import { v } from "convex/values";

import { Id } from "./_generated/dataModel";

import { mutation } from "./_generated/server";



export const deleteById = mutation({

  args: {

    storageId: v.id("_storage"),

  },

  handler: async (ctx, args) => {

    return await ctx.storage.delete(args.storageId);

  },

});
```
