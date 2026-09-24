# Interface: DefineSchemaOptions\<StrictTableNameTypes>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).DefineSchemaOptions

Options for [defineSchema](/api/modules/server.md#defineschema).

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name                   | Type              |
| ---------------------- | ----------------- |
| `StrictTableNameTypes` | extends `boolean` |

## Properties[​](#properties "Direct link to Properties")

### schemaValidation[​](#schemavalidation "Direct link to schemaValidation")

• `Optional` **schemaValidation**: `boolean`

Whether Convex should validate at runtime that all documents match your schema.

If `schemaValidation` is `true`, Convex will:

1. Check that all existing documents match your schema when your schema is pushed.
2. Check that all insertions and updates match your schema during mutations.

If `schemaValidation` is `false`, Convex will not validate that new or existing documents match your schema. You'll still get schema-specific TypeScript types, but there will be no validation at runtime that your documents match those types.

By default, `schemaValidation` is `true`.

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/schema.ts:981](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L981)

***

### strictTableNameTypes[​](#stricttablenametypes "Direct link to strictTableNameTypes")

• `Optional` **strictTableNameTypes**: `StrictTableNameTypes`

Whether the TypeScript types should allow accessing tables not in the schema.

If `strictTableNameTypes` is `true`, using tables not listed in the schema will generate a TypeScript compilation error.

If `strictTableNameTypes` is `false`, you'll be able to access tables not listed in the schema and their document type will be `any`.

`strictTableNameTypes: false` is useful for rapid prototyping.

Regardless of the value of `strictTableNameTypes`, your schema will only validate documents in the tables listed in the schema. You can still create and modify other tables on the dashboard or in JavaScript mutations.

By default, `strictTableNameTypes` is `true`.

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/schema.ts:1000](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L1000)
