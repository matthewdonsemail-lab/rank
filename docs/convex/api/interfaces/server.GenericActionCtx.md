# Interface: GenericActionCtx\<DataModel>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).GenericActionCtx

A set of services for use within Convex action functions.

The action context is passed as the first argument to any Convex action run on the server. Actions can call external APIs and use Node.js libraries, but do **not** have direct database access (`ctx.db` is not available). Use `ctx.runQuery` and `ctx.runMutation` to interact with the database.

You should generally use the `ActionCtx` type from `"./_generated/server"`.

**`Example`**

```
import { action } from "./_generated/server";

import { internal } from "./_generated/api";

import { v } from "convex/values";



export const processPayment = action({

  args: { orderId: v.id("orders"), amount: v.number() },

  returns: v.null(),

  handler: async (ctx, args) => {

    // Read data via ctx.runQuery:

    const order = await ctx.runQuery(internal.orders.get, { id: args.orderId });



    // Call external API:

    const result = await fetch("https://api.stripe.com/v1/charges", { ... });



    // Write results back via ctx.runMutation:

    await ctx.runMutation(internal.orders.markPaid, { id: args.orderId });



    return null;

  },

});
```

**Common mistake:** `ctx.db` is not available in actions. Do not try to access it, use `ctx.runQuery` and `ctx.runMutation` instead.

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `DataModel` | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel) |

## Properties[​](#properties "Direct link to Properties")

### scheduler[​](#scheduler "Direct link to scheduler")

• **scheduler**: [`Scheduler`](/api/interfaces/server.Scheduler.md)

A utility for scheduling Convex functions to run in the future.

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/registration.ts:401](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L401)

***

### auth[​](#auth "Direct link to auth")

• **auth**: [`Auth`](/api/interfaces/server.Auth.md)

Information about the currently authenticated user.

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/registration.ts:406](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L406)

***

### storage[​](#storage "Direct link to storage")

• **storage**: [`StorageActionWriter`](/api/interfaces/server.StorageActionWriter.md)

A utility for reading and writing files in storage.

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/registration.ts:411](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L411)

***

### meta[​](#meta "Direct link to meta")

• **meta**: [`ActionMeta`](/api/interfaces/server.ActionMeta.md)

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/registration.ts:434](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L434)

## Methods[​](#methods "Direct link to Methods")

### runQuery[​](#runquery "Direct link to runQuery")

▸ **runQuery**<`Query`>(`query`, `...args`): `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

Run the Convex query with the given name and arguments.

Each `runQuery` call is a separate read transaction. Consider using an internalQuery to prevent users from calling the query directly.

**`Example`**

```
const user = await ctx.runQuery(internal.users.get, { userId });
```

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                                                                                   |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`, `"public"` \| `"internal"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`, `"public"` \| `"internal"`> |

#### Parameters[​](#parameters "Direct link to Parameters")

| Name      | Type                                                                   | Description                                                                           |
| --------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `query`   | `Query`                                                                | A [FunctionReference](/api/modules/server.md#functionreference) for the query to run. |
| `...args` | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`Query`> | The arguments to the query function.                                                  |

#### Returns[​](#returns "Direct link to Returns")

`Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

A promise of the query's result.

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[server/registration.ts:340](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L340)

***

### runMutation[​](#runmutation "Direct link to runMutation")

▸ **runMutation**<`Mutation`>(`mutation`, `...args`): `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Mutation`>>

Run the Convex mutation with the given name and arguments.

Each `runMutation` call is a separate write transaction. Consider using an internalMutation to prevent users from calling it directly.

**`Example`**

```
await ctx.runMutation(internal.orders.markPaid, { id: orderId });
```

#### Type parameters[​](#type-parameters-2 "Direct link to Type parameters")

| Name       | Type                                                                                                                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Mutation` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"mutation"`, `"public"` \| `"internal"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"mutation"`, `"public"` \| `"internal"`> |

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name       | Type                                                                      | Description                                                                              |
| ---------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `mutation` | `Mutation`                                                                | A [FunctionReference](/api/modules/server.md#functionreference) for the mutation to run. |
| `...args`  | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`Mutation`> | The arguments to the mutation function.                                                  |

#### Returns[​](#returns-1 "Direct link to Returns")

`Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Mutation`>>

A promise of the mutation's result.

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[server/registration.ts:364](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L364)

***

### runAction[​](#runaction "Direct link to runAction")

▸ **runAction**<`Action`>(`action`, `...args`): `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Action`>>

Run the Convex action with the given name and arguments.

**Important:** Only use `runAction` when you need to cross runtimes (e.g., calling a `"use node"` action from the default Convex runtime). For code in the same runtime, extract shared logic into a plain TypeScript helper function instead, `runAction` has significant overhead (separate function call, separate resource allocation).

Consider using an internalAction to prevent users from calling the action directly.

#### Type parameters[​](#type-parameters-3 "Direct link to Type parameters")

| Name     | Type                                                                                                                                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Action` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"action"`, `"public"` \| `"internal"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"action"`, `"public"` \| `"internal"`> |

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name      | Type                                                                    | Description                                                                            |
| --------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `action`  | `Action`                                                                | A [FunctionReference](/api/modules/server.md#functionreference) for the action to run. |
| `...args` | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`Action`> | The arguments to the action function.                                                  |

#### Returns[​](#returns-2 "Direct link to Returns")

`Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Action`>>

A promise of the action's result.

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[server/registration.ts:389](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L389)

***

### vectorSearch[​](#vectorsearch "Direct link to vectorSearch")

▸ **vectorSearch**<`TableName`, `IndexName`>(`tableName`, `indexName`, `query`): `Promise`<{ `_id`: [`GenericId`](/api/modules/values.md#genericid)<`TableName`> ; `_score`: `number` }\[]>

Run a vector search on the given table and index.

#### Type parameters[​](#type-parameters-4 "Direct link to Type parameters")

| Name        | Type                                     |
| ----------- | ---------------------------------------- |
| `TableName` | extends `string`                         |
| `IndexName` | extends `string` \| `number` \| `symbol` |

#### Parameters[​](#parameters-3 "Direct link to Parameters")

| Name            | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Description                                                                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tableName`     | `TableName`                                                                                                                                                                                                                                                                                                                                                                                                                                                                | The name of the table to query.                                                                                                                                                  |
| `indexName`     | `IndexName`                                                                                                                                                                                                                                                                                                                                                                                                                                                                | The name of the vector index on the table to query.                                                                                                                              |
| `query`         | `Object`                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | A [VectorSearchQuery](/api/interfaces/server.VectorSearchQuery.md) containing the vector to query, the number of results to return, and any filters.                             |
| `query.vector`  | `number`\[]                                                                                                                                                                                                                                                                                                                                                                                                                                                                | The query vector. This must have the same length as the `dimensions` of the index. This vector search will return the IDs of the documents most similar to this vector.          |
| `query.limit?`  | `number`                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | The number of results to return. If specified, must be between 1 and 256 inclusive. **`Default`** `ts 10`                                                                        |
| `query.filter?` | (`q`: [`VectorFilterBuilder`](/api/interfaces/server.VectorFilterBuilder.md)<[`DocumentByInfo`](/api/modules/server.md#documentbyinfo)<[`NamedTableInfo`](/api/modules/server.md#namedtableinfo)<`DataModel`, `TableName`>>, [`NamedVectorIndex`](/api/modules/server.md#namedvectorindex)<[`NamedTableInfo`](/api/modules/server.md#namedtableinfo)<`DataModel`, `TableName`>, `IndexName`>>) => [`FilterExpression`](/api/classes/server.FilterExpression.md)<`boolean`> | Optional filter expression made up of `q.or` and `q.eq` operating over the filter fields of the index. e.g. `filter: q => q.or(q.eq("genre", "comedy"), q.eq("genre", "drama"))` |

#### Returns[​](#returns-3 "Direct link to Returns")

`Promise`<{ `_id`: [`GenericId`](/api/modules/values.md#genericid)<`TableName`> ; `_score`: `number` }\[]>

A promise of IDs and scores for the documents with the nearest vectors

#### Defined in[​](#defined-in-7 "Direct link to Defined in")

[server/registration.ts:423](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L423)
