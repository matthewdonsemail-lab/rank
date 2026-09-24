# Class: ConvexReactClient

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[react](/api/modules/react.md).ConvexReactClient

A Convex client for use within React.

This loads reactive queries and executes mutations over a WebSocket.

## Constructors[​](#constructors "Direct link to Constructors")

### constructor[​](#constructor "Direct link to constructor")

• **new ConvexReactClient**(`address`, `options?`)

#### Parameters[​](#parameters "Direct link to Parameters")

| Name       | Type                                                                            | Description                                                                                                                |
| ---------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `address`  | `string`                                                                        | The url of your Convex deployment, often provided by an environment variable. E.g. `https://small-mouse-123.convex.cloud`. |
| `options?` | [`ConvexReactClientOptions`](/api/interfaces/react.ConvexReactClientOptions.md) | See [ConvexReactClientOptions](/api/interfaces/react.ConvexReactClientOptions.md) for a full description.                  |

#### Defined in[​](#defined-in "Direct link to Defined in")

[react/client.ts:346](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L346)

## Accessors[​](#accessors "Direct link to Accessors")

### url[​](#url "Direct link to url")

• `get` **url**(): `string`

Return the address for this client, useful for creating a new client.

Not guaranteed to match the address with which this client was constructed: it may be canonicalized.

#### Returns[​](#returns "Direct link to Returns")

`string`

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[react/client.ts:381](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L381)

***

### logger[​](#logger "Direct link to logger")

• `get` **logger**(): `Logger`

Get the logger for this client.

#### Returns[​](#returns-1 "Direct link to Returns")

`Logger`

The Logger for this client.

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[react/client.ts:767](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L767)

## Methods[​](#methods "Direct link to Methods")

### setAuth[​](#setauth "Direct link to setAuth")

▸ **setAuth**(`fetchToken`, `onChange?`, `onRefreshChange?`): `void`

Set the authentication token to be used for subsequent queries and mutations. `fetchToken` will be called automatically again if a token expires. `fetchToken` should return `null` if the token cannot be retrieved, for example when the user's rights were permanently revoked.

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name               | Type                                                           | Description                                                                                                                                       |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fetchToken`       | [`AuthTokenFetcher`](/api/modules/browser.md#authtokenfetcher) | an async function returning the JWT-encoded OpenID Connect Identity Token                                                                         |
| `onChange?`        | (`isAuthenticated`: `boolean`) => `void`                       | a callback that will be called when the authentication status changes                                                                             |
| `onRefreshChange?` | (`isRefreshing`: `boolean`) => `void`                          | a callback called with `true` when the socket is paused to fetch a replacement token after a server rejection, and `false` when refresh completes |

#### Returns[​](#returns-2 "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[react/client.ts:440](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L440)

***

### clearAuth[​](#clearauth "Direct link to clearAuth")

▸ **clearAuth**(): `void`

Clear the current authentication token if set.

#### Returns[​](#returns-3 "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[react/client.ts:464](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L464)

***

### watchQuery[​](#watchquery "Direct link to watchQuery")

▸ **watchQuery**<`Query`>(`query`, `...argsAndOptions`): [`Watch`](/api/interfaces/react.Watch.md)<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

Construct a new [Watch](/api/interfaces/react.Watch.md) on a Convex query function.

**Most application code should not call this method directly. Instead use the [useQuery](/api/modules/react.md#usequery) hook.**

The act of creating a watch does nothing, a Watch is stateless.

#### Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`> |

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name                | Type                                                                                                                                  | Description                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `query`             | `Query`                                                                                                                               | A [FunctionReference](/api/modules/server.md#functionreference) for the public query to run. |
| `...argsAndOptions` | [`ArgsAndOptions`](/api/modules/server.md#argsandoptions)<`Query`, [`WatchQueryOptions`](/api/interfaces/react.WatchQueryOptions.md)> | -                                                                                            |

#### Returns[​](#returns-4 "Direct link to Returns")

[`Watch`](/api/interfaces/react.Watch.md)<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

The [Watch](/api/interfaces/react.Watch.md) object.

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[react/client.ts:497](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L497)

***

### prewarmQuery[​](#prewarmquery "Direct link to prewarmQuery")

▸ **prewarmQuery**<`Query`>(`queryOptions`): `void`

Indicates likely future interest in a query subscription.

The implementation currently immediately subscribes to a query. In the future this method may prioritize some queries over others, fetch the query result without subscribing, or do nothing in slow network connections or high load scenarios.

To use this in a React component, call useQuery() and ignore the return value.

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`> |

#### Parameters[​](#parameters-3 "Direct link to Parameters")

| Name           | Type                                                                                                     | Description                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `queryOptions` | [`QueryOptions`](/api/modules/browser.md#queryoptions)<`Query`> & { `extendSubscriptionFor?`: `number` } | A query (function reference from an api object) and its args, plus an optional extendSubscriptionFor for how long to subscribe to the query. |

#### Returns[​](#returns-5 "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[react/client.ts:577](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L577)

***

### mutation[​](#mutation "Direct link to mutation")

▸ **mutation**<`Mutation`>(`mutation`, `...argsAndOptions`): `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Mutation`>>

Execute a mutation function.

#### Type parameters[​](#type-parameters-2 "Direct link to Type parameters")

| Name       | Type                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Mutation` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"mutation"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"mutation"`> |

#### Parameters[​](#parameters-4 "Direct link to Parameters")

| Name                | Type                                                                                                                                                                                                    | Description                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `mutation`          | `Mutation`                                                                                                                                                                                              | A [FunctionReference](/api/modules/server.md#functionreference) for the public mutation to run. |
| `...argsAndOptions` | [`ArgsAndOptions`](/api/modules/server.md#argsandoptions)<`Mutation`, [`MutationOptions`](/api/interfaces/react.MutationOptions.md)<[`FunctionArgs`](/api/modules/server.md#functionargs)<`Mutation`>>> | -                                                                                               |

#### Returns[​](#returns-6 "Direct link to Returns")

`Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Mutation`>>

A promise of the mutation's result.

#### Defined in[​](#defined-in-7 "Direct link to Defined in")

[react/client.ts:660](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L660)

***

### action[​](#action "Direct link to action")

▸ **action**<`Action`>(`action`, `...args`): `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Action`>>

Execute an action function.

#### Type parameters[​](#type-parameters-3 "Direct link to Type parameters")

| Name     | Type                                                                                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Action` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"action"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"action"`> |

#### Parameters[​](#parameters-5 "Direct link to Parameters")

| Name      | Type                                                                    | Description                                                                                   |
| --------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `action`  | `Action`                                                                | A [FunctionReference](/api/modules/server.md#functionreference) for the public action to run. |
| `...args` | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`Action`> | An arguments object for the action. If this is omitted, the arguments will be `{}`.           |

#### Returns[​](#returns-7 "Direct link to Returns")

`Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Action`>>

A promise of the action's result.

#### Defined in[​](#defined-in-8 "Direct link to Defined in")

[react/client.ts:685](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L685)

***

### query[​](#query "Direct link to query")

▸ **query**<`Query`>(`query`, `...args`): `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

Fetch a query result once.

**Most application code should subscribe to queries instead, using the [useQuery](/api/modules/react.md#usequery) hook.**

#### Type parameters[​](#type-parameters-4 "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`> |

#### Parameters[​](#parameters-6 "Direct link to Parameters")

| Name      | Type                                                                   | Description                                                                                  |
| --------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `query`   | `Query`                                                                | A [FunctionReference](/api/modules/server.md#functionreference) for the public query to run. |
| `...args` | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`Query`> | An arguments object for the query. If this is omitted, the arguments will be `{}`.           |

#### Returns[​](#returns-8 "Direct link to Returns")

`Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

A promise of the query's result.

#### Defined in[​](#defined-in-9 "Direct link to Defined in")

[react/client.ts:709](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L709)

***

### connectionState[​](#connectionstate "Direct link to connectionState")

▸ **connectionState**(): [`ConnectionState`](/api/modules/browser.md#connectionstate)

Get the current [ConnectionState](/api/modules/browser.md#connectionstate) between the client and the Convex backend.

#### Returns[​](#returns-9 "Direct link to Returns")

[`ConnectionState`](/api/modules/browser.md#connectionstate)

The [ConnectionState](/api/modules/browser.md#connectionstate) with the Convex backend.

#### Defined in[​](#defined-in-10 "Direct link to Defined in")

[react/client.ts:740](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L740)

***

### subscribeToConnectionState[​](#subscribetoconnectionstate "Direct link to subscribeToConnectionState")

▸ **subscribeToConnectionState**(`cb`): () => `void`

Subscribe to the [ConnectionState](/api/modules/browser.md#connectionstate) between the client and the Convex backend, calling a callback each time it changes.

Subscribed callbacks will be called when any part of ConnectionState changes. ConnectionState may grow in future versions (e.g. to provide a array of inflight requests) in which case callbacks would be called more frequently. ConnectionState may also *lose* properties in future versions as we figure out what information is most useful. As such this API is considered unstable.

#### Parameters[​](#parameters-7 "Direct link to Parameters")

| Name | Type                                                                                        |
| ---- | ------------------------------------------------------------------------------------------- |
| `cb` | (`connectionState`: [`ConnectionState`](/api/modules/browser.md#connectionstate)) => `void` |

#### Returns[​](#returns-10 "Direct link to Returns")

`fn`

An unsubscribe function to stop listening.

▸ (): `void`

Subscribe to the [ConnectionState](/api/modules/browser.md#connectionstate) between the client and the Convex backend, calling a callback each time it changes.

Subscribed callbacks will be called when any part of ConnectionState changes. ConnectionState may grow in future versions (e.g. to provide a array of inflight requests) in which case callbacks would be called more frequently. ConnectionState may also *lose* properties in future versions as we figure out what information is most useful. As such this API is considered unstable.

##### Returns[​](#returns-11 "Direct link to Returns")

`void`

An unsubscribe function to stop listening.

#### Defined in[​](#defined-in-11 "Direct link to Defined in")

[react/client.ts:756](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L756)

***

### close[​](#close "Direct link to close")

▸ **close**(): `Promise`<`void`>

Close any network handles associated with this client and stop all subscriptions.

Call this method when you're done with a [ConvexReactClient](/api/classes/react.ConvexReactClient.md) to dispose of its sockets and resources.

#### Returns[​](#returns-12 "Direct link to Returns")

`Promise`<`void`>

A `Promise` fulfilled when the connection has been completely closed.

#### Defined in[​](#defined-in-12 "Direct link to Defined in")

[react/client.ts:779](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L779)
