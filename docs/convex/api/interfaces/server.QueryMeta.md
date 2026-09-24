# Interface: QueryMeta

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).QueryMeta

Extra context available in Convex query functions.

## Hierarchy[​](#hierarchy "Direct link to Hierarchy")

* **`QueryMeta`**

  ↳ [`MutationMeta`](/api/interfaces/server.MutationMeta.md)

## Methods[​](#methods "Direct link to Methods")

### getFunctionMetadata[​](#getfunctionmetadata "Direct link to getFunctionMetadata")

▸ **getFunctionMetadata**(): `Promise`<[`FunctionMetadata`](/api/modules/server.md#functionmetadata)>

Metadata about the currently executing Convex function.

#### Returns[​](#returns "Direct link to Returns")

`Promise`<[`FunctionMetadata`](/api/modules/server.md#functionmetadata)>

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/meta.ts:152](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L152)

***

### getTransactionMetrics[​](#gettransactionmetrics "Direct link to getTransactionMetrics")

▸ **getTransactionMetrics**(): `Promise`<[`TransactionMetrics`](/api/modules/server.md#transactionmetrics)>

The remaining headroom for a transaction before hitting limits.

See <https://docs.convex.dev/production/state/limits>

#### Returns[​](#returns-1 "Direct link to Returns")

`Promise`<[`TransactionMetrics`](/api/modules/server.md#transactionmetrics)>

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/meta.ts:158](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L158)

***

### getDeploymentMetadata[​](#getdeploymentmetadata "Direct link to getDeploymentMetadata")

▸ **getDeploymentMetadata**(): `Promise`<[`DeploymentMetadata`](/api/modules/server.md#deploymentmetadata)>

Metadata about the deployment this function is running on.

#### Returns[​](#returns-2 "Direct link to Returns")

`Promise`<[`DeploymentMetadata`](/api/modules/server.md#deploymentmetadata)>

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

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/meta.ts:188](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L188)
