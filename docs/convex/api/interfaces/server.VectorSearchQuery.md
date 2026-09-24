# Interface: VectorSearchQuery\<TableInfo, IndexName>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).VectorSearchQuery

An object with parameters for performing a vector search against a vector index.

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name        | Type                                                                               |
| ----------- | ---------------------------------------------------------------------------------- |
| `TableInfo` | extends [`GenericTableInfo`](/api/modules/server.md#generictableinfo)              |
| `IndexName` | extends [`VectorIndexNames`](/api/modules/server.md#vectorindexnames)<`TableInfo`> |

## Properties[​](#properties "Direct link to Properties")

### vector[​](#vector "Direct link to vector")

• **vector**: `number`\[]

The query vector.

This must have the same length as the `dimensions` of the index. This vector search will return the IDs of the documents most similar to this vector.

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/vector\_search.ts:30](https://github.com/get-convex/convex-js/blob/main/src/server/vector_search.ts#L30)

***

### limit[​](#limit "Direct link to limit")

• `Optional` **limit**: `number`

The number of results to return. If specified, must be between 1 and 256 inclusive.

**`Default`**

```
10
```

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/vector\_search.ts:37](https://github.com/get-convex/convex-js/blob/main/src/server/vector_search.ts#L37)

***

### filter[​](#filter "Direct link to filter")

• `Optional` **filter**: (`q`: [`VectorFilterBuilder`](/api/interfaces/server.VectorFilterBuilder.md)<[`DocumentByInfo`](/api/modules/server.md#documentbyinfo)<`TableInfo`>, [`NamedVectorIndex`](/api/modules/server.md#namedvectorindex)<`TableInfo`, `IndexName`>>) => [`FilterExpression`](/api/classes/server.FilterExpression.md)<`boolean`>

#### Type declaration[​](#type-declaration "Direct link to Type declaration")

▸ (`q`): [`FilterExpression`](/api/classes/server.FilterExpression.md)<`boolean`>

Optional filter expression made up of `q.or` and `q.eq` operating over the filter fields of the index.

e.g. `filter: q => q.or(q.eq("genre", "comedy"), q.eq("genre", "drama"))`

##### Parameters[​](#parameters "Direct link to Parameters")

| Name | Type                                                                                                                                                                                                                                    |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `q`  | [`VectorFilterBuilder`](/api/interfaces/server.VectorFilterBuilder.md)<[`DocumentByInfo`](/api/modules/server.md#documentbyinfo)<`TableInfo`>, [`NamedVectorIndex`](/api/modules/server.md#namedvectorindex)<`TableInfo`, `IndexName`>> |

##### Returns[​](#returns "Direct link to Returns")

[`FilterExpression`](/api/classes/server.FilterExpression.md)<`boolean`>

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/vector\_search.ts:47](https://github.com/get-convex/convex-js/blob/main/src/server/vector_search.ts#L47)
