# Interface: SearchFilterBuilder\<Document, SearchIndexConfig>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).SearchFilterBuilder

Builder for defining search filters.

A search filter is a chained list of:

1. One search expression constructed with `.search`.
2. Zero or more equality expressions constructed with `.eq`.

The search expression must search for text in the index's `searchField`. The filter expressions can use any of the `filterFields` defined in the index.

For all other filtering use [filter](/api/interfaces/server.OrderedQuery.md#filter).

To learn about full text search, see [Indexes](https://docs.convex.dev/text-search).

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name                | Type                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------- |
| `Document`          | extends [`GenericDocument`](/api/modules/server.md#genericdocument)                   |
| `SearchIndexConfig` | extends [`GenericSearchIndexConfig`](/api/modules/server.md#genericsearchindexconfig) |

## Methods[​](#methods "Direct link to Methods")

### search[​](#search "Direct link to search")

▸ **search**(`fieldName`, `query`): [`SearchFilterFinalizer`](/api/interfaces/server.SearchFilterFinalizer.md)<`Document`, `SearchIndexConfig`>

Search for the terms in `query` within `doc[fieldName]`.

This will do a full text search that returns results where any word of of `query` appears in the field.

Documents will be returned based on their relevance to the query. This takes into account:

* How many words in the query appear in the text?
* How many times do they appear?
* How long is the text field?

#### Parameters[​](#parameters "Direct link to Parameters")

| Name        | Type                                  | Description                                                                           |
| ----------- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| `fieldName` | `SearchIndexConfig`\[`"searchField"`] | The name of the field to search in. This must be listed as the index's `searchField`. |
| `query`     | `string`                              | The query text to search for.                                                         |

#### Returns[​](#returns "Direct link to Returns")

[`SearchFilterFinalizer`](/api/interfaces/server.SearchFilterFinalizer.md)<`Document`, `SearchIndexConfig`>

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/search\_filter\_builder.ts:42](https://github.com/get-convex/convex-js/blob/main/src/server/search_filter_builder.ts#L42)
