# Interface: PaginationOptions

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).PaginationOptions

The options passed to [paginate](/api/interfaces/server.OrderedQuery.md#paginate).

To use this type in [argument validation](https://docs.convex.dev/functions/validation), use the [paginationOptsValidator](/api/modules/server.md#paginationoptsvalidator).

## Properties[​](#properties "Direct link to Properties")

### numItems[​](#numitems "Direct link to numItems")

• **numItems**: `number`

Number of items to load in this page of results.

Note: This is only an initial value!

If you are running this paginated query in a reactive query function, you may receive more or less items than this if items were added to or removed from the query range.

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/pagination.ts:78](https://github.com/get-convex/convex-js/blob/main/src/server/pagination.ts#L78)

***

### cursor[​](#cursor "Direct link to cursor")

• **cursor**: `null` | `string`

A [Cursor](/api/modules/server.md#cursor) representing the start of this page or `null` to start at the beginning of the query results.

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/pagination.ts:84](https://github.com/get-convex/convex-js/blob/main/src/server/pagination.ts#L84)

***

### endCursor[​](#endcursor "Direct link to endCursor")

• `Optional` **endCursor**: `null` | `string`

A [Cursor](/api/modules/server.md#cursor) representing the end of this page or `null | undefined` to use `numItems` instead.

This explicitly sets the range of documents the query will return, from `cursor` to `endCursor`. It's used by reactive pagination clients to ensure there are no gaps between pages when data changes, and to split pages when `pageStatus` indicates a split is recommended or required.

When splitting a page, use the returned `splitCursor` as `endCursor` for the first half and as `cursor` for the second half.

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/pagination.ts:98](https://github.com/get-convex/convex-js/blob/main/src/server/pagination.ts#L98)

***

### maximumRowsRead[​](#maximumrowsread "Direct link to maximumRowsRead")

• `Optional` **maximumRowsRead**: `number`

The maximum number of rows to read from the database during pagination.

This limits rows entering the query pipeline before filters are applied. Use this when filtering for rare items, where low `numItems` won't bound execution time because the query scans many rows to find matches.

Currently this is not enforced for search queries.

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/pagination.ts:109](https://github.com/get-convex/convex-js/blob/main/src/server/pagination.ts#L109)

***

### maximumBytesRead[​](#maximumbytesread "Direct link to maximumBytesRead")

• `Optional` **maximumBytesRead**: `number`

The maximum number of bytes to read from the database during pagination.

This limits bytes entering the query pipeline before filters are applied. Use this to control bandwidth usage when documents are large. If the limit is reached, the query may return an incomplete page and require a page split.

Currently this is not enforced for search queries.

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[server/pagination.ts:121](https://github.com/get-convex/convex-js/blob/main/src/server/pagination.ts#L121)
