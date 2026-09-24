# Class: VUnion\<Type, T, IsOptional, FieldPaths>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[values](/api/modules/values.md).VUnion

The type of the `v.union()` validator.

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name         | Type                                                                                   |
| ------------ | -------------------------------------------------------------------------------------- |
| `Type`       | `Type`                                                                                 |
| `T`          | extends [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`>\[] |
| `IsOptional` | extends [`OptionalProperty`](/api/modules/values.md#optionalproperty) = `"required"`   |
| `FieldPaths` | extends `string` = `T`\[`number`]\[`"fieldPaths"`]                                     |

## Hierarchy[​](#hierarchy "Direct link to Hierarchy")

* `BaseValidator`<`Type`, `IsOptional`, `FieldPaths`>

  ↳ **`VUnion`**

## Constructors[​](#constructors "Direct link to Constructors")

### constructor[​](#constructor "Direct link to constructor")

• **new VUnion**<`Type`, `T`, `IsOptional`, `FieldPaths`>(`«destructured»`)

Usually you'd use `v.union(...members)` instead.

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name         | Type                                                                                   |
| ------------ | -------------------------------------------------------------------------------------- |
| `Type`       | `Type`                                                                                 |
| `T`          | extends [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`>\[] |
| `IsOptional` | extends [`OptionalProperty`](/api/modules/values.md#optionalproperty) = `"required"`   |
| `FieldPaths` | extends `string` = `T`\[`number`]\[`"fieldPaths"`]                                     |

#### Parameters[​](#parameters "Direct link to Parameters")

| Name             | Type         |
| ---------------- | ------------ |
| `«destructured»` | `Object`     |
| › `isOptional`   | `IsOptional` |
| › `members`      | `T`          |

#### Overrides[​](#overrides "Direct link to Overrides")

BaseValidator\&lt;Type, IsOptional, FieldPaths\&gt;.constructor

#### Defined in[​](#defined-in "Direct link to Defined in")

[values/validators.ts:697](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L697)

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

### members[​](#members "Direct link to members")

• `Readonly` **members**: `T`

The array of validators, one of which must match the value.

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[values/validators.ts:687](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L687)

***

### kind[​](#kind "Direct link to kind")

• `Readonly` **kind**: `"union"`

The kind of validator, `"union"`.

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[values/validators.ts:692](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L692)

## Methods[​](#methods "Direct link to Methods")

### optional[​](#optional "Direct link to optional")

▸ **optional**(): [`VUnion`](/api/classes/values.VUnion.md)<`undefined` | `Type`, `T`, `"optional"`, `FieldPaths`>

Allow this validated field to be absent.

#### Returns[​](#returns "Direct link to Returns")

[`VUnion`](/api/classes/values.VUnion.md)<`undefined` | `Type`, `T`, `"optional"`, `FieldPaths`>

#### Overrides[​](#overrides-1 "Direct link to Overrides")

BaseValidator.optional

#### Defined in[​](#defined-in-7 "Direct link to Defined in")

[values/validators.ts:717](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L717)
