# Interface: BaseConvexClientOptions

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[browser](/api/modules/browser.md).BaseConvexClientOptions

Options for [BaseConvexClient](/api/classes/browser.BaseConvexClient.md).

## Hierarchy[​](#hierarchy "Direct link to Hierarchy")

* **`BaseConvexClientOptions`**

  ↳ [`ConvexReactClientOptions`](/api/interfaces/react.ConvexReactClientOptions.md)

## Properties[​](#properties "Direct link to Properties")

### unsavedChangesWarning[​](#unsavedchangeswarning "Direct link to unsavedChangesWarning")

• `Optional` **unsavedChangesWarning**: `boolean`

Whether to prompt the user if they have unsaved changes pending when navigating away or closing a web page.

This is only possible when the `window` object exists, i.e. in a browser.

The default value is `true` in browsers.

#### Defined in[​](#defined-in "Direct link to Defined in")

[browser/sync/client.ts:69](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L69)

***

### webSocketConstructor[​](#websocketconstructor "Direct link to webSocketConstructor")

• `Optional` **webSocketConstructor**: `Object`

#### Call signature[​](#call-signature "Direct link to Call signature")

• **new webSocketConstructor**(`url`, `protocols?`): `WebSocket`

Specifies an alternate [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) constructor to use for client communication with the Convex cloud. The default behavior is to use `WebSocket` from the global environment.

##### Parameters[​](#parameters "Direct link to Parameters")

| Name         | Type                    |
| ------------ | ----------------------- |
| `url`        | `string` \| `URL`       |
| `protocols?` | `string` \| `string`\[] |

##### Returns[​](#returns "Direct link to Returns")

`WebSocket`

#### Type declaration[​](#type-declaration "Direct link to Type declaration")

| Name         | Type        |
| ------------ | ----------- |
| `prototype`  | `WebSocket` |
| `CONNECTING` | `0`         |
| `OPEN`       | `1`         |
| `CLOSING`    | `2`         |
| `CLOSED`     | `3`         |

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[browser/sync/client.ts:76](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L76)

***

### verbose[​](#verbose "Direct link to verbose")

• `Optional` **verbose**: `boolean`

Adds additional logging for debugging purposes.

The default value is `false`.

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[browser/sync/client.ts:82](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L82)

***

### logger[​](#logger "Direct link to logger")

• `Optional` **logger**: `boolean` | `Logger`

A logger, `true`, or `false`. If not provided or `true`, logs to the console. If `false`, logs are not printed anywhere.

You can construct your own logger to customize logging to log elsewhere. A logger is an object with 4 methods: log(), warn(), error(), and logVerbose(). These methods can receive multiple arguments of any types, like console.log().

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[browser/sync/client.ts:91](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L91)

***

### reportDebugInfoToConvex[​](#reportdebuginfotoconvex "Direct link to reportDebugInfoToConvex")

• `Optional` **reportDebugInfoToConvex**: `boolean`

Sends additional metrics to Convex for debugging purposes.

The default value is `false`.

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[browser/sync/client.ts:97](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L97)

***

### onServerDisconnectError[​](#onserverdisconnecterror "Direct link to onServerDisconnectError")

• `Optional` **onServerDisconnectError**: (`message`: `string`) => `void`

#### Type declaration[​](#type-declaration-1 "Direct link to Type declaration")

▸ (`message`): `void`

This API is experimental: it may change or disappear.

A function to call on receiving abnormal WebSocket close messages from the connected Convex deployment. The content of these messages is not stable, it is an implementation detail that may change.

Consider this API an observability stopgap until higher level codes with recommendations on what to do are available, which could be a more stable interface instead of `string`.

Check `connectionState` for more quantitative metrics about connection status.

##### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name      | Type     |
| --------- | -------- |
| `message` | `string` |

##### Returns[​](#returns-1 "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[browser/sync/client.ts:111](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L111)

***

### skipConvexDeploymentUrlCheck[​](#skipconvexdeploymenturlcheck "Direct link to skipConvexDeploymentUrlCheck")

• `Optional` **skipConvexDeploymentUrlCheck**: `boolean`

Skip validating that the Convex deployment URL looks like `https://happy-animal-123.convex.cloud` or localhost.

This can be useful if running a self-hosted Convex backend that uses a different URL.

The default value is `false`

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[browser/sync/client.ts:121](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L121)

***

### authRefreshTokenLeewaySeconds[​](#authrefreshtokenleewayseconds "Direct link to authRefreshTokenLeewaySeconds")

• `Optional` **authRefreshTokenLeewaySeconds**: `number`

If using auth, the number of seconds before a token expires that we should refresh it.

The default value is `10`.

#### Defined in[​](#defined-in-7 "Direct link to Defined in")

[browser/sync/client.ts:127](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L127)

***

### expectAuth[​](#expectauth "Direct link to expectAuth")

• `Optional` **expectAuth**: `boolean`

This API is experimental: it may change or disappear.

Whether query, mutation, and action requests should be held back until the first auth token can be sent.

Opting into this behavior works well for pages that should only be viewed by authenticated clients.

Defaults to false, not waiting for an auth token.

#### Defined in[​](#defined-in-8 "Direct link to Defined in")

[browser/sync/client.ts:139](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L139)

***

### initialAuthTokenReuse[​](#initialauthtokenreuse "Direct link to initialAuthTokenReuse")

• `Optional` **initialAuthTokenReuse**: `boolean`

This API is experimental: it may change or disappear.

When true, the client reuses the initial cached auth token instead of immediately fetching a fresh one. This avoids a second Authenticate message that causes the server to re-execute all authenticated queries.

The cached token's remaining lifetime is estimated using the server's clock skew measurement, and a refresh is scheduled before it expires.

Defaults to false, preserving the original behavior of immediately fetching a fresh token after the cached token is confirmed.

#### Defined in[​](#defined-in-9 "Direct link to Defined in")

[browser/sync/client.ts:155](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L155)
