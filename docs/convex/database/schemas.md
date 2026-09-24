# Schemas

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

A schema is a description of

1. the tables in your Convex project
2. the type of documents within your tables

While it is possible to use Convex *without* defining a schema, adding a `schema.ts` file will ensure that the documents in your tables are the correct type. If you're using [TypeScript](/understanding/best-practices/typescript.md), adding a schema will also give you end-to-end type safety throughout your app.

We recommend beginning your project without a schema for rapid prototyping and then adding a schema once you've solidified your plan. To learn more see our [Schema Philosophy](/database/advanced/schema-philosophy.md).

**Example:** [TypeScript and Schemas](https://github.com/get-convex/convex-demos/tree/main/typescript)

## Writing schemas[​](#writing-schemas "Direct link to Writing schemas")

Schemas are defined in a `schema.ts` file in your `convex/` directory and look like:

convex/schema.ts

```
import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";



export default defineSchema({

  messages: defineTable({

    body: v.string(),

    user: v.id("users"),

  }),

  users: defineTable({

    name: v.string(),

    tokenIdentifier: v.string(),

  }).index("by_token", ["tokenIdentifier"]),

});
```

This schema (which is based on our [users and auth example](https://github.com/get-convex/convex-demos/tree/main/users-and-auth)), has 2 tables: messages and users. Each table is defined using the [`defineTable`](/api/modules/server.md#definetable) function. Within each table, the document type is defined using the validator builder, [`v`](/api/modules/values.md#v). In addition to the fields listed, Convex will also automatically add `_id` and `_creationTime` fields. To learn more, see [System Fields](/database/types.md#system-fields).

Generating a Schema

While writing your schema, it can be helpful to consult the [Convex Dashboard](/dashboard/deployments/schema.md). The "View schema file" panel on the "Schema" page can generate a schema declaration based on the data in your tables.

### Validators[​](#validators "Direct link to Validators")

The validator builder, [`v`](/api/modules/values.md#v) is used to define the type of documents in each table. It has methods for each of [Convex's types](/database/types.md):

convex/schema.ts

```
import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";



export default defineSchema({

  documents: defineTable({

    id: v.id("documents"),

    string: v.string(),

    number: v.number(),

    boolean: v.boolean(),

    commitTs: v.commitTs(),

    nestedObject: v.object({

      property: v.string(),

    }),

  }),

});
```

It additionally allows you to define unions, optional property, string literals, and more. [Argument validation](/functions/validation.md) and schemas both use the same validator builder, `v`.

#### Optional fields[​](#optional-fields "Direct link to Optional fields")

You can describe optional fields by wrapping their type with `v.optional(...)`:

```
defineTable({

  optionalString: v.optional(v.string()),

  optionalNumber: v.optional(v.number()),

});
```

This corresponds to marking fields as optional with `?` in TypeScript.

#### Unions[​](#unions "Direct link to Unions")

You can describe fields that could be one of multiple types using `v.union`:

```
defineTable({

  stringOrNumber: v.union(v.string(), v.number()),

});
```

If your table stores multiple different types of documents, you can use `v.union` at the top level:

```
defineTable(

  v.union(

    v.object({

      kind: v.literal("StringDocument"),

      value: v.string(),

    }),

    v.object({

      kind: v.literal("NumberDocument"),

      value: v.number(),

    }),

  ),

);
```

In this schema, documents either have a `kind` of `"StringDocument"` and a string for their `value`:

```
{

  "kind": "StringDocument",

  "value": "abc"

}
```

or they have a `kind` of `"NumberDocument"` and a number for their `value`:

```
{

  "kind": "NumberDocument",

  "value": 123

}
```

#### Literals[​](#literals "Direct link to Literals")

Fields that are a constant can be expressed with `v.literal`:

```
defineTable({

  oneTwoOrThree: v.union(

    v.literal("one"),

    v.literal("two"),

    v.literal("three"),

  ),

});
```

#### Record objects[​](#record-objects "Direct link to Record objects")

You can describe objects that map arbitrary keys to values with `v.record`:

```
defineTable({

  simpleMapping: v.record(v.string(), v.boolean()),

});
```

You can use other types of string validators for the keys:

```
import { mutation } from "./_generated/server";

import { v } from "convex/values";



export default mutation({

  args: {

    userIdToValue: v.record(v.id("users"), v.boolean()),

  },

  handler: async ({ db }, { userIdToValue }) => {

    //...

  },

});
```

Notes:

* This type corresponds to the [Record\<K,V>](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) type in TypeScript
* You cannot use string literals as a `record` key
* Using `v.string()` as a `record` key validator will only allow ASCII characters

#### Any[​](#any "Direct link to Any")

Fields or documents that could take on any value can be represented with `v.any()`:

```
defineTable({

  anyValue: v.any(),

});
```

This corresponds to the `any` type in TypeScript.

### Options[​](#options "Direct link to Options")

These options are passed as part of the [options](/api/interfaces/server.DefineSchemaOptions.md) argument to [`defineSchema`](/api/modules/server.md#defineschema).

#### `schemaValidation: boolean`[​](#schemavalidation-boolean "Direct link to schemavalidation-boolean")

Whether Convex should validate at runtime that your documents match your schema.

By default, Convex will enforce that all new and existing documents match your schema.

You can disable `schemaValidation` by passing in `schemaValidation: false`:

```
defineSchema(

  {

    // Define tables here.

  },

  {

    schemaValidation: false,

  },

);
```

When `schemaValidation` is disabled, Convex will not validate that new or existing documents match your schema. You'll still get schema-specific TypeScript types, but there will be no validation at runtime that your documents match those types.

#### `strictTableNameTypes: boolean`[​](#stricttablenametypes-boolean "Direct link to stricttablenametypes-boolean")

Whether the TypeScript types should allow accessing tables not in the schema.

By default, the TypeScript table name types produced by your schema are strict. That means that they will be a union of strings (ex. `"messages" | "users"`) and only support accessing tables explicitly listed in your schema.

Sometimes it's useful to only define part of your schema. For example, if you are rapidly prototyping, it could be useful to try out a new table before adding it your `schema.ts` file.

You can disable `strictTableNameTypes` by passing in `strictTableNameTypes: false`:

```
defineSchema(

  {

    // Define tables here.

  },

  {

    strictTableNameTypes: false,

  },

);
```

When `strictTableNameTypes` is disabled, the TypeScript types will allow access to tables not listed in the schema and their document type will be `any`.

Regardless of the value of `strictTableNameTypes`, your schema will only validate documents in the tables listed in the schema. You can still create and modify documents in other tables in JavaScript or on the dashboard (they just won't be validated).

## Schema validation[​](#schema-validation "Direct link to Schema validation")

Schemas are pushed automatically in [`npx convex dev`](/cli/reference/dev.md) and [`npx convex deploy`](/cli/reference/deploy.md).

The first push after a schema is added or modified will validate that all existing documents match the schema. If there are documents that fail validation, the push will fail.

After the schema is pushed, Convex will validate that all future document inserts and updates match the schema.

Schema validation is skipped if [`schemaValidation`](#schemavalidation-boolean) is set to `false`.

Note that schemas only validate documents in the tables listed in the schema. You can still create and modify documents in other tables (they just won't be validated).

### Circular references[​](#circular-references "Direct link to Circular references")

You might want to define a schema with circular ID references like:

convex/schema.ts

```
import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";



export default defineSchema({

  users: defineTable({

    preferencesId: v.id("preferences"),

  }),

  preferences: defineTable({

    userId: v.id("users"),

  }),

});
```

In this schema, documents in the `users` table contain a reference to documents in `preferences` and vice versa.

Because schema validation enforces your schema on every `db.insert`, `db.replace`, and `db.patch` call, creating circular references like this is not possible.

The easiest way around this is to make one of the references nullable:

convex/schema.ts

```
import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";



export default defineSchema({

  users: defineTable({

    preferencesId: v.id("preferences"),

  }),

  preferences: defineTable({

    userId: v.union(v.id("users"), v.null()),

  }),

});
```

This way you can create a preferences document first, then create a user document, then set the reference on the preferences document:

convex/users.ts

```
import { mutation } from "./_generated/server";



export default mutation({

  handler: async (ctx) => {

    const preferencesId = await ctx.db.insert("preferences", {});

    const userId = await ctx.db.insert("users", { preferencesId });

    await ctx.db.patch("preferences", preferencesId, { userId });

  },

});
```

[Let us know](/production/contact.md) if you need better support for circular references.

## TypeScript types[​](#typescript-types "Direct link to TypeScript types")

Once you've defined a schema, [`npx convex dev`](/cli/reference/dev.md) will produce new versions of [`dataModel.d.ts`](/generated-api/data-model.md) and [`server.d.ts`](/generated-api/server.md) with types based on your schema.

### `Doc<TableName>`[​](#doctablename "Direct link to doctablename")

The [`Doc`](/generated-api/data-model.md#doc) TypeScript type from [`dataModel.d.ts`](/generated-api/data-model.md) provides document types for all of your tables. You can use these both when writing Convex functions and in your React components:

MessageView\.tsx

```
import { Doc } from "../convex/_generated/dataModel";



function MessageView(props: { message: Doc<"messages"> }) {

  ...

}
```

If you need the type for a portion of a document, use the [`Infer` type helper](/functions/validation.md#extracting-typescript-types).

### `query` and `mutation`[​](#query-and-mutation "Direct link to query-and-mutation")

The [`query`](/generated-api/server.md#query) and [`mutation`](/generated-api/server.md#mutation) functions in [`server.js`](/generated-api/server.md) have the same API as before but now provide a `db` with more precise types. Functions like [`db.insert(table, document)`](/api/interfaces/server.GenericDatabaseWriter.md#insert) now understand your schema. Additionally [database queries](/database/reading-data/.md) will now return the correct document type (not `any`).

Related posts from

<!-- -->

[![Stack](/img/stack-logo-dark.svg)![Stack](/img/stack-logo-light.svg)](https://stack.convex.dev/)
