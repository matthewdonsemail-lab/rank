# Interface: Scheduler

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).Scheduler

An interface to schedule Convex functions to run in the future.

Available as `ctx.scheduler` in mutations and actions.

**Execution guarantees:**

* **Scheduled mutations** are guaranteed to execute **exactly once**. They are automatically retried on transient errors.
* **Scheduled actions** execute **at most once**. They are not retried and may fail due to transient errors.

Consider using an `internalMutation` or `internalAction` to ensure that scheduled functions cannot be called directly from a client.

**`Example`**

```
import { mutation } from "./_generated/server";

import { internal } from "./_generated/api";

import { v } from "convex/values";



export const createOrder = mutation({

  args: { items: v.array(v.string()) },

  returns: v.null(),

  handler: async (ctx, args) => {

    const orderId = await ctx.db.insert("orders", { items: args.items });



    // Run immediately after this mutation commits:

    await ctx.scheduler.runAfter(0, internal.emails.sendConfirmation, {

      orderId,

    });



    // Run cleanup in 7 days:

    await ctx.scheduler.runAfter(

      7 * 24 * 60 * 60 * 1000,

      internal.orders.archiveOrder,

      { orderId },

    );



    return null;

  },

});
```

**`See`**

<https://docs.convex.dev/scheduling/scheduled-functions>

## Methods[​](#methods "Direct link to Methods")

### runAfter[​](#runafter "Direct link to runAfter")

▸ **runAfter**<`FuncRef`>(`delayMs`, `functionReference`, `...args`): `Promise`<[`GenericId`](/api/modules/values.md#genericid)<`"_scheduled_functions"`>>

Schedule a function to execute after a delay.

**`Example`**

```
// Schedule to run as soon as possible (if this is a mutation it would be after this mutation commits):

await ctx.scheduler.runAfter(0, internal.tasks.process, { taskId });



// Run after 5 seconds:

await ctx.scheduler.runAfter(5000, internal.tasks.process, { taskId });



// Run after 1 hour:

await ctx.scheduler.runAfter(60 * 60 * 1000, internal.cleanup.run, {});
```

#### Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name      | Type                                         |
| --------- | -------------------------------------------- |
| `FuncRef` | extends `SchedulableFunctionReferenceCompat` |

#### Parameters[​](#parameters "Direct link to Parameters")

| Name                | Type                                                                     | Description                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `delayMs`           | `number`                                                                 | Delay in milliseconds. Must be non-negative. If the delay is zero, the scheduled function will be due to execute immediately after the scheduling one completes.              |
| `functionReference` | `FuncRef`                                                                | A [FunctionReference](/api/modules/server.md#functionreference) or [FunctionReference\_future](/api/modules/server.md#functionreference_future) for the function to schedule. |
| `...args`           | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`FuncRef`> | Arguments to call the scheduled functions with.                                                                                                                               |

#### Returns[​](#returns "Direct link to Returns")

`Promise`<[`GenericId`](/api/modules/values.md#genericid)<`"_scheduled_functions"`>>

The ID of the scheduled function in the `_scheduled_functions` system table. Use this to cancel it later if needed.

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/scheduler.ts:102](https://github.com/get-convex/convex-js/blob/main/src/server/scheduler.ts#L102)

***

### runAt[​](#runat "Direct link to runAt")

▸ **runAt**<`FuncRef`>(`timestamp`, `functionReference`, `...args`): `Promise`<[`GenericId`](/api/modules/values.md#genericid)<`"_scheduled_functions"`>>

Schedule a function to execute at a specific time.

**`Example`**

```
// Run at a specific Date:

await ctx.scheduler.runAt(

  new Date("2030-01-01T00:00:00Z"),

  internal.events.triggerNewYear,

  {},

);



// Run at a timestamp (milliseconds since epoch):

await ctx.scheduler.runAt(Date.now() + 60000, internal.tasks.process, { taskId });
```

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name      | Type                                         |
| --------- | -------------------------------------------- |
| `FuncRef` | extends `SchedulableFunctionReferenceCompat` |

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name                | Type                                                                     | Description                                                                                                                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `timestamp`         | `number` \| `Date`                                                       | A Date or a timestamp (milliseconds since the epoch). If the timestamp is in the past, the scheduled function will be due to execute immediately after the scheduling one completes. The timestamp can't be more than five years in the past or more than five years in the future. |
| `functionReference` | `FuncRef`                                                                | A [FunctionReference](/api/modules/server.md#functionreference) or [FunctionReference\_future](/api/modules/server.md#functionreference_future) for the function to schedule.                                                                                                       |
| `...args`           | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`FuncRef`> | Arguments to call the scheduled functions with.                                                                                                                                                                                                                                     |

#### Returns[​](#returns-1 "Direct link to Returns")

`Promise`<[`GenericId`](/api/modules/values.md#genericid)<`"_scheduled_functions"`>>

The ID of the scheduled function in the `_scheduled_functions` system table.

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/scheduler.ts:134](https://github.com/get-convex/convex-js/blob/main/src/server/scheduler.ts#L134)

***

### cancel[​](#cancel "Direct link to cancel")

▸ **cancel**(`id`): `Promise`<`void`>

Cancel a previously scheduled function.

For scheduled **actions**: if the action has not started, it will not run. If it is already in progress, it will continue running but any new functions it tries to schedule will be canceled. If it had already completed, canceling will throw an error. For scheduled **mutations**: the mutation will either show up as "pending", "completed", or "failed", but never "inProgress". Canceling a mutation will atomically cancel it entirely or fail to cancel if it has committed. It is a transaction that will either run to completion and commit or fully roll back.

**`Example`**

```
// Cancel a scheduled function:

await ctx.scheduler.cancel(scheduledFunctionId);
```

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name | Type                                                                      | Description                                                                     |
| ---- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `id` | [`GenericId`](/api/modules/values.md#genericid)<`"_scheduled_functions"`> | The ID of the scheduled function to cancel (returned by `runAfter` or `runAt`). |

#### Returns[​](#returns-2 "Direct link to Returns")

`Promise`<`void`>

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/scheduler.ts:162](https://github.com/get-convex/convex-js/blob/main/src/server/scheduler.ts#L162)
