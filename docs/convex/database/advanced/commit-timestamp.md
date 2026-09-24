# Commit Timestamp

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

A commit timestamp represents the time (in nanoseconds) when a mutation commits. The value is not observable within the mutation, but with the `db.vars.commitTs` placeholder you can have the value inserted at commit time into documents or the return value.

This can be used to to model a queue, or to implement an `updatedAt` field. You could define an index on a field that captures the commit time, then use that to iterate over new or updated documents without worrying about missing changes due to out-of-order commits. For tips on using CommitTs for efficient iteration, see the notes in the [Batch Worker Component README](https://github.com/get-convex/batch-worker).

convex/work.ts

```
export const enqueue = mutation({

  args: { payload: v.string() },

  handler: async (ctx, { payload }) => {

    await ctx.db.insert("work", {

      payload,

      updatedAt: ctx.db.vars.commitTs,

    });

  },

});
```

`db.vars.commitTs` is a placeholder value while the mutation executes. When the mutation commits, the value gets resolved to the commit timestamp in nanoseconds.

## Commit timestamp vs. `_creationTime`[​](#commit-timestamp-vs-_creationtime "Direct link to commit-timestamp-vs-_creationtime")

Note that the commit timestamp is not the same as the `_creationTime` system field.

|                                           | `db.vars.commitTs`      | `_creationTime`              |
| ----------------------------------------- | ----------------------- | ---------------------------- |
| **Timing**                                | Assigned at commit time | Based on function start time |
| **Units**                                 | Nanoseconds             | Milliseconds                 |
| **Type when inserted**                    | CommitTsPlaceholder     | Float64 (Number)             |
| **Type after committed**                  | Int64 (BigInt)          | Float64 (Number)             |
| **Reflects commit order**                 | ✅ Yes                  | ❌ No                        |
| **Shared for inserts within transaction** | ✅ Yes                  | ❌ No (db.insert advances)   |

Mutations execute concurrently before committing, so `_creationTime` does not necessarily reflect the order in which the mutations committed. This mean you can be reading the last committed document in a table, ordered by `_creationTime`, and then later a new document could be inserted with an earlier `_creationTime`. This can lead to missing documents when iterating over a table.

With an index on `db.vars.commitTs`, you do not need to worry about this, as the timestamp is strictly increasing. Since inserted documents will always have a greater commit timestamp, the tombstones will always end where the new documents begin.

## Using the commit timestamp[​](#using-the-commit-timestamp "Direct link to Using the commit timestamp")

During function execution, new documents inserted with `db.vars.commitTs` will have the `CommitTsPlaceholder`. Resolved commit timestamps are Int64s (bigint in JS). You can use the `v.commitTs()` validator in argument and return validators and schema definitions. It accepts both resolved Int64 values and the commit timestamp placeholder. Fields with the commit timestamp are otherwise like any other field: they can be used in indexes, nested objects, arrays, and unions.

convex/schema.ts

```
import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";



export default defineSchema({

  work: defineTable({

    payload: v.string(),

    updatedAt: v.commitTs(),

  }).index("by_updatedAt", ["updatedAt"]),

});
```

You can check for the placeholder before using the commit timestamp type.

convex/work.ts

```
if (commitTs instanceof CommitTsPlaceholder) {

  return "pending";

}

// commitTs is an Int64
```

You can query for documents inserted in the current transaction using a commit timestamp index. This can be useful inside components or nested function where you may not have context from the parent transaction.

convex/work.ts

```
export const enqueueAndListPending = mutation({

  args: { payload: v.string() },

  handler: async (ctx, { payload }) => {

    await ctx.db.insert("work", {

      payload,

      updatedAt: ctx.db.vars.commitTs,

    });

    return await ctx.db

      .query("work")

      .withIndex("by_updatedAt", (q) => q.eq("updatedAt", ctx.db.vars.commitTs))

      .collect();

  },

});
```

The commit timestamp placeholder can be passed into or returned from a nested function.

convex/work.ts

```
export const enqueueWithTimestamp = mutation({

  args: { payload: v.string(), updatedAt: v.commitTs() },

  returns: v.commitTs(),

  handler: async (ctx, { payload, updatedAt }) => {

    await ctx.db.insert("work", { payload, updatedAt });

    return updatedAt;

  },

});



export const enqueueViaSubtransaction = mutation({

  args: { payload: v.string() },

  returns: v.commitTs(),

  handler: async (ctx, { payload }): Promise<bigint | CommitTsPlaceholder> => {

    return await ctx.runMutation(api.commitTs.enqueueWithTimestamp, {

      payload,

      updatedAt: ctx.db.vars.commitTs,

    });

  },

});
```

Note that it is not possible to schedule a function with the commit timestamp as an argument. Furthermore, you cannot return the commit timestamp placeholder from a query, as queries are not committed.
