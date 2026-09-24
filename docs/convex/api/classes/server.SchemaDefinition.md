# Class: SchemaDefinition\<Schema, StrictTableTypes>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).SchemaDefinition

The definition of a Convex project schema.

This should be produced by using [defineSchema](/api/modules/server.md#defineschema).

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name               | Type                                                            |
| ------------------ | --------------------------------------------------------------- |
| `Schema`           | extends [`GenericSchema`](/api/modules/server.md#genericschema) |
| `StrictTableTypes` | extends `boolean`                                               |

## Properties[​](#properties "Direct link to Properties")

### tables[​](#tables "Direct link to tables")

• **tables**: `Schema`

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/schema.ts:873](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L873)

***

### strictTableNameTypes[​](#stricttablenametypes "Direct link to strictTableNameTypes")

• **strictTableNameTypes**: `StrictTableTypes`

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/schema.ts:874](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L874)

***

### schemaValidation[​](#schemavalidation "Direct link to schemaValidation")

• `Readonly` **schemaValidation**: `boolean`

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/schema.ts:875](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L875)

## Methods[​](#methods "Direct link to Methods")

### doc[​](#doc "Direct link to doc")

▸ **doc**<`TableName`>(`tableName`): [`DocValidator`](/api/modules/server.md#docvalidator)<`TableName`, `Schema`\[`TableName`]\[`"validator"`]>

The validator for whole documents of a table in this schema: the table's own validator with the `_id` and `_creationTime` system fields added.

**`Example`**

```
export const get = query({

  args: { id: schema.id("messages") },

  returns: v.union(schema.doc("messages"), v.null()),

  handler: (ctx, args) => ctx.db.get(args.id),

});
```

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name        | Type             |
| ----------- | ---------------- |
| `TableName` | extends `string` |

#### Parameters[​](#parameters "Direct link to Parameters")

| Name        | Type        | Description                         |
| ----------- | ----------- | ----------------------------------- |
| `tableName` | `TableName` | The name of a table in this schema. |

#### Returns[​](#returns "Direct link to Returns")

[`DocValidator`](/api/modules/server.md#docvalidator)<`TableName`, `Schema`\[`TableName`]\[`"validator"`]>

A validator matching documents of that table.

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/schema.ts:902](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L902)

***

### id[​](#id "Direct link to id")

▸ **id**<`TableName`>(`tableName`): [`VId`](/api/classes/values.VId.md)<[`GenericId`](/api/modules/values.md#genericid)<`TableName`>, `"required"`>

The validator for IDs of a table in this schema.

Same as `v.id(tableName)`, but only accepts tables in this schema.

#### Type parameters[​](#type-parameters-2 "Direct link to Type parameters")

| Name        | Type             |
| ----------- | ---------------- |
| `TableName` | extends `string` |

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name        | Type        | Description                         |
| ----------- | ----------- | ----------------------------------- |
| `tableName` | `TableName` | The name of a table in this schema. |

#### Returns[​](#returns-1 "Direct link to Returns")

[`VId`](/api/classes/values.VId.md)<[`GenericId`](/api/modules/values.md#genericid)<`TableName`>, `"required"`>

A validator matching IDs of that table.

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[server/schema.ts:916](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L916)
