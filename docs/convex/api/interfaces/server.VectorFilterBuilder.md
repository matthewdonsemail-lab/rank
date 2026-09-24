# Interface: VectorFilterBuilder\<Document, VectorIndexConfig>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).VectorFilterBuilder

An interface for defining filters for vector searches.

This has a similar interface to [FilterBuilder](/api/interfaces/server.FilterBuilder.md), which is used in database queries, but supports only the methods that can be efficiently done in a vector search.

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name                | Type                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------- |
| `Document`          | extends [`GenericDocument`](/api/modules/server.md#genericdocument)                   |
| `VectorIndexConfig` | extends [`GenericVectorIndexConfig`](/api/modules/server.md#genericvectorindexconfig) |

## Methods[​](#methods "Direct link to Methods")

### eq[​](#eq "Direct link to eq")

▸ **eq**<`FieldName`>(`fieldName`, `value`): [`FilterExpression`](/api/classes/server.FilterExpression.md)<`boolean`>

Is the field at `fieldName` equal to `value`

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name        | Type             |
| ----------- | ---------------- |
| `FieldName` | extends `string` |

#### Parameters[​](#parameters "Direct link to Parameters")

| Name        | Type                                                                                               |
| ----------- | -------------------------------------------------------------------------------------------------- |
| `fieldName` | `FieldName`                                                                                        |
| `value`     | [`FieldTypeFromFieldPath`](/api/modules/server.md#fieldtypefromfieldpath)<`Document`, `FieldName`> |

#### Returns[​](#returns "Direct link to Returns")

[`FilterExpression`](/api/classes/server.FilterExpression.md)<`boolean`>

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/vector\_search.ts:110](https://github.com/get-convex/convex-js/blob/main/src/server/vector_search.ts#L110)

***

### or[​](#or "Direct link to or")

▸ **or**(`...exprs`): [`FilterExpression`](/api/classes/server.FilterExpression.md)<`boolean`>

`exprs[0] || exprs[1] || ... || exprs[n]`

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name       | Type                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| `...exprs` | [`FilterExpression`](/api/classes/server.FilterExpression.md)<`boolean`>\[] |

#### Returns[​](#returns-1 "Direct link to Returns")

[`FilterExpression`](/api/classes/server.FilterExpression.md)<`boolean`>

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/vector\_search.ts:122](https://github.com/get-convex/convex-js/blob/main/src/server/vector_search.ts#L122)
