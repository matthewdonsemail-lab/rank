# Interface: ValidatedFunction\<Ctx, ArgsValidator, Returns>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).ValidatedFunction

**`Deprecated`**

\-- See the type definition for `MutationBuilder` or similar for the types used for defining Convex functions.

The definition of a Convex query, mutation, or action function with argument validation.

Argument validation allows you to assert that the arguments to this function are the expected type.

Example:

```
import { query } from "./_generated/server";

import { v } from "convex/values";



export const func = query({

  args: {

    arg: v.string()

  },

  handler: ({ db }, { arg }) => {...},

});
```

**For security, argument validation should be added to all public functions in production apps.**

See [UnvalidatedFunction](/api/modules/server.md#unvalidatedfunction) for functions without argument validation.

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name            | Type                                                                      |
| --------------- | ------------------------------------------------------------------------- |
| `Ctx`           | `Ctx`                                                                     |
| `ArgsValidator` | extends [`PropertyValidators`](/api/modules/values.md#propertyvalidators) |
| `Returns`       | `Returns`                                                                 |

## Properties[​](#properties "Direct link to Properties")

### args[​](#args "Direct link to args")

• **args**: `ArgsValidator`

A validator for the arguments of this function.

This is an object mapping argument names to validators constructed with [v](/api/modules/values.md#v).

```
import { v } from "convex/values";



const args = {

  stringArg: v.string(),

  optionalNumberArg: v.optional(v.number()),

}
```

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/registration.ts:697](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L697)

***

### handler[​](#handler "Direct link to handler")

• **handler**: (`ctx`: `Ctx`, `args`: [`ObjectType`](/api/modules/values.md#objecttype)<`ArgsValidator`>) => `Returns`

#### Type declaration[​](#type-declaration "Direct link to Type declaration")

▸ (`ctx`, `args`): `Returns`

The implementation of this function.

This is a function that takes in the appropriate context and arguments and produces some result.

##### Parameters[​](#parameters "Direct link to Parameters")

| Name   | Type                                                               | Description                                                                                            |
| ------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `ctx`  | `Ctx`                                                              | The context object. This is one of QueryCtx, MutationCtx, or ActionCtx depending on the function type. |
| `args` | [`ObjectType`](/api/modules/values.md#objecttype)<`ArgsValidator`> | The arguments object for this function. This will match the type defined by the argument validator.    |

##### Returns[​](#returns "Direct link to Returns")

`Returns`

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/registration.ts:711](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L711)
