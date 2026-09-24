# Interface: PaginationResult\<T>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).PaginationResult

The result of paginating using [paginate](/api/interfaces/server.OrderedQuery.md#paginate).

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name |
| ---- |
| `T`  |

## Properties[​](#properties "Direct link to Properties")

### page[​](#page "Direct link to page")

• **page**: `T`\[]

The page of results.

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/pagination.ts:32](https://github.com/get-convex/convex-js/blob/main/src/server/pagination.ts#L32)

***

### isDone[​](#isdone "Direct link to isDone")

• **isDone**: `boolean`

Have we reached the end of the results?

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/pagination.ts:37](https://github.com/get-convex/convex-js/blob/main/src/server/pagination.ts#L37)

***

### continueCursor[​](#continuecursor "Direct link to continueCursor")

• **continueCursor**: `string`

A [Cursor](/api/modules/server.md#cursor) to continue loading more results.

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/pagination.ts:42](https://github.com/get-convex/convex-js/blob/main/src/server/pagination.ts#L42)

***

### splitCursor[​](#splitcursor "Direct link to splitCursor")

• `Optional` **splitCursor**: `null` | `string`

A [Cursor](/api/modules/server.md#cursor) to split the page into two, so the page from (cursor, continueCursor] can be replaced by two pages (cursor, splitCursor] and (splitCursor, continueCursor].

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/pagination.ts:49](https://github.com/get-convex/convex-js/blob/main/src/server/pagination.ts#L49)

***

### pageStatus[​](#pagestatus "Direct link to pageStatus")

• `Optional` **pageStatus**: `null` | `"SplitRecommended"` | `"SplitRequired"`

When a query reads too much data, it may return 'SplitRecommended' to indicate that the page should be split into two with `splitCursor`. When a query reads so much data that `page` might be incomplete, its status becomes 'SplitRequired'.

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[server/pagination.ts:57](https://github.com/get-convex/convex-js/blob/main/src/server/pagination.ts#L57)
