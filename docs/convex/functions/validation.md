# Argument and Return Value Validation

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Argument and return value validators ensure that [queries](/functions/query-functions.md), [mutations](/functions/mutation-functions.md), and [actions](/functions/actions.md) are called with the correct types of arguments and return the expected types of return values.

**This is important for security!** Without argument validation, a malicious user can call your public functions with unexpected arguments and cause surprising results. [TypeScript](/understanding/best-practices/typescript.md) alone won't help because TypeScript types aren't present at runtime. We recommend adding argument validation for all public functions in production apps. For non-public functions that are not called by clients, we recommend [internal functions](/functions/internal-functions.md) and optionally validation.

**Example:** [Argument Validation](https://github.com/get-convex/convex-demos/tree/main/args-validation)

## Adding validators[​](#adding-validators "Direct link to Adding validators")

To add argument validation to your functions, pass an object with `args` and `handler` properties to the `query`, `mutation` or `action` constructor. To add return value validation, use the `returns` property in this object:

convex/message.ts

```
import { mutation, query } from "./_generated/server";

import { v } from "convex/values";



export const send = mutation({

  args: {

    body: v.string(),

    author: v.string(),

  },

  returns: v.null(),

  handler: async (ctx, args) => {

    const { body, author } = args;

    await ctx.db.insert("messages", { body, author });

  },

});
```

If you define your function with an argument validator, there is no need to include [TypeScript](/understanding/best-practices/typescript.md) type annotations! The type of your function will be inferred automatically. Similarly, if you define a return value validator, the return type of your function will be inferred from the validator, and TypeScript will check that it matches the inferred return type of the `handler` function.

Unlike TypeScript, validation for an object will throw if the object contains properties that are not declared in the validator.

If the client supplies arguments not declared in `args`, or if the function returns a value that does not match the validator declared in `returns`. This is helpful to prevent bugs caused by mistyped names of arguments or returning more data than intended to a client.

Even `args: {}` is a helpful use of validators because TypeScript will show an error on the client if you try to pass any arguments to the function which doesn't expect them.

## Supported types[​](#supported-types "Direct link to Supported types")

All functions, both public and internal, can accept and return the following data types. Each type has a corresponding validator that can be accessed on the [`v`](/api/modules/values.md#v) object imported from `"convex/values"`.

The [database](/database/overview.md) can store the exact same set of [data types](/database/types.md).

Additionally you can also express type unions, literals, `any` types, and optional fields.

### Convex values[​](#convex-values "Direct link to Convex values")

Convex supports the following types of values:

| Convex Type | TS/JS Type                                                                                                                      | Example Usage          | Validator for [Argument Validation](/functions/validation.md) and [Schemas](/database/schemas.md) | `json` Format for [Export](/database/import-export/.md) | Notes                                                                                                                                                                                                                                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Id          | [Id](/database/document-ids.md) ([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)) | `doc._id`              | `v.id(tableName)`                                                                                 | string                                                  | See [Document IDs](/database/document-ids.md).                                                                                                                                                                                                                                                                                                         |
| Null        | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#null_type)                                       | `null`                 | `v.null()`                                                                                        | null                                                    | JavaScript's `undefined` is not a valid Convex value. Functions the return `undefined` or do not return will return `null` when called from a client. Use `null` instead.                                                                                                                                                                              |
| Int64       | [bigint](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#bigint_type)                                   | `3n`                   | `v.int64()`                                                                                       | string (base10)                                         | Int64s only support BigInts between -2^63 and 2^63-1. Convex supports `bigint`s in [most modern browsers](https://caniuse.com/bigint).                                                                                                                                                                                                                 |
| Float64     | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)                                   | `3.1`                  | `v.number()`                                                                                      | number / string                                         | Convex supports all IEEE-754 double-precision floating point numbers (such as NaNs). Inf and NaN are JSON serialized as strings.                                                                                                                                                                                                                       |
| Boolean     | [boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)                                 | `true`                 | `v.boolean()`                                                                                     | bool                                                    |                                                                                                                                                                                                                                                                                                                                                        |
| String      | [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)                                   | `"abc"`                | `v.string()`                                                                                      | string                                                  | Strings are stored as UTF-8 and must be valid Unicode sequences. Strings must be smaller than the 1MB total size limit when encoded as UTF-8.                                                                                                                                                                                                          |
| Bytes       | [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)                     | `new ArrayBuffer(8)`   | `v.bytes()`                                                                                       | string (base64)                                         | Convex supports first class bytestrings, passed in as `ArrayBuffer`s. Bytestrings must be smaller than the 1MB total size limit for Convex types.                                                                                                                                                                                                      |
| CommitTs    | [bigint](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#bigint_type) or `CommitTsPlaceholder`          | `db.vars.commitTs`     | `v.commitTs()`                                                                                    | string (base10)                                         | Either an Int64 commit timestamp or a placeholder. See [Commit Timestamp](/database/advanced/commit-timestamp.md).                                                                                                                                                                                                                                     |
| Array       | [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)                                 | `[1, 3.2, "abc"]`      | `v.array(values)`                                                                                 | array                                                   | Arrays can have at most 8192 values.                                                                                                                                                                                                                                                                                                                   |
| Object      | [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#objects)                                       | `{a: "abc"}`           | `v.object({property: value})`                                                                     | object                                                  | Convex only supports "plain old JavaScript objects" (objects that do not have a custom prototype). Convex includes all [enumerable properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties). Objects can have at most 1024 entries. Field names must be nonempty and not start with "$" or "\_". |
| Record      | [Record](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)                                       | `{"a": "1", "b": "2"}` | `v.record(keys, values)`                                                                          | object                                                  | Records are objects at runtime, but can have dynamic keys. Keys must be only ASCII characters, nonempty, and not start with "$" or "\_".                                                                                                                                                                                                               |

### Unions[​](#unions "Direct link to Unions")

You can describe fields that could be one of multiple types using `v.union`:

```
import { mutation } from "./_generated/server";

import { v } from "convex/values";



export default mutation({

  args: {

    stringOrNull: v.union(v.string(), v.null()),

  },

  handler: async (ctx, { stringOrNull }) => {

    //...

  },

});
```

For convenience, `v.nullable(foo)` is equivalent to `v.union(foo, v.null())`.

### Literals[​](#literals "Direct link to Literals")

Fields that are a constant can be expressed with `v.literal`. This is especially useful when combined with unions:

```
import { mutation } from "./_generated/server";

import { v } from "convex/values";



export default mutation({

  args: {

    oneTwoOrThree: v.union(

      v.literal("one"),

      v.literal("two"),

      v.literal("three"),

    ),

  },

  handler: async (ctx, { oneTwoOrThree }) => {

    //...

  },

});
```

### Record objects[​](#record-objects "Direct link to Record objects")

You can describe objects that map arbitrary keys to values with `v.record`:

```
import { mutation } from "./_generated/server";

import { v } from "convex/values";



export default mutation({

  args: {

    simpleMapping: v.record(v.string(), v.boolean()),

  },

  handler: async (ctx, { simpleMapping }) => {

    //...

  },

});
```

You can use other types of string validators for the keys:

```
defineTable({

  userIdToValue: v.record(v.id("users"), v.boolean()),

});
```

Notes:

* This type corresponds to the [Record\<K,V>](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) type in TypeScript.
* You cannot use string literals as a `record` key.
* Using `v.string()` as a `record` key validator will only allow ASCII characters.

### Any[​](#any "Direct link to Any")

Fields that could take on any value can be represented with `v.any()`:

```
import { mutation } from "./_generated/server";

import { v } from "convex/values";



export default mutation({

  args: {

    anyValue: v.any(),

  },

  handler: async (ctx, { anyValue }) => {

    //...

  },

});
```

This corresponds to the `any` type in TypeScript.

### Optional fields[​](#optional-fields "Direct link to Optional fields")

You can describe optional fields by wrapping their type with `v.optional(...)`:

```
import { mutation } from "./_generated/server";

import { v } from "convex/values";



export default mutation({

  args: {

    optionalString: v.optional(v.string()),

    optionalNumber: v.optional(v.number()),

  },

  handler: async (ctx, { optionalString, optionalNumber }) => {

    //...

  },

});
```

This corresponds to marking fields as optional with `?` in TypeScript.

## Extracting TypeScript types[​](#extracting-typescript-types "Direct link to Extracting TypeScript types")

The [`Infer`](/api/modules/values.md#infer) type allows you to turn validator calls into TypeScript types. This can be useful to remove duplication between your validators and TypeScript types:

```
import { mutation } from "./_generated/server";

import { Infer, v } from "convex/values";



const nestedObject = v.object({

  property: v.string(),

});



// Resolves to `{property: string}`.

export type NestedObject = Infer<typeof nestedObject>;



export default mutation({

  args: {

    nested: nestedObject,

  },

  handler: async (ctx, { nested }) => {

    //...

  },

});
```

### Reusing and extending validators[​](#reusing-and-extending-validators "Direct link to Reusing and extending validators")

Validators can be defined once and shared between functions and table schemas.

```
const statusValidator = v.union(v.literal("active"), v.literal("inactive"));



const userValidator = v.object({

  name: v.string(),

  email: v.email(),

  status: statusValidator,

  profileUrl: v.optional(v.string()),

});



const schema = defineSchema({

  users: defineTable(userValidator).index("by_email", ["email"]),

});
```

You can create new object validators from existing ones by adding or removing fields using `.pick`, `.omit`, `.extend`, and `.partial` on object validators.

```
// Creates a new validator with only the name and profileUrl fields.

const publicUser = userValidator.pick("name", "profileUrl");



// Creates a new validator with all fields except the specified fields.

const userWithoutStatus = userValidator.omit("status", "profileUrl");



// Creates a validator where all fields are optional.

// This is useful for validating patches to a document.

const userPatch = userWithoutStatus.partial();



// Creates a new validator with an extra field added.

const userWithFriends = userValidator.extend({

  friends: v.array(schema.id("users")),

});
```

To validate whole documents of a table, use `schema.doc(tableName)`, which is that table's validator with the `_id` and `_creationTime` system fields added. `schema.id(tableName)` is `v.id(tableName)` restricted to the table names in your schema, for a type-safe alternative to `v.id`.

```
export const getUserById = query({

  args: { id: schema.id("users") },

  returns: v.union(schema.doc("users"), v.null()),

  handler: async (ctx, { id }) => {

    return await ctx.db.get("users", id);

  },

});
```

For a table defined with a union, `schema.doc` adds the system fields to each member of the union.

Notes:

* Object validators don't allow extra properties, objects with properties that aren't specified will fail validation.
* Top-level table fields cannot start with `_` because they are reserved for system fields like `_id` and `_creationTime`.
