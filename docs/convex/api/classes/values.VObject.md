# Class: VObject\<Type, Fields, IsOptional, FieldPaths>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[values](/api/modules/values.md).VObject

The type of the `v.object()` validator.

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name         | Type                                                                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Type`       | `Type`                                                                                                                                                           |
| `Fields`     | extends `Record`<`string`, [`GenericValidator`](/api/modules/values.md#genericvalidator)>                                                                        |
| `IsOptional` | extends [`OptionalProperty`](/api/modules/values.md#optionalproperty) = `"required"`                                                                             |
| `FieldPaths` | extends `string` = { \[Property in keyof Fields]: JoinFieldPaths\<Property & string, Fields\[Property]\["fieldPaths"]> \| Property }\[keyof `Fields`] & `string` |

## Hierarchy[​](#hierarchy "Direct link to Hierarchy")

* `BaseValidator`<`Type`, `IsOptional`, `FieldPaths`>

  ↳ **`VObject`**

## Constructors[​](#constructors "Direct link to Constructors")

### constructor[​](#constructor "Direct link to constructor")

• **new VObject**<`Type`, `Fields`, `IsOptional`, `FieldPaths`>(`«destructured»`)

Usually you'd use `v.object({ ... })` instead.

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name         | Type                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Type`       | `Type`                                                                                                                                                                 |
| `Fields`     | extends `Record`<`string`, [`GenericValidator`](/api/modules/values.md#genericvalidator)>                                                                              |
| `IsOptional` | extends [`OptionalProperty`](/api/modules/values.md#optionalproperty) = `"required"`                                                                                   |
| `FieldPaths` | extends `string` = { \[Property in string \| number \| symbol]: Property \| \`${Property & string}.${Fields\[Property]\["fieldPaths"]}\` }\[keyof `Fields`] & `string` |

#### Parameters[​](#parameters "Direct link to Parameters")

| Name             | Type         |
| ---------------- | ------------ |
| `«destructured»` | `Object`     |
| › `isOptional`   | `IsOptional` |
| › `fields`       | `Fields`     |

#### Overrides[​](#overrides "Direct link to Overrides")

BaseValidator\&lt;Type, IsOptional, FieldPaths\&gt;.constructor

#### Defined in[​](#defined-in "Direct link to Defined in")

[values/validators.ts:366](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L366)

## Properties[​](#properties "Direct link to Properties")

### type[​](#type "Direct link to type")

• `Readonly` **type**: `Type`

Only for TypeScript, the TS type of the JS values validated by this validator.

#### Inherited from[​](#inherited-from "Direct link to Inherited from")

BaseValidator.type

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[values/validators.ts:37](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L37)

***

### fieldPaths[​](#fieldpaths "Direct link to fieldPaths")

• `Readonly` **fieldPaths**: `FieldPaths`

Only for TypeScript, if this an Object validator, then this is the TS type of its property names.

#### Inherited from[​](#inherited-from-1 "Direct link to Inherited from")

BaseValidator.fieldPaths

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[values/validators.ts:42](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L42)

***

### isOptional[​](#isoptional "Direct link to isOptional")

• `Readonly` **isOptional**: `IsOptional`

Whether this is an optional Object property value validator.

#### Inherited from[​](#inherited-from-2 "Direct link to Inherited from")

BaseValidator.isOptional

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[values/validators.ts:47](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L47)

***

### isConvexValidator[​](#isconvexvalidator "Direct link to isConvexValidator")

• `Readonly` **isConvexValidator**: `true`

Always `"true"`.

#### Inherited from[​](#inherited-from-3 "Direct link to Inherited from")

BaseValidator.isConvexValidator

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[values/validators.ts:52](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L52)

***

### fields[​](#fields "Direct link to fields")

• `Readonly` **fields**: `Fields`

An object with the validator for each property.

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[values/validators.ts:356](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L356)

***

### kind[​](#kind "Direct link to kind")

• `Readonly` **kind**: `"object"`

The kind of validator, `"object"`.

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[values/validators.ts:361](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L361)

## Methods[​](#methods "Direct link to Methods")

### optional[​](#optional "Direct link to optional")

▸ **optional**(): [`VObject`](/api/classes/values.VObject.md)<`undefined` | `Type`, `Fields`, `"optional"`, `FieldPaths`>

Allow this validated field to be absent.

#### Returns[​](#returns "Direct link to Returns")

[`VObject`](/api/classes/values.VObject.md)<`undefined` | `Type`, `Fields`, `"optional"`, `FieldPaths`>

#### Overrides[​](#overrides-1 "Direct link to Overrides")

BaseValidator.optional

#### Defined in[​](#defined-in-7 "Direct link to Defined in")

[values/validators.ts:400](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L400)

***

### omit[​](#omit "Direct link to omit")

▸ **omit**<`K`>(`...fields`): [`VObject`](/api/classes/values.VObject.md)<[`Expand`](/api/modules/server.md#expand)<`Omit`<`Type`, `K`>>, [`Expand`](/api/modules/server.md#expand)<`Omit`<`Fields`, `K`>>, `IsOptional`, { \[Property in string | number | symbol]: Property | \`${Property & string}.${Expand\<Omit\<Fields, K>>\[Property]\["fieldPaths"]}\` }\[keyof [`Expand`](/api/modules/server.md#expand)<`Omit`<`Fields`, `K`>>] & `string`>

Create a new VObject with the specified fields omitted.

#### Type parameters[​](#type-parameters-2 "Direct link to Type parameters")

| Name | Type             |
| ---- | ---------------- |
| `K`  | extends `string` |

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name        | Type   | Description                                |
| ----------- | ------ | ------------------------------------------ |
| `...fields` | `K`\[] | The field names to omit from this VObject. |

#### Returns[​](#returns-1 "Direct link to Returns")

[`VObject`](/api/classes/values.VObject.md)<[`Expand`](/api/modules/server.md#expand)<`Omit`<`Type`, `K`>>, [`Expand`](/api/modules/server.md#expand)<`Omit`<`Fields`, `K`>>, `IsOptional`, { \[Property in string | number | symbol]: Property | \`${Property & string}.${Expand\<Omit\<Fields, K>>\[Property]\["fieldPaths"]}\` }\[keyof [`Expand`](/api/modules/server.md#expand)<`Omit`<`Fields`, `K`>>] & `string`>

#### Defined in[​](#defined-in-8 "Direct link to Defined in")

[values/validators.ts:415](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L415)

***

### pick[​](#pick "Direct link to pick")

▸ **pick**<`K`>(`...fields`): [`VObject`](/api/classes/values.VObject.md)<[`Expand`](/api/modules/server.md#expand)<`Pick`<`Type`, `Extract`\<keyof `Type`, `K`>>>, [`Expand`](/api/modules/server.md#expand)<`Pick`<`Fields`, `K`>>, `IsOptional`, { \[Property in string | number | symbol]: Property | \`${Property & string}.${Expand\<Pick\<Fields, K>>\[Property]\["fieldPaths"]}\` }\[keyof [`Expand`](/api/modules/server.md#expand)<`Pick`<`Fields`, `K`>>] & `string`>

Create a new VObject with only the specified fields.

#### Type parameters[​](#type-parameters-3 "Direct link to Type parameters")

| Name | Type             |
| ---- | ---------------- |
| `K`  | extends `string` |

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name        | Type   | Description                                |
| ----------- | ------ | ------------------------------------------ |
| `...fields` | `K`\[] | The field names to pick from this VObject. |

#### Returns[​](#returns-2 "Direct link to Returns")

[`VObject`](/api/classes/values.VObject.md)<[`Expand`](/api/modules/server.md#expand)<`Pick`<`Type`, `Extract`\<keyof `Type`, `K`>>>, [`Expand`](/api/modules/server.md#expand)<`Pick`<`Fields`, `K`>>, `IsOptional`, { \[Property in string | number | symbol]: Property | \`${Property & string}.${Expand\<Pick\<Fields, K>>\[Property]\["fieldPaths"]}\` }\[keyof [`Expand`](/api/modules/server.md#expand)<`Pick`<`Fields`, `K`>>] & `string`>

#### Defined in[​](#defined-in-9 "Direct link to Defined in")

[values/validators.ts:432](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L432)

***

### partial[​](#partial "Direct link to partial")

▸ **partial**(): [`VObject`](/api/classes/values.VObject.md)<{ \[K in string | number | symbol]?: Type\[K] }, { \[K in string | number | symbol]: VOptional\<Fields\[K]> }, `IsOptional`, { \[Property in string | number | symbol]: Property | \`${Property & string}.${{ \[K in string | number | symbol]: VOptional\<Fields\[K]> }\[Property]\["fieldPaths"]}\` }\[keyof `Fields`] & `string`>

Create a new VObject with all fields marked as optional.

#### Returns[​](#returns-3 "Direct link to Returns")

[`VObject`](/api/classes/values.VObject.md)<{ \[K in string | number | symbol]?: Type\[K] }, { \[K in string | number | symbol]: VOptional\<Fields\[K]> }, `IsOptional`, { \[Property in string | number | symbol]: Property | \`${Property & string}.${{ \[K in string | number | symbol]: VOptional\<Fields\[K]> }\[Property]\["fieldPaths"]}\` }\[keyof `Fields`] & `string`>

#### Defined in[​](#defined-in-10 "Direct link to Defined in")

[values/validators.ts:452](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L452)

***

### extend[​](#extend "Direct link to extend")

▸ **extend**<`NewFields`>(`fields`): [`VObject`](/api/classes/values.VObject.md)<[`Expand`](/api/modules/server.md#expand)<`Type` & [`ObjectType`](/api/modules/values.md#objecttype)<`NewFields`>>, [`Expand`](/api/modules/server.md#expand)<`Fields` & `NewFields`>, `IsOptional`, { \[Property in string | number | symbol]: Property | \`${Property & string}.${Expand\<Fields & NewFields>\[Property]\["fieldPaths"]}\` }\[keyof [`Expand`](/api/modules/server.md#expand)<`Fields` & `NewFields`>] & `string`>

Create a new VObject with additional fields merged in.

#### Type parameters[​](#type-parameters-4 "Direct link to Type parameters")

| Name        | Type                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------- |
| `NewFields` | extends `Record`<`string`, [`GenericValidator`](/api/modules/values.md#genericvalidator)> |

#### Parameters[​](#parameters-3 "Direct link to Parameters")

| Name     | Type        | Description                                                      |
| -------- | ----------- | ---------------------------------------------------------------- |
| `fields` | `NewFields` | An object with additional validators to merge into this VObject. |

#### Returns[​](#returns-4 "Direct link to Returns")

[`VObject`](/api/classes/values.VObject.md)<[`Expand`](/api/modules/server.md#expand)<`Type` & [`ObjectType`](/api/modules/values.md#objecttype)<`NewFields`>>, [`Expand`](/api/modules/server.md#expand)<`Fields` & `NewFields`>, `IsOptional`, { \[Property in string | number | symbol]: Property | \`${Property & string}.${Expand\<Fields & NewFields>\[Property]\["fieldPaths"]}\` }\[keyof [`Expand`](/api/modules/server.md#expand)<`Fields` & `NewFields`>] & `string`>

#### Defined in[​](#defined-in-11 "Direct link to Defined in")

[values/validators.ts:473](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L473)
