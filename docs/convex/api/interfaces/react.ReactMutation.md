# Interface: ReactMutation\<Mutation>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[react](/api/modules/react.md).ReactMutation

An interface to execute a Convex mutation function on the server.

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name       | Type                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Mutation` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"mutation"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"mutation"`> |

## Callable[​](#callable "Direct link to Callable")

### ReactMutation[​](#reactmutation "Direct link to ReactMutation")

▸ **ReactMutation**(`...args`): `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Mutation`>>

Execute the mutation on the server, returning a `Promise` of its return value.

#### Parameters[​](#parameters "Direct link to Parameters")

| Name      | Type                                                                      | Description                                          |
| --------- | ------------------------------------------------------------------------- | ---------------------------------------------------- |
| `...args` | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`Mutation`> | Arguments for the mutation to pass up to the server. |

#### Returns[​](#returns "Direct link to Returns")

`Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Mutation`>>

The return value of the server-side function call.

#### Defined in[​](#defined-in "Direct link to Defined in")

[react/client.ts:70](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L70)

## Methods[​](#methods "Direct link to Methods")

### withOptimisticUpdate[​](#withoptimisticupdate "Direct link to withOptimisticUpdate")

▸ **withOptimisticUpdate**<`T`>(`optimisticUpdate`): [`ReactMutation`](/api/interfaces/react.ReactMutation.md)<`Mutation`>

Define an optimistic update to apply as part of this mutation.

This is a temporary update to the local query results to facilitate a fast, interactive UI. It enables query results to update before a mutation executed on the server.

When the mutation is invoked, the optimistic update will be applied.

Optimistic updates can also be used to temporarily remove queries from the client and create loading experiences until a mutation completes and the new query results are synced.

The update will be automatically rolled back when the mutation is fully completed and queries have been updated.

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name | Type                                                                                                                                      |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `T`  | extends [`OptimisticUpdate`](/api/modules/browser.md#optimisticupdate)<[`FunctionArgs`](/api/modules/server.md#functionargs)<`Mutation`>> |

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name               | Type                                                                                                    | Description                     |
| ------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `optimisticUpdate` | `T` & `ReturnType`<`T`> extends `Promise`<`any`> ? `"Optimistic update handlers must be synchronous"` : | The optimistic update to apply. |

#### Returns[​](#returns-1 "Direct link to Returns")

[`ReactMutation`](/api/interfaces/react.ReactMutation.md)<`Mutation`>

A new `ReactMutation` with the update configured.

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[react/client.ts:93](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L93)
