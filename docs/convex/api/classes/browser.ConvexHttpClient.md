# Class: ConvexHttpClient

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[browser](/api/modules/browser.md).ConvexHttpClient

A Convex client that runs queries and mutations over HTTP.

This client is stateful (it has user credentials and queues mutations) so take care to avoid sharing it between requests in a server.

This is appropriate for server-side code (like Netlify Lambdas) or non-reactive webapps.

## Constructors[​](#constructors "Direct link to Constructors")

### constructor[​](#constructor "Direct link to constructor")

• **new ConvexHttpClient**(`address`, `options?`)

Create a new [ConvexHttpClient](/api/classes/browser.ConvexHttpClient.md).

#### Parameters[​](#parameters "Direct link to Parameters")

| Name                                    | Type                                                                                                                                                                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`                               | `string`                                                                                                                                                                     | The url of your Convex deployment, often provided by an environment variable. E.g. `https://small-mouse-123.convex.cloud`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `options?`                              | `Object`                                                                                                                                                                     | An object of options. - `skipConvexDeploymentUrlCheck` - Skip validating that the Convex deployment URL looks like `https://happy-animal-123.convex.cloud` or localhost. This can be useful if running a self-hosted Convex backend that uses a different URL. - `logger` - A logger or a boolean. If not provided, logs to the console. You can construct your own logger to customize logging to log elsewhere or not log at all, or use `false` as a shorthand for a no-op logger. A logger is an object with 4 methods: log(), warn(), error(), and logVerbose(). These methods can receive multiple arguments of any types, like console.log(). - `auth` - A JWT containing identity claims accessible in Convex functions. This identity may expire so it may be necessary to call `setAuth()` later, but for short-lived clients it's convenient to specify this value here. - `fetch` - A custom fetch implementation to use for all HTTP requests made by this client. |
| `options.skipConvexDeploymentUrlCheck?` | `boolean`                                                                                                                                                                    | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `options.logger?`                       | `boolean` \| `Logger`                                                                                                                                                        | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `options.auth?`                         | `string`                                                                                                                                                                     | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `options.fetch?`                        | (`input`: `URL` \| `RequestInfo`, `init?`: `RequestInit`) => `Promise`<`Response`>(`input`: `string` \| `URL` \| `Request`, `init?`: `RequestInit`) => `Promise`<`Response`> | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

#### Defined in[​](#defined-in "Direct link to Defined in")

[browser/http\_client.ts:100](https://github.com/get-convex/convex-js/blob/main/src/browser/http_client.ts#L100)

## Accessors[​](#accessors "Direct link to Accessors")

### url[​](#url "Direct link to url")

• `get` **url**(): `string`

Return the address for this client, useful for creating a new client.

Not guaranteed to match the address with which this client was constructed: it may be canonicalized.

#### Returns[​](#returns "Direct link to Returns")

`string`

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[browser/http\_client.ts:150](https://github.com/get-convex/convex-js/blob/main/src/browser/http_client.ts#L150)

## Methods[​](#methods "Direct link to Methods")

### backendUrl[​](#backendurl "Direct link to backendUrl")

▸ **backendUrl**(): `string`

Obtain the [ConvexHttpClient](/api/classes/browser.ConvexHttpClient.md)'s URL to its backend.

**`Deprecated`**

Use url, which returns the url without /api at the end.

#### Returns[​](#returns-1 "Direct link to Returns")

`string`

The URL to the Convex backend, including the client's API version.

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[browser/http\_client.ts:140](https://github.com/get-convex/convex-js/blob/main/src/browser/http_client.ts#L140)

***

### setAuth[​](#setauth "Direct link to setAuth")

▸ **setAuth**(`value`): `void`

Set the authentication token to be used for subsequent queries and mutations.

Should be called whenever the token changes (i.e. due to expiration and refresh).

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name    | Type     | Description                                |
| ------- | -------- | ------------------------------------------ |
| `value` | `string` | JWT-encoded OpenID Connect identity token. |

#### Returns[​](#returns-2 "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[browser/http\_client.ts:161](https://github.com/get-convex/convex-js/blob/main/src/browser/http_client.ts#L161)

***

### clearAuth[​](#clearauth "Direct link to clearAuth")

▸ **clearAuth**(): `void`

Clear the current authentication token if set.

#### Returns[​](#returns-3 "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[browser/http\_client.ts:187](https://github.com/get-convex/convex-js/blob/main/src/browser/http_client.ts#L187)

***

### consistentQuery[​](#consistentquery "Direct link to consistentQuery")

▸ **consistentQuery**<`Query`>(`query`, `...args`): `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

This API is experimental: it may change or disappear.

Execute a Convex query function at the same timestamp as every other consistent query execution run by this HTTP client.

This doesn't make sense for long-lived ConvexHttpClients as Convex backends can read a limited amount into the past: beyond 30 seconds in the past may not be available.

Create a new client to use a consistent time.

**`Deprecated`**

This API is experimental: it may change or disappear.

#### Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`> |

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name      | Type                                                                   | Description                                                                         |
| --------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `query`   | `Query`                                                                | -                                                                                   |
| `...args` | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`Query`> | The arguments object for the query. If this is omitted, the arguments will be `{}`. |

#### Returns[​](#returns-4 "Direct link to Returns")

`Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

A promise of the query's result.

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[browser/http\_client.ts:229](https://github.com/get-convex/convex-js/blob/main/src/browser/http_client.ts#L229)

***

### query[​](#query "Direct link to query")

▸ **query**<`Query`>(`query`, `...args`): `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

Execute a Convex query function.

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`> |

#### Parameters[​](#parameters-3 "Direct link to Parameters")

| Name      | Type                                                                   | Description                                                                         |
| --------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `query`   | `Query`                                                                | -                                                                                   |
| `...args` | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`Query`> | The arguments object for the query. If this is omitted, the arguments will be `{}`. |

#### Returns[​](#returns-5 "Direct link to Returns")

`Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

A promise of the query's result.

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[browser/http\_client.ts:277](https://github.com/get-convex/convex-js/blob/main/src/browser/http_client.ts#L277)

***

### mutation[​](#mutation "Direct link to mutation")

▸ **mutation**<`Mutation`>(`mutation`, `...args`): `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Mutation`>>

Execute a Convex mutation function. Mutations are queued by default.

#### Type parameters[​](#type-parameters-2 "Direct link to Type parameters")

| Name       | Type                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Mutation` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"mutation"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"mutation"`> |

#### Parameters[​](#parameters-4 "Direct link to Parameters")

| Name       | Type                                                                                                                                        | Description                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `mutation` | `Mutation`                                                                                                                                  | -                                                                                      |
| `...args`  | [`ArgsAndOptions`](/api/modules/server.md#argsandoptions)<`Mutation`, [`HttpMutationOptions`](/api/modules/browser.md#httpmutationoptions)> | The arguments object for the mutation. If this is omitted, the arguments will be `{}`. |

#### Returns[​](#returns-6 "Direct link to Returns")

`Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Mutation`>>

A promise of the mutation's result.

#### Defined in[​](#defined-in-7 "Direct link to Defined in")

[browser/http\_client.ts:453](https://github.com/get-convex/convex-js/blob/main/src/browser/http_client.ts#L453)

***

### action[​](#action "Direct link to action")

▸ **action**<`Action`>(`action`, `...args`): `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Action`>>

Execute a Convex action function. Actions are not queued.

#### Type parameters[​](#type-parameters-3 "Direct link to Type parameters")

| Name     | Type                                                                                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Action` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"action"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"action"`> |

#### Parameters[​](#parameters-5 "Direct link to Parameters")

| Name      | Type                                                                    | Description                                                                          |
| --------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `action`  | `Action`                                                                | -                                                                                    |
| `...args` | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`Action`> | The arguments object for the action. If this is omitted, the arguments will be `{}`. |

#### Returns[​](#returns-7 "Direct link to Returns")

`Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Action`>>

A promise of the action's result.

#### Defined in[​](#defined-in-8 "Direct link to Defined in")

[browser/http\_client.ts:480](https://github.com/get-convex/convex-js/blob/main/src/browser/http_client.ts#L480)
