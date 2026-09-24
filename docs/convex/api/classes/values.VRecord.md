# Class: VRecord\<Type, Key, Value, IsOptional, FieldPaths>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[values](/api/modules/values.md).VRecord

The type of the `v.record()` validator.

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name         | Type                                                                                   |
| ------------ | -------------------------------------------------------------------------------------- |
| `Type`       | `Type`                                                                                 |
| `Key`        | extends [`Validator`](/api/modules/values.md#validator)<`string`, `"required"`, `any`> |
| `Value`      | extends [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`>    |
| `IsOptional` | extends [`OptionalProperty`](/api/modules/values.md#optionalproperty) = `"required"`   |
| `FieldPaths` | extends `string` = `string`                                                            |

## Hierarchy[​](#hierarchy "Direct link to Hierarchy")

* `BaseValidator`<`Type`, `IsOptional`, `FieldPaths`>

  ↳ **`VRecord`**

## Constructors[​](#constructors "Direct link to Constructors")

### constructor[​](#constructor "Direct link to constructor")

• **new VRecord**<`Type`, `Key`, `Value`, `IsOptional`, `FieldPaths`>(`«destructured»`)

Usually you'd use `v.record(key, value)` instead.

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name         | Type                                                                                   |
| ------------ | -------------------------------------------------------------------------------------- |
| `Type`       | `Type`                                                                                 |
| `Key`        | extends [`Validator`](/api/modules/values.md#validator)<`string`, `"required"`, `any`> |
| `Value`      | extends [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`>    |
| `IsOptional` | extends [`OptionalProperty`](/api/modules/values.md#optionalproperty) = `"required"`   |
| `FieldPaths` | extends `string` = `string`                                                            |

#### Parameters[​](#parameters "Direct link to Parameters")

| Name             | Type         |
| ---------------- | ------------ |
| `«destructured»` | `Object`     |
| › `isOptional`   | `IsOptional` |
| › `key`          | `Key`        |
| › `value`        | `Value`      |

#### Overrides[​](#overrides "Direct link to Overrides")

BaseValidator\&lt;Type, IsOptional, FieldPaths\&gt;.constructor

#### Defined in[​](#defined-in "Direct link to Defined in")

[values/validators.ts:621](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L621)

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

### key[​](#key "Direct link to key")

• `Readonly` **key**: `Key`

The validator for the keys of the record.

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[values/validators.ts:606](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L606)

***

### value[​](#value "Direct link to value")

• `Readonly` **value**: `Value`

The validator for the values of the record.

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[values/validators.ts:611](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L611)

***

### kind[​](#kind "Direct link to kind")

• `Readonly` **kind**: `"record"`

The kind of validator, `"record"`.

#### Defined in[​](#defined-in-7 "Direct link to Defined in")

[values/validators.ts:616](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L616)

## Methods[​](#methods "Direct link to Methods")

### optional[​](#optional "Direct link to optional")

▸ **optional**(): [`VRecord`](/api/classes/values.VRecord.md)<`undefined` | `Type`, `Key`, `Value`, `"optional"`, `FieldPaths`>

Allow this validated field to be absent.

#### Returns[​](#returns "Direct link to Returns")

[`VRecord`](/api/classes/values.VRecord.md)<`undefined` | `Type`, `Key`, `Value`, `"optional"`, `FieldPaths`>

#### Overrides[​](#overrides-1 "Direct link to Overrides")

BaseValidator.optional

#### Defined in[​](#defined-in-8 "Direct link to Defined in")

[values/validators.ts:662](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L662)
