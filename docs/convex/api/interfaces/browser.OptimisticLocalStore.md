# Interface: OptimisticLocalStore

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[browser](/api/modules/browser.md).OptimisticLocalStore

A view of the query results currently in the Convex client for use within optimistic updates.

## Methods[​](#methods "Direct link to Methods")

### getQuery[​](#getquery "Direct link to getQuery")

▸ **getQuery**<`Query`>(`query`, `...args`): `undefined` | [`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>

Retrieve the result of a query from the client.

Important: Query results should be treated as immutable! Always make new copies of structures within query results to avoid corrupting data within the client.

#### Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`> |

#### Parameters[​](#parameters "Direct link to Parameters")

| Name      | Type                                                                   | Description                                                                           |
| --------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `query`   | `Query`                                                                | A [FunctionReference](/api/modules/server.md#functionreference) for the query to get. |
| `...args` | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`Query`> | The arguments object for this query.                                                  |

#### Returns[​](#returns "Direct link to Returns")

`undefined` | [`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>

The query result or `undefined` if the query is not currently in the client.

#### Defined in[​](#defined-in "Direct link to Defined in")

[browser/sync/optimistic\_updates.ts:29](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/optimistic_updates.ts#L29)

***

### getAllQueries[​](#getallqueries "Direct link to getAllQueries")

▸ **getAllQueries**<`Query`>(`query`): { `args`: [`FunctionArgs`](/api/modules/server.md#functionargs)<`Query`> ; `value`: `undefined` | [`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`> }\[]

Retrieve the results and arguments of all queries with a given name.

This is useful for complex optimistic updates that need to inspect and update many query results (for example updating a paginated list).

Important: Query results should be treated as immutable! Always make new copies of structures within query results to avoid corrupting data within the client.

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`> |

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name    | Type    | Description                                                                           |
| ------- | ------- | ------------------------------------------------------------------------------------- |
| `query` | `Query` | A [FunctionReference](/api/modules/server.md#functionreference) for the query to get. |

#### Returns[​](#returns-1 "Direct link to Returns")

{ `args`: [`FunctionArgs`](/api/modules/server.md#functionargs)<`Query`> ; `value`: `undefined` | [`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`> }\[]

An array of objects, one for each query of the given name. Each object includes:

* `args` - The arguments object for the query.
* `value` The query result or `undefined` if the query is loading.

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[browser/sync/optimistic\_updates.ts:54](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/optimistic_updates.ts#L54)

***

### setQuery[​](#setquery "Direct link to setQuery")

▸ **setQuery**<`Query`>(`query`, `args`, `value`): `void`

Optimistically update the result of a query.

This can either be a new value (perhaps derived from the old value from [getQuery](/api/interfaces/browser.OptimisticLocalStore.md#getquery)) or `undefined` to remove the query. Removing a query is useful to create loading states while Convex recomputes the query results.

#### Type parameters[​](#type-parameters-2 "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`> |

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name    | Type                                                                                      | Description                                                                           |
| ------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `query` | `Query`                                                                                   | A [FunctionReference](/api/modules/server.md#functionreference) for the query to set. |
| `args`  | [`FunctionArgs`](/api/modules/server.md#functionargs)<`Query`>                            | The arguments object for this query.                                                  |
| `value` | `undefined` \| [`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`> | The new value to set the query to or `undefined` to remove it from the client.        |

#### Returns[​](#returns-2 "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[browser/sync/optimistic\_updates.ts:78](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/optimistic_updates.ts#L78)
