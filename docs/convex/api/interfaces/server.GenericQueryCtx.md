# Interface: GenericQueryCtx\<DataModel>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).GenericQueryCtx

A set of services for use within Convex query functions.

The query context is passed as the first argument to any Convex query function run on the server. Queries are **read-only**, they can read from the database but cannot write. They are also **reactive**, when used with `useQuery` on the client, the result automatically updates when data changes.

You should generally use the `QueryCtx` type from `"./_generated/server"`.

**`Example`**

```
import { query } from "./_generated/server";

import { v } from "convex/values";



export const listTasks = query({

  args: {},

  returns: v.array(v.object({

    _id: v.id("tasks"),

    _creationTime: v.number(),

    text: v.string(),

    completed: v.boolean(),

  })),

  handler: async (ctx, args) => {

    // ctx.db: read-only database access

    return await ctx.db.query("tasks").order("desc").take(100);

  },

});
```

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `DataModel` | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel) |

## Properties[​](#properties "Direct link to Properties")

### db[​](#db "Direct link to db")

• **db**: [`GenericDatabaseReader`](/api/interfaces/server.GenericDatabaseReader.md)<`DataModel`>

A utility for reading data in the database.

Use `ctx.db.get(table, id)` to fetch a single document by ID, or `ctx.db.query("tableName")` to query multiple documents with filtering and ordering. Queries are read-only, no write methods are available.

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/registration.ts:225](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L225)

***

### auth[​](#auth "Direct link to auth")

• **auth**: [`Auth`](/api/interfaces/server.Auth.md)

Information about the currently authenticated user.

Call `await ctx.auth.getUserIdentity()` to get the current user's identity, or `null` if the user is not authenticated.

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/registration.ts:233](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L233)

***

### storage[​](#storage "Direct link to storage")

• **storage**: [`StorageReader`](/api/interfaces/server.StorageReader.md)

A utility for reading files in storage.

Use `ctx.storage.getUrl(storageId)` to get a URL for a stored file.

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/registration.ts:240](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L240)

***

### runQuery[​](#runquery "Direct link to runQuery")

• **runQuery**: \<Query>(`query`: `Query`, ...`args`: [`ArgsAndOptions`](/api/modules/server.md#argsandoptions)<`Query`, { `transactionLimits?`: [`TransactionLimits`](/api/interfaces/server.TransactionLimits.md) }>) => `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

#### Type declaration[​](#type-declaration "Direct link to Type declaration")

▸ <`Query`>(`query`, `...args`): `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

Call a query function within the same transaction.

The query runs within the same read snapshot. Requires a [FunctionReference](/api/modules/server.md#functionreference) (e.g., `api.myModule.myQuery` or `internal.myModule.myQuery`).

NOTE: Often you can extract shared logic into a helper function instead. `runQuery` incurs overhead of running argument and return value validation, and creating a new isolated JS context.

##### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                                                                                   |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`, `"public"` \| `"internal"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`, `"public"` \| `"internal"`> |

##### Parameters[​](#parameters "Direct link to Parameters")

| Name      | Type                                                                                                                                                             |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`   | `Query`                                                                                                                                                          |
| `...args` | [`ArgsAndOptions`](/api/modules/server.md#argsandoptions)<`Query`, { `transactionLimits?`: [`TransactionLimits`](/api/interfaces/server.TransactionLimits.md) }> |

##### Returns[​](#returns "Direct link to Returns")

`Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/registration.ts:253](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L253)

***

### meta[​](#meta "Direct link to meta")

• **meta**: [`QueryMeta`](/api/interfaces/server.QueryMeta.md)

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[server/registration.ts:262](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L262)
