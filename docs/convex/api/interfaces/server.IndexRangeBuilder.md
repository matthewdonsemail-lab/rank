# Interface: IndexRangeBuilder\<Document, IndexFields, FieldNum>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).IndexRangeBuilder

Builder to define an index range to query.

An index range is a description of which documents Convex should consider when running the query.

An index range is always a chained list of:

1. 0 or more equality expressions defined with `.eq`.
2. \[Optionally] A lower bound expression defined with `.gt` or `.gte`.
3. \[Optionally] An upper bound expression defined with `.lt` or `.lte`.

**You must step through fields in index order.**

Each equality expression must compare a different index field, starting from the beginning and in order. The upper and lower bounds must follow the equality expressions and compare the next field.

For example, if there is an index of messages on `["projectId", "priority"]`, a range searching for "messages in 'myProjectId' with priority at least 100" would look like:

```
q.eq("projectId", myProjectId)

 .gte("priority", 100)
```

**The performance of your query is based on the specificity of the range.**

This class is designed to only allow you to specify ranges that Convex can efficiently use your index to find. For all other filtering use [filter](/api/interfaces/server.OrderedQuery.md#filter).

To learn about indexes, see [Indexes](https://docs.convex.dev/using/indexes).

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name          | Type                                                                      |
| ------------- | ------------------------------------------------------------------------- |
| `Document`    | extends [`GenericDocument`](/api/modules/server.md#genericdocument)       |
| `IndexFields` | extends [`GenericIndexFields`](/api/modules/server.md#genericindexfields) |
| `FieldNum`    | extends `number` = `0`                                                    |

## Hierarchy[​](#hierarchy "Direct link to Hierarchy")

* `LowerBoundIndexRangeBuilder`<`Document`, `IndexFields`\[`FieldNum`]>

  ↳ **`IndexRangeBuilder`**

## Methods[​](#methods "Direct link to Methods")

### eq[​](#eq "Direct link to eq")

▸ **eq**(`fieldName`, `value`): `NextIndexRangeBuilder`<`Document`, `IndexFields`, `FieldNum`>

Restrict this range to documents where `doc[fieldName] === value`.

#### Parameters[​](#parameters "Direct link to Parameters")

| Name        | Type                                                                                                              | Description                                                            |
| ----------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `fieldName` | `IndexFields`\[`FieldNum`]                                                                                        | The name of the field to compare. Must be the next field in the index. |
| `value`     | [`FieldTypeFromFieldPath`](/api/modules/server.md#fieldtypefromfieldpath)<`Document`, `IndexFields`\[`FieldNum`]> | The value to compare against.                                          |

#### Returns[​](#returns "Direct link to Returns")

`NextIndexRangeBuilder`<`Document`, `IndexFields`, `FieldNum`>

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/index\_range\_builder.ts:76](https://github.com/get-convex/convex-js/blob/main/src/server/index_range_builder.ts#L76)

***

### gt[​](#gt "Direct link to gt")

▸ **gt**(`fieldName`, `value`): `UpperBoundIndexRangeBuilder`<`Document`, `IndexFields`\[`FieldNum`]>

Restrict this range to documents where `doc[fieldName] > value`.

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name        | Type                                                                                                              | Description                                                            |
| ----------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `fieldName` | `IndexFields`\[`FieldNum`]                                                                                        | The name of the field to compare. Must be the next field in the index. |
| `value`     | [`FieldTypeFromFieldPath`](/api/modules/server.md#fieldtypefromfieldpath)<`Document`, `IndexFields`\[`FieldNum`]> | The value to compare against.                                          |

#### Returns[​](#returns-1 "Direct link to Returns")

`UpperBoundIndexRangeBuilder`<`Document`, `IndexFields`\[`FieldNum`]>

#### Inherited from[​](#inherited-from "Direct link to Inherited from")

LowerBoundIndexRangeBuilder.gt

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/index\_range\_builder.ts:115](https://github.com/get-convex/convex-js/blob/main/src/server/index_range_builder.ts#L115)

***

### gte[​](#gte "Direct link to gte")

▸ **gte**(`fieldName`, `value`): `UpperBoundIndexRangeBuilder`<`Document`, `IndexFields`\[`FieldNum`]>

Restrict this range to documents where `doc[fieldName] >= value`.

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name        | Type                                                                                                              | Description                                                            |
| ----------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `fieldName` | `IndexFields`\[`FieldNum`]                                                                                        | The name of the field to compare. Must be the next field in the index. |
| `value`     | [`FieldTypeFromFieldPath`](/api/modules/server.md#fieldtypefromfieldpath)<`Document`, `IndexFields`\[`FieldNum`]> | The value to compare against.                                          |

#### Returns[​](#returns-2 "Direct link to Returns")

`UpperBoundIndexRangeBuilder`<`Document`, `IndexFields`\[`FieldNum`]>

#### Inherited from[​](#inherited-from-1 "Direct link to Inherited from")

LowerBoundIndexRangeBuilder.gte

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/index\_range\_builder.ts:126](https://github.com/get-convex/convex-js/blob/main/src/server/index_range_builder.ts#L126)

***

### lt[​](#lt "Direct link to lt")

▸ **lt**(`fieldName`, `value`): [`IndexRange`](/api/classes/server.IndexRange.md)

Restrict this range to documents where `doc[fieldName] < value`.

#### Parameters[​](#parameters-3 "Direct link to Parameters")

| Name        | Type                                                                                                              | Description                                                                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fieldName` | `IndexFields`\[`FieldNum`]                                                                                        | The name of the field to compare. Must be the same index field used in the lower bound (`.gt` or `.gte`) or the next field if no lower bound was specified. |
| `value`     | [`FieldTypeFromFieldPath`](/api/modules/server.md#fieldtypefromfieldpath)<`Document`, `IndexFields`\[`FieldNum`]> | The value to compare against.                                                                                                                               |

#### Returns[​](#returns-3 "Direct link to Returns")

[`IndexRange`](/api/classes/server.IndexRange.md)

#### Inherited from[​](#inherited-from-2 "Direct link to Inherited from")

LowerBoundIndexRangeBuilder.lt

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/index\_range\_builder.ts:151](https://github.com/get-convex/convex-js/blob/main/src/server/index_range_builder.ts#L151)

***

### lte[​](#lte "Direct link to lte")

▸ **lte**(`fieldName`, `value`): [`IndexRange`](/api/classes/server.IndexRange.md)

Restrict this range to documents where `doc[fieldName] <= value`.

#### Parameters[​](#parameters-4 "Direct link to Parameters")

| Name        | Type                                                                                                              | Description                                                                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fieldName` | `IndexFields`\[`FieldNum`]                                                                                        | The name of the field to compare. Must be the same index field used in the lower bound (`.gt` or `.gte`) or the next field if no lower bound was specified. |
| `value`     | [`FieldTypeFromFieldPath`](/api/modules/server.md#fieldtypefromfieldpath)<`Document`, `IndexFields`\[`FieldNum`]> | The value to compare against.                                                                                                                               |

#### Returns[​](#returns-4 "Direct link to Returns")

[`IndexRange`](/api/classes/server.IndexRange.md)

#### Inherited from[​](#inherited-from-3 "Direct link to Inherited from")

LowerBoundIndexRangeBuilder.lte

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[server/index\_range\_builder.ts:164](https://github.com/get-convex/convex-js/blob/main/src/server/index_range_builder.ts#L164)
