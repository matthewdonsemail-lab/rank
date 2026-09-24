# Module: values

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Utilities for working with values stored in Convex.

You can see the full set of supported types at [Types](https://docs.convex.dev/using/types).

## Namespaces[​](#namespaces "Direct link to Namespaces")

* [Base64](/api/namespaces/values.Base64.md)

## Classes[​](#classes "Direct link to Classes")

* [ConvexError](/api/classes/values.ConvexError.md)
* [VId](/api/classes/values.VId.md)
* [VFloat64](/api/classes/values.VFloat64.md)
* [VInt64](/api/classes/values.VInt64.md)
* [VCommitTs](/api/classes/values.VCommitTs.md)
* [VBoolean](/api/classes/values.VBoolean.md)
* [VBytes](/api/classes/values.VBytes.md)
* [VString](/api/classes/values.VString.md)
* [VNull](/api/classes/values.VNull.md)
* [VAny](/api/classes/values.VAny.md)
* [VObject](/api/classes/values.VObject.md)
* [VLiteral](/api/classes/values.VLiteral.md)
* [VArray](/api/classes/values.VArray.md)
* [VRecord](/api/classes/values.VRecord.md)
* [VUnion](/api/classes/values.VUnion.md)
* [CommitTsPlaceholder](/api/classes/values.CommitTsPlaceholder.md)

## Type Aliases[​](#type-aliases "Direct link to Type Aliases")

### GenericValidator[​](#genericvalidator "Direct link to GenericValidator")

Ƭ **GenericValidator**: [`Validator`](/api/modules/values.md#validator)<`any`, `any`, `any`>

The type that all validators must extend.

#### Defined in[​](#defined-in "Direct link to Defined in")

[values/validator.ts:28](https://github.com/get-convex/convex-js/blob/main/src/values/validator.ts#L28)

***

### AsObjectValidator[​](#asobjectvalidator "Direct link to AsObjectValidator")

Ƭ **AsObjectValidator**<`V`>: `V` extends [`Validator`](/api/modules/values.md#validator)<`any`, `any`, `any`> ? `V` : `V` extends [`PropertyValidators`](/api/modules/values.md#propertyvalidators) ? [`Validator`](/api/modules/values.md#validator)<[`ObjectType`](/api/modules/values.md#objecttype)<`V`>> : `never`

Coerce an object with validators as properties to a validator. If a validator is passed, return it.

#### Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name | Type                                                                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `V`  | extends [`Validator`](/api/modules/values.md#validator)<`any`, `any`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators) |

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[values/validator.ts:64](https://github.com/get-convex/convex-js/blob/main/src/values/validator.ts#L64)

***

### PropertyValidators[​](#propertyvalidators "Direct link to PropertyValidators")

Ƭ **PropertyValidators**: `Record`<`string`, [`Validator`](/api/modules/values.md#validator)<`any`, [`OptionalProperty`](/api/modules/values.md#optionalproperty), `any`>>

Validators for each property of an object.

This is represented as an object mapping the property name to its [Validator](/api/modules/values.md#validator).

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[values/validator.ts:439](https://github.com/get-convex/convex-js/blob/main/src/values/validator.ts#L439)

***

### ObjectType[​](#objecttype "Direct link to ObjectType")

Ƭ **ObjectType**<`Fields`>: [`Expand`](/api/modules/server.md#expand)<{ \[Property in OptionalKeys\<Fields>]?: Exclude\<Infer\<Fields\[Property]>, undefined> } & { \[Property in RequiredKeys\<Fields>]: Infer\<Fields\[Property]> }>

Compute the type of an object from [PropertyValidators](/api/modules/values.md#propertyvalidators).

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name     | Type                                                                      |
| -------- | ------------------------------------------------------------------------- |
| `Fields` | extends [`PropertyValidators`](/api/modules/values.md#propertyvalidators) |

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[values/validator.ts:449](https://github.com/get-convex/convex-js/blob/main/src/values/validator.ts#L449)

***

### Infer[​](#infer "Direct link to Infer")

Ƭ **Infer**<`T`>: `T`\[`"type"`]

Extract a TypeScript type from a validator.

Example usage:

```
const objectSchema = v.object({

  property: v.string(),

});

type MyObject = Infer<typeof objectSchema>; // { property: string }
```

**`Type Param`**

The type of a [Validator](/api/modules/values.md#validator) constructed with [v](/api/modules/values.md#v).

#### Type parameters[​](#type-parameters-2 "Direct link to Type parameters")

| Name | Type                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `T`  | extends [`Validator`](/api/modules/values.md#validator)<`any`, [`OptionalProperty`](/api/modules/values.md#optionalproperty), `any`> |

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[values/validator.ts:491](https://github.com/get-convex/convex-js/blob/main/src/values/validator.ts#L491)

***

### VOptional[​](#voptional "Direct link to VOptional")

Ƭ **VOptional**<`T`>: `T` extends [`VId`](/api/classes/values.VId.md)\<infer Type, [`OptionalProperty`](/api/modules/values.md#optionalproperty)> ? [`VId`](/api/classes/values.VId.md)<`Type` | `undefined`, `"optional"`> : `T` extends [`VString`](/api/classes/values.VString.md)\<infer Type, [`OptionalProperty`](/api/modules/values.md#optionalproperty)> ? [`VString`](/api/classes/values.VString.md)<`Type` | `undefined`, `"optional"`> : `T` extends [`VFloat64`](/api/classes/values.VFloat64.md)\<infer Type, [`OptionalProperty`](/api/modules/values.md#optionalproperty)> ? [`VFloat64`](/api/classes/values.VFloat64.md)<`Type` | `undefined`, `"optional"`> : `T` extends [`VInt64`](/api/classes/values.VInt64.md)\<infer Type, [`OptionalProperty`](/api/modules/values.md#optionalproperty)> ? [`VInt64`](/api/classes/values.VInt64.md)<`Type` | `undefined`, `"optional"`> : `T` extends [`VCommitTs`](/api/classes/values.VCommitTs.md)\<infer Type, [`OptionalProperty`](/api/modules/values.md#optionalproperty)> ? [`VCommitTs`](/api/classes/values.VCommitTs.md)<`Type` | `undefined`, `"optional"`> : `T` extends [`VBoolean`](/api/classes/values.VBoolean.md)\<infer Type, [`OptionalProperty`](/api/modules/values.md#optionalproperty)> ? [`VBoolean`](/api/classes/values.VBoolean.md)<`Type` | `undefined`, `"optional"`> : `T` extends [`VNull`](/api/classes/values.VNull.md)\<infer Type, [`OptionalProperty`](/api/modules/values.md#optionalproperty)> ? [`VNull`](/api/classes/values.VNull.md)<`Type` | `undefined`, `"optional"`> : `T` extends [`VAny`](/api/classes/values.VAny.md)\<infer Type, [`OptionalProperty`](/api/modules/values.md#optionalproperty)> ? [`VAny`](/api/classes/values.VAny.md)<`Type` | `undefined`, `"optional"`> : `T` extends [`VLiteral`](/api/classes/values.VLiteral.md)\<infer Type, [`OptionalProperty`](/api/modules/values.md#optionalproperty)> ? [`VLiteral`](/api/classes/values.VLiteral.md)<`Type` | `undefined`, `"optional"`> : `T` extends [`VBytes`](/api/classes/values.VBytes.md)\<infer Type, [`OptionalProperty`](/api/modules/values.md#optionalproperty)> ? [`VBytes`](/api/classes/values.VBytes.md)<`Type` | `undefined`, `"optional"`> : `T` extends [`VObject`](/api/classes/values.VObject.md)\<infer Type, infer Fields, [`OptionalProperty`](/api/modules/values.md#optionalproperty), infer FieldPaths> ? [`VObject`](/api/classes/values.VObject.md)<`Type` | `undefined`, `Fields`, `"optional"`, `FieldPaths`> : `T` extends [`VArray`](/api/classes/values.VArray.md)\<infer Type, infer Element, [`OptionalProperty`](/api/modules/values.md#optionalproperty)> ? [`VArray`](/api/classes/values.VArray.md)<`Type` | `undefined`, `Element`, `"optional"`> : `T` extends [`VRecord`](/api/classes/values.VRecord.md)\<infer Type, infer Key, infer Value, [`OptionalProperty`](/api/modules/values.md#optionalproperty), infer FieldPaths> ? [`VRecord`](/api/classes/values.VRecord.md)<`Type` | `undefined`, `Key`, `Value`, `"optional"`, `FieldPaths`> : `T` extends [`VUnion`](/api/classes/values.VUnion.md)\<infer Type, infer Members, [`OptionalProperty`](/api/modules/values.md#optionalproperty), infer FieldPaths> ? [`VUnion`](/api/classes/values.VUnion.md)<`Type` | `undefined`, `Members`, `"optional"`, `FieldPaths`> : `never`

#### Type parameters[​](#type-parameters-3 "Direct link to Type parameters")

| Name | Type                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `T`  | extends [`Validator`](/api/modules/values.md#validator)<`any`, [`OptionalProperty`](/api/modules/values.md#optionalproperty), `any`> |

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[values/validators.ts:730](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L730)

***

### OptionalProperty[​](#optionalproperty "Direct link to OptionalProperty")

Ƭ **OptionalProperty**: `"optional"` | `"required"`

Type representing whether a property in an object is optional or required.

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[values/validators.ts:765](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L765)

***

### Validator[​](#validator "Direct link to Validator")

Ƭ **Validator**<`Type`, `IsOptional`, `FieldPaths`>: [`VId`](/api/classes/values.VId.md)<`Type`, `IsOptional`> | [`VString`](/api/classes/values.VString.md)<`Type`, `IsOptional`> | [`VFloat64`](/api/classes/values.VFloat64.md)<`Type`, `IsOptional`> | [`VInt64`](/api/classes/values.VInt64.md)<`Type`, `IsOptional`> | [`VCommitTs`](/api/classes/values.VCommitTs.md)<`Type`, `IsOptional`> | [`VBoolean`](/api/classes/values.VBoolean.md)<`Type`, `IsOptional`> | [`VNull`](/api/classes/values.VNull.md)<`Type`, `IsOptional`> | [`VAny`](/api/classes/values.VAny.md)<`Type`, `IsOptional`> | [`VLiteral`](/api/classes/values.VLiteral.md)<`Type`, `IsOptional`> | [`VBytes`](/api/classes/values.VBytes.md)<`Type`, `IsOptional`> | [`VObject`](/api/classes/values.VObject.md)<`Type`, `Record`<`string`, [`Validator`](/api/modules/values.md#validator)<`any`, [`OptionalProperty`](/api/modules/values.md#optionalproperty), `any`>>, `IsOptional`, `FieldPaths`> | [`VArray`](/api/classes/values.VArray.md)<`Type`, [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`>, `IsOptional`> | [`VRecord`](/api/classes/values.VRecord.md)<`Type`, [`Validator`](/api/modules/values.md#validator)<`string`, `"required"`, `any`>, [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`>, `IsOptional`, `FieldPaths`> | [`VUnion`](/api/classes/values.VUnion.md)<`Type`, [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`>\[], `IsOptional`, `FieldPaths`>

A validator for a Convex value.

This should be constructed using the validator builder, [v](/api/modules/values.md#v).

A validator encapsulates:

* The TypeScript type of this value.
* Whether this field should be optional if it's included in an object.
* The TypeScript type for the set of index field paths that can be used to build indexes on this value.
* A JSON representation of the validator.

Specific types of validators contain additional information: for example an `ArrayValidator` contains an `element` property with the validator used to validate each element of the list. Use the shared 'kind' property to identity the type of validator.

More validators can be added in future releases so an exhaustive switch statement on validator `kind` should be expected to break in future releases of Convex.

#### Type parameters[​](#type-parameters-4 "Direct link to Type parameters")

| Name         | Type                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| `Type`       | `Type`                                                                               |
| `IsOptional` | extends [`OptionalProperty`](/api/modules/values.md#optionalproperty) = `"required"` |
| `FieldPaths` | extends `string` = `never`                                                           |

#### Defined in[​](#defined-in-7 "Direct link to Defined in")

[values/validators.ts:790](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L790)

***

### ObjectFieldType[​](#objectfieldtype "Direct link to ObjectFieldType")

Ƭ **ObjectFieldType**: `Object`

#### Type declaration[​](#type-declaration "Direct link to Type declaration")

| Name        | Type                                                    |
| ----------- | ------------------------------------------------------- |
| `fieldType` | [`ValidatorJSON`](/api/modules/values.md#validatorjson) |
| `optional`  | `boolean`                                               |

#### Defined in[​](#defined-in-8 "Direct link to Defined in")

[values/validators.ts:832](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L832)

***

### ValidatorJSON[​](#validatorjson "Direct link to ValidatorJSON")

Ƭ **ValidatorJSON**: { `type`: `"null"` } | { `type`: `"number"` } | { `type`: `"bigint"` } | { `type`: `"commitTs"` } | { `type`: `"boolean"` } | { `type`: `"string"` } | { `type`: `"bytes"` } | { `type`: `"any"` } | { `type`: `"literal"` ; `value`: [`JSONValue`](/api/modules/values.md#jsonvalue) } | { `type`: `"id"` ; `tableName`: `string` } | { `type`: `"array"` ; `value`: [`ValidatorJSON`](/api/modules/values.md#validatorjson) } | { `type`: `"record"` ; `keys`: [`RecordKeyValidatorJSON`](/api/modules/values.md#recordkeyvalidatorjson) ; `values`: [`RecordValueValidatorJSON`](/api/modules/values.md#recordvaluevalidatorjson) } | { `type`: `"object"` ; `value`: `Record`<`string`, [`ObjectFieldType`](/api/modules/values.md#objectfieldtype)> } | { `type`: `"union"` ; `value`: [`ValidatorJSON`](/api/modules/values.md#validatorjson)\[] }

#### Defined in[​](#defined-in-9 "Direct link to Defined in")

[values/validators.ts:834](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L834)

***

### RecordKeyValidatorJSON[​](#recordkeyvalidatorjson "Direct link to RecordKeyValidatorJSON")

Ƭ **RecordKeyValidatorJSON**: { `type`: `"string"` } | { `type`: `"id"` ; `tableName`: `string` } | { `type`: `"union"` ; `value`: [`RecordKeyValidatorJSON`](/api/modules/values.md#recordkeyvalidatorjson)\[] }

#### Defined in[​](#defined-in-10 "Direct link to Defined in")

[values/validators.ts:854](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L854)

***

### RecordValueValidatorJSON[​](#recordvaluevalidatorjson "Direct link to RecordValueValidatorJSON")

Ƭ **RecordValueValidatorJSON**: [`ObjectFieldType`](/api/modules/values.md#objectfieldtype) & { `optional`: `false` }

#### Defined in[​](#defined-in-11 "Direct link to Defined in")

[values/validators.ts:859](https://github.com/get-convex/convex-js/blob/main/src/values/validators.ts#L859)

***

### JSONValue[​](#jsonvalue "Direct link to JSONValue")

Ƭ **JSONValue**: `null` | `boolean` | `number` | `string` | [`JSONValue`](/api/modules/values.md#jsonvalue)\[] | { `[key: string]`: [`JSONValue`](/api/modules/values.md#jsonvalue); }

The type of JavaScript values serializable to JSON.

#### Defined in[​](#defined-in-12 "Direct link to Defined in")

[values/value.ts:24](https://github.com/get-convex/convex-js/blob/main/src/values/value.ts#L24)

***

### GenericId[​](#genericid "Direct link to GenericId")

Ƭ **GenericId**<`TableName`>: `string` & { `__tableName`: `TableName` }

An identifier for a document in Convex.

Convex documents are uniquely identified by their `Id`, which is accessible on the `_id` field. To learn more, see [Document IDs](https://docs.convex.dev/database/document-ids).

Documents can be loaded using `db.get(tableName, id)` in query and mutation functions.

IDs are base 32 encoded strings which are URL safe.

IDs are just strings at runtime, but this type can be used to distinguish them from other strings at compile time.

If you're using code generation, use the `Id` type generated for your data model in `convex/_generated/dataModel.d.ts`.

#### Type parameters[​](#type-parameters-5 "Direct link to Type parameters")

| Name        | Type             | Description                                             |
| ----------- | ---------------- | ------------------------------------------------------- |
| `TableName` | extends `string` | A string literal type of the table name (like "users"). |

#### Defined in[​](#defined-in-13 "Direct link to Defined in")

[values/value.ts:52](https://github.com/get-convex/convex-js/blob/main/src/values/value.ts#L52)

***

### Value[​](#value "Direct link to Value")

Ƭ **Value**: `null` | `bigint` | `number` | `boolean` | `string` | `ArrayBuffer` | [`CommitTsPlaceholder`](/api/classes/values.CommitTsPlaceholder.md) | [`Value`](/api/modules/values.md#value)\[] | { `[key: string]`: `undefined` | [`Value`](/api/modules/values.md#value); }

A value supported by Convex.

Values can be:

* stored inside of documents.
* used as arguments and return types to queries and mutation functions.

You can see the full set of supported types at [Types](https://docs.convex.dev/using/types).

#### Defined in[​](#defined-in-14 "Direct link to Defined in")

[values/value.ts:66](https://github.com/get-convex/convex-js/blob/main/src/values/value.ts#L66)

***

### NumericValue[​](#numericvalue "Direct link to NumericValue")

Ƭ **NumericValue**: `bigint` | `number`

The types of [Value](/api/modules/values.md#value) that can be used to represent numbers.

#### Defined in[​](#defined-in-15 "Direct link to Defined in")

[values/value.ts:82](https://github.com/get-convex/convex-js/blob/main/src/values/value.ts#L82)

## Variables[​](#variables "Direct link to Variables")

### v[​](#v "Direct link to v")

• `Const` **v**: `Object`

The validator builder.

This builder allows you to build validators for Convex values. Validators are used in two places:

1. **Schema definitions** - to define the shape of documents in your tables.
2. **Function arguments and return values** - to validate inputs and outputs of your Convex queries, mutations, and actions.

Always include `args` and `returns` validators on all Convex functions. If a function doesn't return a value, use `returns: v.null()`.

**Convex type reference:**

| Convex Type | JS/TS Type    | Validator                    |
| ----------- | ------------- | ---------------------------- |
| Id          | `string`      | `v.id("tableName")`          |
| Null        | `null`        | `v.null()`                   |
| Float64     | `number`      | `v.number()`                 |
| Int64       | `bigint`      | `v.int64()`                  |
| Boolean     | `boolean`     | `v.boolean()`                |
| String      | `string`      | `v.string()`                 |
| Bytes       | `ArrayBuffer` | `v.bytes()`                  |
| Array       | `Array`       | `v.array(element)`           |
| Object      | `Object`      | `v.object({ field: value })` |
| Record      | `Record`      | `v.record(keys, values)`     |

**Modifiers and meta-types:**

* `v.union(member1, member2)` - a value matching at least one validator
* `v.literal("value")` - a specific literal string, number, bigint, or boolean
* `v.optional(validator)` - makes a property optional in an object (`T | undefined`)

**Important notes:**

* JavaScript's `undefined` is **not** a valid Convex value. Functions that return `undefined` or have no return will return `null` to the client. Objects with `undefined` values will strip those keys during serialization. For arrays, use an explicit `null` instead.
* `v.bigint()` is deprecated, use `v.int64()` instead.
* `v.map()` and `v.set()` are not supported. Use `v.array()` of tuples or `v.record()` as alternatives.

**`Example`**

```
import { v } from "convex/values";



// Use in function definition:

export const createUser = mutation({

  args: {

    name: v.string(),

    email: v.string(),

    age: v.optional(v.number()),

  },

  returns: v.id("users"),

  handler: async (ctx, args) => {

    return await ctx.db.insert("users", args);

  },

});
```

**`See`**

* <https://docs.convex.dev/database/types>
* <https://docs.convex.dev/functions/validation>

#### Type declaration[​](#type-declaration-1 "Direct link to Type declaration")

| Name       | Type                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`       | \<TableName>(`tableName`: `TableName`) => [`VId`](/api/classes/values.VId.md)<[`GenericId`](/api/modules/values.md#genericid)<`TableName`>, `"required"`>                                                                                                                                                                                                                                                                                    |
| `null`     | () => [`VNull`](/api/classes/values.VNull.md)<`null`, `"required"`>                                                                                                                                                                                                                                                                                                                                                                          |
| `number`   | () => [`VFloat64`](/api/classes/values.VFloat64.md)<`number`, `"required"`>                                                                                                                                                                                                                                                                                                                                                                  |
| `float64`  | () => [`VFloat64`](/api/classes/values.VFloat64.md)<`number`, `"required"`>                                                                                                                                                                                                                                                                                                                                                                  |
| `bigint`   | () => [`VInt64`](/api/classes/values.VInt64.md)<`bigint`, `"required"`>                                                                                                                                                                                                                                                                                                                                                                      |
| `int64`    | () => [`VInt64`](/api/classes/values.VInt64.md)<`bigint`, `"required"`>                                                                                                                                                                                                                                                                                                                                                                      |
| `commitTs` | () => [`VCommitTs`](/api/classes/values.VCommitTs.md)<`bigint` \| [`CommitTsPlaceholder`](/api/classes/values.CommitTsPlaceholder.md), `"required"`>                                                                                                                                                                                                                                                                                         |
| `boolean`  | () => [`VBoolean`](/api/classes/values.VBoolean.md)<`boolean`, `"required"`>                                                                                                                                                                                                                                                                                                                                                                 |
| `string`   | () => [`VString`](/api/classes/values.VString.md)<`string`, `"required"`>                                                                                                                                                                                                                                                                                                                                                                    |
| `bytes`    | () => [`VBytes`](/api/classes/values.VBytes.md)<`ArrayBuffer`, `"required"`>                                                                                                                                                                                                                                                                                                                                                                 |
| `literal`  | \<T>(`literal`: `T`) => [`VLiteral`](/api/classes/values.VLiteral.md)<`T`, `"required"`>                                                                                                                                                                                                                                                                                                                                                     |
| `array`    | \<T>(`element`: `T`) => [`VArray`](/api/classes/values.VArray.md)<`T`\[`"type"`]\[], `T`, `"required"`>                                                                                                                                                                                                                                                                                                                                      |
| `object`   | \<T>(`fields`: `T`) => [`VObject`](/api/classes/values.VObject.md)<[`Expand`](/api/modules/server.md#expand)<{ \[Property in string \| number \| symbol]?: Exclude\<Infer\<T\[Property]>, undefined> } & { \[Property in string \| number \| symbol]: Infer\<T\[Property]> }>, `T`, `"required"`, { \[Property in string \| number \| symbol]: Property \| \`${Property & string}.${T\[Property]\["fieldPaths"]}\` }\[keyof `T`] & `string`> |
| `record`   | \<Key, Value>(`keys`: `Key`, `values`: `Value`) => [`VRecord`](/api/classes/values.VRecord.md)<`Record`<[`Infer`](/api/modules/values.md#infer)<`Key`>, `Value`\[`"type"`]>, `Key`, `Value`, `"required"`, `string`>                                                                                                                                                                                                                         |
| `union`    | \<T>(...`members`: `T`) => [`VUnion`](/api/classes/values.VUnion.md)<`T`\[`number`]\[`"type"`], `T`, `"required"`, `T`\[`number`]\[`"fieldPaths"`]>                                                                                                                                                                                                                                                                                          |
| `any`      | () => [`VAny`](/api/classes/values.VAny.md)<`any`, `"required"`, `string`>                                                                                                                                                                                                                                                                                                                                                                   |
| `optional` | \<T>(`value`: `T`) => [`VOptional`](/api/modules/values.md#voptional)<`T`>                                                                                                                                                                                                                                                                                                                                                                   |
| `nullable` | \<T>(`value`: `T`) => [`VUnion`](/api/classes/values.VUnion.md)<`T` \| [`VNull`](/api/classes/values.VNull.md)<`null`, `"required"`>\[`"type"`], \[`T`, [`VNull`](/api/classes/values.VNull.md)<`null`, `"required"`>], `"required"`, `T` \| [`VNull`](/api/classes/values.VNull.md)<`null`, `"required"`>\[`"fieldPaths"`]>                                                                                                                 |

#### Defined in[​](#defined-in-16 "Direct link to Defined in")

[values/validator.ts:137](https://github.com/get-convex/convex-js/blob/main/src/values/validator.ts#L137)

## Functions[​](#functions "Direct link to Functions")

### compareValues[​](#comparevalues "Direct link to compareValues")

▸ **compareValues**(`k1`, `k2`): `number`

#### Parameters[​](#parameters "Direct link to Parameters")

| Name | Type                                                   |
| ---- | ------------------------------------------------------ |
| `k1` | `undefined` \| [`Value`](/api/modules/values.md#value) |
| `k2` | `undefined` \| [`Value`](/api/modules/values.md#value) |

#### Returns[​](#returns "Direct link to Returns")

`number`

#### Defined in[​](#defined-in-17 "Direct link to Defined in")

[values/compare.ts:4](https://github.com/get-convex/convex-js/blob/main/src/values/compare.ts#L4)

***

### getConvexSize[​](#getconvexsize "Direct link to getConvexSize")

▸ **getConvexSize**(`value`): `number`

Calculate the size in bytes of a Convex value.

This matches how Convex calculates document size for bandwidth tracking and size limit enforcement.

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name    | Type                                                   | Description               |
| ------- | ------------------------------------------------------ | ------------------------- |
| `value` | `undefined` \| [`Value`](/api/modules/values.md#value) | A Convex value to measure |

#### Returns[​](#returns-1 "Direct link to Returns")

`number`

The size in bytes

#### Defined in[​](#defined-in-18 "Direct link to Defined in")

[values/size.ts:40](https://github.com/get-convex/convex-js/blob/main/src/values/size.ts#L40)

***

### getDocumentSize[​](#getdocumentsize "Direct link to getDocumentSize")

▸ **getDocumentSize**(`value`, `options?`): `number`

Calculate the size of a document including system fields.

If your value already has \_id and \_creationTime fields, this will count them in the normal size calculation. Otherwise, it adds the constant overhead for system fields.

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name       | Type                                                        | Description                     |
| ---------- | ----------------------------------------------------------- | ------------------------------- |
| `value`    | `Record`<`string`, [`Value`](/api/modules/values.md#value)> | A Convex object (document body) |
| `options?` | `Object`                                                    | Options for size calculation    |

#### Returns[​](#returns-2 "Direct link to Returns")

`number`

The size in bytes

#### Defined in[​](#defined-in-19 "Direct link to Defined in")

[values/size.ts:159](https://github.com/get-convex/convex-js/blob/main/src/values/size.ts#L159)

***

### asObjectValidator[​](#asobjectvalidator-1 "Direct link to asObjectValidator")

▸ **asObjectValidator**<`V`>(`obj`): `V` extends [`Validator`](/api/modules/values.md#validator)<`any`, `any`, `any`> ? `V` : `V` extends [`PropertyValidators`](/api/modules/values.md#propertyvalidators) ? [`Validator`](/api/modules/values.md#validator)<[`ObjectType`](/api/modules/values.md#objecttype)<`V`>> : `never`

Coerce an object with validators as properties to a validator. If a validator is passed, return it.

#### Type parameters[​](#type-parameters-6 "Direct link to Type parameters")

| Name | Type                                                                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `V`  | extends [`PropertyValidators`](/api/modules/values.md#propertyvalidators) \| [`Validator`](/api/modules/values.md#validator)<`any`, `any`, `any`> |

#### Parameters[​](#parameters-3 "Direct link to Parameters")

| Name  | Type |
| ----- | ---- |
| `obj` | `V`  |

#### Returns[​](#returns-3 "Direct link to Returns")

`V` extends [`Validator`](/api/modules/values.md#validator)<`any`, `any`, `any`> ? `V` : `V` extends [`PropertyValidators`](/api/modules/values.md#propertyvalidators) ? [`Validator`](/api/modules/values.md#validator)<[`ObjectType`](/api/modules/values.md#objecttype)<`V`>> : `never`

#### Defined in[​](#defined-in-20 "Direct link to Defined in")

[values/validator.ts:42](https://github.com/get-convex/convex-js/blob/main/src/values/validator.ts#L42)

***

### jsonToConvex[​](#jsontoconvex "Direct link to jsonToConvex")

▸ **jsonToConvex**(`value`): [`Value`](/api/modules/values.md#value)

Parse a Convex value from its JSON representation.

This function will deserialize serialized Int64s to `BigInt`s, Bytes to `ArrayBuffer`s etc.

To learn more about Convex values, see [Types](https://docs.convex.dev/using/types).

#### Parameters[​](#parameters-4 "Direct link to Parameters")

| Name    | Type                                            | Description                                                                                                            |
| ------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `value` | [`JSONValue`](/api/modules/values.md#jsonvalue) | The JSON representation of a Convex value previously created with [convexToJson](/api/modules/values.md#convextojson). |

#### Returns[​](#returns-4 "Direct link to Returns")

[`Value`](/api/modules/values.md#value)

The JavaScript representation of the Convex value.

#### Defined in[​](#defined-in-21 "Direct link to Defined in")

[values/value.ts:233](https://github.com/get-convex/convex-js/blob/main/src/values/value.ts#L233)

***

### convexToJson[​](#convextojson "Direct link to convexToJson")

▸ **convexToJson**(`value`): [`JSONValue`](/api/modules/values.md#jsonvalue)

Convert a Convex value to its JSON representation.

Use [jsonToConvex](/api/modules/values.md#jsontoconvex) to recreate the original value.

To learn more about Convex values, see [Types](https://docs.convex.dev/using/types).

#### Parameters[​](#parameters-5 "Direct link to Parameters")

| Name    | Type                                    | Description                          |
| ------- | --------------------------------------- | ------------------------------------ |
| `value` | [`Value`](/api/modules/values.md#value) | A Convex value to convert into JSON. |

#### Returns[​](#returns-5 "Direct link to Returns")

[`JSONValue`](/api/modules/values.md#jsonvalue)

The JSON representation of `value`.

#### Defined in[​](#defined-in-22 "Direct link to Defined in")

[values/value.ts:484](https://github.com/get-convex/convex-js/blob/main/src/values/value.ts#L484)
