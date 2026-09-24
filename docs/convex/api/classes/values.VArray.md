# Class: VArray\<Type, Element, IsOptional>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[values](/api/modules/values.md).VArray

The type of the `v.array()` validator.

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name         | Type                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| `Type`       | `Type`                                                                               |
| `Element`    | extends [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`>  |
| `IsOptional` | extends [`OptionalProperty`](/api/modules/values.md#optionalproperty) = `"required"` |

## Hierarchy[​](#hierarchy "Direct link to Hierarchy")

* `BaseValidator`<`Type`, `IsOptional`>

  ↳ **`VArray`**

## Constructors[​](#constructors "Direct link to Constructors")

### constructor[​](#constructor "Direct link to constructor")

• **new VArray**<`Type`, `Element`, `IsOptional`>(`«destructured»`)

Usually you'd use `v.array(element)` instead.

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name         | Type                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| `Type`       | `Type`                                                                               |
| `Element`    | extends [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`>  |
| `IsOptional` | extends [`OptionalProperty`](/api/modules/values.md#optionalproperty) = `"required"` |

#### Parameters[​](#parameters "Direct link to Parameters")

| Name             | Type         |
| ---------------- | ------------ |
| `«destructured»` | `Object`     |
| › `isOptional`   | `IsOptional` |
| › `element`      | `Element`    |

#### Overrides[​](#overrides "Direct link to Overrides")

BaseValidator\&lt;Type, IsOptional\&gt;.constructor

#### Defined in[​](#defined-in "Direct link to Defined in")

[values/validators.ts:560](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L560)

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

• `Readonly` **fieldPaths**: `never`

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

### element[​](#element "Direct link to element")

• `Readonly` **element**: `Element`

The validator for the elements of the array.

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[values/validators.ts:550](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L550)

***

### kind[​](#kind "Direct link to kind")

• `Readonly` **kind**: `"array"`

The kind of validator, `"array"`.

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[values/validators.ts:555](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L555)

## Methods[​](#methods "Direct link to Methods")

### optional[​](#optional "Direct link to optional")

▸ **optional**(): [`VArray`](/api/classes/values.VArray.md)<`undefined` | `Type`, `Element`, `"optional"`>

Allow this validated field to be absent.

#### Returns[​](#returns "Direct link to Returns")

[`VArray`](/api/classes/values.VArray.md)<`undefined` | `Type`, `Element`, `"optional"`>

#### Overrides[​](#overrides-1 "Direct link to Overrides")

BaseValidator.optional

#### Defined in[​](#defined-in-7 "Direct link to Defined in")

[values/validators.ts:581](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L581)
