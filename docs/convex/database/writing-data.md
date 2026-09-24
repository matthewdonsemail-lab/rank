# Writing Data

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[Mutations](/functions/mutation-functions.md) can insert, update, and remove data from database tables.

## Inserting new documents[​](#inserting-new-documents "Direct link to Inserting new documents")

You can create new documents in the database with the [`db.insert`](/api/interfaces/server.GenericDatabaseWriter.md#insert) method:

convex/tasks.ts

```
import { mutation } from "./_generated/server";

import { v } from "convex/values";



export const createTask = mutation({

  args: { text: v.string() },

  handler: async (ctx, args) => {

    const taskId = await ctx.db.insert("tasks", { text: args.text });

    // do something with `taskId`

  },

});
```

The second argument to `db.insert` is a JavaScript object with data for the new document.

The same types of values that can be passed into and returned from [queries](/functions/query-functions.md) and [mutations](/functions/mutation-functions.md) can be written into the database. See [Data Types](/database/types.md) for the full list of supported types.

The `insert` method returns a globally unique ID for the newly inserted document.

## Updating existing documents[​](#updating-existing-documents "Direct link to Updating existing documents")

Given an existing document ID the document can be updated using the following methods:

1. The [`db.patch`](/api/interfaces/server.GenericDatabaseWriter.md#patch) method will patch an existing document, shallow merging it with the given partial document. New fields are added. Existing fields are overwritten. Fields set to `undefined` are removed.

convex/tasks.ts

```
import { mutation } from "./_generated/server";

import { v } from "convex/values";



export const updateTask = mutation({

  args: { id: v.id("tasks") },

  handler: async (ctx, args) => {

    const { id } = args;

    console.log(await ctx.db.get("tasks", id));

    // { text: "foo", status: { done: true }, _id: ... }



    // Add `tag` and overwrite `status`:

    await ctx.db.patch("tasks", id, { tag: "bar", status: { archived: true } });

    console.log(await ctx.db.get("tasks", id));

    // { text: "foo", tag: "bar", status: { archived: true }, _id: ... }



    // Unset `tag` by setting it to `undefined`

    await ctx.db.patch("tasks", id, { tag: undefined });

    console.log(await ctx.db.get("tasks", id));

    // { text: "foo", status: { archived: true }, _id: ... }

  },

});
```

2. The [`db.replace`](/api/interfaces/server.GenericDatabaseWriter.md#replace) method will replace the existing document entirely, potentially removing existing fields:

convex/tasks.ts

```
import { mutation } from "./_generated/server";

import { v } from "convex/values";



export const replaceTask = mutation({

  args: { id: v.id("tasks") },

  handler: async (ctx, args) => {

    const { id } = args;

    console.log(await ctx.db.get("tasks", id));

    // { text: "foo", _id: ... }



    // Replace the whole document

    await ctx.db.replace("tasks", id, { invalid: true });

    console.log(await ctx.db.get("tasks", id));

    // { invalid: true, _id: ... }

  },

});
```

## Deleting documents[​](#deleting-documents "Direct link to Deleting documents")

Given an existing document ID the document can be removed from the table with the [`db.delete`](/api/interfaces/server.GenericDatabaseWriter.md#delete) method.

convex/tasks.ts

```
import { mutation } from "./_generated/server";

import { v } from "convex/values";



export const deleteTask = mutation({

  args: { id: v.id("tasks") },

  handler: async (ctx, args) => {

    await ctx.db.delete("tasks", args.id);

  },

});
```

## Bulk inserts or updates[​](#bulk-inserts-or-updates "Direct link to Bulk inserts or updates")

If you are used to SQL you might be looking for some sort of bulk insert or bulk update statement. In Convex the entire `mutation` function is automatically a single transaction.

You can just insert or update in a loop in the mutation function. Convex queues up all database changes in the function and executes them all in a single transaction when the function ends, leading to a single efficient change to the database.

````
/**

 * Bulk insert multiple products into the database.

 *

 * Equivalent to the SQL:

 * ```sql

 * INSERT INTO products (product_id, product_name, category, price, in_stock)

 * VALUES

 *     ('Laptop Pro', 'Electronics', 1299.99, true),

 *     ('Wireless Mouse', 'Electronics', 24.95, true),

 *     ('Ergonomic Keyboard', 'Electronics', 89.50, true),

 *     ('Ultra HD Monitor', 'Electronics', 349.99, false),

 *     ('Wireless Headphones', 'Audio', 179.99, true);

 * ```

 */

export const bulkInsertProducts = mutation({

  args: {

    products: v.array(

      v.object({

        product_name: v.string(),

        category: v.string(),

        price: v.number(),

        in_stock: v.boolean(),

      }),

    ),

  },

  handler: async (ctx, args) => {

    const { products } = args;



    // Insert in a loop. This is efficient because Convex queues all the changes

    // to be executed in a single transaction when the mutation ends.

    for (const product of products) {

      const id = await ctx.db.insert("products", {

        product_name: product.product_name,

        category: product.category,

        price: product.price,

        in_stock: product.in_stock,

      });

    }

  },

});
````

## Migrations[​](#migrations "Direct link to Migrations")

Database migrations are done through the migration component. The component is designed to run online migrations to safely evolve your database schema over time. It allows you to resume from failures, and validate changes with dry runs.

[Convex Component](https://www.convex.dev/components/migrations)

### [Migrations](https://www.convex.dev/components/migrations)

[Framework for long running data migrations of live data.](https://www.convex.dev/components/migrations)

## Write performance and limits[​](#write-performance-and-limits "Direct link to Write performance and limits")

To prevent accidental writes of large amounts of records, queries and mutations enforce [transaction limits](/production/state/limits.md#transactions). In situations where you are at risk of reading or writing unknown amounts of data, use these tools to stay within the limits.

### Measuring document sizes[​](#measuring-document-sizes "Direct link to Measuring document sizes")

Use tools like `getConvexSize` to [calculate documents sizes](/database/types.md#measuring-document-sizes). By doing so, you can make batches of work dynamically and handle each batch in a separate transaction, using the scheduler or having an action call multiple mutations. Note: a mutation or query called by another mutation or query share the overall transaction limits.

### Limiting paginated queries[​](#limiting-paginated-queries "Direct link to Limiting paginated queries")

When using [paginated queries](/database/pagination.md), pass `maximumBytesRead` or `maximumRowsRead` in [`PaginationOptions`](/api/interfaces/server.PaginationOptions.md) to limit how much data a single page reads. This is especially useful when filtering for rare items where a low `numItems` won't bound execution time.

### Checking transaction headroom[​](#checking-transaction-headroom "Direct link to Checking transaction headroom")

Use `ctx.meta.getTransactionMetrics()` to check how much capacity remains in the current transaction. Each field returns `{ used, remaining }`.

convex/clearTasks.ts

```
import { internalMutation } from "./_generated/server";

import { handleTaskDeletion } from "./lib/tasks";

import { internal } from "./_generated/api";



const MiB = 1 << 20;



export const clearTasks = internalMutation({

  args: {},

  handler: async (ctx, args) => {

    const tasks = ctx.db

      .query("tasks")

      .withIndex("by_status", (q) => q.eq("status", { archived: true }));



    for await (const task of tasks) {

      await handleTaskDeletion(ctx, task);

      await ctx.db.delete("tasks", task._id);

      const metrics = await ctx.meta.getTransactionMetrics();

      if (

        metrics.bytesRead.used > 4 * MiB ||

        metrics.bytesWritten.used > 2 * MiB ||

        metrics.databaseQueries.remaining < 500

      ) {

        // Run this mutation again and continue clearing tasks.

        await ctx.scheduler.runAfter(0, internal.clearTasks.clearTasks);

        break;

      }

    }

  },

});
```

### Limiting nested transactions[​](#limiting-nested-transactions "Direct link to Limiting nested transactions")

When calling a nested query or mutation via `ctx.runQuery` or `ctx.runMutation`, pass a `transactionLimits` option to cap how much of the parent's budget the nested call can consume. Each field is relative to the current consumption and cannot exceed the parent's remaining capacity. You can use this to reserve space for work after the nested function call, even if the child reads or writes too much. Note: the limit determines when a nested transaction will fail, but the actual consumption tracked will count the overage, so you may end up with slightly less reserved space, depending how big the document was that exceeded the limit.

convex/transactionLimits.ts

```
import { v } from "convex/values";

import { internalMutation } from "./_generated/server";

import { internal } from "./_generated/api";



const MiB = 1 << 20;



// Reserve 1 MiB of reads and writes plus 100 document reads/writes for the

// status update below, by capping the nested call at `remaining - reserve`.

// Subtracting from `remaining` adapts to whatever the parent has already

// used, so the parent is always guaranteed enough budget for the cleanup —

// even if processTask consumes its entire quota or throws.

export const runWithStatus = internalMutation({

  args: { id: v.id("tasks") },

  handler: async (ctx, { id }) => {

    const metrics = await ctx.meta.getTransactionMetrics();

    const RESERVE_BYTES = 1 * MiB;

    const RESERVE_DOCS = 100;

    try {

      const result = await ctx.runMutation(

        internal.transactionLimits.processTask,

        { id },

        {

          transactionLimits: {

            bytesRead: metrics.bytesRead.remaining - RESERVE_BYTES,

            bytesWritten: metrics.bytesWritten.remaining - RESERVE_BYTES,

            documentsRead: metrics.documentsRead.remaining - RESERVE_DOCS,

            documentsWritten: metrics.documentsWritten.remaining - RESERVE_DOCS,

          },

        },

      );

      await ctx.db.patch("tasks", id, {

        result: { kind: "success", result },

      });

    } catch (e: any) {

      // The nested mutation's writes rolled back since it threw an exception, but

      // this parent mutation can still commit the error to the database.

      await ctx.db.patch("tasks", id, {

        result: { kind: "error", error: e?.message ?? String(e) },

      });

    }

  },

});



export const processTask = internalMutation({

  args: { id: v.id("tasks") },

  handler: async (_ctx, _args) => {

    // ...

  },

});
```

The available fields match those on `TransactionMetrics`: `bytesRead`, `bytesWritten`, `databaseQueries`, `documentsRead`, `documentsWritten`, `functionsScheduled`, and `scheduledFunctionArgsBytes`. Any omitted field inherits the parent's current limit.
