# Interface: TransactionLimits

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).TransactionLimits

Custom limits for a nested transaction. Each field specifies the absolute maximum allowed for the nested function call. Values are capped at the global transaction limits, so they can only lower limits, never raise them.

## Properties[​](#properties "Direct link to Properties")

### bytesRead[​](#bytesread "Direct link to bytesRead")

• `Optional` **bytesRead**: `number`

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/meta.ts:47](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L47)

***

### bytesWritten[​](#byteswritten "Direct link to bytesWritten")

• `Optional` **bytesWritten**: `number`

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/meta.ts:48](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L48)

***

### databaseQueries[​](#databasequeries "Direct link to databaseQueries")

• `Optional` **databaseQueries**: `number`

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/meta.ts:49](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L49)

***

### documentsRead[​](#documentsread "Direct link to documentsRead")

• `Optional` **documentsRead**: `number`

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/meta.ts:50](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L50)

***

### documentsWritten[​](#documentswritten "Direct link to documentsWritten")

• `Optional` **documentsWritten**: `number`

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[server/meta.ts:51](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L51)

***

### functionsScheduled[​](#functionsscheduled "Direct link to functionsScheduled")

• `Optional` **functionsScheduled**: `number`

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[server/meta.ts:52](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L52)

***

### scheduledFunctionArgsBytes[​](#scheduledfunctionargsbytes "Direct link to scheduledFunctionArgsBytes")

• `Optional` **scheduledFunctionArgsBytes**: `number`

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[server/meta.ts:53](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L53)
