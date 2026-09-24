# Interface: MutationMeta

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).MutationMeta

Extra context available in Convex mutation functions.

## Hierarchy[​](#hierarchy "Direct link to Hierarchy")

* [`QueryMeta`](/api/interfaces/server.QueryMeta.md)

  ↳ **`MutationMeta`**

## Methods[​](#methods "Direct link to Methods")

### getFunctionMetadata[​](#getfunctionmetadata "Direct link to getFunctionMetadata")

▸ **getFunctionMetadata**(): `Promise`<[`FunctionMetadata`](/api/modules/server.md#functionmetadata)>

Metadata about the currently executing Convex function.

#### Returns[​](#returns "Direct link to Returns")

`Promise`<[`FunctionMetadata`](/api/modules/server.md#functionmetadata)>

#### Inherited from[​](#inherited-from "Direct link to Inherited from")

[QueryMeta](/api/interfaces/server.QueryMeta.md).[getFunctionMetadata](/api/interfaces/server.QueryMeta.md#getfunctionmetadata)

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/meta.ts:152](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L152)

***

### getTransactionMetrics[​](#gettransactionmetrics "Direct link to getTransactionMetrics")

▸ **getTransactionMetrics**(): `Promise`<[`TransactionMetrics`](/api/modules/server.md#transactionmetrics)>

The remaining headroom for a transaction before hitting limits.

See <https://docs.convex.dev/production/state/limits>

#### Returns[​](#returns-1 "Direct link to Returns")

`Promise`<[`TransactionMetrics`](/api/modules/server.md#transactionmetrics)>

#### Inherited from[​](#inherited-from-1 "Direct link to Inherited from")

[QueryMeta](/api/interfaces/server.QueryMeta.md).[getTransactionMetrics](/api/interfaces/server.QueryMeta.md#gettransactionmetrics)

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/meta.ts:158](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L158)

***

### getDeploymentMetadata[​](#getdeploymentmetadata "Direct link to getDeploymentMetadata")

▸ **getDeploymentMetadata**(): `Promise`<[`DeploymentMetadata`](/api/modules/server.md#deploymentmetadata)>

Metadata about the deployment this function is running on.

#### Returns[​](#returns-2 "Direct link to Returns")

`Promise`<[`DeploymentMetadata`](/api/modules/server.md#deploymentmetadata)>

#### Inherited from[​](#inherited-from-2 "Direct link to Inherited from")

[QueryMeta](/api/interfaces/server.QueryMeta.md).[getDeploymentMetadata](/api/interfaces/server.QueryMeta.md#getdeploymentmetadata)

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/meta.ts:162](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L162)

***

### getSnapshotTs[​](#getsnapshotts "Direct link to getSnapshotTs")

▸ **getSnapshotTs**(): `bigint`

Returns the timestamp of the database snapshot this transaction reads from, in nanoseconds.

All commits at or before this timestamp are observable within the transaction, and no later commits are. The value is fixed for the lifetime of the transaction and shared with all nested `runMutation` and non-stale `runQuery` calls. If a nested query is called with `useStaleSnapshot: true`, then the nested query may in a future backend version choose an older snapshotTs.

It is on the same clock as `db.vars.commitTs`: documents observable in this transaction have `commitTs` values at or before this timestamp, and no new documents will be written with a `commitTs` at or below this, including from the current transaction. When reading documents with an index in commitTs order, you can use this as an upper bound to prevent conflicting with racing inserts.

Since the timestamp differs on every execution, calling this in a query limits caching of the query's result the same way `Date.now()` does.

Note: this should not be compared to `_creationTime` or `Date.now()`, as those are based on wall-clock time rather than the database clock, and aren't guaranteed to follow commit order.

#### Returns[​](#returns-3 "Direct link to Returns")

`bigint`

#### Inherited from[​](#inherited-from-3 "Direct link to Inherited from")

[QueryMeta](/api/interfaces/server.QueryMeta.md).[getSnapshotTs](/api/interfaces/server.QueryMeta.md#getsnapshotts)

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/meta.ts:188](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L188)

***

### getRequestMetadata[​](#getrequestmetadata "Direct link to getRequestMetadata")

▸ **getRequestMetadata**(): `Promise`<[`RequestMetadata`](/api/modules/server.md#requestmetadata)>

Metadata about the HTTP request that triggered the current function execution.

`ip` and `userAgent` are `null` when the function was not triggered by an HTTP request (e.g. scheduled jobs or cron jobs).

Functions called from within a function (i.e. using `runMutation`) will have the same request metadata as the parent function.

#### Returns[​](#returns-4 "Direct link to Returns")

`Promise`<[`RequestMetadata`](/api/modules/server.md#requestmetadata)>

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[server/meta.ts:206](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L206)
