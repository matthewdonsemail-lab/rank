# Interface: AdvancedRunQueryOptions

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).AdvancedRunQueryOptions

## Properties[​](#properties "Direct link to Properties")

### transactionLimits[​](#transactionlimits "Direct link to transactionLimits")

• `Optional` **transactionLimits**: [`TransactionLimits`](/api/interfaces/server.TransactionLimits.md)

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/registration.ts:1237](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L1237)

***

### useStaleSnapshot[​](#usestalesnapshot "Direct link to useStaleSnapshot")

• `Optional` **useStaleSnapshot**: `boolean`

Run a query on a recent snapshot of the database that is not guaranteed to be up-to-date when this transaction commits.

This is an advanced feature which can introduce subtle race conditions, so its use is generally discouraged except for specific use-cases where database read conflicts are expected, e.g. reading from an append-only table with immutable records where the only read conflicts are from concurrent appends.

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/registration.ts:1248](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L1248)
