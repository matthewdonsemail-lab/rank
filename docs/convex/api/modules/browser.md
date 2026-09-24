# Module: browser

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Tools for accessing Convex in the browser.

**If you are using React, use the [react](/api/modules/react.md) module instead.**

## Usage[​](#usage "Direct link to Usage")

Create a [ConvexHttpClient](/api/classes/browser.ConvexHttpClient.md) to connect to the Convex Cloud.

```
import { ConvexHttpClient } from "convex/browser";

// typically loaded from an environment variable

const address = "https://small-mouse-123.convex.cloud";

const convex = new ConvexHttpClient(address);
```

## Classes[​](#classes "Direct link to Classes")

* [ConvexHttpClient](/api/classes/browser.ConvexHttpClient.md)
* [ConvexClient](/api/classes/browser.ConvexClient.md)
* [BaseConvexClient](/api/classes/browser.BaseConvexClient.md)

## Interfaces[​](#interfaces "Direct link to Interfaces")

* [BaseConvexClientOptions](/api/interfaces/browser.BaseConvexClientOptions.md)
* [SubscribeOptions](/api/interfaces/browser.SubscribeOptions.md)
* [MutationOptions](/api/interfaces/browser.MutationOptions.md)
* [OptimisticLocalStore](/api/interfaces/browser.OptimisticLocalStore.md)

## Type Aliases[​](#type-aliases "Direct link to Type Aliases")

### HttpMutationOptions[​](#httpmutationoptions "Direct link to HttpMutationOptions")

Ƭ **HttpMutationOptions**: `Object`

#### Type declaration[​](#type-declaration "Direct link to Type declaration")

| Name        | Type      | Description                                                                                                                                                                                                    |
| ----------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `skipQueue` | `boolean` | Skip the default queue of mutations and run this immediately. This allows the same HttpConvexClient to be used to request multiple mutations in parallel, something not possible with WebSocket-based clients. |

#### Defined in[​](#defined-in "Direct link to Defined in")

[browser/http\_client.ts:41](https://github.com/get-convex/convex-js/blob/main/src/browser/http_client.ts#L41)

***

### QueryOptions[​](#queryoptions "Direct link to QueryOptions")

Ƭ **QueryOptions**<`Query`>: `Object`

Options for a Convex query: the query function reference and its arguments.

Used with the object-form overload of useQuery.

#### Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`> |

#### Type declaration[​](#type-declaration-1 "Direct link to Type declaration")

| Name    | Type                                                           | Description                          |
| ------- | -------------------------------------------------------------- | ------------------------------------ |
| `query` | `Query`                                                        | The query function to run.           |
| `args`  | [`FunctionArgs`](/api/modules/server.md#functionargs)<`Query`> | The arguments to the query function. |

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[browser/query\_options.ts:15](https://github.com/get-convex/convex-js/blob/main/src/browser/query_options.ts#L15)

***

### ConvexClientOptions[​](#convexclientoptions "Direct link to ConvexClientOptions")

Ƭ **ConvexClientOptions**: [`BaseConvexClientOptions`](/api/interfaces/browser.BaseConvexClientOptions.md) & { `disabled?`: `boolean` ; `unsavedChangesWarning?`: `boolean` }

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[browser/simple\_client.ts:39](https://github.com/get-convex/convex-js/blob/main/src/browser/simple_client.ts#L39)

***

### AuthTokenFetcher[​](#authtokenfetcher "Direct link to AuthTokenFetcher")

Ƭ **AuthTokenFetcher**: (`args`: { `forceRefreshToken`: `boolean` }) => `Promise`<`string` | `null` | `undefined`>

#### Type declaration[​](#type-declaration-2 "Direct link to Type declaration")

▸ (`args`): `Promise`<`string` | `null` | `undefined`>

An async function returning a JWT. Depending on the auth providers configured in convex/auth.config.ts, this may be a JWT-encoded OpenID Connect Identity Token or a traditional JWT.

`forceRefreshToken` is `true` if the server rejected a previously returned token or the token is anticipated to expiring soon based on its `exp` time.

See ConvexReactClient.setAuth.

##### Parameters[​](#parameters "Direct link to Parameters")

| Name                     | Type      |
| ------------------------ | --------- |
| `args`                   | `Object`  |
| `args.forceRefreshToken` | `boolean` |

##### Returns[​](#returns "Direct link to Returns")

`Promise`<`string` | `null` | `undefined`>

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[browser/sync/authentication\_manager.ts:25](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/authentication_manager.ts#L25)

***

### ConnectionState[​](#connectionstate "Direct link to ConnectionState")

Ƭ **ConnectionState**: `Object`

State describing the client's connection with the Convex backend.

#### Type declaration[​](#type-declaration-3 "Direct link to Type declaration")

| Name                          | Type             | Description                                                                                                                                                                                                                                                                         |
| ----------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hasInflightRequests`         | `boolean`        | -                                                                                                                                                                                                                                                                                   |
| `isWebSocketConnected`        | `boolean`        | -                                                                                                                                                                                                                                                                                   |
| `timeOfOldestInflightRequest` | `Date` \| `null` | -                                                                                                                                                                                                                                                                                   |
| `hasEverConnected`            | `boolean`        | True if the client has ever opened a WebSocket to the "ready" state.                                                                                                                                                                                                                |
| `connectionCount`             | `number`         | The number of times this client has connected to the Convex backend. A number of things can cause the client to reconnect -- server errors, bad internet, auth expiring. But this number being high is an indication that the client is having trouble keeping a stable connection. |
| `connectionRetries`           | `number`         | The number of times this client has tried (and failed) to connect to the Convex backend.                                                                                                                                                                                            |
| `inflightMutations`           | `number`         | The number of mutations currently in flight.                                                                                                                                                                                                                                        |
| `inflightActions`             | `number`         | The number of actions currently in flight.                                                                                                                                                                                                                                          |

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[browser/sync/client.ts:163](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L163)

***

### FunctionResult[​](#functionresult "Direct link to FunctionResult")

Ƭ **FunctionResult**: `FunctionSuccess` | `FunctionFailure`

The result of running a function on the server.

If the function hit an exception it will have an `errorMessage`. Otherwise it will produce a `Value`.

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[browser/sync/function\_result.ts:11](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/function_result.ts#L11)

***

### OptimisticUpdate[​](#optimisticupdate "Direct link to OptimisticUpdate")

Ƭ **OptimisticUpdate**<`Args`>: (`localQueryStore`: [`OptimisticLocalStore`](/api/interfaces/browser.OptimisticLocalStore.md), `args`: `Args`) => `void`

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name   | Type                                                                |
| ------ | ------------------------------------------------------------------- |
| `Args` | extends `Record`<`string`, [`Value`](/api/modules/values.md#value)> |

#### Type declaration[​](#type-declaration-4 "Direct link to Type declaration")

▸ (`localQueryStore`, `args`): `void`

A temporary, local update to query results within this client.

This update will always be executed when a mutation is synced to the Convex server and rolled back when the mutation completes.

Note that optimistic updates can be called multiple times! If the client loads new data while the mutation is in progress, the update will be replayed again.

##### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name              | Type                                                                      | Description                                        |
| ----------------- | ------------------------------------------------------------------------- | -------------------------------------------------- |
| `localQueryStore` | [`OptimisticLocalStore`](/api/interfaces/browser.OptimisticLocalStore.md) | An interface to read and edit local query results. |
| `args`            | `Args`                                                                    | The arguments to the mutation.                     |

##### Returns[​](#returns-1 "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[browser/sync/optimistic\_updates.ts:103](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/optimistic_updates.ts#L103)

***

### PaginationStatus[​](#paginationstatus "Direct link to PaginationStatus")

Ƭ **PaginationStatus**: `"LoadingFirstPage"` | `"CanLoadMore"` | `"LoadingMore"` | `"Exhausted"`

#### Defined in[​](#defined-in-7 "Direct link to Defined in")

[browser/sync/pagination.ts:5](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/pagination.ts#L5)

***

### QueryJournal[​](#queryjournal "Direct link to QueryJournal")

Ƭ **QueryJournal**: `string` | `null`

A serialized representation of decisions made during a query's execution.

A journal is produced when a query function first executes and is re-used when a query is re-executed.

Currently this is used to store pagination end cursors to ensure that pages of paginated queries will always end at the same cursor. This enables gapless, reactive pagination.

`null` is used to represent empty journals.

#### Defined in[​](#defined-in-8 "Direct link to Defined in")

[browser/sync/protocol.ts:113](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/protocol.ts#L113)

***

### QueryToken[​](#querytoken "Direct link to QueryToken")

Ƭ **QueryToken**: `string` & { `__queryToken`: `true` }

A string representing the name and arguments of a query.

This is used by the [BaseConvexClient](/api/classes/browser.BaseConvexClient.md).

#### Defined in[​](#defined-in-9 "Direct link to Defined in")

[browser/sync/udf\_path\_utils.ts:31](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/udf_path_utils.ts#L31)

***

### PaginatedQueryToken[​](#paginatedquerytoken "Direct link to PaginatedQueryToken")

Ƭ **PaginatedQueryToken**: [`QueryToken`](/api/modules/browser.md#querytoken) & { `__paginatedQueryToken`: `true` }

A string representing the name and arguments of a paginated query.

This is a specialized form of QueryToken used for paginated queries.

#### Defined in[​](#defined-in-10 "Direct link to Defined in")

[browser/sync/udf\_path\_utils.ts:38](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/udf_path_utils.ts#L38)

***

### UserIdentityAttributes[​](#useridentityattributes "Direct link to UserIdentityAttributes")

Ƭ **UserIdentityAttributes**: `Omit`<[`UserIdentity`](/api/interfaces/server.UserIdentity.md), `"tokenIdentifier"`>

#### Defined in[​](#defined-in-11 "Direct link to Defined in")

[server/authentication.ts:215](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L215)
