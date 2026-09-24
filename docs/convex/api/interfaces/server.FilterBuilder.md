# Interface: FilterBuilder\<TableInfo>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).FilterBuilder

An interface for defining filters in queries.

`FilterBuilder` has various methods that produce [Expression](/api/classes/server.Expression.md)s. These expressions can be nested together along with constants to express a filter predicate.

`FilterBuilder` is used within [filter](/api/interfaces/server.OrderedQuery.md#filter) to create query filters.

Here are the available methods:

|                              |                                               |
| ---------------------------- | --------------------------------------------- |
| **Comparisons**              | Error when `l` and `r` are not the same type. |
| [`eq(l, r)`](#eq)            | `l === r`                                     |
| [`neq(l, r)`](#neq)          | `l !== r`                                     |
| [`lt(l, r)`](#lt)            | `l < r`                                       |
| [`lte(l, r)`](#lte)          | `l <= r`                                      |
| [`gt(l, r)`](#gt)            | `l > r`                                       |
| [`gte(l, r)`](#gte)          | `l >= r`                                      |
|                              |                                               |
| **Arithmetic**               | Error when `l` and `r` are not the same type. |
| [`add(l, r)`](#add)          | `l + r`                                       |
| [`sub(l, r)`](#sub)          | `l - r`                                       |
| [`mul(l, r)`](#mul)          | `l * r`                                       |
| [`div(l, r)`](#div)          | `l / r`                                       |
| [`mod(l, r)`](#mod)          | `l % r`                                       |
| [`neg(x)`](#neg)             | `-x`                                          |
|                              |                                               |
| **Logic**                    | Error if any param is not a `bool`.           |
| [`not(x)`](#not)             | `!x`                                          |
| [`and(a, b, ..., z)`](#and)  | `a && b && ... && z`                          |
| [`or(a, b, ..., z)`](#or)    | `a \|\| b \|\| ... \|\| z`                    |
|                              |                                               |
| **Other**                    |                                               |
| [`field(fieldPath)`](#field) | Evaluates to the field at `fieldPath`.        |

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `TableInfo` | extends [`GenericTableInfo`](/api/modules/server.md#generictableinfo) |

## Methods[​](#methods "Direct link to Methods")

### eq[​](#eq "Direct link to eq")

▸ **eq**<`T`>(`l`, `r`): [`Expression`](/api/classes/server.Expression.md)<`boolean`>

`l === r`

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name | Type                                                           |
| ---- | -------------------------------------------------------------- |
| `T`  | extends `undefined` \| [`Value`](/api/modules/values.md#value) |

#### Parameters[​](#parameters "Direct link to Parameters")

| Name | Type                                                                 |
| ---- | -------------------------------------------------------------------- |
| `l`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |
| `r`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |

#### Returns[​](#returns "Direct link to Returns")

[`Expression`](/api/classes/server.Expression.md)<`boolean`>

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/filter\_builder.ts:87](https://github.com/get-convex/convex-js/blob/main/src/server/filter_builder.ts#L87)

***

### neq[​](#neq "Direct link to neq")

▸ **neq**<`T`>(`l`, `r`): [`Expression`](/api/classes/server.Expression.md)<`boolean`>

`l !== r`

#### Type parameters[​](#type-parameters-2 "Direct link to Type parameters")

| Name | Type                                                           |
| ---- | -------------------------------------------------------------- |
| `T`  | extends `undefined` \| [`Value`](/api/modules/values.md#value) |

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name | Type                                                                 |
| ---- | -------------------------------------------------------------------- |
| `l`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |
| `r`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |

#### Returns[​](#returns-1 "Direct link to Returns")

[`Expression`](/api/classes/server.Expression.md)<`boolean`>

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/filter\_builder.ts:97](https://github.com/get-convex/convex-js/blob/main/src/server/filter_builder.ts#L97)

***

### lt[​](#lt "Direct link to lt")

▸ **lt**<`T`>(`l`, `r`): [`Expression`](/api/classes/server.Expression.md)<`boolean`>

`l < r`

#### Type parameters[​](#type-parameters-3 "Direct link to Type parameters")

| Name | Type                                            |
| ---- | ----------------------------------------------- |
| `T`  | extends [`Value`](/api/modules/values.md#value) |

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name | Type                                                                 |
| ---- | -------------------------------------------------------------------- |
| `l`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |
| `r`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |

#### Returns[​](#returns-2 "Direct link to Returns")

[`Expression`](/api/classes/server.Expression.md)<`boolean`>

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/filter\_builder.ts:107](https://github.com/get-convex/convex-js/blob/main/src/server/filter_builder.ts#L107)

***

### lte[​](#lte "Direct link to lte")

▸ **lte**<`T`>(`l`, `r`): [`Expression`](/api/classes/server.Expression.md)<`boolean`>

`l <= r`

#### Type parameters[​](#type-parameters-4 "Direct link to Type parameters")

| Name | Type                                            |
| ---- | ----------------------------------------------- |
| `T`  | extends [`Value`](/api/modules/values.md#value) |

#### Parameters[​](#parameters-3 "Direct link to Parameters")

| Name | Type                                                                 |
| ---- | -------------------------------------------------------------------- |
| `l`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |
| `r`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |

#### Returns[​](#returns-3 "Direct link to Returns")

[`Expression`](/api/classes/server.Expression.md)<`boolean`>

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/filter\_builder.ts:117](https://github.com/get-convex/convex-js/blob/main/src/server/filter_builder.ts#L117)

***

### gt[​](#gt "Direct link to gt")

▸ **gt**<`T`>(`l`, `r`): [`Expression`](/api/classes/server.Expression.md)<`boolean`>

`l > r`

#### Type parameters[​](#type-parameters-5 "Direct link to Type parameters")

| Name | Type                                            |
| ---- | ----------------------------------------------- |
| `T`  | extends [`Value`](/api/modules/values.md#value) |

#### Parameters[​](#parameters-4 "Direct link to Parameters")

| Name | Type                                                                 |
| ---- | -------------------------------------------------------------------- |
| `l`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |
| `r`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |

#### Returns[​](#returns-4 "Direct link to Returns")

[`Expression`](/api/classes/server.Expression.md)<`boolean`>

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[server/filter\_builder.ts:127](https://github.com/get-convex/convex-js/blob/main/src/server/filter_builder.ts#L127)

***

### gte[​](#gte "Direct link to gte")

▸ **gte**<`T`>(`l`, `r`): [`Expression`](/api/classes/server.Expression.md)<`boolean`>

`l >= r`

#### Type parameters[​](#type-parameters-6 "Direct link to Type parameters")

| Name | Type                                            |
| ---- | ----------------------------------------------- |
| `T`  | extends [`Value`](/api/modules/values.md#value) |

#### Parameters[​](#parameters-5 "Direct link to Parameters")

| Name | Type                                                                 |
| ---- | -------------------------------------------------------------------- |
| `l`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |
| `r`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |

#### Returns[​](#returns-5 "Direct link to Returns")

[`Expression`](/api/classes/server.Expression.md)<`boolean`>

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[server/filter\_builder.ts:137](https://github.com/get-convex/convex-js/blob/main/src/server/filter_builder.ts#L137)

***

### add[​](#add "Direct link to add")

▸ **add**<`T`>(`l`, `r`): [`Expression`](/api/classes/server.Expression.md)<`T`>

`l + r`

#### Type parameters[​](#type-parameters-7 "Direct link to Type parameters")

| Name | Type                                                          |
| ---- | ------------------------------------------------------------- |
| `T`  | extends [`NumericValue`](/api/modules/values.md#numericvalue) |

#### Parameters[​](#parameters-6 "Direct link to Parameters")

| Name | Type                                                                 |
| ---- | -------------------------------------------------------------------- |
| `l`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |
| `r`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |

#### Returns[​](#returns-6 "Direct link to Returns")

[`Expression`](/api/classes/server.Expression.md)<`T`>

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[server/filter\_builder.ts:149](https://github.com/get-convex/convex-js/blob/main/src/server/filter_builder.ts#L149)

***

### sub[​](#sub "Direct link to sub")

▸ **sub**<`T`>(`l`, `r`): [`Expression`](/api/classes/server.Expression.md)<`T`>

`l - r`

#### Type parameters[​](#type-parameters-8 "Direct link to Type parameters")

| Name | Type                                                          |
| ---- | ------------------------------------------------------------- |
| `T`  | extends [`NumericValue`](/api/modules/values.md#numericvalue) |

#### Parameters[​](#parameters-7 "Direct link to Parameters")

| Name | Type                                                                 |
| ---- | -------------------------------------------------------------------- |
| `l`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |
| `r`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |

#### Returns[​](#returns-7 "Direct link to Returns")

[`Expression`](/api/classes/server.Expression.md)<`T`>

#### Defined in[​](#defined-in-7 "Direct link to Defined in")

[server/filter\_builder.ts:159](https://github.com/get-convex/convex-js/blob/main/src/server/filter_builder.ts#L159)

***

### mul[​](#mul "Direct link to mul")

▸ **mul**<`T`>(`l`, `r`): [`Expression`](/api/classes/server.Expression.md)<`T`>

`l * r`

#### Type parameters[​](#type-parameters-9 "Direct link to Type parameters")

| Name | Type                                                          |
| ---- | ------------------------------------------------------------- |
| `T`  | extends [`NumericValue`](/api/modules/values.md#numericvalue) |

#### Parameters[​](#parameters-8 "Direct link to Parameters")

| Name | Type                                                                 |
| ---- | -------------------------------------------------------------------- |
| `l`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |
| `r`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |

#### Returns[​](#returns-8 "Direct link to Returns")

[`Expression`](/api/classes/server.Expression.md)<`T`>

#### Defined in[​](#defined-in-8 "Direct link to Defined in")

[server/filter\_builder.ts:169](https://github.com/get-convex/convex-js/blob/main/src/server/filter_builder.ts#L169)

***

### div[​](#div "Direct link to div")

▸ **div**<`T`>(`l`, `r`): [`Expression`](/api/classes/server.Expression.md)<`T`>

`l / r`

#### Type parameters[​](#type-parameters-10 "Direct link to Type parameters")

| Name | Type                                                          |
| ---- | ------------------------------------------------------------- |
| `T`  | extends [`NumericValue`](/api/modules/values.md#numericvalue) |

#### Parameters[​](#parameters-9 "Direct link to Parameters")

| Name | Type                                                                 |
| ---- | -------------------------------------------------------------------- |
| `l`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |
| `r`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |

#### Returns[​](#returns-9 "Direct link to Returns")

[`Expression`](/api/classes/server.Expression.md)<`T`>

#### Defined in[​](#defined-in-9 "Direct link to Defined in")

[server/filter\_builder.ts:179](https://github.com/get-convex/convex-js/blob/main/src/server/filter_builder.ts#L179)

***

### mod[​](#mod "Direct link to mod")

▸ **mod**<`T`>(`l`, `r`): [`Expression`](/api/classes/server.Expression.md)<`T`>

`l % r`

#### Type parameters[​](#type-parameters-11 "Direct link to Type parameters")

| Name | Type                                                          |
| ---- | ------------------------------------------------------------- |
| `T`  | extends [`NumericValue`](/api/modules/values.md#numericvalue) |

#### Parameters[​](#parameters-10 "Direct link to Parameters")

| Name | Type                                                                 |
| ---- | -------------------------------------------------------------------- |
| `l`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |
| `r`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |

#### Returns[​](#returns-10 "Direct link to Returns")

[`Expression`](/api/classes/server.Expression.md)<`T`>

#### Defined in[​](#defined-in-10 "Direct link to Defined in")

[server/filter\_builder.ts:189](https://github.com/get-convex/convex-js/blob/main/src/server/filter_builder.ts#L189)

***

### neg[​](#neg "Direct link to neg")

▸ **neg**<`T`>(`x`): [`Expression`](/api/classes/server.Expression.md)<`T`>

`-x`

#### Type parameters[​](#type-parameters-12 "Direct link to Type parameters")

| Name | Type                                                          |
| ---- | ------------------------------------------------------------- |
| `T`  | extends [`NumericValue`](/api/modules/values.md#numericvalue) |

#### Parameters[​](#parameters-11 "Direct link to Parameters")

| Name | Type                                                                 |
| ---- | -------------------------------------------------------------------- |
| `x`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`T`> |

#### Returns[​](#returns-11 "Direct link to Returns")

[`Expression`](/api/classes/server.Expression.md)<`T`>

#### Defined in[​](#defined-in-11 "Direct link to Defined in")

[server/filter\_builder.ts:199](https://github.com/get-convex/convex-js/blob/main/src/server/filter_builder.ts#L199)

***

### and[​](#and "Direct link to and")

▸ **and**(`...exprs`): [`Expression`](/api/classes/server.Expression.md)<`boolean`>

`exprs[0] && exprs[1] && ... && exprs[n]`

#### Parameters[​](#parameters-12 "Direct link to Parameters")

| Name       | Type                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| `...exprs` | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`boolean`>\[] |

#### Returns[​](#returns-12 "Direct link to Returns")

[`Expression`](/api/classes/server.Expression.md)<`boolean`>

#### Defined in[​](#defined-in-12 "Direct link to Defined in")

[server/filter\_builder.ts:208](https://github.com/get-convex/convex-js/blob/main/src/server/filter_builder.ts#L208)

***

### or[​](#or "Direct link to or")

▸ **or**(`...exprs`): [`Expression`](/api/classes/server.Expression.md)<`boolean`>

`exprs[0] || exprs[1] || ... || exprs[n]`

#### Parameters[​](#parameters-13 "Direct link to Parameters")

| Name       | Type                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| `...exprs` | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`boolean`>\[] |

#### Returns[​](#returns-13 "Direct link to Returns")

[`Expression`](/api/classes/server.Expression.md)<`boolean`>

#### Defined in[​](#defined-in-13 "Direct link to Defined in")

[server/filter\_builder.ts:215](https://github.com/get-convex/convex-js/blob/main/src/server/filter_builder.ts#L215)

***

### not[​](#not "Direct link to not")

▸ **not**(`x`): [`Expression`](/api/classes/server.Expression.md)<`boolean`>

`!x`

#### Parameters[​](#parameters-14 "Direct link to Parameters")

| Name | Type                                                                       |
| ---- | -------------------------------------------------------------------------- |
| `x`  | [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`boolean`> |

#### Returns[​](#returns-14 "Direct link to Returns")

[`Expression`](/api/classes/server.Expression.md)<`boolean`>

#### Defined in[​](#defined-in-14 "Direct link to Defined in")

[server/filter\_builder.ts:222](https://github.com/get-convex/convex-js/blob/main/src/server/filter_builder.ts#L222)

***

### field[​](#field "Direct link to field")

▸ **field**<`FieldPath`>(`fieldPath`): [`Expression`](/api/classes/server.Expression.md)<[`FieldTypeFromFieldPath`](/api/modules/server.md#fieldtypefromfieldpath)<[`DocumentByInfo`](/api/modules/server.md#documentbyinfo)<`TableInfo`>, `FieldPath`>>

Evaluates to the field at the given `fieldPath`.

For example, in [filter](/api/interfaces/server.OrderedQuery.md#filter) this can be used to examine the values being filtered.

#### Example[​](#example "Direct link to Example")

On this object:

```
{

  "user": {

    "isActive": true

  }

}
```

`field("user.isActive")` evaluates to `true`.

#### Type parameters[​](#type-parameters-13 "Direct link to Type parameters")

| Name        | Type             |
| ----------- | ---------------- |
| `FieldPath` | extends `string` |

#### Parameters[​](#parameters-15 "Direct link to Parameters")

| Name        | Type        |
| ----------- | ----------- |
| `fieldPath` | `FieldPath` |

#### Returns[​](#returns-15 "Direct link to Returns")

[`Expression`](/api/classes/server.Expression.md)<[`FieldTypeFromFieldPath`](/api/modules/server.md#fieldtypefromfieldpath)<[`DocumentByInfo`](/api/modules/server.md#documentbyinfo)<`TableInfo`>, `FieldPath`>>

#### Defined in[​](#defined-in-15 "Direct link to Defined in")

[server/filter\_builder.ts:246](https://github.com/get-convex/convex-js/blob/main/src/server/filter_builder.ts#L246)
