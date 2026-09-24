# server.js

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

This code is generated

These exports are not directly available in the `convex` package!

Instead you must run `npx convex dev` to create `convex/_generated/server.js` and `convex/_generated/server.d.ts`.

Generated utilities for implementing server-side Convex query and mutation functions.

## Functions[​](#functions "Direct link to Functions")

### query[​](#query "Direct link to query")

▸ **query**(`func`): [`RegisteredQuery`](/api/modules/server.md#registeredquery)

Define a query in this Convex app's public API.

This function will be allowed to read your Convex database and will be accessible from the client.

This is an alias of [`queryGeneric`](/api/modules/server.md#querygeneric) that is typed for your app's data model.

#### Parameters[​](#parameters "Direct link to Parameters")

| Name   | Description                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------ |
| `func` | The query function. It receives a [QueryCtx](/generated-api/server.md#queryctx) as its first argument. |

#### Returns[​](#returns "Direct link to Returns")

[`RegisteredQuery`](/api/modules/server.md#registeredquery)

The wrapped query. Include this as an `export` to name it and make it accessible.

***

### internalQuery[​](#internalquery "Direct link to internalQuery")

▸ **internalQuery**(`func`): [`RegisteredQuery`](/api/modules/server.md#registeredquery)

Define a query that is only accessible from other Convex functions (but not from the client).

This function will be allowed to read from your Convex database. It will not be accessible from the client.

This is an alias of [`internalQueryGeneric`](/api/modules/server.md#internalquerygeneric) that is typed for your app's data model.

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name   | Description                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------ |
| `func` | The query function. It receives a [QueryCtx](/generated-api/server.md#queryctx) as its first argument. |

#### Returns[​](#returns-1 "Direct link to Returns")

[`RegisteredQuery`](/api/modules/server.md#registeredquery)

The wrapped query. Include this as an `export` to name it and make it accessible.

***

### mutation[​](#mutation "Direct link to mutation")

▸ **mutation**(`func`): [`RegisteredMutation`](/api/modules/server.md#registeredmutation)

Define a mutation in this Convex app's public API.

This function will be allowed to modify your Convex database and will be accessible from the client.

This is an alias of [`mutationGeneric`](/api/modules/server.md#mutationgeneric) that is typed for your app's data model.

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name   | Description                                                                             |
| ------ | --------------------------------------------------------------------------------------- |
| `func` | The mutation function. It receives a [MutationCtx](#mutationctx) as its first argument. |

#### Returns[​](#returns-2 "Direct link to Returns")

[`RegisteredMutation`](/api/modules/server.md#registeredmutation)

The wrapped mutation. Include this as an `export` to name it and make it accessible.

***

### internalMutation[​](#internalmutation "Direct link to internalMutation")

▸ **internalMutation**(`func`): [`RegisteredMutation`](/api/modules/server.md#registeredmutation)

Define a mutation that is only accessible from other Convex functions (but not from the client).

This function will be allowed to read and write from your Convex database. It will not be accessible from the client.

This is an alias of [`internalMutationGeneric`](/api/modules/server.md#internalmutationgeneric) that is typed for your app's data model.

#### Parameters[​](#parameters-3 "Direct link to Parameters")

| Name   | Description                                                                                                     |
| ------ | --------------------------------------------------------------------------------------------------------------- |
| `func` | The mutation function. It receives a [MutationCtx](/generated-api/server.md#mutationctx) as its first argument. |

#### Returns[​](#returns-3 "Direct link to Returns")

[`RegisteredMutation`](/api/modules/server.md#registeredmutation)

The wrapped mutation. Include this as an `export` to name it and make it accessible.

***

### action[​](#action "Direct link to action")

▸ **action**(`func`): [`RegisteredAction`](/api/modules/server.md#registeredaction)

Define an action in this Convex app's public API.

An action is a function which can execute any JavaScript code, including non-deterministic code and code with side-effects, like calling third-party services. They can be run in Convex's JavaScript environment or in Node.js using the `"use node"` directive. They can interact with the database indirectly by calling queries and mutations using the [`ActionCtx`](#actionctx).

This is an alias of [`actionGeneric`](/api/modules/server.md#actiongeneric) that is typed for your app's data model.

#### Parameters[​](#parameters-4 "Direct link to Parameters")

| Name   | Description                                                                        |
| ------ | ---------------------------------------------------------------------------------- |
| `func` | The action function. It receives an [ActionCtx](#actionctx) as its first argument. |

#### Returns[​](#returns-4 "Direct link to Returns")

[`RegisteredAction`](/api/modules/server.md#registeredaction)

The wrapped function. Include this as an `export` to name it and make it accessible.

***

### internalAction[​](#internalaction "Direct link to internalAction")

▸ **internalAction**(`func`): [`RegisteredAction`](/api/modules/server.md#registeredaction)

Define an action that is only accessible from other Convex functions (but not from the client).

This is an alias of [`internalActionGeneric`](/api/modules/server.md#internalactiongeneric) that is typed for your app's data model.

#### Parameters[​](#parameters-5 "Direct link to Parameters")

| Name   | Description                                                                        |
| ------ | ---------------------------------------------------------------------------------- |
| `func` | The action function. It receives an [ActionCtx](#actionctx) as its first argument. |

#### Returns[​](#returns-5 "Direct link to Returns")

[`RegisteredAction`](/api/modules/server.md#registeredaction)

The wrapped action. Include this as an `export` to name it and make it accessible.

***

### httpAction[​](#httpaction "Direct link to httpAction")

▸ **httpAction**(`func: (ctx: ActionCtx, request: Request) => Promise<Response>`): [`PublicHttpAction`](/api/modules/server.md#publichttpaction)

#### Parameters[​](#parameters-6 "Direct link to Parameters")

| Name   | Type                                                      | Description                                                                                                                                                                      |
| ------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `func` | `(ctx: ActionCtx, request: Request) => Promise<Response>` | The function. It receives an [`ActionCtx`](#actionctx) as its first argument and a [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) as its second argument. |

#### Returns[​](#returns-6 "Direct link to Returns")

[`PublicHttpAction`](/api/modules/server.md#publichttpaction)

The wrapped function. Import this function from `convex/http.js` and route it to hook it up.

## Types[​](#types "Direct link to Types")

### QueryCtx[​](#queryctx "Direct link to QueryCtx")

Ƭ **QueryCtx**: `Object`

A set of services for use within Convex query functions.

The query context is passed as the first argument to any Convex query function run on the server.

This differs from the [MutationCtx](#mutationctx) because all of the services are read-only.

This is an alias of [`GenericQueryCtx`](/api/interfaces/server.GenericQueryCtx.md) that is typed for your app's data model.

#### Type declaration[​](#type-declaration "Direct link to Type declaration")

| Name      | Type                                                       |
| --------- | ---------------------------------------------------------- |
| `db`      | [`DatabaseReader`](#databasereader)                        |
| `auth`    | [`Auth`](/api/interfaces/server.Auth.md)                   |
| `storage` | [`StorageReader`](/api/interfaces/server.StorageReader.md) |

***

### MutationCtx[​](#mutationctx "Direct link to MutationCtx")

Ƭ **MutationCtx**: `Object`

A set of services for use within Convex mutation functions.

The mutation context is passed as the first argument to any Convex mutation function run on the server.

This is an alias of [`GenericMutationCtx`](/api/interfaces/server.GenericMutationCtx.md) that is typed for your app's data model.

#### Type declaration[​](#type-declaration-1 "Direct link to Type declaration")

| Name        | Type                                                       |
| ----------- | ---------------------------------------------------------- |
| `db`        | [`DatabaseWriter`](#databasewriter)                        |
| `auth`      | [`Auth`](/api/interfaces/server.Auth.md)                   |
| `storage`   | [`StorageWriter`](/api/interfaces/server.StorageWriter.md) |
| `scheduler` | [`Scheduler`](/api/interfaces/server.Scheduler.md)         |

***

### ActionCtx[​](#actionctx "Direct link to ActionCtx")

Ƭ **ActionCtx**: `Object`

A set of services for use within Convex action functions.

The action context is passed as the first argument to any Convex action function run on the server.

This is an alias of [`GenericActionCtx`](/api/interfaces/server.GenericActionCtx.md) that is typed for your app's data model.

#### Type declaration[​](#type-declaration-2 "Direct link to Type declaration")

| Name           | Type                                                                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `runQuery`     | (`name`: `string`, `args`?: `Record<string, Value>`) => `Promise<Value>`                                                                                                     |
| `runMutation`  | (`name`: `string`, `args`?: `Record<string, Value>`) => `Promise<Value>`                                                                                                     |
| `runAction`    | (`name`: `string`, `args`?: `Record<string, Value>`) => `Promise<Value>`                                                                                                     |
| `auth`         | [`Auth`](/api/interfaces/server.Auth.md)                                                                                                                                     |
| `scheduler`    | [`Scheduler`](/api/interfaces/server.Scheduler.md)                                                                                                                           |
| `storage`      | [`StorageActionWriter`](/api/interfaces/server.StorageActionWriter.md)                                                                                                       |
| `vectorSearch` | (`tableName`: `string`, `indexName`: `string`, `query`: [`VectorSearchQuery`](/api/interfaces/server.VectorSearchQuery.md)) => `Promise<Array<{ _id: Id, _score: number }>>` |

***

### DatabaseReader[​](#databasereader "Direct link to DatabaseReader")

An interface to read from the database within Convex query functions.

This is an alias of [`GenericDatabaseReader`](/api/interfaces/server.GenericDatabaseReader.md) that is typed for your app's data model.

***

### DatabaseWriter[​](#databasewriter "Direct link to DatabaseWriter")

An interface to read from and write to the database within Convex mutation functions.

This is an alias of [`GenericDatabaseWriter`](/api/interfaces/server.GenericDatabaseWriter.md) that is typed for your app's data model.
