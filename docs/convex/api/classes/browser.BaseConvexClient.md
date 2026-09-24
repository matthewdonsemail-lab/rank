# Class: BaseConvexClient

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[browser](/api/modules/browser.md).BaseConvexClient

Low-level client for directly integrating state management libraries with Convex.

Most developers should use higher level clients, like the [ConvexHttpClient](/api/classes/browser.ConvexHttpClient.md) or the React hook based [ConvexReactClient](/api/classes/react.ConvexReactClient.md).

## Constructors[​](#constructors "Direct link to Constructors")

### constructor[​](#constructor "Direct link to constructor")

• **new BaseConvexClient**(`address`, `onTransition`, `options?`)

#### Parameters[​](#parameters "Direct link to Parameters")

| Name           | Type                                                                                | Description                                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`      | `string`                                                                            | The url of your Convex deployment, often provided by an environment variable. E.g. `https://small-mouse-123.convex.cloud`.                                       |
| `onTransition` | (`updatedQueries`: [`QueryToken`](/api/modules/browser.md#querytoken)\[]) => `void` | A callback receiving an array of query tokens corresponding to query results that have changed -- additional handlers can be added via `addOnTransitionHandler`. |
| `options?`     | [`BaseConvexClientOptions`](/api/interfaces/browser.BaseConvexClientOptions.md)     | See [BaseConvexClientOptions](/api/interfaces/browser.BaseConvexClientOptions.md) for a full description.                                                        |

#### Defined in[​](#defined-in "Direct link to Defined in")

[browser/sync/client.ts:293](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L293)

## Accessors[​](#accessors "Direct link to Accessors")

### url[​](#url "Direct link to url")

• `get` **url**(): `string`

Return the address for this client, useful for creating a new client.

Not guaranteed to match the address with which this client was constructed: it may be canonicalized.

#### Returns[​](#returns "Direct link to Returns")

`string`

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[browser/sync/client.ts:1055](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L1055)

## Methods[​](#methods "Direct link to Methods")

### getMaxObservedTimestamp[​](#getmaxobservedtimestamp "Direct link to getMaxObservedTimestamp")

▸ **getMaxObservedTimestamp**(): `undefined` | `Long`

#### Returns[​](#returns-1 "Direct link to Returns")

`undefined` | `Long`

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[browser/sync/client.ts:554](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L554)

***

### addOnTransitionHandler[​](#addontransitionhandler "Direct link to addOnTransitionHandler")

▸ **addOnTransitionHandler**(`fn`): () => `boolean`

Add a handler that will be called on a transition.

Any external side effects (e.g. setting React state) should be handled here.

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name | Type                                   |
| ---- | -------------------------------------- |
| `fn` | (`transition`: `Transition`) => `void` |

#### Returns[​](#returns-2 "Direct link to Returns")

`fn`

▸ (): `boolean`

##### Returns[​](#returns-3 "Direct link to Returns")

`boolean`

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[browser/sync/client.ts:633](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L633)

***

### getCurrentAuthClaims[​](#getcurrentauthclaims "Direct link to getCurrentAuthClaims")

▸ **getCurrentAuthClaims**(): `undefined` | { `token`: `string` ; `decoded`: `Record`<`string`, `any`> }

Get the current JWT auth token and decoded claims.

#### Returns[​](#returns-4 "Direct link to Returns")

`undefined` | { `token`: `string` ; `decoded`: `Record`<`string`, `any`> }

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[browser/sync/client.ts:642](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L642)

***

### setAuth[​](#setauth "Direct link to setAuth")

▸ **setAuth**(`fetchToken`, `onChange`, `onRefreshChange?`): `void`

Set the authentication token to be used for subsequent queries and mutations. `fetchToken` will be called automatically again if a token expires. `fetchToken` should return `null` if the token cannot be retrieved, for example when the user's rights were permanently revoked.

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name               | Type                                                           | Description                                                                                                                                       |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fetchToken`       | [`AuthTokenFetcher`](/api/modules/browser.md#authtokenfetcher) | an async function returning the JWT-encoded OpenID Connect Identity Token                                                                         |
| `onChange`         | (`isAuthenticated`: `boolean`) => `void`                       | a callback that will be called when the authentication status changes                                                                             |
| `onRefreshChange?` | (`isRefreshing`: `boolean`) => `void`                          | a callback called with `true` when the socket is paused to fetch a replacement token after a server rejection, and `false` when refresh completes |

#### Returns[​](#returns-5 "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[browser/sync/client.ts:668](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L668)

***

### hasAuth[​](#hasauth "Direct link to hasAuth")

▸ **hasAuth**(): `boolean`

#### Returns[​](#returns-6 "Direct link to Returns")

`boolean`

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[browser/sync/client.ts:680](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L680)

***

### clearAuth[​](#clearauth "Direct link to clearAuth")

▸ **clearAuth**(): `void`

#### Returns[​](#returns-7 "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-7 "Direct link to Defined in")

[browser/sync/client.ts:690](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L690)

***

### subscribe[​](#subscribe "Direct link to subscribe")

▸ **subscribe**(`name`, `args?`, `options?`): `Object`

Subscribe to a query function.

Whenever this query's result changes, the `onTransition` callback passed into the constructor will be called.

#### Parameters[​](#parameters-3 "Direct link to Parameters")

| Name       | Type                                                              | Description                                                                                      |
| ---------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `name`     | `string`                                                          | The name of the query.                                                                           |
| `args?`    | `Record`<`string`, [`Value`](/api/modules/values.md#value)>       | An arguments object for the query. If this is omitted, the arguments will be `{}`.               |
| `options?` | [`SubscribeOptions`](/api/interfaces/browser.SubscribeOptions.md) | A [SubscribeOptions](/api/interfaces/browser.SubscribeOptions.md) options object for this query. |

#### Returns[​](#returns-8 "Direct link to Returns")

`Object`

An object containing a [QueryToken](/api/modules/browser.md#querytoken) corresponding to this query and an `unsubscribe` callback.

| Name          | Type                                               |
| ------------- | -------------------------------------------------- |
| `queryToken`  | [`QueryToken`](/api/modules/browser.md#querytoken) |
| `unsubscribe` | () => `void`                                       |

#### Defined in[​](#defined-in-8 "Direct link to Defined in")

[browser/sync/client.ts:709](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L709)

***

### localQueryResult[​](#localqueryresult "Direct link to localQueryResult")

▸ **localQueryResult**(`udfPath`, `args?`): `undefined` | [`Value`](/api/modules/values.md#value)

A query result based only on the current, local state.

The only way this will return a value is if we're already subscribed to the query or its value has been set optimistically.

#### Parameters[​](#parameters-4 "Direct link to Parameters")

| Name      | Type                                                        |
| --------- | ----------------------------------------------------------- |
| `udfPath` | `string`                                                    |
| `args?`   | `Record`<`string`, [`Value`](/api/modules/values.md#value)> |

#### Returns[​](#returns-9 "Direct link to Returns")

`undefined` | [`Value`](/api/modules/values.md#value)

#### Defined in[​](#defined-in-9 "Direct link to Defined in")

[browser/sync/client.ts:742](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L742)

***

### queryJournal[​](#queryjournal "Direct link to queryJournal")

▸ **queryJournal**(`name`, `args?`): `undefined` | [`QueryJournal`](/api/modules/browser.md#queryjournal)

Retrieve the current [QueryJournal](/api/modules/browser.md#queryjournal) for this query function.

If we have not yet received a result for this query, this will be `undefined`.

#### Parameters[​](#parameters-5 "Direct link to Parameters")

| Name    | Type                                                        | Description                          |
| ------- | ----------------------------------------------------------- | ------------------------------------ |
| `name`  | `string`                                                    | The name of the query.               |
| `args?` | `Record`<`string`, [`Value`](/api/modules/values.md#value)> | The arguments object for this query. |

#### Returns[​](#returns-10 "Direct link to Returns")

`undefined` | [`QueryJournal`](/api/modules/browser.md#queryjournal)

The query's [QueryJournal](/api/modules/browser.md#queryjournal) or `undefined`.

#### Defined in[​](#defined-in-10 "Direct link to Defined in")

[browser/sync/client.ts:795](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L795)

***

### connectionState[​](#connectionstate "Direct link to connectionState")

▸ **connectionState**(): [`ConnectionState`](/api/modules/browser.md#connectionstate)

Get the current [ConnectionState](/api/modules/browser.md#connectionstate) between the client and the Convex backend.

#### Returns[​](#returns-11 "Direct link to Returns")

[`ConnectionState`](/api/modules/browser.md#connectionstate)

The [ConnectionState](/api/modules/browser.md#connectionstate) with the Convex backend.

#### Defined in[​](#defined-in-11 "Direct link to Defined in")

[browser/sync/client.ts:810](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L810)

***

### subscribeToConnectionState[​](#subscribetoconnectionstate "Direct link to subscribeToConnectionState")

▸ **subscribeToConnectionState**(`cb`): () => `void`

Subscribe to the [ConnectionState](/api/modules/browser.md#connectionstate) between the client and the Convex backend, calling a callback each time it changes.

Subscribed callbacks will be called when any part of ConnectionState changes. ConnectionState may grow in future versions (e.g. to provide a array of inflight requests) in which case callbacks would be called more frequently.

#### Parameters[​](#parameters-6 "Direct link to Parameters")

| Name | Type                                                                                        |
| ---- | ------------------------------------------------------------------------------------------- |
| `cb` | (`connectionState`: [`ConnectionState`](/api/modules/browser.md#connectionstate)) => `void` |

#### Returns[​](#returns-12 "Direct link to Returns")

`fn`

An unsubscribe function to stop listening.

▸ (): `void`

Subscribe to the [ConnectionState](/api/modules/browser.md#connectionstate) between the client and the Convex backend, calling a callback each time it changes.

Subscribed callbacks will be called when any part of ConnectionState changes. ConnectionState may grow in future versions (e.g. to provide a array of inflight requests) in which case callbacks would be called more frequently.

##### Returns[​](#returns-13 "Direct link to Returns")

`void`

An unsubscribe function to stop listening.

#### Defined in[​](#defined-in-12 "Direct link to Defined in")

[browser/sync/client.ts:856](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L856)

***

### mutation[​](#mutation "Direct link to mutation")

▸ **mutation**(`name`, `args?`, `options?`): `Promise`<`any`>

Execute a mutation function.

#### Parameters[​](#parameters-7 "Direct link to Parameters")

| Name       | Type                                                            | Description                                                                                       |
| ---------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `name`     | `string`                                                        | The name of the mutation.                                                                         |
| `args?`    | `Record`<`string`, [`Value`](/api/modules/values.md#value)>     | An arguments object for the mutation. If this is omitted, the arguments will be `{}`.             |
| `options?` | [`MutationOptions`](/api/interfaces/browser.MutationOptions.md) | A [MutationOptions](/api/interfaces/browser.MutationOptions.md) options object for this mutation. |

#### Returns[​](#returns-14 "Direct link to Returns")

`Promise`<`any`>

* A promise of the mutation's result.

#### Defined in[​](#defined-in-13 "Direct link to Defined in")

[browser/sync/client.ts:876](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L876)

***

### action[​](#action "Direct link to action")

▸ **action**(`name`, `args?`): `Promise`<`any`>

Execute an action function.

#### Parameters[​](#parameters-8 "Direct link to Parameters")

| Name    | Type                                                        | Description                                                                         |
| ------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `name`  | `string`                                                    | The name of the action.                                                             |
| `args?` | `Record`<`string`, [`Value`](/api/modules/values.md#value)> | An arguments object for the action. If this is omitted, the arguments will be `{}`. |

#### Returns[​](#returns-15 "Direct link to Returns")

`Promise`<`any`>

A promise of the action's result.

#### Defined in[​](#defined-in-14 "Direct link to Defined in")

[browser/sync/client.ts:997](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L997)

***

### close[​](#close "Direct link to close")

▸ **close**(): `Promise`<`void`>

Close any network handles associated with this client and stop all subscriptions.

Call this method when you're done with an [BaseConvexClient](/api/classes/browser.BaseConvexClient.md) to dispose of its sockets and resources.

#### Returns[​](#returns-16 "Direct link to Returns")

`Promise`<`void`>

A `Promise` fulfilled when the connection has been completely closed.

#### Defined in[​](#defined-in-15 "Direct link to Defined in")

[browser/sync/client.ts:1044](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L1044)
