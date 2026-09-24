# Class: ConvexClient

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[browser](/api/modules/browser.md).ConvexClient

Subscribes to Convex query functions and executes mutations and actions over a WebSocket.

Optimistic updates for mutations are not provided for this client. Third party clients may choose to wrap [BaseConvexClient](/api/classes/browser.BaseConvexClient.md) for additional control.

```
const client = new ConvexClient("https://happy-otter-123.convex.cloud");

const unsubscribe = client.onUpdate(api.messages.list, {}, (messages) => {

  console.log(messages[0].body);

});
```

## Constructors[​](#constructors "Direct link to Constructors")

### constructor[​](#constructor "Direct link to constructor")

• **new ConvexClient**(`address`, `options?`)

Construct a client and immediately initiate a WebSocket connection to the passed address.

#### Parameters[​](#parameters "Direct link to Parameters")

| Name      | Type                                                                 |
| --------- | -------------------------------------------------------------------- |
| `address` | `string`                                                             |
| `options` | [`ConvexClientOptions`](/api/modules/browser.md#convexclientoptions) |

#### Defined in[​](#defined-in "Direct link to Defined in")

[browser/simple\_client.ts:122](https://github.com/get-convex/convex-js/blob/main/src/browser/simple_client.ts#L122)

## Accessors[​](#accessors "Direct link to Accessors")

### closed[​](#closed "Direct link to closed")

• `get` **closed**(): `boolean`

Once closed no registered callbacks will fire again.

#### Returns[​](#returns "Direct link to Returns")

`boolean`

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[browser/simple\_client.ts:99](https://github.com/get-convex/convex-js/blob/main/src/browser/simple_client.ts#L99)

***

### client[​](#client "Direct link to client")

• `get` **client**(): [`BaseConvexClient`](/api/classes/browser.BaseConvexClient.md)

#### Returns[​](#returns-1 "Direct link to Returns")

[`BaseConvexClient`](/api/classes/browser.BaseConvexClient.md)

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[browser/simple\_client.ts:102](https://github.com/get-convex/convex-js/blob/main/src/browser/simple_client.ts#L102)

***

### disabled[​](#disabled "Direct link to disabled")

• `get` **disabled**(): `boolean`

#### Returns[​](#returns-2 "Direct link to Returns")

`boolean`

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[browser/simple\_client.ts:113](https://github.com/get-convex/convex-js/blob/main/src/browser/simple_client.ts#L113)

## Methods[​](#methods "Direct link to Methods")

### onUpdate[​](#onupdate "Direct link to onUpdate")

▸ **onUpdate**<`Query`>(`query`, `args`, `callback`, `onError?`): `Unsubscribe`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

Call a callback whenever a new result for a query is received. The callback will run soon after being registered if a result for the query is already in memory.

The return value is an Unsubscribe object which is both a function an an object with properties. Both of the patterns below work with this object:

```
// call the return value as a function

const unsubscribe = client.onUpdate(api.messages.list, {}, (messages) => {

  console.log(messages);

});

unsubscribe();



// unpack the return value into its properties

const {

  getCurrentValue,

  unsubscribe,

} = client.onUpdate(api.messages.list, {}, (messages) => {

  console.log(messages);

});
```

#### Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`> |

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name       | Type                                                                                                | Description                                                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `query`    | `Query`                                                                                             | A [FunctionReference](/api/modules/server.md#functionreference) for the public query to run.                                          |
| `args`     | [`FunctionArgs`](/api/modules/server.md#functionargs)<`Query`>                                      | The arguments to run the query with.                                                                                                  |
| `callback` | (`result`: [`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>) => `unknown` | Function to call when the query result updates.                                                                                       |
| `onError?` | (`e`: `Error`) => `unknown`                                                                         | Function to call when the query result updates with an error. If not provided, errors will be thrown instead of calling the callback. |

#### Returns[​](#returns-3 "Direct link to Returns")

`Unsubscribe`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

an Unsubscribe function to stop calling the onUpdate function.

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[browser/simple\_client.ts:188](https://github.com/get-convex/convex-js/blob/main/src/browser/simple_client.ts#L188)

***

### onPaginatedUpdate\_experimental[​](#onpaginatedupdate_experimental "Direct link to onPaginatedUpdate_experimental")

▸ **onPaginatedUpdate\_experimental**<`Query`>(`query`, `args`, `options`, `callback`, `onError?`): `Unsubscribe`<`PaginatedQueryResult`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>\[]>>

Call a callback whenever a new result for a paginated query is received.

This is an experimental preview: the final API may change. In particular, caching behavior, page splitting, and required paginated query options may change.

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`> |

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name                      | Type                                                                                                                                                                  | Description                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `query`                   | `Query`                                                                                                                                                               | A [FunctionReference](/api/modules/server.md#functionreference) for the public query to run. |
| `args`                    | [`FunctionArgs`](/api/modules/server.md#functionargs)<`Query`>                                                                                                        | The arguments to run the query with.                                                         |
| `options`                 | `Object`                                                                                                                                                              | Options for the paginated query including initialNumItems and id.                            |
| `options.initialNumItems` | `number`                                                                                                                                                              | -                                                                                            |
| `callback`                | (`result`: [`PaginationResult`](/api/interfaces/server.PaginationResult.md)<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>) => `unknown` | Function to call when the query result updates.                                              |
| `onError?`                | (`e`: `Error`) => `unknown`                                                                                                                                           | Function to call when the query result updates with an error.                                |

#### Returns[​](#returns-4 "Direct link to Returns")

`Unsubscribe`<`PaginatedQueryResult`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>\[]>>

an Unsubscribe function to stop calling the callback.

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[browser/simple\_client.ts:270](https://github.com/get-convex/convex-js/blob/main/src/browser/simple_client.ts#L270)

***

### close[​](#close "Direct link to close")

▸ **close**(): `Promise`<`void`>

#### Returns[​](#returns-5 "Direct link to Returns")

`Promise`<`void`>

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[browser/simple\_client.ts:377](https://github.com/get-convex/convex-js/blob/main/src/browser/simple_client.ts#L377)

***

### getAuth[​](#getauth "Direct link to getAuth")

▸ **getAuth**(): `undefined` | { `token`: `string` ; `decoded`: `Record`<`string`, `any`> }

Get the current JWT auth token and decoded claims.

#### Returns[​](#returns-6 "Direct link to Returns")

`undefined` | { `token`: `string` ; `decoded`: `Record`<`string`, `any`> }

#### Defined in[​](#defined-in-7 "Direct link to Defined in")

[browser/simple\_client.ts:391](https://github.com/get-convex/convex-js/blob/main/src/browser/simple_client.ts#L391)

***

### setAuth[​](#setauth "Direct link to setAuth")

▸ **setAuth**(`fetchToken`, `onChange?`): `void`

Set the authentication token to be used for subsequent queries and mutations. `fetchToken` will be called automatically again if a token expires. `fetchToken` should return `null` if the token cannot be retrieved, for example when the user's rights were permanently revoked.

#### Parameters[​](#parameters-3 "Direct link to Parameters")

| Name         | Type                                                           | Description                                                                      |
| ------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `fetchToken` | [`AuthTokenFetcher`](/api/modules/browser.md#authtokenfetcher) | an async function returning the JWT (typically an OpenID Connect Identity Token) |
| `onChange?`  | (`isAuthenticated`: `boolean`) => `void`                       | a callback that will be called when the authentication status changes            |

#### Returns[​](#returns-7 "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-8 "Direct link to Defined in")

[browser/simple\_client.ts:404](https://github.com/get-convex/convex-js/blob/main/src/browser/simple_client.ts#L404)

***

### mutation[​](#mutation "Direct link to mutation")

▸ **mutation**<`Mutation`>(`mutation`, `args`, `options?`): `Promise`<`Awaited`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Mutation`>>>

Execute a mutation function.

#### Type parameters[​](#type-parameters-2 "Direct link to Type parameters")

| Name       | Type                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Mutation` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"mutation"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"mutation"`> |

#### Parameters[​](#parameters-4 "Direct link to Parameters")

| Name       | Type                                                              | Description                                                                                      |
| ---------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `mutation` | `Mutation`                                                        | A [FunctionReference](/api/modules/server.md#functionreference) for the public mutation to run.  |
| `args`     | [`FunctionArgs`](/api/modules/server.md#functionargs)<`Mutation`> | An arguments object for the mutation.                                                            |
| `options?` | [`MutationOptions`](/api/interfaces/browser.MutationOptions.md)   | A [MutationOptions](/api/interfaces/browser.MutationOptions.md) options object for the mutation. |

#### Returns[​](#returns-8 "Direct link to Returns")

`Promise`<`Awaited`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Mutation`>>>

A promise of the mutation's result.

#### Defined in[​](#defined-in-9 "Direct link to Defined in")

[browser/simple\_client.ts:499](https://github.com/get-convex/convex-js/blob/main/src/browser/simple_client.ts#L499)

***

### action[​](#action "Direct link to action")

▸ **action**<`Action`>(`action`, `args`): `Promise`<`Awaited`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Action`>>>

Execute an action function.

#### Type parameters[​](#type-parameters-3 "Direct link to Type parameters")

| Name     | Type                                                                                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Action` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"action"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"action"`> |

#### Parameters[​](#parameters-5 "Direct link to Parameters")

| Name     | Type                                                            | Description                                                                                   |
| -------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `action` | `Action`                                                        | A [FunctionReference](/api/modules/server.md#functionreference) for the public action to run. |
| `args`   | [`FunctionArgs`](/api/modules/server.md#functionargs)<`Action`> | An arguments object for the action.                                                           |

#### Returns[​](#returns-9 "Direct link to Returns")

`Promise`<`Awaited`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Action`>>>

A promise of the action's result.

#### Defined in[​](#defined-in-10 "Direct link to Defined in")

[browser/simple\_client.ts:520](https://github.com/get-convex/convex-js/blob/main/src/browser/simple_client.ts#L520)

***

### query[​](#query "Direct link to query")

▸ **query**<`Query`>(`query`, `args`): `Promise`<`Awaited`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>>

Fetch a query result once.

#### Type parameters[​](#type-parameters-4 "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`> |

#### Parameters[​](#parameters-6 "Direct link to Parameters")

| Name    | Type                                                           | Description                                                                                  |
| ------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `query` | `Query`                                                        | A [FunctionReference](/api/modules/server.md#functionreference) for the public query to run. |
| `args`  | [`FunctionArgs`](/api/modules/server.md#functionargs)<`Query`> | An arguments object for the query.                                                           |

#### Returns[​](#returns-10 "Direct link to Returns")

`Promise`<`Awaited`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>>

A promise of the query's result.

#### Defined in[​](#defined-in-11 "Direct link to Defined in")

[browser/simple\_client.ts:540](https://github.com/get-convex/convex-js/blob/main/src/browser/simple_client.ts#L540)

***

### connectionState[​](#connectionstate "Direct link to connectionState")

▸ **connectionState**(): [`ConnectionState`](/api/modules/browser.md#connectionstate)

Get the current [ConnectionState](/api/modules/browser.md#connectionstate) between the client and the Convex backend.

#### Returns[​](#returns-11 "Direct link to Returns")

[`ConnectionState`](/api/modules/browser.md#connectionstate)

The [ConnectionState](/api/modules/browser.md#connectionstate) with the Convex backend.

#### Defined in[​](#defined-in-12 "Direct link to Defined in")

[browser/simple\_client.ts:576](https://github.com/get-convex/convex-js/blob/main/src/browser/simple_client.ts#L576)

***

### subscribeToConnectionState[​](#subscribetoconnectionstate "Direct link to subscribeToConnectionState")

▸ **subscribeToConnectionState**(`cb`): () => `void`

Subscribe to the [ConnectionState](/api/modules/browser.md#connectionstate) between the client and the Convex backend, calling a callback each time it changes.

Subscribed callbacks will be called when any part of ConnectionState changes. ConnectionState may grow in future versions (e.g. to provide a array of inflight requests) in which case callbacks would be called more frequently.

#### Parameters[​](#parameters-7 "Direct link to Parameters")

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

#### Defined in[​](#defined-in-13 "Direct link to Defined in")

[browser/simple\_client.ts:591](https://github.com/get-convex/convex-js/blob/main/src/browser/simple_client.ts#L591)
