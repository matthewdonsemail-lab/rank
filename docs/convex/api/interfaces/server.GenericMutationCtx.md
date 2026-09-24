# Interface: GenericMutationCtx\<DataModel>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).GenericMutationCtx

A set of services for use within Convex mutation functions.

The mutation context is passed as the first argument to any Convex mutation function run on the server. Mutations run **transactionally**, all reads and writes within a single mutation are atomic and isolated.

You should generally use the `MutationCtx` type from `"./_generated/server"`.

**`Example`**

```
import { mutation } from "./_generated/server";

import { internal } from "./_generated/api";

import { v } from "convex/values";



export const createTask = mutation({

  args: { text: v.string() },

  returns: v.id("tasks"),

  handler: async (ctx, args) => {

    // ctx.db: read and write documents

    const taskId = await ctx.db.insert("tasks", { text: args.text, completed: false });



    // ctx.auth: check the authenticated user

    const identity = await ctx.auth.getUserIdentity();



    // ctx.scheduler: schedule functions for later

    await ctx.scheduler.runAfter(0, internal.notifications.send, { taskId });



    return taskId;

  },

});
```

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `DataModel` | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel) |

## Properties[​](#properties "Direct link to Properties")

### db[​](#db "Direct link to db")

• **db**: [`GenericDatabaseWriter`](/api/interfaces/server.GenericDatabaseWriter.md)<`DataModel`>

A utility for reading and writing data in the database.

Use `ctx.db.insert()`, `ctx.db.patch()`, `ctx.db.replace()`, and `ctx.db.delete()` to write data. Use `ctx.db.get()` and `ctx.db.query()` to read data. All operations within a mutation are atomic.

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/registration.ts:87](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L87)

***

### auth[​](#auth "Direct link to auth")

• **auth**: [`Auth`](/api/interfaces/server.Auth.md)

Information about the currently authenticated user.

Call `await ctx.auth.getUserIdentity()` to get the current user's identity, or `null` if the user is not authenticated.

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/registration.ts:95](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L95)

***

### storage[​](#storage "Direct link to storage")

• **storage**: [`StorageWriter`](/api/interfaces/server.StorageWriter.md)

A utility for reading and writing files in storage.

Use `ctx.storage.generateUploadUrl()` to create an upload URL for clients, `ctx.storage.getUrl(storageId)` to get a URL for a stored file, or `ctx.storage.delete(storageId)` to remove one.

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/registration.ts:104](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L104)

***

### scheduler[​](#scheduler "Direct link to scheduler")

• **scheduler**: [`Scheduler`](/api/interfaces/server.Scheduler.md)

A utility for scheduling Convex functions to run in the future.

**`Example`**

```
// Schedule an action to run immediately after this mutation commits:

await ctx.scheduler.runAfter(0, internal.emails.sendWelcome, { userId });



// Schedule a cleanup to run in 24 hours:

await ctx.scheduler.runAfter(24 * 60 * 60 * 1000, internal.tasks.cleanup, {});
```

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/registration.ts:118](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L118)

***

### runQuery[​](#runquery "Direct link to runQuery")

• **runQuery**: \<Query>(`query`: `Query`, ...`args`: [`ArgsAndOptions`](/api/modules/server.md#argsandoptions)<`Query`, [`AdvancedRunQueryOptions`](/api/interfaces/server.AdvancedRunQueryOptions.md)>) => `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

#### Type declaration[​](#type-declaration "Direct link to Type declaration")

▸ <`Query`>(`query`, `...args`): `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

Call a query function within the same transaction.

The query runs within the same transaction as the calling mutation, seeing a consistent snapshot of the database. Requires a [FunctionReference](/api/modules/server.md#functionreference) (e.g., `api.myModule.myQuery` or `internal.myModule.myQuery`).

NOTE: Often you can extract shared logic into a helper function instead. `runQuery` incurs overhead of running argument and return value validation, and creating a new isolated JS context.

**`Example`**

```
const user = await ctx.runQuery(internal.users.getUser, { userId });
```

##### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                                                                                   |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`, `"public"` \| `"internal"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`, `"public"` \| `"internal"`> |

##### Parameters[​](#parameters "Direct link to Parameters")

| Name      | Type                                                                                                                                               |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`   | `Query`                                                                                                                                            |
| `...args` | [`ArgsAndOptions`](/api/modules/server.md#argsandoptions)<`Query`, [`AdvancedRunQueryOptions`](/api/interfaces/server.AdvancedRunQueryOptions.md)> |

##### Returns[​](#returns "Direct link to Returns")

`Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[server/registration.ts:137](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L137)

***

### runMutation[​](#runmutation "Direct link to runMutation")

• **runMutation**: \<Mutation>(`mutation`: `Mutation`, ...`args`: [`ArgsAndOptions`](/api/modules/server.md#argsandoptions)<`Mutation`, { `transactionLimits?`: [`TransactionLimits`](/api/interfaces/server.TransactionLimits.md) }>) => `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Mutation`>>

#### Type declaration[​](#type-declaration-1 "Direct link to Type declaration")

▸ <`Mutation`>(`mutation`, `...args`): `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Mutation`>>

Call a mutation function within the same transaction.

The mutation runs in a sub-transaction, so if it throws an error, all of its writes will be rolled back. Requires a [FunctionReference](/api/modules/server.md#functionreference).

NOTE: Often you can extract shared logic into a helper function instead. `runMutation` incurs overhead of running argument and return value validation, and creating a new isolated JS context.

##### Type parameters[​](#type-parameters-2 "Direct link to Type parameters")

| Name       | Type                                                                                                                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Mutation` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"mutation"`, `"public"` \| `"internal"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"mutation"`, `"public"` \| `"internal"`> |

##### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name       | Type                                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mutation` | `Mutation`                                                                                                                                                          |
| `...args`  | [`ArgsAndOptions`](/api/modules/server.md#argsandoptions)<`Mutation`, { `transactionLimits?`: [`TransactionLimits`](/api/interfaces/server.TransactionLimits.md) }> |

##### Returns[​](#returns-1 "Direct link to Returns")

`Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Mutation`>>

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[server/registration.ts:156](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L156)

***

### meta[​](#meta "Direct link to meta")

• **meta**: [`MutationMeta`](/api/interfaces/server.MutationMeta.md)

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[server/registration.ts:165](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L165)
