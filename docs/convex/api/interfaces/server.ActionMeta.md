# Interface: ActionMeta

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).ActionMeta

Extra context available in Convex action functions.

## Methods[​](#methods "Direct link to Methods")

### getFunctionMetadata[​](#getfunctionmetadata "Direct link to getFunctionMetadata")

▸ **getFunctionMetadata**(): `Promise`<[`FunctionMetadata`](/api/modules/server.md#functionmetadata)>

Metadata about the currently executing Convex function.

#### Returns[​](#returns "Direct link to Returns")

`Promise`<[`FunctionMetadata`](/api/modules/server.md#functionmetadata)>

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/meta.ts:218](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L218)

***

### getDeploymentMetadata[​](#getdeploymentmetadata "Direct link to getDeploymentMetadata")

▸ **getDeploymentMetadata**(): `Promise`<[`DeploymentMetadata`](/api/modules/server.md#deploymentmetadata)>

Metadata about the deployment this function is running on.

#### Returns[​](#returns-1 "Direct link to Returns")

`Promise`<[`DeploymentMetadata`](/api/modules/server.md#deploymentmetadata)>

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/meta.ts:222](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L222)

***

### getRequestMetadata[​](#getrequestmetadata "Direct link to getRequestMetadata")

▸ **getRequestMetadata**(): `Promise`<[`RequestMetadata`](/api/modules/server.md#requestmetadata)>

Metadata about the HTTP request that triggered the current function execution.

`ip` and `userAgent` are `null` when the function was not triggered by an HTTP request (e.g. scheduled jobs or cron jobs).

Functions called from within a function (i.e. using `runMutation` or `runAction`) will have the same request metadata as the parent function.

#### Returns[​](#returns-2 "Direct link to Returns")

`Promise`<[`RequestMetadata`](/api/modules/server.md#requestmetadata)>

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/meta.ts:232](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L232)
