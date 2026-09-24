# Interface: SearchFilterFinalizer\<Document, SearchIndexConfig>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).SearchFilterFinalizer

Builder to define equality expressions as part of a search filter.

See [SearchFilterBuilder](/api/interfaces/server.SearchFilterBuilder.md).

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name                | Type                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------- |
| `Document`          | extends [`GenericDocument`](/api/modules/server.md#genericdocument)                   |
| `SearchIndexConfig` | extends [`GenericSearchIndexConfig`](/api/modules/server.md#genericsearchindexconfig) |

## Hierarchy[​](#hierarchy "Direct link to Hierarchy")

* [`SearchFilter`](/api/classes/server.SearchFilter.md)

  ↳ **`SearchFilterFinalizer`**

## Methods[​](#methods "Direct link to Methods")

### eq[​](#eq "Direct link to eq")

▸ **eq**<`FieldName`>(`fieldName`, `value`): [`SearchFilterFinalizer`](/api/interfaces/server.SearchFilterFinalizer.md)<`Document`, `SearchIndexConfig`>

Restrict this query to documents where `doc[fieldName] === value`.

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name        | Type             |
| ----------- | ---------------- |
| `FieldName` | extends `string` |

#### Parameters[​](#parameters "Direct link to Parameters")

| Name        | Type                                                                                               | Description                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `fieldName` | `FieldName`                                                                                        | The name of the field to compare. This must be listed in the search index's `filterFields`. |
| `value`     | [`FieldTypeFromFieldPath`](/api/modules/server.md#fieldtypefromfieldpath)<`Document`, `FieldName`> | The value to compare against.                                                               |

#### Returns[​](#returns "Direct link to Returns")

[`SearchFilterFinalizer`](/api/interfaces/server.SearchFilterFinalizer.md)<`Document`, `SearchIndexConfig`>

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/search\_filter\_builder.ts:66](https://github.com/get-convex/convex-js/blob/main/src/server/search_filter_builder.ts#L66)
