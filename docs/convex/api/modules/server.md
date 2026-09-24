# Module: server

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Utilities for implementing server-side Convex query and mutation functions.

## Usage[​](#usage "Direct link to Usage")

### Code Generation[​](#code-generation "Direct link to Code Generation")

This module is typically used alongside generated server code.

To generate the server code, run `npx convex dev` in your Convex project. This will create a `convex/_generated/server.js` file with the following functions, typed for your schema:

* [query](https://docs.convex.dev/generated-api/server#query)
* [mutation](https://docs.convex.dev/generated-api/server#mutation)

If you aren't using TypeScript and code generation, you can use these untyped functions instead:

* [queryGeneric](/api/modules/server.md#querygeneric)
* [mutationGeneric](/api/modules/server.md#mutationgeneric)

### Example[​](#example "Direct link to Example")

Convex functions are defined by using either the `query` or `mutation` wrappers.

Queries receive a `db` that implements the [GenericDatabaseReader](/api/interfaces/server.GenericDatabaseReader.md) interface.

```
import { query } from "./_generated/server";



export default query({

  handler: async ({ db }, { arg1, arg2 }) => {

    // Your (read-only) code here!

  },

});
```

If your function needs to write to the database, such as inserting, updating, or deleting documents, use `mutation` instead which provides a `db` that implements the [GenericDatabaseWriter](/api/interfaces/server.GenericDatabaseWriter.md) interface.

```
import { mutation } from "./_generated/server";



export default mutation({

  handler: async ({ db }, { arg1, arg2 }) => {

    // Your mutation code here!

  },

});
```

## Classes[​](#classes "Direct link to Classes")

* [Crons](/api/classes/server.Crons.md)
* [Expression](/api/classes/server.Expression.md)
* [IndexRange](/api/classes/server.IndexRange.md)
* [HttpRouter](/api/classes/server.HttpRouter.md)
* [TableDefinition](/api/classes/server.TableDefinition.md)
* [SchemaDefinition](/api/classes/server.SchemaDefinition.md)
* [SearchFilter](/api/classes/server.SearchFilter.md)
* [FilterExpression](/api/classes/server.FilterExpression.md)

## Interfaces[​](#interfaces "Direct link to Interfaces")

* [UserIdentity](/api/interfaces/server.UserIdentity.md)
* [Auth](/api/interfaces/server.Auth.md)
* [CronJob](/api/interfaces/server.CronJob.md)
* [BaseTableReader](/api/interfaces/server.BaseTableReader.md)
* [GenericDatabaseReader](/api/interfaces/server.GenericDatabaseReader.md)
* [GenericDatabaseReaderWithTable](/api/interfaces/server.GenericDatabaseReaderWithTable.md)
* [GenericDatabaseWriter](/api/interfaces/server.GenericDatabaseWriter.md)
* [GenericDatabaseWriterWithTable](/api/interfaces/server.GenericDatabaseWriterWithTable.md)
* [BaseTableWriter](/api/interfaces/server.BaseTableWriter.md)
* [FilterBuilder](/api/interfaces/server.FilterBuilder.md)
* [IndexRangeBuilder](/api/interfaces/server.IndexRangeBuilder.md)
* [TransactionLimits](/api/interfaces/server.TransactionLimits.md)
* [QueryMeta](/api/interfaces/server.QueryMeta.md)
* [MutationMeta](/api/interfaces/server.MutationMeta.md)
* [ActionMeta](/api/interfaces/server.ActionMeta.md)
* [PaginationResult](/api/interfaces/server.PaginationResult.md)
* [PaginationOptions](/api/interfaces/server.PaginationOptions.md)
* [QueryInitializer](/api/interfaces/server.QueryInitializer.md)
* [Query](/api/interfaces/server.Query.md)
* [OrderedQuery](/api/interfaces/server.OrderedQuery.md)
* [GenericMutationCtx](/api/interfaces/server.GenericMutationCtx.md)
* [GenericQueryCtx](/api/interfaces/server.GenericQueryCtx.md)
* [GenericActionCtx](/api/interfaces/server.GenericActionCtx.md)
* [ValidatedFunction](/api/interfaces/server.ValidatedFunction.md)
* [AdvancedRunQueryOptions](/api/interfaces/server.AdvancedRunQueryOptions.md)
* [Scheduler](/api/interfaces/server.Scheduler.md)
* [SearchIndexConfig](/api/interfaces/server.SearchIndexConfig.md)
* [VectorIndexConfig](/api/interfaces/server.VectorIndexConfig.md)
* [DefineSchemaOptions](/api/interfaces/server.DefineSchemaOptions.md)
* [SystemDataModel](/api/interfaces/server.SystemDataModel.md)
* [SearchFilterBuilder](/api/interfaces/server.SearchFilterBuilder.md)
* [SearchFilterFinalizer](/api/interfaces/server.SearchFilterFinalizer.md)
* [StorageReader](/api/interfaces/server.StorageReader.md)
* [StorageWriter](/api/interfaces/server.StorageWriter.md)
* [StorageActionWriter](/api/interfaces/server.StorageActionWriter.md)
* [VectorSearchQuery](/api/interfaces/server.VectorSearchQuery.md)
* [VectorFilterBuilder](/api/interfaces/server.VectorFilterBuilder.md)

## References[​](#references "Direct link to References")

### UserIdentityAttributes[​](#useridentityattributes "Direct link to UserIdentityAttributes")

Re-exports [UserIdentityAttributes](/api/modules/browser.md#useridentityattributes)

## Type Aliases[​](#type-aliases "Direct link to Type Aliases")

### FunctionType[​](#functiontype "Direct link to FunctionType")

Ƭ **FunctionType**: `"query"` | `"mutation"` | `"action"`

The type of a Convex function.

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/api.ts:19](https://github.com/get-convex/convex-js/blob/main/src/server/api.ts#L19)

***

### FunctionReference[​](#functionreference "Direct link to FunctionReference")

Ƭ **FunctionReference**<`Type`, `Visibility`, `Args`, `ReturnType`, `ComponentPath`>: `Object`

A reference to a registered Convex function.

You can create a [FunctionReference](/api/modules/server.md#functionreference) using the generated `api` utility:

```
import { api } from "../convex/_generated/api";



const reference = api.myModule.myFunction;
```

If you aren't using code generation, you can create references using [anyApi](/api/modules/server.md#anyapi-1):

```
import { anyApi } from "convex/server";



const reference = anyApi.myModule.myFunction;
```

Function references can be used to invoke functions from the client. For example, in React you can pass references to the [useQuery](/api/modules/react.md#usequery) hook:

```
const result = useQuery(api.myModule.myFunction);
```

If you want to accept a `FunctionReference` as a callback argument, prefer typing the callback parameter as [FunctionReference\_future](/api/modules/server.md#functionreference_future).

#### Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name            | Type                                                                                   | Description                                                                              |
| --------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `Type`          | extends [`FunctionType`](/api/modules/server.md#functiontype)                          | The type of the function ("query", "mutation", or "action").                             |
| `Visibility`    | extends [`FunctionVisibility`](/api/modules/server.md#functionvisibility) = `"public"` | The visibility of the function ("public" or "internal").                                 |
| `Args`          | extends [`DefaultFunctionArgs`](/api/modules/server.md#defaultfunctionargs) = `any`    | The arguments to this function. This is an object mapping argument names to their types. |
| `ReturnType`    | `any`                                                                                  | The return type of this function.                                                        |
| `ComponentPath` | `string` \| `undefined`                                                                | -                                                                                        |

#### Type declaration[​](#type-declaration "Direct link to Type declaration")

| Name             | Type                                                                         | Description                                                                                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_type`          | `Type`                                                                       | -                                                                                                                                                                                              |
| `_visibility`    | `Visibility`                                                                 | -                                                                                                                                                                                              |
| `_args`          | `Args`                                                                       | To read the arguments for a `FunctionReference`, prefer [FunctionArgs](/api/modules/server.md#functionargs). This slot will be removed in a future version. **`Deprecated`**                   |
| `_returnType`    | `ReturnType`                                                                 | To read the return type of a `FunctionReference`, prefer [FunctionReturnType](/api/modules/server.md#functionreturntype). This slot will be removed in a future version. **`Deprecated`**      |
| `_componentPath` | `ComponentPath`                                                              | -                                                                                                                                                                                              |
| `_fn?`           | (`args`: `Args`, `keys`: `FunctionReferenceArgKeys`<`Args`>) => `ReturnType` | To read the arguments or return type of a `FunctionReference`, prefer [FunctionArgs](/api/modules/server.md#functionargs) and [FunctionReturnType](/api/modules/server.md#functionreturntype). |

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/api.ts:55](https://github.com/get-convex/convex-js/blob/main/src/server/api.ts#L55)

***

### FunctionReference\_future[​](#functionreference_future "Direct link to FunctionReference_future")

Ƭ **FunctionReference\_future**<`Type`, `Visibility`, `Args`, `ReturnType`, `ComponentPath`>: `Object`

A reference to a Convex function whose arguments are checked closer to the way Convex checks them at runtime.

Use this instead of [FunctionReference](/api/modules/server.md#functionreference) when you accept someone else's Convex function as a callback and know which arguments you will pass it.

A plain `FunctionReference` gets a couple things backwards: it accepts a function requiring arguments you never pass, and rejects a function accepting broader values than you pass. An ordinary TypeScript function type doesn't map perfectly either: it treats a surplus argument as harmless, where a Convex validator rejects it.

This type melds regular TypeScript function reference behavior with top level checking of arguments to prevent surplus arguments from hitting runtime validation errors. The caveat: a surplus key inside a nested object, an array element, or one arm of a union passes the type check and fails the validator at runtime.

```
import { FunctionReference_future } from "convex/server";



declare function onComplete(

  fn: FunctionReference_future<

    "mutation",

    "internal",

    { taskId: string; force: boolean },

    null

  >,

): void;



// Takes exactly `{ taskId: string; force: boolean }`.

onComplete(internal.tasks.finish);

// Takes `{ taskId: string | number; force?: boolean }`: calling it is safe.

onComplete(internal.tasks.finishLoosely);

// Requires a `reason` argument that `onComplete` never passes.

onComplete(internal.tasks.finishWithReason);

//          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ rejected

// Takes only `{ taskId: string }`: its validator would reject `force`.

onComplete(internal.tasks.finishById);

//          ~~~~~~~~~~~~~~~~~~~~~~~~ rejected
```

A value of this type is usable with `ctx.runMutation`, `ctx.scheduler.runAfter`, `createFunctionHandle`, and everything else in this package that takes a reference, all of which accept either kind.

It is *not* assignable to a plain `FunctionReference`. Code that wants to accept both kinds should take `FunctionReference<...> | FunctionReference_future<...>` and read arguments and return types through [FunctionArgs](/api/modules/server.md#functionargs) and [FunctionReturnType](/api/modules/server.md#functionreturntype).

Argument checking here relies on `strictFunctionTypes` (implied by `strict`) and is skipped for projects that disable it. Everything else about the reference is compared exactly as `FunctionReference` compares it.

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name            | Type                                                                                   | Description                                                  |
| --------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `Type`          | extends [`FunctionType`](/api/modules/server.md#functiontype)                          | The type of the function ("query", "mutation", or "action"). |
| `Visibility`    | extends [`FunctionVisibility`](/api/modules/server.md#functionvisibility) = `"public"` | The visibility of the function ("public" or "internal").     |
| `Args`          | extends [`DefaultFunctionArgs`](/api/modules/server.md#defaultfunctionargs) = `any`    | The arguments the consumer of the reference will pass.       |
| `ReturnType`    | `any`                                                                                  | The return type of this function.                            |
| `ComponentPath` | `string` \| `undefined`                                                                | -                                                            |

#### Type declaration[​](#type-declaration-1 "Direct link to Type declaration")

| Name             | Type                                                                                |
| ---------------- | ----------------------------------------------------------------------------------- |
| `_type`          | `Type`                                                                              |
| `_visibility`    | `Visibility`                                                                        |
| `_componentPath` | `ComponentPath`                                                                     |
| `_fn?`           | (`args`: `Args`, `keys`: `FunctionReference_futureArgKeys`<`Args`>) => `ReturnType` |

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/api.ts:214](https://github.com/get-convex/convex-js/blob/main/src/server/api.ts#L214)

***

### ApiFromModules[​](#apifrommodules "Direct link to ApiFromModules")

Ƭ **ApiFromModules**<`AllModules`>: [`FilterApi`](/api/modules/server.md#filterapi)<`ApiFromModulesAllowEmptyNodes`<`AllModules`>, [`FunctionReference`](/api/modules/server.md#functionreference)<`any`, `any`, `any`, `any`>>

Given the types of all modules in the `convex/` directory, construct the type of `api`.

`api` is a utility for constructing [FunctionReference](/api/modules/server.md#functionreference)s.

#### Type parameters[​](#type-parameters-2 "Direct link to Type parameters")

| Name         | Type                                 | Description                                                                      |
| ------------ | ------------------------------------ | -------------------------------------------------------------------------------- |
| `AllModules` | extends `Record`<`string`, `object`> | A type mapping module paths (like `"dir/myModule"`) to the types of the modules. |

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/api.ts:430](https://github.com/get-convex/convex-js/blob/main/src/server/api.ts#L430)

***

### FilterApi[​](#filterapi "Direct link to FilterApi")

Ƭ **FilterApi**<`API`, `Predicate`>: [`Expand`](/api/modules/server.md#expand)<{ \[mod in keyof API as FilterKeysInApi\<mod, API\[mod], Predicate>]: API\[mod] extends Predicate ? API\[mod] : FilterApi\<API\[mod], Predicate> }>

Filter a Convex deployment api object for functions which meet criteria, for example all public queries.

#### Type parameters[​](#type-parameters-3 "Direct link to Type parameters")

| Name        |
| ----------- |
| `API`       |
| `Predicate` |

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[server/api.ts:462](https://github.com/get-convex/convex-js/blob/main/src/server/api.ts#L462)

***

### AnyApi[​](#anyapi "Direct link to AnyApi")

Ƭ **AnyApi**: `Record`<`string`, `Record`<`string`, `AnyModuleDirOrFunc`>>

The type that Convex api objects extend. If you were writing an api from scratch it should extend this type.

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[server/api.ts:572](https://github.com/get-convex/convex-js/blob/main/src/server/api.ts#L572)

***

### PartialApi[​](#partialapi "Direct link to PartialApi")

Ƭ **PartialApi**<`API`>: { \[mod in keyof API]?: API\[mod] extends FunctionReference\<any, any, any, any> ? API\[mod] : PartialApi\<API\[mod]> }

Recursive partial API, useful for defining a subset of an API when mocking or building custom api objects.

#### Type parameters[​](#type-parameters-4 "Direct link to Type parameters")

| Name  |
| ----- |
| `API` |

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[server/api.ts:580](https://github.com/get-convex/convex-js/blob/main/src/server/api.ts#L580)

***

### FunctionArgs[​](#functionargs "Direct link to FunctionArgs")

Ƭ **FunctionArgs**<`FuncRef`>: `ExtractSignature`<`FuncRef`>\[`"args"`]

Given a [FunctionReference](/api/modules/server.md#functionreference) or [FunctionReference\_future](/api/modules/server.md#functionreference_future), get the arguments of the function.

This is represented as an object mapping argument names to values.

#### Type parameters[​](#type-parameters-5 "Direct link to Type parameters")

| Name      | Type                                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `FuncRef` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`any`, `any`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`any`, `any`> |

#### Defined in[​](#defined-in-7 "Direct link to Defined in")

[server/api.ts:616](https://github.com/get-convex/convex-js/blob/main/src/server/api.ts#L616)

***

### OptionalRestArgs[​](#optionalrestargs "Direct link to OptionalRestArgs")

Ƭ **OptionalRestArgs**<`FuncRef`>: [`FunctionArgs`](/api/modules/server.md#functionargs)<`FuncRef`> extends `EmptyObject` ? \[args?: EmptyObject] : \[args: FunctionArgs\<FuncRef>]

A tuple type of the (maybe optional) arguments to `FuncRef`.

This type is used to make methods involving arguments type safe while allowing skipping the arguments for functions that don't require arguments.

#### Type parameters[​](#type-parameters-6 "Direct link to Type parameters")

| Name      | Type                                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `FuncRef` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`any`, `any`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`any`, `any`> |

#### Defined in[​](#defined-in-8 "Direct link to Defined in")

[server/api.ts:645](https://github.com/get-convex/convex-js/blob/main/src/server/api.ts#L645)

***

### ArgsAndOptions[​](#argsandoptions "Direct link to ArgsAndOptions")

Ƭ **ArgsAndOptions**<`FuncRef`, `Options`>: [`FunctionArgs`](/api/modules/server.md#functionargs)<`FuncRef`> extends `EmptyObject` ? \[args?: EmptyObject, options?: Options] : \[args: FunctionArgs\<FuncRef>, options?: Options]

A tuple type of the (maybe optional) arguments to `FuncRef`, followed by an options object of type `Options`.

This type is used to make methods like `useQuery` type-safe while allowing

1. Skipping arguments for functions that don't require arguments.
2. Skipping the options object.

#### Type parameters[​](#type-parameters-7 "Direct link to Type parameters")

| Name      | Type                                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `FuncRef` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`any`, `any`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`any`, `any`> |
| `Options` | `Options`                                                                                                                                                                            |

#### Defined in[​](#defined-in-9 "Direct link to Defined in")

[server/api.ts:663](https://github.com/get-convex/convex-js/blob/main/src/server/api.ts#L663)

***

### FunctionReturnType[​](#functionreturntype "Direct link to FunctionReturnType")

Ƭ **FunctionReturnType**<`FuncRef`>: `ExtractSignature`<`FuncRef`>\[`"returnType"`]

Given a [FunctionReference](/api/modules/server.md#functionreference) or [FunctionReference\_future](/api/modules/server.md#functionreference_future), get the return type of the function.

#### Type parameters[​](#type-parameters-8 "Direct link to Type parameters")

| Name      | Type                                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `FuncRef` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`any`, `any`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`any`, `any`> |

#### Defined in[​](#defined-in-10 "Direct link to Defined in")

[server/api.ts:679](https://github.com/get-convex/convex-js/blob/main/src/server/api.ts#L679)

***

### ValidatorTypeToReturnType[​](#validatortypetoreturntype "Direct link to ValidatorTypeToReturnType")

Ƭ **ValidatorTypeToReturnType**<`T`>: `Promise`<`NullToUndefinedOrNull`<`T`>> | `NullToUndefinedOrNull`<`T`>

#### Type parameters[​](#type-parameters-9 "Direct link to Type parameters")

| Name |
| ---- |
| `T`  |

#### Defined in[​](#defined-in-11 "Direct link to Defined in")

[server/api.ts:698](https://github.com/get-convex/convex-js/blob/main/src/server/api.ts#L698)

***

### AuditLogBody[​](#auditlogbody "Direct link to AuditLogBody")

Ƭ **AuditLogBody**: `Object`

#### Index signature[​](#index-signature "Direct link to Index signature")

▪ \[key: `string`]: [`AuditLogValue`](/api/modules/server.md#auditlogvalue)

#### Defined in[​](#defined-in-12 "Direct link to Defined in")

[server/audit\_logging.ts:5](https://github.com/get-convex/convex-js/blob/main/src/server/audit_logging.ts#L5)

***

### AuditLogValue[​](#auditlogvalue "Direct link to AuditLogValue")

Ƭ **AuditLogValue**: `null` | `undefined` | `boolean` | `number` | `string` | `LogVar` | [`AuditLogValue`](/api/modules/server.md#auditlogvalue)\[] | { `[key: string]`: [`AuditLogValue`](/api/modules/server.md#auditlogvalue); }

#### Defined in[​](#defined-in-13 "Direct link to Defined in")

[server/audit\_logging.ts:6](https://github.com/get-convex/convex-js/blob/main/src/server/audit_logging.ts#L6)

***

### AuthConfig[​](#authconfig "Direct link to AuthConfig")

Ƭ **AuthConfig**: `Object`

The value exported by your Convex project in `auth.config.ts`.

```
import { AuthConfig } from "convex/server";



export default {

  providers: [

    {

      domain: "https://your.issuer.url.com",

      applicationID: "your-application-id",

    },

  ],

} satisfies AuthConfig;
```

#### Type declaration[​](#type-declaration-2 "Direct link to Type declaration")

| Name        | Type                                                     |
| ----------- | -------------------------------------------------------- |
| `providers` | [`AuthProvider`](/api/modules/server.md#authprovider)\[] |

#### Defined in[​](#defined-in-14 "Direct link to Defined in")

[server/authentication.ts:19](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L19)

***

### AuthProvider[​](#authprovider "Direct link to AuthProvider")

Ƭ **AuthProvider**: { `applicationID`: `string` ; `domain`: `string` } | { `type`: `"customJwt"` ; `applicationID?`: `string` ; `issuer`: `string` ; `jwks`: `string` ; `algorithm`: `"RS256"` | `"ES256"` }

An authentication provider allowed to issue JWTs for your app.

See: <https://docs.convex.dev/auth/advanced/custom-auth> and <https://docs.convex.dev/auth/advanced/custom-jwt>

#### Defined in[​](#defined-in-15 "Direct link to Defined in")

[server/authentication.ts:28](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L28)

***

### FunctionHandle[​](#functionhandle "Direct link to FunctionHandle")

Ƭ **FunctionHandle**<`Type`, `Args`, `ReturnType`>: `string` & [`FunctionReference`](/api/modules/server.md#functionreference)<`Type`, `"internal"`, `Args`, `ReturnType`>

A serializable reference to a Convex function. Passing a this reference to another component allows that component to call this function during the current function execution or at any later time. Function handles are used like `api.folder.function` FunctionReferences, e.g. `ctx.scheduler.runAfter(0, functionReference, args)`.

A function reference is stable across code pushes but it's possible the Convex function it refers to might no longer exist.

This is a feature of components, which are in beta. This API is unstable and may change in subsequent releases.

#### Type parameters[​](#type-parameters-10 "Direct link to Type parameters")

| Name         | Type                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| `Type`       | extends [`FunctionType`](/api/modules/server.md#functiontype)                       |
| `Args`       | extends [`DefaultFunctionArgs`](/api/modules/server.md#defaultfunctionargs) = `any` |
| `ReturnType` | `any`                                                                               |

#### Defined in[​](#defined-in-16 "Direct link to Defined in")

[server/components/index.ts:46](https://github.com/get-convex/convex-js/blob/main/src/server/components/index.ts#L46)

***

### ComponentDefinition[​](#componentdefinition "Direct link to ComponentDefinition")

Ƭ **ComponentDefinition**<`Exports`, `Env`>: `Object`

An object of this type should be the default export of a convex.config.ts file in a component definition directory.

This is a feature of components, which are in beta. This API is unstable and may change in subsequent releases.

#### Type parameters[​](#type-parameters-11 "Direct link to Type parameters")

| Name      | Type                                                              |
| --------- | ----------------------------------------------------------------- |
| `Exports` | extends `ComponentExports` = `any`                                |
| `Env`     | extends [`EnvDefinition`](/api/modules/server.md#envdefinition) = |

#### Type declaration[​](#type-declaration-3 "Direct link to Type declaration")

| Name        | Type                                                                                                                | Description                                                                                                                                                                                                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `use`       | \<Definition>(`definition`: `Definition`, ...`args`: `UseArgs`<`Definition`>) => `InstalledComponent`<`Definition`> | Install a component with the given definition in this component definition. Takes a component definition and an optional name. For editor tooling this method expects a [ComponentDefinition](/api/modules/server.md#componentdefinition) but at runtime the object that is imported will be a ImportedComponentDefinition |
| `__exports` | `Exports`                                                                                                           | Internal type-only property tracking exports provided. **`Deprecated`** This is a type-only property, don't use it.                                                                                                                                                                                                        |
| `env`       | `EnvRefFromDefinition`<`Env`>                                                                                       | References to this component's declared env vars. Pass one of these in `app.use(child, { env: { ... } })` to bind a child's env var by reference to this component's env var.                                                                                                                                              |
| `__env`     | `Env`                                                                                                               | Internal type-only property tracking env definition. **`Deprecated`** This is a type-only property, don't use it.                                                                                                                                                                                                          |

#### Defined in[​](#defined-in-17 "Direct link to Defined in")

[server/components/index.ts:92](https://github.com/get-convex/convex-js/blob/main/src/server/components/index.ts#L92)

***

### EnvDefinition[​](#envdefinition "Direct link to EnvDefinition")

Ƭ **EnvDefinition**: `Record`<`string`, `StringLikeValidator` | [`VOptional`](/api/modules/values.md#voptional)<`StringLikeValidator`>>

A definition of environment variables for the app.

Maps environment variable names to string-like validators. Use `v.string()` for a plain string, `v.literal("a")` for an enum value, or `v.union(v.literal("a"), v.literal("b"))` for an enum. Wrap in `v.optional(...)` for optional vars.

**`Example`**

```
import { defineApp } from "convex/server";

import { v } from "convex/values";



const app = defineApp({

  env: {

    OPENAI_API_KEY: v.string(),

    DEBUG_MODE: v.optional(v.string()),

  },

});
```

#### Defined in[​](#defined-in-18 "Direct link to Defined in")

[server/components/index.ts:224](https://github.com/get-convex/convex-js/blob/main/src/server/components/index.ts#L224)

***

### EnvFromDefinition[​](#envfromdefinition "Direct link to EnvFromDefinition")

Ƭ **EnvFromDefinition**<`E`>: [`Expand`](/api/modules/server.md#expand)<{ \[K in keyof E as E\[K] extends Validator\<any, "optional", any> ? never : K]: Infer\<E\[K]> } & { \[K in keyof E as E\[K] extends Validator\<any, "optional", any> ? K : never]?: Infer\<E\[K]> }>

Compute the typed environment object from an [EnvDefinition](/api/modules/server.md#envdefinition).

Required entries get the validator's inferred string type; optional entries are `T | undefined`.

#### Type parameters[​](#type-parameters-12 "Direct link to Type parameters")

| Name | Type                                                            |
| ---- | --------------------------------------------------------------- |
| `E`  | extends [`EnvDefinition`](/api/modules/server.md#envdefinition) |

#### Defined in[​](#defined-in-19 "Direct link to Defined in")

[server/components/index.ts:237](https://github.com/get-convex/convex-js/blob/main/src/server/components/index.ts#L237)

***

### EnvFromAppDefinition[​](#envfromappdefinition "Direct link to EnvFromAppDefinition")

Ƭ **EnvFromAppDefinition**<`A`>: `A` extends [`AppDefinition`](/api/modules/server.md#appdefinition)\<infer E> ? [`EnvFromDefinition`](/api/modules/server.md#envfromdefinition)<`E`> : `Record`<`string`, `never`>

Extract the typed environment from an [AppDefinition](/api/modules/server.md#appdefinition).

#### Type parameters[​](#type-parameters-13 "Direct link to Type parameters")

| Name |
| ---- |
| `A`  |

#### Defined in[​](#defined-in-20 "Direct link to Defined in")

[server/components/index.ts:274](https://github.com/get-convex/convex-js/blob/main/src/server/components/index.ts#L274)

***

### AppDefinition[​](#appdefinition "Direct link to AppDefinition")

Ƭ **AppDefinition**<`Env`>: `Object`

An object of this type should be the default export of a convex.config.ts file in a component-aware convex directory.

This is a feature of components, which are in beta. This API is unstable and may change in subsequent releases.

#### Type parameters[​](#type-parameters-14 "Direct link to Type parameters")

| Name  | Type                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------- |
| `Env` | extends [`EnvDefinition`](/api/modules/server.md#envdefinition) = [`EnvDefinition`](/api/modules/server.md#envdefinition) |

#### Type declaration[​](#type-declaration-4 "Direct link to Type declaration")

| Name    | Type                                                                                                                | Description                                                                                                                                                                                                                                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `use`   | \<Definition>(`definition`: `Definition`, ...`args`: `UseArgs`<`Definition`>) => `InstalledComponent`<`Definition`> | Install a component with the given definition in this component definition. Takes a component definition and an optional name. For editor tooling this method expects a [ComponentDefinition](/api/modules/server.md#componentdefinition) but at runtime the object that is imported will be a ImportedComponentDefinition |
| `env`   | `EnvRefFromDefinition`<`Env`>                                                                                       | References to this app's declared env vars. Pass one of these in `app.use(child, { env: { ... } })` to bind a child's env var by reference to this app's env var.                                                                                                                                                          |
| `__env` | `Env`                                                                                                               | Internal type-only property tracking env definition. **`Deprecated`** This is a type-only property, don't use it.                                                                                                                                                                                                          |

#### Defined in[​](#defined-in-21 "Direct link to Defined in")

[server/components/index.ts:286](https://github.com/get-convex/convex-js/blob/main/src/server/components/index.ts#L286)

***

### AnyChildComponents[​](#anychildcomponents "Direct link to AnyChildComponents")

Ƭ **AnyChildComponents**: `Record`<`string`, `AnyComponentReference`>

#### Defined in[​](#defined-in-22 "Direct link to Defined in")

[server/components/index.ts:777](https://github.com/get-convex/convex-js/blob/main/src/server/components/index.ts#L777)

***

### AnyComponents[​](#anycomponents "Direct link to AnyComponents")

Ƭ **AnyComponents**: [`AnyChildComponents`](/api/modules/server.md#anychildcomponents)

#### Defined in[​](#defined-in-23 "Direct link to Defined in")

[server/components/index.ts:817](https://github.com/get-convex/convex-js/blob/main/src/server/components/index.ts#L817)

***

### GenericDocument[​](#genericdocument "Direct link to GenericDocument")

Ƭ **GenericDocument**: `Record`<`string`, [`Value`](/api/modules/values.md#value)>

A document stored in Convex.

#### Defined in[​](#defined-in-24 "Direct link to Defined in")

[server/data\_model.ts:10](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L10)

***

### GenericFieldPaths[​](#genericfieldpaths "Direct link to GenericFieldPaths")

Ƭ **GenericFieldPaths**: `string`

A type describing all of the document fields in a table.

These can either be field names (like "name") or references to fields on nested objects (like "properties.name").

#### Defined in[​](#defined-in-25 "Direct link to Defined in")

[server/data\_model.ts:19](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L19)

***

### GenericIndexFields[​](#genericindexfields "Direct link to GenericIndexFields")

Ƭ **GenericIndexFields**: `string`\[]

A type describing the ordered fields in an index.

These can either be field names (like "name") or references to fields on nested objects (like "properties.name").

#### Defined in[​](#defined-in-26 "Direct link to Defined in")

[server/data\_model.ts:30](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L30)

***

### GenericTableIndexes[​](#generictableindexes "Direct link to GenericTableIndexes")

Ƭ **GenericTableIndexes**: `Record`<`string`, [`GenericIndexFields`](/api/modules/server.md#genericindexfields)>

A type describing the indexes in a table.

It's an object mapping each index name to the fields in the index.

#### Defined in[​](#defined-in-27 "Direct link to Defined in")

[server/data\_model.ts:38](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L38)

***

### GenericSearchIndexConfig[​](#genericsearchindexconfig "Direct link to GenericSearchIndexConfig")

Ƭ **GenericSearchIndexConfig**: `Object`

A type describing the configuration of a search index.

#### Type declaration[​](#type-declaration-5 "Direct link to Type declaration")

| Name           | Type     |
| -------------- | -------- |
| `searchField`  | `string` |
| `filterFields` | `string` |

#### Defined in[​](#defined-in-28 "Direct link to Defined in")

[server/data\_model.ts:44](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L44)

***

### GenericTableSearchIndexes[​](#generictablesearchindexes "Direct link to GenericTableSearchIndexes")

Ƭ **GenericTableSearchIndexes**: `Record`<`string`, [`GenericSearchIndexConfig`](/api/modules/server.md#genericsearchindexconfig)>

A type describing all of the search indexes in a table.

This is an object mapping each index name to the config for the index.

#### Defined in[​](#defined-in-29 "Direct link to Defined in")

[server/data\_model.ts:55](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L55)

***

### GenericVectorIndexConfig[​](#genericvectorindexconfig "Direct link to GenericVectorIndexConfig")

Ƭ **GenericVectorIndexConfig**: `Object`

A type describing the configuration of a vector index.

#### Type declaration[​](#type-declaration-6 "Direct link to Type declaration")

| Name           | Type     |
| -------------- | -------- |
| `vectorField`  | `string` |
| `dimensions`   | `number` |
| `filterFields` | `string` |

#### Defined in[​](#defined-in-30 "Direct link to Defined in")

[server/data\_model.ts:64](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L64)

***

### GenericTableVectorIndexes[​](#generictablevectorindexes "Direct link to GenericTableVectorIndexes")

Ƭ **GenericTableVectorIndexes**: `Record`<`string`, [`GenericVectorIndexConfig`](/api/modules/server.md#genericvectorindexconfig)>

A type describing all of the vector indexes in a table.

This is an object mapping each index name to the config for the index.

#### Defined in[​](#defined-in-31 "Direct link to Defined in")

[server/data\_model.ts:76](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L76)

***

### FieldTypeFromFieldPath[​](#fieldtypefromfieldpath "Direct link to FieldTypeFromFieldPath")

Ƭ **FieldTypeFromFieldPath**<`Document`, `FieldPath`>: [`FieldTypeFromFieldPathInner`](/api/modules/server.md#fieldtypefromfieldpathinner)<`Document`, `FieldPath`> extends [`Value`](/api/modules/values.md#value) | `undefined` ? [`FieldTypeFromFieldPathInner`](/api/modules/server.md#fieldtypefromfieldpathinner)<`Document`, `FieldPath`> : [`Value`](/api/modules/values.md#value) | `undefined`

The type of a field in a document.

Note that this supports both simple fields like "name" and nested fields like "properties.name".

If the field is not present in the document it is considered to be `undefined`.

#### Type parameters[​](#type-parameters-15 "Direct link to Type parameters")

| Name        | Type                                                                |
| ----------- | ------------------------------------------------------------------- |
| `Document`  | extends [`GenericDocument`](/api/modules/server.md#genericdocument) |
| `FieldPath` | extends `string`                                                    |

#### Defined in[​](#defined-in-32 "Direct link to Defined in")

[server/data\_model.ts:105](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L105)

***

### FieldTypeFromFieldPathInner[​](#fieldtypefromfieldpathinner "Direct link to FieldTypeFromFieldPathInner")

Ƭ **FieldTypeFromFieldPathInner**<`Document`, `FieldPath`>: `FieldPath` extends \`${infer First}.${infer Second}\` ? `ValueFromUnion`<`Document`, `First`, `Record`<`never`, `never`>> extends infer FieldValue ? `FieldValue` extends [`GenericDocument`](/api/modules/server.md#genericdocument) ? [`FieldTypeFromFieldPath`](/api/modules/server.md#fieldtypefromfieldpath)<`FieldValue`, `Second`> : `undefined` : `undefined` : `ValueFromUnion`<`Document`, `FieldPath`, `undefined`>

The inner type of [FieldTypeFromFieldPath](/api/modules/server.md#fieldtypefromfieldpath).

It's wrapped in a helper to coerce the type to `Value | undefined` since some versions of TypeScript fail to infer this type correctly.

#### Type parameters[​](#type-parameters-16 "Direct link to Type parameters")

| Name        | Type                                                                |
| ----------- | ------------------------------------------------------------------- |
| `Document`  | extends [`GenericDocument`](/api/modules/server.md#genericdocument) |
| `FieldPath` | extends `string`                                                    |

#### Defined in[​](#defined-in-33 "Direct link to Defined in")

[server/data\_model.ts:121](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L121)

***

### GenericTableInfo[​](#generictableinfo "Direct link to GenericTableInfo")

Ƭ **GenericTableInfo**: `Object`

A type describing the document type and indexes in a table.

#### Type declaration[​](#type-declaration-7 "Direct link to Type declaration")

| Name            | Type                                                                            |
| --------------- | ------------------------------------------------------------------------------- |
| `document`      | [`GenericDocument`](/api/modules/server.md#genericdocument)                     |
| `fieldPaths`    | [`GenericFieldPaths`](/api/modules/server.md#genericfieldpaths)                 |
| `indexes`       | [`GenericTableIndexes`](/api/modules/server.md#generictableindexes)             |
| `searchIndexes` | [`GenericTableSearchIndexes`](/api/modules/server.md#generictablesearchindexes) |
| `vectorIndexes` | [`GenericTableVectorIndexes`](/api/modules/server.md#generictablevectorindexes) |

#### Defined in[​](#defined-in-34 "Direct link to Defined in")

[server/data\_model.ts:146](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L146)

***

### DocumentByInfo[​](#documentbyinfo "Direct link to DocumentByInfo")

Ƭ **DocumentByInfo**<`TableInfo`>: `TableInfo`\[`"document"`]

The type of a document in a table for a given [GenericTableInfo](/api/modules/server.md#generictableinfo).

#### Type parameters[​](#type-parameters-17 "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `TableInfo` | extends [`GenericTableInfo`](/api/modules/server.md#generictableinfo) |

#### Defined in[​](#defined-in-35 "Direct link to Defined in")

[server/data\_model.ts:158](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L158)

***

### FieldPaths[​](#fieldpaths "Direct link to FieldPaths")

Ƭ **FieldPaths**<`TableInfo`>: `TableInfo`\[`"fieldPaths"`]

The field paths in a table for a given [GenericTableInfo](/api/modules/server.md#generictableinfo).

These can either be field names (like "name") or references to fields on nested objects (like "properties.name").

#### Type parameters[​](#type-parameters-18 "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `TableInfo` | extends [`GenericTableInfo`](/api/modules/server.md#generictableinfo) |

#### Defined in[​](#defined-in-36 "Direct link to Defined in")

[server/data\_model.ts:168](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L168)

***

### Indexes[​](#indexes "Direct link to Indexes")

Ƭ **Indexes**<`TableInfo`>: `TableInfo`\[`"indexes"`]

The database indexes in a table for a given [GenericTableInfo](/api/modules/server.md#generictableinfo).

This will be an object mapping index names to the fields in the index.

#### Type parameters[​](#type-parameters-19 "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `TableInfo` | extends [`GenericTableInfo`](/api/modules/server.md#generictableinfo) |

#### Defined in[​](#defined-in-37 "Direct link to Defined in")

[server/data\_model.ts:177](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L177)

***

### IndexNames[​](#indexnames "Direct link to IndexNames")

Ƭ **IndexNames**<`TableInfo`>: keyof [`Indexes`](/api/modules/server.md#indexes)<`TableInfo`>

The names of indexes in a table for a given [GenericTableInfo](/api/modules/server.md#generictableinfo).

#### Type parameters[​](#type-parameters-20 "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `TableInfo` | extends [`GenericTableInfo`](/api/modules/server.md#generictableinfo) |

#### Defined in[​](#defined-in-38 "Direct link to Defined in")

[server/data\_model.ts:183](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L183)

***

### NamedIndex[​](#namedindex "Direct link to NamedIndex")

Ƭ **NamedIndex**<`TableInfo`, `IndexName`>: [`Indexes`](/api/modules/server.md#indexes)<`TableInfo`>\[`IndexName`]

Extract the fields of an index from a [GenericTableInfo](/api/modules/server.md#generictableinfo) by name.

#### Type parameters[​](#type-parameters-21 "Direct link to Type parameters")

| Name        | Type                                                                   |
| ----------- | ---------------------------------------------------------------------- |
| `TableInfo` | extends [`GenericTableInfo`](/api/modules/server.md#generictableinfo)  |
| `IndexName` | extends [`IndexNames`](/api/modules/server.md#indexnames)<`TableInfo`> |

#### Defined in[​](#defined-in-39 "Direct link to Defined in")

[server/data\_model.ts:190](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L190)

***

### SearchIndexes[​](#searchindexes "Direct link to SearchIndexes")

Ƭ **SearchIndexes**<`TableInfo`>: `TableInfo`\[`"searchIndexes"`]

The search indexes in a table for a given [GenericTableInfo](/api/modules/server.md#generictableinfo).

This will be an object mapping index names to the search index config.

#### Type parameters[​](#type-parameters-22 "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `TableInfo` | extends [`GenericTableInfo`](/api/modules/server.md#generictableinfo) |

#### Defined in[​](#defined-in-40 "Direct link to Defined in")

[server/data\_model.ts:201](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L201)

***

### SearchIndexNames[​](#searchindexnames "Direct link to SearchIndexNames")

Ƭ **SearchIndexNames**<`TableInfo`>: keyof [`SearchIndexes`](/api/modules/server.md#searchindexes)<`TableInfo`>

The names of search indexes in a table for a given [GenericTableInfo](/api/modules/server.md#generictableinfo).

#### Type parameters[​](#type-parameters-23 "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `TableInfo` | extends [`GenericTableInfo`](/api/modules/server.md#generictableinfo) |

#### Defined in[​](#defined-in-41 "Direct link to Defined in")

[server/data\_model.ts:208](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L208)

***

### NamedSearchIndex[​](#namedsearchindex "Direct link to NamedSearchIndex")

Ƭ **NamedSearchIndex**<`TableInfo`, `IndexName`>: [`SearchIndexes`](/api/modules/server.md#searchindexes)<`TableInfo`>\[`IndexName`]

Extract the config of a search index from a [GenericTableInfo](/api/modules/server.md#generictableinfo) by name.

#### Type parameters[​](#type-parameters-24 "Direct link to Type parameters")

| Name        | Type                                                                               |
| ----------- | ---------------------------------------------------------------------------------- |
| `TableInfo` | extends [`GenericTableInfo`](/api/modules/server.md#generictableinfo)              |
| `IndexName` | extends [`SearchIndexNames`](/api/modules/server.md#searchindexnames)<`TableInfo`> |

#### Defined in[​](#defined-in-42 "Direct link to Defined in")

[server/data\_model.ts:215](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L215)

***

### VectorIndexes[​](#vectorindexes "Direct link to VectorIndexes")

Ƭ **VectorIndexes**<`TableInfo`>: `TableInfo`\[`"vectorIndexes"`]

The vector indexes in a table for a given [GenericTableInfo](/api/modules/server.md#generictableinfo).

This will be an object mapping index names to the vector index config.

#### Type parameters[​](#type-parameters-25 "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `TableInfo` | extends [`GenericTableInfo`](/api/modules/server.md#generictableinfo) |

#### Defined in[​](#defined-in-43 "Direct link to Defined in")

[server/data\_model.ts:226](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L226)

***

### VectorIndexNames[​](#vectorindexnames "Direct link to VectorIndexNames")

Ƭ **VectorIndexNames**<`TableInfo`>: keyof [`VectorIndexes`](/api/modules/server.md#vectorindexes)<`TableInfo`>

The names of vector indexes in a table for a given [GenericTableInfo](/api/modules/server.md#generictableinfo).

#### Type parameters[​](#type-parameters-26 "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `TableInfo` | extends [`GenericTableInfo`](/api/modules/server.md#generictableinfo) |

#### Defined in[​](#defined-in-44 "Direct link to Defined in")

[server/data\_model.ts:233](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L233)

***

### NamedVectorIndex[​](#namedvectorindex "Direct link to NamedVectorIndex")

Ƭ **NamedVectorIndex**<`TableInfo`, `IndexName`>: [`VectorIndexes`](/api/modules/server.md#vectorindexes)<`TableInfo`>\[`IndexName`]

Extract the config of a vector index from a [GenericTableInfo](/api/modules/server.md#generictableinfo) by name.

#### Type parameters[​](#type-parameters-27 "Direct link to Type parameters")

| Name        | Type                                                                               |
| ----------- | ---------------------------------------------------------------------------------- |
| `TableInfo` | extends [`GenericTableInfo`](/api/modules/server.md#generictableinfo)              |
| `IndexName` | extends [`VectorIndexNames`](/api/modules/server.md#vectorindexnames)<`TableInfo`> |

#### Defined in[​](#defined-in-45 "Direct link to Defined in")

[server/data\_model.ts:240](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L240)

***

### GenericDataModel[​](#genericdatamodel "Direct link to GenericDataModel")

Ƭ **GenericDataModel**: `Record`<`string`, [`GenericTableInfo`](/api/modules/server.md#generictableinfo)>

A type describing the tables in a Convex project.

This is designed to be code generated with `npx convex dev`.

#### Defined in[​](#defined-in-46 "Direct link to Defined in")

[server/data\_model.ts:253](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L253)

***

### AnyDataModel[​](#anydatamodel "Direct link to AnyDataModel")

Ƭ **AnyDataModel**: `Object`

A [GenericDataModel](/api/modules/server.md#genericdatamodel) that considers documents to be `any` and does not support indexes.

This is the default before a schema is defined.

#### Index signature[​](#index-signature-1 "Direct link to Index signature")

▪ \[tableName: `string`]: { `document`: `any` ; `fieldPaths`: [`GenericFieldPaths`](/api/modules/server.md#genericfieldpaths) ; `indexes`: [`SystemIndexes`](/api/modules/server.md#systemindexes) ; `searchIndexes`: <!-- -->; `vectorIndexes`: <!-- -->}

#### Defined in[​](#defined-in-47 "Direct link to Defined in")

[server/data\_model.ts:262](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L262)

***

### TableNamesInDataModel[​](#tablenamesindatamodel "Direct link to TableNamesInDataModel")

Ƭ **TableNamesInDataModel**<`DataModel`>: keyof `DataModel` & `string`

A type of all of the table names defined in a [GenericDataModel](/api/modules/server.md#genericdatamodel).

#### Type parameters[​](#type-parameters-28 "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `DataModel` | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel) |

#### Defined in[​](#defined-in-48 "Direct link to Defined in")

[server/data\_model.ts:276](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L276)

***

### NamedTableInfo[​](#namedtableinfo "Direct link to NamedTableInfo")

Ƭ **NamedTableInfo**<`DataModel`, `TableName`>: `DataModel`\[`TableName`]

Extract the `TableInfo` for a table in a [GenericDataModel](/api/modules/server.md#genericdatamodel) by table name.

#### Type parameters[​](#type-parameters-29 "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `DataModel` | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel) |
| `TableName` | extends keyof `DataModel`                                             |

#### Defined in[​](#defined-in-49 "Direct link to Defined in")

[server/data\_model.ts:285](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L285)

***

### DocumentByName[​](#documentbyname "Direct link to DocumentByName")

Ƭ **DocumentByName**<`DataModel`, `TableName`>: `DataModel`\[`TableName`]\[`"document"`]

The type of a document in a [GenericDataModel](/api/modules/server.md#genericdatamodel) by table name.

#### Type parameters[​](#type-parameters-30 "Direct link to Type parameters")

| Name        | Type                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------- |
| `DataModel` | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel)                        |
| `TableName` | extends [`TableNamesInDataModel`](/api/modules/server.md#tablenamesindatamodel)<`DataModel`> |

#### Defined in[​](#defined-in-50 "Direct link to Defined in")

[server/data\_model.ts:294](https://github.com/get-convex/convex-js/blob/main/src/server/data_model.ts#L294)

***

### ExpressionOrValue[​](#expressionorvalue "Direct link to ExpressionOrValue")

Ƭ **ExpressionOrValue**<`T`>: [`Expression`](/api/classes/server.Expression.md)<`T`> | `T`

An [Expression](/api/classes/server.Expression.md) or a constant [Value](/api/modules/values.md#value)

#### Type parameters[​](#type-parameters-31 "Direct link to Type parameters")

| Name | Type                                                           |
| ---- | -------------------------------------------------------------- |
| `T`  | extends [`Value`](/api/modules/values.md#value) \| `undefined` |

#### Defined in[​](#defined-in-51 "Direct link to Defined in")

[server/filter\_builder.ts:38](https://github.com/get-convex/convex-js/blob/main/src/server/filter_builder.ts#L38)

***

### ServiceName[​](#servicename "Direct link to ServiceName")

Ƭ **ServiceName**: `"ai-gateway"`

A Convex-managed service. The backend decides which names it accepts; this type lists the ones the current release knows about.

#### Defined in[​](#defined-in-52 "Direct link to Defined in")

[server/impl/actions\_impl.ts:71](https://github.com/get-convex/convex-js/blob/main/src/server/impl/actions_impl.ts#L71)

***

### TransactionMetric[​](#transactionmetric "Direct link to TransactionMetric")

Ƭ **TransactionMetric**: `Object`

Used and remaining amounts for a single transaction limit.

#### Type declaration[​](#type-declaration-8 "Direct link to Type declaration")

| Name        | Type     |
| ----------- | -------- |
| `used`      | `number` |
| `remaining` | `number` |

#### Defined in[​](#defined-in-53 "Direct link to Defined in")

[server/meta.ts:9](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L9)

***

### TransactionMetrics[​](#transactionmetrics "Direct link to TransactionMetrics")

Ƭ **TransactionMetrics**: `Object`

The remaining headroom for a transaction before hitting limits.

See <https://docs.convex.dev/production/state/limits>

#### Type declaration[​](#type-declaration-9 "Direct link to Type declaration")

| Name                         | Type                                                            |
| ---------------------------- | --------------------------------------------------------------- |
| `bytesRead`                  | [`TransactionMetric`](/api/modules/server.md#transactionmetric) |
| `bytesWritten`               | [`TransactionMetric`](/api/modules/server.md#transactionmetric) |
| `databaseQueries`            | [`TransactionMetric`](/api/modules/server.md#transactionmetric) |
| `documentsRead`              | [`TransactionMetric`](/api/modules/server.md#transactionmetric) |
| `documentsWritten`           | [`TransactionMetric`](/api/modules/server.md#transactionmetric) |
| `functionsScheduled`         | [`TransactionMetric`](/api/modules/server.md#transactionmetric) |
| `scheduledFunctionArgsBytes` | [`TransactionMetric`](/api/modules/server.md#transactionmetric) |

#### Defined in[​](#defined-in-54 "Direct link to Defined in")

[server/meta.ts:21](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L21)

***

### FunctionMetadata[​](#functionmetadata "Direct link to FunctionMetadata")

Ƭ **FunctionMetadata**: `Object`

Metadata about the currently executing Convex function.

#### Type declaration[​](#type-declaration-10 "Direct link to Type declaration")

| Name            | Type                                                              | Description                                                                                   |
| --------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `name`          | `string`                                                          | The name of the function, in the format `"path/to/module:functionName"`                       |
| `componentPath` | `string`                                                          | The path of the component this function belongs to. This is an empty string `""` for the app. |
| `type`          | [`FunctionType`](/api/modules/server.md#functiontype)             | Whether it's a query, mutation, or action.                                                    |
| `visibility`    | [`FunctionVisibility`](/api/modules/server.md#functionvisibility) | Whether the function is public or internal.                                                   |

#### Defined in[​](#defined-in-55 "Direct link to Defined in")

[server/meta.ts:69](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L69)

***

### DeploymentMetadata[​](#deploymentmetadata "Direct link to DeploymentMetadata")

Ƭ **DeploymentMetadata**: `Object`

Metadata about the deployment this function is running on.

#### Type declaration[​](#type-declaration-11 "Direct link to Type declaration")

| Name     | Type                                          | Description                                                                                                                                                           |
| -------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`   | `string`                                      | The deployment name, e.g. `"tall-tiger-123"` for cloud deployments, `"local-my_team-my_project"` for local deployments, or `"anonymous-*"` for anonymous deployments. |
| `region` | `string` \| `null`                            | The deployment region, e.g. `"aws-us-east-1"`. `null` for local and self-hosted deployments.                                                                          |
| `class`  | `"s16"` \| `"s256"` \| `"d1024"` \| `"d2048"` | The deployment class, e.g. `"s16"`, `"s256"`, `"d1024"`, or `"d2048"`.                                                                                                |

#### Defined in[​](#defined-in-56 "Direct link to Defined in")

[server/meta.ts:90](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L90)

***

### RequestMetadata[​](#requestmetadata "Direct link to RequestMetadata")

Ƭ **RequestMetadata**: `Object`

Metadata about the HTTP request that triggered the current function execution.

`ip` and `userAgent` are `null` when the function was not triggered by an HTTP request (e.g. scheduled jobs or cron jobs).

Functions called from within a function (i.e. using `runMutation` or `runAction`) will have the same request metadata as the parent function.

#### Type declaration[​](#type-declaration-12 "Direct link to Type declaration")

| Name                  | Type               | Description                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ip`                  | `string` \| `null` | -                                                                                                                                                                                                                                                                                                                                                                                                  |
| `userAgent`           | `string` \| `null` | -                                                                                                                                                                                                                                                                                                                                                                                                  |
| `requestId`           | `string`           | -                                                                                                                                                                                                                                                                                                                                                                                                  |
| `scheduledFunctionId` | `string` \| `null` | The ID of the scheduled function document (in `_scheduled_functions`) that this execution belongs to, or `null` otherwise. This is set for the scheduled function itself and for any functions it calls (e.g. a mutation invoked via `runMutation` by a scheduled action), propagating the top-level scheduled function's ID down the call tree. It is `null` when the function was not scheduled. |
| `authToken`           | `string` \| `null` | The raw auth token (a JWT) the request was authenticated with, or `null` when the request was unauthenticated or authenticated with an admin key. This is the same token that `ctx.auth.getUserIdentity()` derives its attributes from.                                                                                                                                                            |

#### Defined in[​](#defined-in-57 "Direct link to Defined in")

[server/meta.ts:119](https://github.com/get-convex/convex-js/blob/main/src/server/meta.ts#L119)

***

### Cursor[​](#cursor "Direct link to Cursor")

Ƭ **Cursor**: `string`

An opaque identifier used for paginating a database query.

Cursors are returned from [paginate](/api/interfaces/server.OrderedQuery.md#paginate) and represent the point of the query where the page of results ended.

To continue paginating, pass the cursor back into [paginate](/api/interfaces/server.OrderedQuery.md#paginate) in the [PaginationOptions](/api/interfaces/server.PaginationOptions.md) object to fetch another page of results.

Note: Cursors can only be passed to *exactly* the same database query that they were generated from. You may not reuse a cursor between different database queries.

#### Defined in[​](#defined-in-58 "Direct link to Defined in")

[server/pagination.ts:21](https://github.com/get-convex/convex-js/blob/main/src/server/pagination.ts#L21)

***

### GenericMutationCtxWithTable[​](#genericmutationctxwithtable "Direct link to GenericMutationCtxWithTable")

Ƭ **GenericMutationCtxWithTable**<`DataModel`>: `Omit`<[`GenericMutationCtx`](/api/interfaces/server.GenericMutationCtx.md)<`DataModel`>, `"db"`> & { `db`: [`GenericDatabaseWriterWithTable`](/api/interfaces/server.GenericDatabaseWriterWithTable.md)<`DataModel`> }

A set of services for use within Convex mutation functions.

The mutation context is passed as the first argument to any Convex mutation function run on the server.

You should generally use the `MutationCtx` type from `"./_generated/server"`.

#### Type parameters[​](#type-parameters-32 "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `DataModel` | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel) |

#### Defined in[​](#defined-in-59 "Direct link to Defined in")

[server/registration.ts:179](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L179)

***

### GenericQueryCtxWithTable[​](#genericqueryctxwithtable "Direct link to GenericQueryCtxWithTable")

Ƭ **GenericQueryCtxWithTable**<`DataModel`>: `Omit`<[`GenericQueryCtx`](/api/interfaces/server.GenericQueryCtx.md)<`DataModel`>, `"db"`> & { `db`: [`GenericDatabaseReaderWithTable`](/api/interfaces/server.GenericDatabaseReaderWithTable.md)<`DataModel`> }

A set of services for use within Convex query functions.

The query context is passed as the first argument to any Convex query function run on the server.

This differs from the MutationCtx because all of the services are read-only.

#### Type parameters[​](#type-parameters-33 "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `DataModel` | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel) |

#### Defined in[​](#defined-in-60 "Direct link to Defined in")

[server/registration.ts:277](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L277)

***

### DefaultFunctionArgs[​](#defaultfunctionargs "Direct link to DefaultFunctionArgs")

Ƭ **DefaultFunctionArgs**: `Record`<`string`, `unknown`>

The default arguments type for a Convex query, mutation, or action function.

Convex functions always take an arguments object that maps the argument names to their values.

#### Defined in[​](#defined-in-61 "Direct link to Defined in")

[server/registration.ts:445](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L445)

***

### ArgsArray[​](#argsarray "Direct link to ArgsArray")

Ƭ **ArgsArray**: `OneArgArray` | `NoArgsArray`

An array of arguments to a Convex function.

Convex functions can take either a single [DefaultFunctionArgs](/api/modules/server.md#defaultfunctionargs) object or no args at all.

#### Defined in[​](#defined-in-62 "Direct link to Defined in")

[server/registration.ts:468](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L468)

***

### ArgsArrayToObject[​](#argsarraytoobject "Direct link to ArgsArrayToObject")

Ƭ **ArgsArrayToObject**<`Args`>: `Args` extends `OneArgArray`\<infer ArgsObject> ? `ArgsObject` : `EmptyObject`

Convert an [ArgsArray](/api/modules/server.md#argsarray) into a single object type.

Empty arguments arrays are converted to EmptyObject.

#### Type parameters[​](#type-parameters-34 "Direct link to Type parameters")

| Name   | Type                                                    |
| ------ | ------------------------------------------------------- |
| `Args` | extends [`ArgsArray`](/api/modules/server.md#argsarray) |

#### Defined in[​](#defined-in-63 "Direct link to Defined in")

[server/registration.ts:483](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L483)

***

### FunctionVisibility[​](#functionvisibility "Direct link to FunctionVisibility")

Ƭ **FunctionVisibility**: `"public"` | `"internal"`

A type representing the visibility of a Convex function.

#### Defined in[​](#defined-in-64 "Direct link to Defined in")

[server/registration.ts:491](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L491)

***

### RegisteredMutation[​](#registeredmutation "Direct link to RegisteredMutation")

Ƭ **RegisteredMutation**<`Visibility`, `Args`, `Returns`>: { `isConvexFunction`: `true` ; `isMutation`: `true` } & `VisibilityProperties`<`Visibility`>

A mutation function that is part of this app.

You can create a mutation by wrapping your function in [mutationGeneric](/api/modules/server.md#mutationgeneric) or [internalMutationGeneric](/api/modules/server.md#internalmutationgeneric) and exporting it.

#### Type parameters[​](#type-parameters-35 "Direct link to Type parameters")

| Name         | Type                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| `Visibility` | extends [`FunctionVisibility`](/api/modules/server.md#functionvisibility)   |
| `Args`       | extends [`DefaultFunctionArgs`](/api/modules/server.md#defaultfunctionargs) |
| `Returns`    | `Returns`                                                                   |

#### Defined in[​](#defined-in-65 "Direct link to Defined in")

[server/registration.ts:516](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L516)

***

### RegisteredQuery[​](#registeredquery "Direct link to RegisteredQuery")

Ƭ **RegisteredQuery**<`Visibility`, `Args`, `Returns`>: { `isConvexFunction`: `true` ; `isQuery`: `true` } & `VisibilityProperties`<`Visibility`>

A query function that is part of this app.

You can create a query by wrapping your function in [queryGeneric](/api/modules/server.md#querygeneric) or [internalQueryGeneric](/api/modules/server.md#internalquerygeneric) and exporting it.

#### Type parameters[​](#type-parameters-36 "Direct link to Type parameters")

| Name         | Type                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| `Visibility` | extends [`FunctionVisibility`](/api/modules/server.md#functionvisibility)   |
| `Args`       | extends [`DefaultFunctionArgs`](/api/modules/server.md#defaultfunctionargs) |
| `Returns`    | `Returns`                                                                   |

#### Defined in[​](#defined-in-66 "Direct link to Defined in")

[server/registration.ts:545](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L545)

***

### RegisteredAction[​](#registeredaction "Direct link to RegisteredAction")

Ƭ **RegisteredAction**<`Visibility`, `Args`, `Returns`>: { `isConvexFunction`: `true` ; `isAction`: `true` } & `VisibilityProperties`<`Visibility`>

An action that is part of this app.

You can create an action by wrapping your function in [actionGeneric](/api/modules/server.md#actiongeneric) or [internalActionGeneric](/api/modules/server.md#internalactiongeneric) and exporting it.

#### Type parameters[​](#type-parameters-37 "Direct link to Type parameters")

| Name         | Type                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| `Visibility` | extends [`FunctionVisibility`](/api/modules/server.md#functionvisibility)   |
| `Args`       | extends [`DefaultFunctionArgs`](/api/modules/server.md#defaultfunctionargs) |
| `Returns`    | `Returns`                                                                   |

#### Defined in[​](#defined-in-67 "Direct link to Defined in")

[server/registration.ts:574](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L574)

***

### PublicHttpAction[​](#publichttpaction "Direct link to PublicHttpAction")

Ƭ **PublicHttpAction**: `Object`

An HTTP action that is part of this app's public API.

You can create public HTTP actions by wrapping your function in [httpActionGeneric](/api/modules/server.md#httpactiongeneric) and exporting it.

#### Type declaration[​](#type-declaration-13 "Direct link to Type declaration")

| Name     | Type   |
| -------- | ------ |
| `isHttp` | `true` |

#### Defined in[​](#defined-in-68 "Direct link to Defined in")

[server/registration.ts:603](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L603)

***

### UnvalidatedFunction[​](#unvalidatedfunction "Direct link to UnvalidatedFunction")

Ƭ **UnvalidatedFunction**<`Ctx`, `Args`, `Returns`>: (`ctx`: `Ctx`, ...`args`: `Args`) => `Returns` | { `handler`: (`ctx`: `Ctx`, ...`args`: `Args`) => `Returns` }

**`Deprecated`**

\-- See the type definition for `MutationBuilder` or similar for the types used for defining Convex functions.

The definition of a Convex query, mutation, or action function without argument validation.

Convex functions always take a context object as their first argument and an (optional) args object as their second argument.

This can be written as a function like:

```
import { query } from "./_generated/server";



export const func = query(({ db }, { arg }) => {...});
```

or as an object like:

```
import { query } from "./_generated/server";



export const func = query({

  handler: ({ db }, { arg }) => {...},

});
```

See [ValidatedFunction](/api/interfaces/server.ValidatedFunction.md) to add argument validation.

#### Type parameters[​](#type-parameters-38 "Direct link to Type parameters")

| Name      | Type                                                    |
| --------- | ------------------------------------------------------- |
| `Ctx`     | `Ctx`                                                   |
| `Args`    | extends [`ArgsArray`](/api/modules/server.md#argsarray) |
| `Returns` | `Returns`                                               |

#### Defined in[​](#defined-in-69 "Direct link to Defined in")

[server/registration.ts:641](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L641)

***

### ReturnValueForOptionalValidator[​](#returnvalueforoptionalvalidator "Direct link to ReturnValueForOptionalValidator")

Ƭ **ReturnValueForOptionalValidator**<`ReturnsValidator`>: \[`ReturnsValidator`] extends \[[`Validator`](/api/modules/values.md#validator)<`any`, `any`, `any`>] ? [`ValidatorTypeToReturnType`](/api/modules/server.md#validatortypetoreturntype)<[`Infer`](/api/modules/values.md#infer)<`ReturnsValidator`>> : \[`ReturnsValidator`] extends \[[`PropertyValidators`](/api/modules/values.md#propertyvalidators)] ? [`ValidatorTypeToReturnType`](/api/modules/server.md#validatortypetoreturntype)<[`ObjectType`](/api/modules/values.md#objecttype)<`ReturnsValidator`>> : `any`

There are multiple syntaxes for defining a Convex function:

```
 - query(async (ctx, args) => {...})

 - query({ handler: async (ctx, args) => {...} })

 - query({ args: { a: v.string }, handler: async (ctx, args) => {...} } })

 - query({ args: { a: v.string }, returns: v.string(), handler: async (ctx, args) => {...} } })
```

In each of these, we want to correctly infer the type for the arguments and return value, preferring the type derived from a validator if it's provided.

To avoid having a separate overload for each, which would show up in error messages, we use the type params -- ArgsValidator, ReturnsValidator, ReturnValue, OneOrZeroArgs.

The type for ReturnValue and OneOrZeroArgs are constrained by the type or ArgsValidator and ReturnsValidator if they're present, and inferred from any explicit type annotations to the arguments or return value of the function.

Below are a few utility types to get the appropriate type constraints based on an optional validator.

Additional tricks:

* We use Validator | void instead of Validator | undefined because the latter does not work with `strictNullChecks` since it's equivalent to just `Validator`.
* We use a tuple type of length 1 to avoid distribution over the union <https://github.com/microsoft/TypeScript/issues/29368#issuecomment-453529532>

#### Type parameters[​](#type-parameters-39 "Direct link to Type parameters")

| Name               | Type                                                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ReturnsValidator` | extends [`Validator`](/api/modules/values.md#validator)<`any`, `any`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators) \| `void` |

#### Defined in[​](#defined-in-70 "Direct link to Defined in")

[server/registration.ts:743](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L743)

***

### ArgsArrayForOptionalValidator[​](#argsarrayforoptionalvalidator "Direct link to ArgsArrayForOptionalValidator")

Ƭ **ArgsArrayForOptionalValidator**<`ArgsValidator`>: \[`ArgsValidator`] extends \[[`Validator`](/api/modules/values.md#validator)<`any`, `any`, `any`>] ? `OneArgArray`<[`Infer`](/api/modules/values.md#infer)<`ArgsValidator`>> : \[`ArgsValidator`] extends \[[`PropertyValidators`](/api/modules/values.md#propertyvalidators)] ? `OneArgArray`<[`ObjectType`](/api/modules/values.md#objecttype)<`ArgsValidator`>> : [`ArgsArray`](/api/modules/server.md#argsarray)

#### Type parameters[​](#type-parameters-40 "Direct link to Type parameters")

| Name            | Type                                                                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ArgsValidator` | extends [`GenericValidator`](/api/modules/values.md#genericvalidator) \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators) \| `void` |

#### Defined in[​](#defined-in-71 "Direct link to Defined in")

[server/registration.ts:751](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L751)

***

### DefaultArgsForOptionalValidator[​](#defaultargsforoptionalvalidator "Direct link to DefaultArgsForOptionalValidator")

Ƭ **DefaultArgsForOptionalValidator**<`ArgsValidator`>: \[`ArgsValidator`] extends \[[`Validator`](/api/modules/values.md#validator)<`any`, `any`, `any`>] ? \[[`Infer`](/api/modules/values.md#infer)<`ArgsValidator`>] : \[`ArgsValidator`] extends \[[`PropertyValidators`](/api/modules/values.md#propertyvalidators)] ? \[[`ObjectType`](/api/modules/values.md#objecttype)<`ArgsValidator`>] : `OneArgArray`

#### Type parameters[​](#type-parameters-41 "Direct link to Type parameters")

| Name            | Type                                                                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ArgsValidator` | extends [`GenericValidator`](/api/modules/values.md#genericvalidator) \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators) \| `void` |

#### Defined in[​](#defined-in-72 "Direct link to Defined in")

[server/registration.ts:759](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L759)

***

### MutationBuilder[​](#mutationbuilder "Direct link to MutationBuilder")

Ƭ **MutationBuilder**<`DataModel`, `Visibility`>: \<ArgsValidator, ReturnsValidator, ReturnValue, OneOrZeroArgs>(`mutation`: { `args?`: `ArgsValidator` ; `returns?`: `ReturnsValidator` ; `handler`: (`ctx`: [`GenericMutationCtx`](/api/interfaces/server.GenericMutationCtx.md)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` } | (`ctx`: [`GenericMutationCtx`](/api/interfaces/server.GenericMutationCtx.md)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue`) => [`RegisteredMutation`](/api/modules/server.md#registeredmutation)<`Visibility`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

#### Type parameters[​](#type-parameters-42 "Direct link to Type parameters")

| Name         | Type                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| `DataModel`  | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel)     |
| `Visibility` | extends [`FunctionVisibility`](/api/modules/server.md#functionvisibility) |

#### Type declaration[​](#type-declaration-14 "Direct link to Type declaration")

▸ <`ArgsValidator`, `ReturnsValidator`, `ReturnValue`, `OneOrZeroArgs`>(`mutation`): [`RegisteredMutation`](/api/modules/server.md#registeredmutation)<`Visibility`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

Internal type helper used by Convex code generation.

Used to give [mutationGeneric](/api/modules/server.md#mutationgeneric) a type specific to your data model.

##### Type parameters[​](#type-parameters-43 "Direct link to Type parameters")

| Name               | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ArgsValidator`    | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnsValidator` | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnValue`      | extends `any` = `any`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `OneOrZeroArgs`    | extends [`ArgsArray`](/api/modules/server.md#argsarray) \| `OneArgArray`<[`Infer`](/api/modules/values.md#infer)<`ArgsValidator`>> \| `OneArgArray`<[`Expand`](/api/modules/server.md#expand)<{ \[Property in string \| number \| symbol]?: Exclude\<Infer\<ArgsValidator\[Property]>, undefined> } & { \[Property in string \| number \| symbol]: Infer\<ArgsValidator\[Property]> }>> = [`DefaultArgsForOptionalValidator`](/api/modules/server.md#defaultargsforoptionalvalidator)<`ArgsValidator`> |

##### Parameters[​](#parameters "Direct link to Parameters")

| Name       | Type                                                                                                                                                                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mutation` | { `args?`: `ArgsValidator` ; `returns?`: `ReturnsValidator` ; `handler`: (`ctx`: [`GenericMutationCtx`](/api/interfaces/server.GenericMutationCtx.md)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` } \| (`ctx`: [`GenericMutationCtx`](/api/interfaces/server.GenericMutationCtx.md)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` |

##### Returns[​](#returns "Direct link to Returns")

[`RegisteredMutation`](/api/modules/server.md#registeredmutation)<`Visibility`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

#### Defined in[​](#defined-in-73 "Direct link to Defined in")

[server/registration.ts:773](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L773)

***

### MutationBuilderWithTable[​](#mutationbuilderwithtable "Direct link to MutationBuilderWithTable")

Ƭ **MutationBuilderWithTable**<`DataModel`, `Visibility`>: \<ArgsValidator, ReturnsValidator, ReturnValue, OneOrZeroArgs>(`mutation`: { `args?`: `ArgsValidator` ; `returns?`: `ReturnsValidator` ; `handler`: (`ctx`: [`GenericMutationCtxWithTable`](/api/modules/server.md#genericmutationctxwithtable)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` } | (`ctx`: [`GenericMutationCtxWithTable`](/api/modules/server.md#genericmutationctxwithtable)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue`) => [`RegisteredMutation`](/api/modules/server.md#registeredmutation)<`Visibility`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

#### Type parameters[​](#type-parameters-44 "Direct link to Type parameters")

| Name         | Type                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| `DataModel`  | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel)     |
| `Visibility` | extends [`FunctionVisibility`](/api/modules/server.md#functionvisibility) |

#### Type declaration[​](#type-declaration-15 "Direct link to Type declaration")

▸ <`ArgsValidator`, `ReturnsValidator`, `ReturnValue`, `OneOrZeroArgs`>(`mutation`): [`RegisteredMutation`](/api/modules/server.md#registeredmutation)<`Visibility`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

Internal type helper used by Convex code generation.

Used to give [mutationGeneric](/api/modules/server.md#mutationgeneric) a type specific to your data model.

##### Type parameters[​](#type-parameters-45 "Direct link to Type parameters")

| Name               | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ArgsValidator`    | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnsValidator` | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnValue`      | extends `any` = `any`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `OneOrZeroArgs`    | extends [`ArgsArray`](/api/modules/server.md#argsarray) \| `OneArgArray`<[`Infer`](/api/modules/values.md#infer)<`ArgsValidator`>> \| `OneArgArray`<[`Expand`](/api/modules/server.md#expand)<{ \[Property in string \| number \| symbol]?: Exclude\<Infer\<ArgsValidator\[Property]>, undefined> } & { \[Property in string \| number \| symbol]: Infer\<ArgsValidator\[Property]> }>> = [`DefaultArgsForOptionalValidator`](/api/modules/server.md#defaultargsforoptionalvalidator)<`ArgsValidator`> |

##### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name       | Type                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mutation` | { `args?`: `ArgsValidator` ; `returns?`: `ReturnsValidator` ; `handler`: (`ctx`: [`GenericMutationCtxWithTable`](/api/modules/server.md#genericmutationctxwithtable)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` } \| (`ctx`: [`GenericMutationCtxWithTable`](/api/modules/server.md#genericmutationctxwithtable)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` |

##### Returns[​](#returns-1 "Direct link to Returns")

[`RegisteredMutation`](/api/modules/server.md#registeredmutation)<`Visibility`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

#### Defined in[​](#defined-in-74 "Direct link to Defined in")

[server/registration.ts:866](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L866)

***

### QueryBuilder[​](#querybuilder "Direct link to QueryBuilder")

Ƭ **QueryBuilder**<`DataModel`, `Visibility`>: \<ArgsValidator, ReturnsValidator, ReturnValue, OneOrZeroArgs>(`query`: { `args?`: `ArgsValidator` ; `returns?`: `ReturnsValidator` ; `handler`: (`ctx`: [`GenericQueryCtx`](/api/interfaces/server.GenericQueryCtx.md)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` } | (`ctx`: [`GenericQueryCtx`](/api/interfaces/server.GenericQueryCtx.md)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue`) => [`RegisteredQuery`](/api/modules/server.md#registeredquery)<`Visibility`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

#### Type parameters[​](#type-parameters-46 "Direct link to Type parameters")

| Name         | Type                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| `DataModel`  | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel)     |
| `Visibility` | extends [`FunctionVisibility`](/api/modules/server.md#functionvisibility) |

#### Type declaration[​](#type-declaration-16 "Direct link to Type declaration")

▸ <`ArgsValidator`, `ReturnsValidator`, `ReturnValue`, `OneOrZeroArgs`>(`query`): [`RegisteredQuery`](/api/modules/server.md#registeredquery)<`Visibility`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

Internal type helper used by Convex code generation.

Used to give [queryGeneric](/api/modules/server.md#querygeneric) a type specific to your data model.

##### Type parameters[​](#type-parameters-47 "Direct link to Type parameters")

| Name               | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ArgsValidator`    | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnsValidator` | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnValue`      | extends `any` = `any`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `OneOrZeroArgs`    | extends [`ArgsArray`](/api/modules/server.md#argsarray) \| `OneArgArray`<[`Infer`](/api/modules/values.md#infer)<`ArgsValidator`>> \| `OneArgArray`<[`Expand`](/api/modules/server.md#expand)<{ \[Property in string \| number \| symbol]?: Exclude\<Infer\<ArgsValidator\[Property]>, undefined> } & { \[Property in string \| number \| symbol]: Infer\<ArgsValidator\[Property]> }>> = [`DefaultArgsForOptionalValidator`](/api/modules/server.md#defaultargsforoptionalvalidator)<`ArgsValidator`> |

##### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name    | Type                                                                                                                                                                                                                                                                                                                                              |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query` | { `args?`: `ArgsValidator` ; `returns?`: `ReturnsValidator` ; `handler`: (`ctx`: [`GenericQueryCtx`](/api/interfaces/server.GenericQueryCtx.md)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` } \| (`ctx`: [`GenericQueryCtx`](/api/interfaces/server.GenericQueryCtx.md)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` |

##### Returns[​](#returns-2 "Direct link to Returns")

[`RegisteredQuery`](/api/modules/server.md#registeredquery)<`Visibility`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

#### Defined in[​](#defined-in-75 "Direct link to Defined in")

[server/registration.ts:959](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L959)

***

### QueryBuilderWithTable[​](#querybuilderwithtable "Direct link to QueryBuilderWithTable")

Ƭ **QueryBuilderWithTable**<`DataModel`, `Visibility`>: \<ArgsValidator, ReturnsValidator, ReturnValue, OneOrZeroArgs>(`query`: { `args?`: `ArgsValidator` ; `returns?`: `ReturnsValidator` ; `handler`: (`ctx`: [`GenericQueryCtxWithTable`](/api/modules/server.md#genericqueryctxwithtable)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` } | (`ctx`: [`GenericQueryCtxWithTable`](/api/modules/server.md#genericqueryctxwithtable)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue`) => [`RegisteredQuery`](/api/modules/server.md#registeredquery)<`Visibility`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

#### Type parameters[​](#type-parameters-48 "Direct link to Type parameters")

| Name         | Type                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| `DataModel`  | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel)     |
| `Visibility` | extends [`FunctionVisibility`](/api/modules/server.md#functionvisibility) |

#### Type declaration[​](#type-declaration-17 "Direct link to Type declaration")

▸ <`ArgsValidator`, `ReturnsValidator`, `ReturnValue`, `OneOrZeroArgs`>(`query`): [`RegisteredQuery`](/api/modules/server.md#registeredquery)<`Visibility`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

Internal type helper used by Convex code generation.

Used to give [queryGeneric](/api/modules/server.md#querygeneric) a type specific to your data model.

##### Type parameters[​](#type-parameters-49 "Direct link to Type parameters")

| Name               | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ArgsValidator`    | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnsValidator` | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnValue`      | extends `any` = `any`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `OneOrZeroArgs`    | extends [`ArgsArray`](/api/modules/server.md#argsarray) \| `OneArgArray`<[`Infer`](/api/modules/values.md#infer)<`ArgsValidator`>> \| `OneArgArray`<[`Expand`](/api/modules/server.md#expand)<{ \[Property in string \| number \| symbol]?: Exclude\<Infer\<ArgsValidator\[Property]>, undefined> } & { \[Property in string \| number \| symbol]: Infer\<ArgsValidator\[Property]> }>> = [`DefaultArgsForOptionalValidator`](/api/modules/server.md#defaultargsforoptionalvalidator)<`ArgsValidator`> |

##### Parameters[​](#parameters-3 "Direct link to Parameters")

| Name    | Type                                                                                                                                                                                                                                                                                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query` | { `args?`: `ArgsValidator` ; `returns?`: `ReturnsValidator` ; `handler`: (`ctx`: [`GenericQueryCtxWithTable`](/api/modules/server.md#genericqueryctxwithtable)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` } \| (`ctx`: [`GenericQueryCtxWithTable`](/api/modules/server.md#genericqueryctxwithtable)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` |

##### Returns[​](#returns-3 "Direct link to Returns")

[`RegisteredQuery`](/api/modules/server.md#registeredquery)<`Visibility`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

#### Defined in[​](#defined-in-76 "Direct link to Defined in")

[server/registration.ts:1048](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L1048)

***

### ActionBuilder[​](#actionbuilder "Direct link to ActionBuilder")

Ƭ **ActionBuilder**<`DataModel`, `Visibility`>: \<ArgsValidator, ReturnsValidator, ReturnValue, OneOrZeroArgs>(`func`: { `args?`: `ArgsValidator` ; `returns?`: `ReturnsValidator` ; `handler`: (`ctx`: [`GenericActionCtx`](/api/interfaces/server.GenericActionCtx.md)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` } | (`ctx`: [`GenericActionCtx`](/api/interfaces/server.GenericActionCtx.md)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue`) => [`RegisteredAction`](/api/modules/server.md#registeredaction)<`Visibility`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

#### Type parameters[​](#type-parameters-50 "Direct link to Type parameters")

| Name         | Type                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| `DataModel`  | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel)     |
| `Visibility` | extends [`FunctionVisibility`](/api/modules/server.md#functionvisibility) |

#### Type declaration[​](#type-declaration-18 "Direct link to Type declaration")

▸ <`ArgsValidator`, `ReturnsValidator`, `ReturnValue`, `OneOrZeroArgs`>(`func`): [`RegisteredAction`](/api/modules/server.md#registeredaction)<`Visibility`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

Internal type helper used by Convex code generation.

Used to give [actionGeneric](/api/modules/server.md#actiongeneric) a type specific to your data model.

##### Type parameters[​](#type-parameters-51 "Direct link to Type parameters")

| Name               | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ArgsValidator`    | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnsValidator` | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnValue`      | extends `any` = `any`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `OneOrZeroArgs`    | extends [`ArgsArray`](/api/modules/server.md#argsarray) \| `OneArgArray`<[`Infer`](/api/modules/values.md#infer)<`ArgsValidator`>> \| `OneArgArray`<[`Expand`](/api/modules/server.md#expand)<{ \[Property in string \| number \| symbol]?: Exclude\<Infer\<ArgsValidator\[Property]>, undefined> } & { \[Property in string \| number \| symbol]: Infer\<ArgsValidator\[Property]> }>> = [`DefaultArgsForOptionalValidator`](/api/modules/server.md#defaultargsforoptionalvalidator)<`ArgsValidator`> |

##### Parameters[​](#parameters-4 "Direct link to Parameters")

| Name   | Type                                                                                                                                                                                                                                                                                                                                                  |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `func` | { `args?`: `ArgsValidator` ; `returns?`: `ReturnsValidator` ; `handler`: (`ctx`: [`GenericActionCtx`](/api/interfaces/server.GenericActionCtx.md)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` } \| (`ctx`: [`GenericActionCtx`](/api/interfaces/server.GenericActionCtx.md)<`DataModel`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` |

##### Returns[​](#returns-4 "Direct link to Returns")

[`RegisteredAction`](/api/modules/server.md#registeredaction)<`Visibility`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

#### Defined in[​](#defined-in-77 "Direct link to Defined in")

[server/registration.ts:1137](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L1137)

***

### HttpActionBuilder[​](#httpactionbuilder "Direct link to HttpActionBuilder")

Ƭ **HttpActionBuilder**: (`func`: (`ctx`: [`GenericActionCtx`](/api/interfaces/server.GenericActionCtx.md)<`any`>, `request`: `Request`) => `Promise`<`Response`>) => [`PublicHttpAction`](/api/modules/server.md#publichttpaction)

#### Type declaration[​](#type-declaration-19 "Direct link to Type declaration")

▸ (`func`): [`PublicHttpAction`](/api/modules/server.md#publichttpaction)

Internal type helper used by Convex code generation.

Used to give [httpActionGeneric](/api/modules/server.md#httpactiongeneric) a type specific to your data model and functions.

##### Parameters[​](#parameters-5 "Direct link to Parameters")

| Name   | Type                                                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `func` | (`ctx`: [`GenericActionCtx`](/api/interfaces/server.GenericActionCtx.md)<`any`>, `request`: `Request`) => `Promise`<`Response`> |

##### Returns[​](#returns-5 "Direct link to Returns")

[`PublicHttpAction`](/api/modules/server.md#publichttpaction)

#### Defined in[​](#defined-in-78 "Direct link to Defined in")

[server/registration.ts:1232](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L1232)

***

### RoutableMethod[​](#routablemethod "Direct link to RoutableMethod")

Ƭ **RoutableMethod**: typeof [`ROUTABLE_HTTP_METHODS`](/api/modules/server.md#routable_http_methods)\[`number`]

A type representing the methods supported by Convex HTTP actions.

HEAD is handled by Convex by running GET and stripping the body. CONNECT is not supported and will not be supported. TRACE is not supported and will not be supported.

#### Defined in[​](#defined-in-79 "Direct link to Defined in")

[server/router.ts:31](https://github.com/get-convex/convex-js/blob/main/src/server/router.ts#L31)

***

### RouteSpecWithPath[​](#routespecwithpath "Direct link to RouteSpecWithPath")

Ƭ **RouteSpecWithPath**: `Object`

A type representing a route to an HTTP action using an exact request URL path match.

Used by [HttpRouter](/api/classes/server.HttpRouter.md) to route requests to HTTP actions.

#### Type declaration[​](#type-declaration-20 "Direct link to Type declaration")

| Name      | Type                                                          | Description                                |
| --------- | ------------------------------------------------------------- | ------------------------------------------ |
| `path`    | `string`                                                      | Exact HTTP request path to route.          |
| `method`  | [`RoutableMethod`](/api/modules/server.md#routablemethod)     | HTTP method ("GET", "POST", ...) to route. |
| `handler` | [`PublicHttpAction`](/api/modules/server.md#publichttpaction) | The HTTP action to execute.                |

#### Defined in[​](#defined-in-80 "Direct link to Defined in")

[server/router.ts:56](https://github.com/get-convex/convex-js/blob/main/src/server/router.ts#L56)

***

### RouteSpecWithPathPrefix[​](#routespecwithpathprefix "Direct link to RouteSpecWithPathPrefix")

Ƭ **RouteSpecWithPathPrefix**: `Object`

A type representing a route to an HTTP action using a request URL path prefix match.

Used by [HttpRouter](/api/classes/server.HttpRouter.md) to route requests to HTTP actions.

#### Type declaration[​](#type-declaration-21 "Direct link to Type declaration")

| Name         | Type                                                          | Description                                                                                                            |
| ------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `pathPrefix` | `string`                                                      | An HTTP request path prefix to route. Requests with a path starting with this value will be routed to the HTTP action. |
| `method`     | [`RoutableMethod`](/api/modules/server.md#routablemethod)     | HTTP method ("GET", "POST", ...) to route.                                                                             |
| `handler`    | [`PublicHttpAction`](/api/modules/server.md#publichttpaction) | The HTTP action to execute.                                                                                            |

#### Defined in[​](#defined-in-81 "Direct link to Defined in")

[server/router.ts:78](https://github.com/get-convex/convex-js/blob/main/src/server/router.ts#L78)

***

### RouteSpec[​](#routespec "Direct link to RouteSpec")

Ƭ **RouteSpec**: [`RouteSpecWithPath`](/api/modules/server.md#routespecwithpath) | [`RouteSpecWithPathPrefix`](/api/modules/server.md#routespecwithpathprefix)

A type representing a route to an HTTP action.

Used by [HttpRouter](/api/classes/server.HttpRouter.md) to route requests to HTTP actions.

#### Defined in[​](#defined-in-82 "Direct link to Defined in")

[server/router.ts:101](https://github.com/get-convex/convex-js/blob/main/src/server/router.ts#L101)

***

### SchedulableFunctionReference[​](#schedulablefunctionreference "Direct link to SchedulableFunctionReference")

Ƭ **SchedulableFunctionReference**: [`FunctionReference`](/api/modules/server.md#functionreference)<`"mutation"` | `"action"`, `"public"` | `"internal"`>

A [FunctionReference](/api/modules/server.md#functionreference) that can be scheduled to run in the future.

Schedulable functions are mutations and actions that are public or internal.

#### Defined in[​](#defined-in-83 "Direct link to Defined in")

[server/scheduler.ts:15](https://github.com/get-convex/convex-js/blob/main/src/server/scheduler.ts#L15)

***

### SystemFieldValidators[​](#systemfieldvalidators "Direct link to SystemFieldValidators")

Ƭ **SystemFieldValidators**<`TableName`>: `Object`

The validators for the system fields Convex adds to every document.

#### Type parameters[​](#type-parameters-52 "Direct link to Type parameters")

| Name        | Type             |
| ----------- | ---------------- |
| `TableName` | extends `string` |

#### Type declaration[​](#type-declaration-22 "Direct link to Type declaration")

| Name            | Type                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------- |
| `_id`           | [`VId`](/api/classes/values.VId.md)<[`GenericId`](/api/modules/values.md#genericid)<`TableName`>> |
| `_creationTime` | [`VFloat64`](/api/classes/values.VFloat64.md)<`number`>                                           |

#### Defined in[​](#defined-in-84 "Direct link to Defined in")

[server/schema.ts:725](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L725)

***

### DocValidator[​](#docvalidator "Direct link to DocValidator")

Ƭ **DocValidator**<`TableName`, `DocumentType`>: `DocumentType` extends [`VUnion`](/api/classes/values.VUnion.md)<`any`, infer Members, `any`, `any`> ? { \[Index in keyof Members]: WithSystemFieldValidators\<TableName, Members\[Index]> } extends infer NewMembers ? [`VUnion`](/api/classes/values.VUnion.md)<`WithSystemFieldValidators`<`TableName`, `Members`\[`number`]>\[`"type"`], `NewMembers`> : `never` : `WithSystemFieldValidators`<`TableName`, `DocumentType`>

The validator for whole documents of a table: the table's own validator with the `_id` and `_creationTime` system fields added.

For a table defined with a union, the system fields are added to each member of the union.

#### Type parameters[​](#type-parameters-53 "Direct link to Type parameters")

| Name           | Type                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| `TableName`    | extends `string`                                                             |
| `DocumentType` | extends [`Validator`](/api/modules/values.md#validator)<`any`, `any`, `any`> |

#### Defined in[​](#defined-in-85 "Direct link to Defined in")

[server/schema.ts:754](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L754)

***

### GenericSchema[​](#genericschema "Direct link to GenericSchema")

Ƭ **GenericSchema**: `Record`<`string`, [`TableDefinition`](/api/classes/server.TableDefinition.md)>

A type describing the schema of a Convex project.

This should be constructed using [defineSchema](/api/modules/server.md#defineschema), [defineTable](/api/modules/server.md#definetable), and [v](/api/modules/values.md#v).

#### Defined in[​](#defined-in-86 "Direct link to Defined in")

[server/schema.ts:842](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L842)

***

### DataModelFromSchemaDefinition[​](#datamodelfromschemadefinition "Direct link to DataModelFromSchemaDefinition")

Ƭ **DataModelFromSchemaDefinition**<`SchemaDef`>: `MaybeMakeLooseDataModel`<{ \[TableName in keyof SchemaDef\["tables"] & string]: SchemaDef\["tables"]\[TableName] extends TableDefinition\<infer DocumentType, infer Indexes, infer SearchIndexes, infer VectorIndexes> ? Object : never }, `SchemaDef`\[`"strictTableNameTypes"`]>

Internal type used in Convex code generation!

Convert a [SchemaDefinition](/api/classes/server.SchemaDefinition.md) into a [GenericDataModel](/api/modules/server.md#genericdatamodel).

#### Type parameters[​](#type-parameters-54 "Direct link to Type parameters")

| Name        | Type                                                                                    |
| ----------- | --------------------------------------------------------------------------------------- |
| `SchemaDef` | extends [`SchemaDefinition`](/api/classes/server.SchemaDefinition.md)<`any`, `boolean`> |

#### Defined in[​](#defined-in-87 "Direct link to Defined in")

[server/schema.ts:1079](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L1079)

***

### SystemTableNames[​](#systemtablenames "Direct link to SystemTableNames")

Ƭ **SystemTableNames**: [`TableNamesInDataModel`](/api/modules/server.md#tablenamesindatamodel)<[`SystemDataModel`](/api/interfaces/server.SystemDataModel.md)>

#### Defined in[​](#defined-in-88 "Direct link to Defined in")

[server/schema.ts:1138](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L1138)

***

### StorageId[​](#storageid "Direct link to StorageId")

Ƭ **StorageId**: `string`

**`Deprecated`**

This ID format is no longer returned by stable file storage APIs. Use `Id<"_storage">` instead.

The old ID format used by Convex file storage.

⚠️ Security warning: Anyone that has knows to this ID can download the underlying file from `https://<deployment>.convex.cloud/api/storage/<storageId>`. (Note that it’s safe to share the new ID format, `Id<"_storage">`, to anyone).

#### Defined in[​](#defined-in-89 "Direct link to Defined in")

[server/storage.ts:14](https://github.com/get-convex/convex-js/blob/main/src/server/storage.ts#L14)

***

### FileStorageId[​](#filestorageid "Direct link to FileStorageId")

Ƭ **FileStorageId**: [`GenericId`](/api/modules/values.md#genericid)<`"_storage"`> | [`StorageId`](/api/modules/server.md#storageid)

**`Deprecated`**

This type is only necessary for backwards compatibility with Convex versions that pre-date `convex@1.6.0`. Use `Id<"_storage">` instead.

#### Defined in[​](#defined-in-90 "Direct link to Defined in")

[server/storage.ts:20](https://github.com/get-convex/convex-js/blob/main/src/server/storage.ts#L20)

***

### FileMetadata[​](#filemetadata "Direct link to FileMetadata")

Ƭ **FileMetadata**: `Object`

**`Deprecated`**

This type is only returned by [storage.getUrl](/api/interfaces/server.StorageReader.md#geturl). To get the details of a document, use `ctx.db.system.get("_storage", storageId)` instead.

Metadata for a single file as returned by [storage.getMetadata](/api/interfaces/server.StorageReader.md#getmetadata).

#### Type declaration[​](#type-declaration-23 "Direct link to Type declaration")

| Name          | Type                                            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `storageId`   | [`StorageId`](/api/modules/server.md#storageid) | ID for referencing the file (eg. via [storage.getUrl](/api/interfaces/server.StorageReader.md#geturl)) This is an older ID format that is no longer returned by stable file storage APIs. Consider using `Id<"_storage">` instead. ⚠️ Security warning: Anyone that has knows to this ID can download the underlying file from `https://<deployment>.convex.cloud/api/storage/<storageId>`. (Note that it’s safe to share the new ID format, `Id<"_storage">`, to anyone). |
| `sha256`      | `string`                                        | Hex encoded sha256 checksum of file contents                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `size`        | `number`                                        | Size of the file in bytes                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `contentType` | `string` \| `null`                              | ContentType of the file if it was provided on upload                                                                                                                                                                                                                                                                                                                                                                                                                       |

#### Defined in[​](#defined-in-91 "Direct link to Defined in")

[server/storage.ts:30](https://github.com/get-convex/convex-js/blob/main/src/server/storage.ts#L30)

***

### SystemFields[​](#systemfields "Direct link to SystemFields")

Ƭ **SystemFields**: `Object`

The fields that Convex automatically adds to documents, not including `_id`.

This is an object type mapping field name to field type.

#### Type declaration[​](#type-declaration-24 "Direct link to Type declaration")

| Name            | Type     |
| --------------- | -------- |
| `_creationTime` | `number` |

#### Defined in[​](#defined-in-92 "Direct link to Defined in")

[server/system\_fields.ts:11](https://github.com/get-convex/convex-js/blob/main/src/server/system_fields.ts#L11)

***

### IdField[​](#idfield "Direct link to IdField")

Ƭ **IdField**<`TableName`>: `Object`

The `_id` field that Convex automatically adds to documents.

#### Type parameters[​](#type-parameters-55 "Direct link to Type parameters")

| Name        | Type             |
| ----------- | ---------------- |
| `TableName` | extends `string` |

#### Type declaration[​](#type-declaration-25 "Direct link to Type declaration")

| Name  | Type                                                         |
| ----- | ------------------------------------------------------------ |
| `_id` | [`GenericId`](/api/modules/values.md#genericid)<`TableName`> |

#### Defined in[​](#defined-in-93 "Direct link to Defined in")

[server/system\_fields.ts:19](https://github.com/get-convex/convex-js/blob/main/src/server/system_fields.ts#L19)

***

### WithoutSystemFields[​](#withoutsystemfields "Direct link to WithoutSystemFields")

Ƭ **WithoutSystemFields**<`Document`>: [`Expand`](/api/modules/server.md#expand)<[`BetterOmit`](/api/modules/server.md#betteromit)<`Document`, keyof [`SystemFields`](/api/modules/server.md#systemfields) | `"_id"`>>

A Convex document with the system fields like `_id` and `_creationTime` omitted.

#### Type parameters[​](#type-parameters-56 "Direct link to Type parameters")

| Name       | Type                                                                |
| ---------- | ------------------------------------------------------------------- |
| `Document` | extends [`GenericDocument`](/api/modules/server.md#genericdocument) |

#### Defined in[​](#defined-in-94 "Direct link to Defined in")

[server/system\_fields.ts:28](https://github.com/get-convex/convex-js/blob/main/src/server/system_fields.ts#L28)

***

### WithOptionalSystemFields[​](#withoptionalsystemfields "Direct link to WithOptionalSystemFields")

Ƭ **WithOptionalSystemFields**<`Document`>: [`Expand`](/api/modules/server.md#expand)<[`WithoutSystemFields`](/api/modules/server.md#withoutsystemfields)<`Document`> & `Partial`<`Pick`<`Document`, keyof [`SystemFields`](/api/modules/server.md#systemfields) | `"_id"`>>>

A Convex document with the system fields like `_id` and `_creationTime` optional.

#### Type parameters[​](#type-parameters-57 "Direct link to Type parameters")

| Name       | Type                                                                |
| ---------- | ------------------------------------------------------------------- |
| `Document` | extends [`GenericDocument`](/api/modules/server.md#genericdocument) |

#### Defined in[​](#defined-in-95 "Direct link to Defined in")

[server/system\_fields.ts:37](https://github.com/get-convex/convex-js/blob/main/src/server/system_fields.ts#L37)

***

### SystemIndexes[​](#systemindexes "Direct link to SystemIndexes")

Ƭ **SystemIndexes**: `Object`

The indexes that Convex automatically adds to every table.

This is an object mapping index names to index field paths.

#### Type declaration[​](#type-declaration-26 "Direct link to Type declaration")

| Name               | Type                 |
| ------------------ | -------------------- |
| `by_id`            | \[`"_id"`]           |
| `by_creation_time` | \[`"_creationTime"`] |

#### Defined in[​](#defined-in-96 "Direct link to Defined in")

[server/system\_fields.ts:48](https://github.com/get-convex/convex-js/blob/main/src/server/system_fields.ts#L48)

***

### IndexTiebreakerField[​](#indextiebreakerfield "Direct link to IndexTiebreakerField")

Ƭ **IndexTiebreakerField**: `"_creationTime"`

Convex automatically appends "\_creationTime" to the end of every index to break ties if all of the other fields are identical.

#### Defined in[​](#defined-in-97 "Direct link to Defined in")

[server/system\_fields.ts:61](https://github.com/get-convex/convex-js/blob/main/src/server/system_fields.ts#L61)

***

### VectorSearch[​](#vectorsearch "Direct link to VectorSearch")

Ƭ **VectorSearch**<`DataModel`, `TableName`, `IndexName`>: (`tableName`: `TableName`, `indexName`: `IndexName`, `query`: [`VectorSearchQuery`](/api/interfaces/server.VectorSearchQuery.md)<[`NamedTableInfo`](/api/modules/server.md#namedtableinfo)<`DataModel`, `TableName`>, `IndexName`>) => `Promise`<{ `_id`: [`GenericId`](/api/modules/values.md#genericid)<`TableName`> ; `_score`: `number` }\[]>

#### Type parameters[​](#type-parameters-58 "Direct link to Type parameters")

| Name        | Type                                                                                                                                                       |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DataModel` | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel)                                                                                      |
| `TableName` | extends [`TableNamesInDataModel`](/api/modules/server.md#tablenamesindatamodel)<`DataModel`>                                                               |
| `IndexName` | extends [`VectorIndexNames`](/api/modules/server.md#vectorindexnames)<[`NamedTableInfo`](/api/modules/server.md#namedtableinfo)<`DataModel`, `TableName`>> |

#### Type declaration[​](#type-declaration-27 "Direct link to Type declaration")

▸ (`tableName`, `indexName`, `query`): `Promise`<{ `_id`: [`GenericId`](/api/modules/values.md#genericid)<`TableName`> ; `_score`: `number` }\[]>

##### Parameters[​](#parameters-6 "Direct link to Parameters")

| Name        | Type                                                                                                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tableName` | `TableName`                                                                                                                                                          |
| `indexName` | `IndexName`                                                                                                                                                          |
| `query`     | [`VectorSearchQuery`](/api/interfaces/server.VectorSearchQuery.md)<[`NamedTableInfo`](/api/modules/server.md#namedtableinfo)<`DataModel`, `TableName`>, `IndexName`> |

##### Returns[​](#returns-6 "Direct link to Returns")

`Promise`<{ `_id`: [`GenericId`](/api/modules/values.md#genericid)<`TableName`> ; `_score`: `number` }\[]>

#### Defined in[​](#defined-in-98 "Direct link to Defined in")

[server/vector\_search.ts:55](https://github.com/get-convex/convex-js/blob/main/src/server/vector_search.ts#L55)

***

### Expand[​](#expand "Direct link to Expand")

Ƭ **Expand**<`ObjectType`>: `ObjectType` extends `Record`<`any`, `any`> ? { \[Key in keyof ObjectType]: ObjectType\[Key] } : `never`

Hack! This type causes TypeScript to simplify how it renders object types.

It is functionally the identity for object types, but in practice it can simplify expressions like `A & B`.

#### Type parameters[​](#type-parameters-59 "Direct link to Type parameters")

| Name         | Type                           |
| ------------ | ------------------------------ |
| `ObjectType` | extends `Record`<`any`, `any`> |

#### Defined in[​](#defined-in-99 "Direct link to Defined in")

[type\_utils.ts:12](https://github.com/get-convex/convex-js/blob/main/src/type_utils.ts#L12)

***

### BetterOmit[​](#betteromit "Direct link to BetterOmit")

Ƭ **BetterOmit**<`T`, `K`>: { \[Property in keyof T as Property extends K ? never : Property]: T\[Property] }

An `Omit<>` type that:

1. Applies to each element of a union.
2. Preserves the index signature of the underlying type.

#### Type parameters[​](#type-parameters-60 "Direct link to Type parameters")

| Name | Type              |
| ---- | ----------------- |
| `T`  | `T`               |
| `K`  | extends keyof `T` |

#### Defined in[​](#defined-in-100 "Direct link to Defined in")

[type\_utils.ts:24](https://github.com/get-convex/convex-js/blob/main/src/type_utils.ts#L24)

## Variables[​](#variables "Direct link to Variables")

### anyApi[​](#anyapi-1 "Direct link to anyApi")

• `Const` **anyApi**: [`AnyApi`](/api/modules/server.md#anyapi)

A utility for constructing [FunctionReference](/api/modules/server.md#functionreference)s in projects that are not using code generation.

You can create a reference to a function like:

```
const reference = anyApi.myModule.myFunction;
```

This supports accessing any path regardless of what directories and modules are in your project. All function references are typed as AnyFunctionReference.

If you're using code generation, use `api` from `convex/_generated/api` instead. It will be more type-safe and produce better auto-complete in your editor.

#### Defined in[​](#defined-in-101 "Direct link to Defined in")

[server/api.ts:606](https://github.com/get-convex/convex-js/blob/main/src/server/api.ts#L606)

***

### log[​](#log "Direct link to log")

• `Const` **log**: `Log`

#### Defined in[​](#defined-in-102 "Direct link to Defined in")

[server/log.ts:31](https://github.com/get-convex/convex-js/blob/main/src/server/log.ts#L31)

***

### paginationOptsValidator[​](#paginationoptsvalidator "Direct link to paginationOptsValidator")

• `Const` **paginationOptsValidator**: [`VObject`](/api/classes/values.VObject.md)<{ `id`: `undefined` | `number` ; `endCursor`: `undefined` | `null` | `string` ; `maximumRowsRead`: `undefined` | `number` ; `maximumBytesRead`: `undefined` | `number` ; `numItems`: `number` ; `cursor`: `null` | `string` }, { `numItems`: [`VFloat64`](/api/classes/values.VFloat64.md)<`number`, `"required"`> ; `cursor`: [`VUnion`](/api/classes/values.VUnion.md)<`null` | `string`, \[[`VString`](/api/classes/values.VString.md)<`string`, `"required"`>, [`VNull`](/api/classes/values.VNull.md)<`null`, `"required"`>], `"required"`, `never`> ; `endCursor`: [`VUnion`](/api/classes/values.VUnion.md)<`undefined` | `null` | `string`, \[[`VString`](/api/classes/values.VString.md)<`string`, `"required"`>, [`VNull`](/api/classes/values.VNull.md)<`null`, `"required"`>], `"optional"`, `never`> ; `id`: [`VFloat64`](/api/classes/values.VFloat64.md)<`undefined` | `number`, `"optional"`> ; `maximumRowsRead`: [`VFloat64`](/api/classes/values.VFloat64.md)<`undefined` | `number`, `"optional"`> ; `maximumBytesRead`: [`VFloat64`](/api/classes/values.VFloat64.md)<`undefined` | `number`, `"optional"`> }, `"required"`, `"id"` | `"numItems"` | `"cursor"` | `"endCursor"` | `"maximumRowsRead"` | `"maximumBytesRead"`>

A [Validator](/api/modules/values.md#validator) for [PaginationOptions](/api/interfaces/server.PaginationOptions.md).

Use this as the args validator in paginated query functions so that clients can pass pagination options.

**`Example`**

```
import { query } from "./_generated/server";

import { paginationOptsValidator } from "convex/server";

import { v } from "convex/values";



export const listMessages = query({

  args: {

    channelId: v.id("channels"),

    paginationOpts: paginationOptsValidator,

  },

  handler: async (ctx, args) => {

    return await ctx.db

      .query("messages")

      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))

      .order("desc")

      .paginate(args.paginationOpts);

  },

});
```

On the client, use `usePaginatedQuery` from `"convex/react"`:

```
const { results, status, loadMore } = usePaginatedQuery(

  api.messages.listMessages,

  { channelId },

  { initialNumItems: 25 },

);
```

**`See`**

<https://docs.convex.dev/database/pagination>

#### Defined in[​](#defined-in-103 "Direct link to Defined in")

[server/pagination.ts:163](https://github.com/get-convex/convex-js/blob/main/src/server/pagination.ts#L163)

***

### ROUTABLE\_HTTP\_METHODS[​](#routable_http_methods "Direct link to ROUTABLE_HTTP_METHODS")

• `Const` **ROUTABLE\_HTTP\_METHODS**: readonly \[`"GET"`, `"POST"`, `"PUT"`, `"DELETE"`, `"OPTIONS"`, `"PATCH"`]

A list of the methods supported by Convex HTTP actions.

HEAD is handled by Convex by running GET and stripping the body. CONNECT is not supported and will not be supported. TRACE is not supported and will not be supported.

#### Defined in[​](#defined-in-104 "Direct link to Defined in")

[server/router.ts:14](https://github.com/get-convex/convex-js/blob/main/src/server/router.ts#L14)

## Functions[​](#functions "Direct link to Functions")

### getFunctionName[​](#getfunctionname "Direct link to getFunctionName")

▸ **getFunctionName**(`functionReference`): `string`

Get the name of a function from a [FunctionReference](/api/modules/server.md#functionreference).

The name is a string like "myDir/myModule<!-- -->:myFunction<!-- -->". If the exported name of the function is `"default"`, the function name is omitted (e.g. "myDir/myModule").

#### Parameters[​](#parameters-7 "Direct link to Parameters")

| Name                | Type                                                                                                                                                                                                                                                       | Description                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `functionReference` | [`FunctionReference`](/api/modules/server.md#functionreference)<`any`, `any`, `any`, `any`, `undefined` \| `string`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`any`, `any`, `any`, `any`, `undefined` \| `string`> | A [FunctionReference](/api/modules/server.md#functionreference) to get the name of. |

#### Returns[​](#returns-7 "Direct link to Returns")

`string`

A string of the function's name.

#### Defined in[​](#defined-in-105 "Direct link to Defined in")

[server/api.ts:251](https://github.com/get-convex/convex-js/blob/main/src/server/api.ts#L251)

***

### makeFunctionReference[​](#makefunctionreference "Direct link to makeFunctionReference")

▸ **makeFunctionReference**<`type`, `args`, `ret`>(`name`): [`FunctionReference`](/api/modules/server.md#functionreference)<`type`, `"public"`, `args`, `ret`>

FunctionReferences generally come from generated code, but in custom clients it may be useful to be able to build one manually.

Real function references are empty objects at runtime, but the same interface can be implemented with an object for tests and clients which don't use code generation.

#### Type parameters[​](#type-parameters-61 "Direct link to Type parameters")

| Name   | Type                                                                                |
| ------ | ----------------------------------------------------------------------------------- |
| `type` | extends [`FunctionType`](/api/modules/server.md#functiontype)                       |
| `args` | extends [`DefaultFunctionArgs`](/api/modules/server.md#defaultfunctionargs) = `any` |
| `ret`  | `any`                                                                               |

#### Parameters[​](#parameters-8 "Direct link to Parameters")

| Name   | Type     | Description                                                      |
| ------ | -------- | ---------------------------------------------------------------- |
| `name` | `string` | The identifier of the function. E.g. `path/to/file:functionName` |

#### Returns[​](#returns-8 "Direct link to Returns")

[`FunctionReference`](/api/modules/server.md#functionreference)<`type`, `"public"`, `args`, `ret`>

#### Defined in[​](#defined-in-106 "Direct link to Defined in")

[server/api.ts:297](https://github.com/get-convex/convex-js/blob/main/src/server/api.ts#L297)

***

### filterApi[​](#filterapi-1 "Direct link to filterApi")

▸ **filterApi**<`API`, `Predicate`>(`api`): [`FilterApi`](/api/modules/server.md#filterapi)<`API`, `Predicate`>

Given an api of type API and a FunctionReference subtype, return an api object containing only the function references that match.

```
const q = filterApi<typeof api, FunctionReference<"query">>(api)
```

#### Type parameters[​](#type-parameters-62 "Direct link to Type parameters")

| Name        |
| ----------- |
| `API`       |
| `Predicate` |

#### Parameters[​](#parameters-9 "Direct link to Parameters")

| Name  | Type  |
| ----- | ----- |
| `api` | `API` |

#### Returns[​](#returns-9 "Direct link to Returns")

[`FilterApi`](/api/modules/server.md#filterapi)<`API`, `Predicate`>

#### Defined in[​](#defined-in-107 "Direct link to Defined in")

[server/api.ts:480](https://github.com/get-convex/convex-js/blob/main/src/server/api.ts#L480)

***

### createFunctionHandle[​](#createfunctionhandle "Direct link to createFunctionHandle")

▸ **createFunctionHandle**<`Type`, `Args`, `ReturnType`>(`functionReference`): `Promise`<[`FunctionHandle`](/api/modules/server.md#functionhandle)<`Type`, `Args`, `ReturnType`>>

Create a serializable reference to a Convex function. Passing a this reference to another component allows that component to call this function during the current function execution or at any later time. Function handles are used like `api.folder.function` FunctionReferences, e.g. `ctx.scheduler.runAfter(0, functionReference, args)`.

A function reference is stable across code pushes but it's possible the Convex function it refers to might no longer exist.

This is a feature of components, which are in beta. This API is unstable and may change in subsequent releases.

#### Type parameters[​](#type-parameters-63 "Direct link to Type parameters")

| Name         | Type                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| `Type`       | extends [`FunctionType`](/api/modules/server.md#functiontype)               |
| `Args`       | extends [`DefaultFunctionArgs`](/api/modules/server.md#defaultfunctionargs) |
| `ReturnType` | `ReturnType`                                                                |

#### Parameters[​](#parameters-10 "Direct link to Parameters")

| Name                | Type                                                                                                                                                                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `functionReference` | [`FunctionReference`](/api/modules/server.md#functionreference)<`Type`, `"public"` \| `"internal"`, `Args`, `ReturnType`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`Type`, `"public"` \| `"internal"`, `Args`, `ReturnType`> |

#### Returns[​](#returns-10 "Direct link to Returns")

`Promise`<[`FunctionHandle`](/api/modules/server.md#functionhandle)<`Type`, `Args`, `ReturnType`>>

#### Defined in[​](#defined-in-108 "Direct link to Defined in")

[server/components/index.ts:65](https://github.com/get-convex/convex-js/blob/main/src/server/components/index.ts#L65)

***

### defineComponent[​](#definecomponent "Direct link to defineComponent")

▸ **defineComponent**<`Exports`, `Env`>(`name`, `options?`): [`ComponentDefinition`](/api/modules/server.md#componentdefinition)<`Exports`, `Env`>

Define a component, a piece of a Convex deployment with namespaced resources.

Optionally define typed environment variables that will be available via the `env` export from `_generated/server` in all Convex functions within this component. Values are passed by the parent via `app.use(component, { env: { ... } })`.

#### Type parameters[​](#type-parameters-64 "Direct link to Type parameters")

| Name      | Type                                                              |
| --------- | ----------------------------------------------------------------- |
| `Exports` | extends `ComponentExports` = `any`                                |
| `Env`     | extends [`EnvDefinition`](/api/modules/server.md#envdefinition) = |

#### Parameters[​](#parameters-11 "Direct link to Parameters")

| Name           | Type     | Description                                                                                                                                                                                                                                  |
| -------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`         | `string` | Name must be alphanumeric plus underscores. Typically these are lowercase with underscores like `"onboarding_flow_tracker"`. This is a feature of components, which are in beta. This API is unstable and may change in subsequent releases. |
| `options?`     | `Object` | -                                                                                                                                                                                                                                            |
| `options.env?` | `Env`    | -                                                                                                                                                                                                                                            |

#### Returns[​](#returns-11 "Direct link to Returns")

[`ComponentDefinition`](/api/modules/server.md#componentdefinition)<`Exports`, `Env`>

#### Defined in[​](#defined-in-109 "Direct link to Defined in")

[server/components/index.ts:674](https://github.com/get-convex/convex-js/blob/main/src/server/components/index.ts#L674)

***

### defineApp[​](#defineapp "Direct link to defineApp")

▸ **defineApp**<`Env`>(`options?`): [`AppDefinition`](/api/modules/server.md#appdefinition)<`Env`>

Attach components, reuseable pieces of a Convex deployment, to this Convex app.

Optionally define typed environment variables that will be available via the `env` export from `_generated/server` in all Convex functions.

**`Example`**

```
import { defineApp } from "convex/server";

import { v } from "convex/values";



const app = defineApp({

  env: {

    OPENAI_API_KEY: v.string(),

    DEBUG_MODE: v.optional(v.string()),

  },

});

export default app;
```

This is a feature of components, which are in beta. This API is unstable and may change in subsequent releases.

#### Type parameters[​](#type-parameters-65 "Direct link to Type parameters")

| Name  | Type                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------- |
| `Env` | extends [`EnvDefinition`](/api/modules/server.md#envdefinition) = [`EnvDefinition`](/api/modules/server.md#envdefinition) |

#### Parameters[​](#parameters-12 "Direct link to Parameters")

| Name                  | Type     |
| --------------------- | -------- |
| `options?`            | `Object` |
| `options.httpPrefix?` | `string` |
| `options.env?`        | `Env`    |

#### Returns[​](#returns-12 "Direct link to Returns")

[`AppDefinition`](/api/modules/server.md#appdefinition)<`Env`>

#### Defined in[​](#defined-in-110 "Direct link to Defined in")

[server/components/index.ts:737](https://github.com/get-convex/convex-js/blob/main/src/server/components/index.ts#L737)

***

### componentsGeneric[​](#componentsgeneric "Direct link to componentsGeneric")

▸ **componentsGeneric**(): [`AnyChildComponents`](/api/modules/server.md#anychildcomponents)

#### Returns[​](#returns-13 "Direct link to Returns")

[`AnyChildComponents`](/api/modules/server.md#anychildcomponents)

#### Defined in[​](#defined-in-111 "Direct link to Defined in")

[server/components/index.ts:815](https://github.com/get-convex/convex-js/blob/main/src/server/components/index.ts#L815)

***

### getFunctionAddress[​](#getfunctionaddress "Direct link to getFunctionAddress")

▸ **getFunctionAddress**(`functionReference`): { `functionHandle`: `string` = functionReference; `name?`: `undefined` ; `reference?`: `undefined` = referencePath } | { `functionHandle?`: `undefined` = functionReference; `name`: `any` ; `reference?`: `undefined` = referencePath } | { `functionHandle?`: `undefined` = functionReference; `name?`: `undefined` ; `reference`: `string` = referencePath }

#### Parameters[​](#parameters-13 "Direct link to Parameters")

| Name                | Type  |
| ------------------- | ----- |
| `functionReference` | `any` |

#### Returns[​](#returns-14 "Direct link to Returns")

{ `functionHandle`: `string` = functionReference; `name?`: `undefined` ; `reference?`: `undefined` = referencePath } | { `functionHandle?`: `undefined` = functionReference; `name`: `any` ; `reference?`: `undefined` = referencePath } | { `functionHandle?`: `undefined` = functionReference; `name?`: `undefined` ; `reference`: `string` = referencePath }

#### Defined in[​](#defined-in-112 "Direct link to Defined in")

[server/components/paths.ts:20](https://github.com/get-convex/convex-js/blob/main/src/server/components/paths.ts#L20)

***

### cronJobs[​](#cronjobs "Direct link to cronJobs")

▸ **cronJobs**(): [`Crons`](/api/classes/server.Crons.md)

Create a CronJobs object to schedule recurring tasks.

```
// convex/crons.js

import { cronJobs } from 'convex/server';

import { api } from "./_generated/api";



const crons = cronJobs();

crons.weekly(

  "weekly re-engagement email",

  {

    hourUTC: 17, // (9:30am Pacific/10:30am Daylight Savings Pacific)

    minuteUTC: 30,

  },

  api.emails.send

)

export default crons;
```

#### Returns[​](#returns-15 "Direct link to Returns")

[`Crons`](/api/classes/server.Crons.md)

#### Defined in[​](#defined-in-113 "Direct link to Defined in")

[server/cron.ts:198](https://github.com/get-convex/convex-js/blob/main/src/server/cron.ts#L198)

***

### getServiceToken[​](#getservicetoken "Direct link to getServiceToken")

▸ **getServiceToken**(`service`): `Promise`<`string`>

Get a short-lived credential for calling a Convex-managed service.

This function can only be called while an action is running. The credential is scoped to the current deployment and should be sent as a bearer token. The action runtime caches and refreshes credentials as needed, so call this function whenever making a service request.

#### Parameters[​](#parameters-14 "Direct link to Parameters")

| Name      | Type           | Description                            |
| --------- | -------------- | -------------------------------------- |
| `service` | `"ai-gateway"` | The service the credential may access. |

#### Returns[​](#returns-16 "Direct link to Returns")

`Promise`<`string`>

A JWT to send as `Authorization: Bearer <token>`. Keep it inside the action: don't return it to clients or store it in environment variables.

#### Defined in[​](#defined-in-114 "Direct link to Defined in")

[server/impl/actions\_impl.ts:86](https://github.com/get-convex/convex-js/blob/main/src/server/impl/actions_impl.ts#L86)

***

### getServiceUrl[​](#getserviceurl "Direct link to getServiceUrl")

▸ **getServiceUrl**(`service`): `Promise`<`string`>

Get the base URL of a Convex-managed service.

This function can only be called while an action is running. Pair it with [getServiceToken](/api/modules/server.md#getservicetoken) to reach the service.

#### Parameters[​](#parameters-15 "Direct link to Parameters")

| Name      | Type           | Description             |
| --------- | -------------- | ----------------------- |
| `service` | `"ai-gateway"` | The service to address. |

#### Returns[​](#returns-17 "Direct link to Returns")

`Promise`<`string`>

The service's origin, without a trailing slash.

#### Defined in[​](#defined-in-115 "Direct link to Defined in")

[server/impl/actions\_impl.ts:103](https://github.com/get-convex/convex-js/blob/main/src/server/impl/actions_impl.ts#L103)

***

### mutationGeneric[​](#mutationgeneric "Direct link to mutationGeneric")

▸ **mutationGeneric**<`ArgsValidator`, `ReturnsValidator`, `ReturnValue`, `OneOrZeroArgs`>(`mutation`): [`RegisteredMutation`](/api/modules/server.md#registeredmutation)<`"public"`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

Define a mutation in this Convex app's public API.

You should generally use the `mutation` function from `"./_generated/server"`.

Mutations can read from and write to the database, and are accessible from the client. They run **transactionally**, all database reads and writes within a single mutation are atomic and isolated from other mutations.

**`Example`**

```
import { mutation } from "./_generated/server";

import { v } from "convex/values";



export const createTask = mutation({

  args: { text: v.string() },

  returns: v.id("tasks"),

  handler: async (ctx, args) => {

    const taskId = await ctx.db.insert("tasks", {

      text: args.text,

      completed: false,

    });

    return taskId;

  },

});
```

**Best practice:** Always include `args` and `returns` validators on all mutations. If the function doesn't return a value, use `returns: v.null()`. Argument validation is critical for security since public mutations are exposed to the internet.

**Common mistake:** Mutations cannot call third-party APIs or use `fetch`. They must be deterministic. Use actions for external API calls.

**Common mistake:** Do not use `mutation` for sensitive internal functions that should not be called by clients. Use `internalMutation` instead.

**`See`**

<https://docs.convex.dev/functions/mutation-functions>

#### Type parameters[​](#type-parameters-66 "Direct link to Type parameters")

| Name               | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ArgsValidator`    | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnsValidator` | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnValue`      | extends `any` = `any`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `OneOrZeroArgs`    | extends [`ArgsArray`](/api/modules/server.md#argsarray) \| `OneArgArray`<[`Infer`](/api/modules/values.md#infer)<`ArgsValidator`>> \| `OneArgArray`<[`Expand`](/api/modules/server.md#expand)<{ \[Property in string \| number \| symbol]?: Exclude\<Infer\<ArgsValidator\[Property]>, undefined> } & { \[Property in string \| number \| symbol]: Infer\<ArgsValidator\[Property]> }>> = [`DefaultArgsForOptionalValidator`](/api/modules/server.md#defaultargsforoptionalvalidator)<`ArgsValidator`> |

#### Parameters[​](#parameters-16 "Direct link to Parameters")

| Name       | Type                                                                                                                                                                                                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mutation` | { `args?`: `ArgsValidator` ; `returns?`: `ReturnsValidator` ; `handler`: (`ctx`: [`GenericMutationCtx`](/api/interfaces/server.GenericMutationCtx.md)<`any`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` } \| (`ctx`: [`GenericMutationCtx`](/api/interfaces/server.GenericMutationCtx.md)<`any`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` |

#### Returns[​](#returns-18 "Direct link to Returns")

[`RegisteredMutation`](/api/modules/server.md#registeredmutation)<`"public"`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

The wrapped mutation. Include this as an `export` to name it and make it accessible.

#### Defined in[​](#defined-in-116 "Direct link to Defined in")

[server/registration.ts:777](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L777)

***

### internalMutationGeneric[​](#internalmutationgeneric "Direct link to internalMutationGeneric")

▸ **internalMutationGeneric**<`ArgsValidator`, `ReturnsValidator`, `ReturnValue`, `OneOrZeroArgs`>(`mutation`): [`RegisteredMutation`](/api/modules/server.md#registeredmutation)<`"internal"`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

Define a mutation that is only accessible from other Convex functions (but not from the client).

You should generally use the `internalMutation` function from `"./_generated/server"`.

Internal mutations can read from and write to the database but are **not** exposed as part of your app's public API. They can only be called by other Convex functions using `ctx.runMutation` or by the scheduler. Like public mutations, they run transactionally.

**`Example`**

```
import { internalMutation } from "./_generated/server";

import { v } from "convex/values";



// This mutation can only be called from other Convex functions:

export const markTaskCompleted = internalMutation({

  args: { taskId: v.id("tasks") },

  returns: v.null(),

  handler: async (ctx, args) => {

    await ctx.db.patch("tasks", args.taskId, { completed: true });

    return null;

  },

});
```

**Best practice:** Use `internalMutation` for any mutation that should not be directly callable by clients, such as write-back functions from actions or scheduled background work. Reference it via the `internal` object: `await ctx.runMutation(internal.myModule.markTaskCompleted, { taskId })`.

**`See`**

<https://docs.convex.dev/functions/internal-functions>

#### Type parameters[​](#type-parameters-67 "Direct link to Type parameters")

| Name               | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ArgsValidator`    | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnsValidator` | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnValue`      | extends `any` = `any`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `OneOrZeroArgs`    | extends [`ArgsArray`](/api/modules/server.md#argsarray) \| `OneArgArray`<[`Infer`](/api/modules/values.md#infer)<`ArgsValidator`>> \| `OneArgArray`<[`Expand`](/api/modules/server.md#expand)<{ \[Property in string \| number \| symbol]?: Exclude\<Infer\<ArgsValidator\[Property]>, undefined> } & { \[Property in string \| number \| symbol]: Infer\<ArgsValidator\[Property]> }>> = [`DefaultArgsForOptionalValidator`](/api/modules/server.md#defaultargsforoptionalvalidator)<`ArgsValidator`> |

#### Parameters[​](#parameters-17 "Direct link to Parameters")

| Name       | Type                                                                                                                                                                                                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mutation` | { `args?`: `ArgsValidator` ; `returns?`: `ReturnsValidator` ; `handler`: (`ctx`: [`GenericMutationCtx`](/api/interfaces/server.GenericMutationCtx.md)<`any`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` } \| (`ctx`: [`GenericMutationCtx`](/api/interfaces/server.GenericMutationCtx.md)<`any`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` |

#### Returns[​](#returns-19 "Direct link to Returns")

[`RegisteredMutation`](/api/modules/server.md#registeredmutation)<`"internal"`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

The wrapped mutation. Include this as an `export` to name it and make it accessible.

#### Defined in[​](#defined-in-117 "Direct link to Defined in")

[server/registration.ts:777](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L777)

***

### queryGeneric[​](#querygeneric "Direct link to queryGeneric")

▸ **queryGeneric**<`ArgsValidator`, `ReturnsValidator`, `ReturnValue`, `OneOrZeroArgs`>(`query`): [`RegisteredQuery`](/api/modules/server.md#registeredquery)<`"public"`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

Define a query in this Convex app's public API.

You should generally use the `query` function from `"./_generated/server"`.

Queries can read from the database and are accessible from the client. They are **reactive**, when used with `useQuery` in React, the component automatically re-renders whenever the underlying data changes. Queries cannot modify the database. Query results are automatically cached by the Convex client and kept consistent via WebSocket subscriptions.

**`Example`**

```
import { query } from "./_generated/server";

import { v } from "convex/values";



export const listTasks = query({

  args: { completed: v.optional(v.boolean()) },

  returns: v.array(v.object({

    _id: v.id("tasks"),

    _creationTime: v.number(),

    text: v.string(),

    completed: v.boolean(),

  })),

  handler: async (ctx, args) => {

    if (args.completed !== undefined) {

      return await ctx.db

        .query("tasks")

        .withIndex("by_completed", (q) => q.eq("completed", args.completed))

        .collect();

    }

    return await ctx.db.query("tasks").collect();

  },

});
```

**Best practice:** Always include `args` and `returns` validators. Use `.withIndex()` instead of `.filter()` for efficient database queries. Queries should be fast since they run on every relevant data change.

**Common mistake:** Queries are pure reads, they cannot write to the database, call external APIs, or schedule functions. Use actions for HTTP calls and mutations for database writes and scheduling.

**`See`**

<https://docs.convex.dev/functions/query-functions>

#### Type parameters[​](#type-parameters-68 "Direct link to Type parameters")

| Name               | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ArgsValidator`    | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnsValidator` | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnValue`      | extends `any` = `any`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `OneOrZeroArgs`    | extends [`ArgsArray`](/api/modules/server.md#argsarray) \| `OneArgArray`<[`Infer`](/api/modules/values.md#infer)<`ArgsValidator`>> \| `OneArgArray`<[`Expand`](/api/modules/server.md#expand)<{ \[Property in string \| number \| symbol]?: Exclude\<Infer\<ArgsValidator\[Property]>, undefined> } & { \[Property in string \| number \| symbol]: Infer\<ArgsValidator\[Property]> }>> = [`DefaultArgsForOptionalValidator`](/api/modules/server.md#defaultargsforoptionalvalidator)<`ArgsValidator`> |

#### Parameters[​](#parameters-18 "Direct link to Parameters")

| Name    | Type                                                                                                                                                                                                                                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query` | { `args?`: `ArgsValidator` ; `returns?`: `ReturnsValidator` ; `handler`: (`ctx`: [`GenericQueryCtx`](/api/interfaces/server.GenericQueryCtx.md)<`any`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` } \| (`ctx`: [`GenericQueryCtx`](/api/interfaces/server.GenericQueryCtx.md)<`any`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` |

#### Returns[​](#returns-20 "Direct link to Returns")

[`RegisteredQuery`](/api/modules/server.md#registeredquery)<`"public"`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

The wrapped query. Include this as an `export` to name it and make it accessible.

#### Defined in[​](#defined-in-118 "Direct link to Defined in")

[server/registration.ts:963](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L963)

***

### internalQueryGeneric[​](#internalquerygeneric "Direct link to internalQueryGeneric")

▸ **internalQueryGeneric**<`ArgsValidator`, `ReturnsValidator`, `ReturnValue`, `OneOrZeroArgs`>(`query`): [`RegisteredQuery`](/api/modules/server.md#registeredquery)<`"internal"`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

Define a query that is only accessible from other Convex functions (but not from the client).

You should generally use the `internalQuery` function from `"./_generated/server"`.

Internal queries can read from the database but are **not** exposed as part of your app's public API. They can only be called by other Convex functions using `ctx.runQuery`. This is useful for loading data in actions or for helper queries that shouldn't be client-facing.

**`Example`**

```
import { internalQuery } from "./_generated/server";

import { v } from "convex/values";



// Only callable from other Convex functions:

export const getUser = internalQuery({

  args: { userId: v.id("users") },

  returns: v.union(

    v.object({

      _id: v.id("users"),

      _creationTime: v.number(),

      name: v.string(),

      email: v.string(),

    }),

    v.null(),

  ),

  handler: async (ctx, args) => {

    return await ctx.db.get("users", args.userId);

  },

});
```

**Best practice:** Use `internalQuery` for data-loading in actions via `ctx.runQuery(internal.myModule.getUser, { userId })`.

**`See`**

<https://docs.convex.dev/functions/internal-functions>

#### Type parameters[​](#type-parameters-69 "Direct link to Type parameters")

| Name               | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ArgsValidator`    | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnsValidator` | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnValue`      | extends `any` = `any`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `OneOrZeroArgs`    | extends [`ArgsArray`](/api/modules/server.md#argsarray) \| `OneArgArray`<[`Infer`](/api/modules/values.md#infer)<`ArgsValidator`>> \| `OneArgArray`<[`Expand`](/api/modules/server.md#expand)<{ \[Property in string \| number \| symbol]?: Exclude\<Infer\<ArgsValidator\[Property]>, undefined> } & { \[Property in string \| number \| symbol]: Infer\<ArgsValidator\[Property]> }>> = [`DefaultArgsForOptionalValidator`](/api/modules/server.md#defaultargsforoptionalvalidator)<`ArgsValidator`> |

#### Parameters[​](#parameters-19 "Direct link to Parameters")

| Name    | Type                                                                                                                                                                                                                                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query` | { `args?`: `ArgsValidator` ; `returns?`: `ReturnsValidator` ; `handler`: (`ctx`: [`GenericQueryCtx`](/api/interfaces/server.GenericQueryCtx.md)<`any`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` } \| (`ctx`: [`GenericQueryCtx`](/api/interfaces/server.GenericQueryCtx.md)<`any`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` |

#### Returns[​](#returns-21 "Direct link to Returns")

[`RegisteredQuery`](/api/modules/server.md#registeredquery)<`"internal"`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

The wrapped query. Include this as an `export` to name it and make it accessible.

#### Defined in[​](#defined-in-119 "Direct link to Defined in")

[server/registration.ts:963](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L963)

***

### actionGeneric[​](#actiongeneric "Direct link to actionGeneric")

▸ **actionGeneric**<`ArgsValidator`, `ReturnsValidator`, `ReturnValue`, `OneOrZeroArgs`>(`func`): [`RegisteredAction`](/api/modules/server.md#registeredaction)<`"public"`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

Define an action in this Convex app's public API.

Actions can call third-party APIs, use Node.js libraries, and perform other side effects. Unlike queries and mutations, actions do **not** have direct database access (`ctx.db` is not available). Instead, use `ctx.runQuery` and `ctx.runMutation` to read and write data.

You should generally use the `action` function from `"./_generated/server"`.

Actions are accessible from the client and run outside of the database transaction, so they are not atomic. They are best for integrating with external services.

**`Example`**

```
// Add "use node"; at the top of the file if using Node.js built-in modules.

import { action } from "./_generated/server";

import { v } from "convex/values";

import { internal } from "./_generated/api";



export const generateSummary = action({

  args: { text: v.string() },

  returns: v.string(),

  handler: async (ctx, args) => {

    // Call an external API:

    const response = await fetch("https://api.example.com/summarize", {

      method: "POST",

      body: JSON.stringify({ text: args.text }),

    });

    const { summary } = await response.json();



    // Write results back via a mutation:

    await ctx.runMutation(internal.myModule.saveSummary, {

      text: args.text,

      summary,

    });



    return summary;

  },

});
```

**Best practice:** Minimize the number of `ctx.runQuery` and `ctx.runMutation` calls from actions. Each call is a separate transaction, so splitting logic across multiple calls introduces the risk of race conditions. Try to batch reads/writes into single query/mutation calls.

**`"use node"` runtime:** Actions run in Convex's default JavaScript runtime, which supports `fetch` and most NPM packages. Only add `"use node";` at the top of the file if a third-party library specifically requires Node.js built-in APIs, it is a last resort, not the default. Node.js actions have slower cold starts, and **only actions can be defined in `"use node"` files** (no queries or mutations), so prefer the default runtime whenever possible.

**Common mistake:** Do not try to access `ctx.db` in an action, it is not available. Use `ctx.runQuery` and `ctx.runMutation` instead.

**`See`**

<https://docs.convex.dev/functions/actions>

#### Type parameters[​](#type-parameters-70 "Direct link to Type parameters")

| Name               | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ArgsValidator`    | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnsValidator` | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnValue`      | extends `any` = `any`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `OneOrZeroArgs`    | extends [`ArgsArray`](/api/modules/server.md#argsarray) \| `OneArgArray`<[`Infer`](/api/modules/values.md#infer)<`ArgsValidator`>> \| `OneArgArray`<[`Expand`](/api/modules/server.md#expand)<{ \[Property in string \| number \| symbol]?: Exclude\<Infer\<ArgsValidator\[Property]>, undefined> } & { \[Property in string \| number \| symbol]: Infer\<ArgsValidator\[Property]> }>> = [`DefaultArgsForOptionalValidator`](/api/modules/server.md#defaultargsforoptionalvalidator)<`ArgsValidator`> |

#### Parameters[​](#parameters-20 "Direct link to Parameters")

| Name   | Type                                                                                                                                                                                                                                                                                                                                      | Description                                                                                                       |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `func` | { `args?`: `ArgsValidator` ; `returns?`: `ReturnsValidator` ; `handler`: (`ctx`: [`GenericActionCtx`](/api/interfaces/server.GenericActionCtx.md)<`any`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` } \| (`ctx`: [`GenericActionCtx`](/api/interfaces/server.GenericActionCtx.md)<`any`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` | The function. It receives a [GenericActionCtx](/api/interfaces/server.GenericActionCtx.md) as its first argument. |

#### Returns[​](#returns-22 "Direct link to Returns")

[`RegisteredAction`](/api/modules/server.md#registeredaction)<`"public"`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

The wrapped function. Include this as an `export` to name it and make it accessible.

#### Defined in[​](#defined-in-120 "Direct link to Defined in")

[server/registration.ts:1141](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L1141)

***

### internalActionGeneric[​](#internalactiongeneric "Direct link to internalActionGeneric")

▸ **internalActionGeneric**<`ArgsValidator`, `ReturnsValidator`, `ReturnValue`, `OneOrZeroArgs`>(`func`): [`RegisteredAction`](/api/modules/server.md#registeredaction)<`"internal"`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

Define an action that is only accessible from other Convex functions (but not from the client).

You should generally use the `internalAction` function from `"./_generated/server"`.

Internal actions behave like public actions (they can call external APIs and use Node.js libraries) but are **not** exposed in your app's public API. They can only be called by other Convex functions using `ctx.runAction` or via the scheduler.

**`Example`**

```
import { internalAction } from "./_generated/server";

import { v } from "convex/values";



export const sendEmail = internalAction({

  args: { to: v.string(), subject: v.string(), body: v.string() },

  returns: v.null(),

  handler: async (ctx, args) => {

    // Call an external email service (fetch works in the default runtime):

    await fetch("https://api.email-service.com/send", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(args),

    });

    return null;

  },

});
```

**Best practice:** Use `internalAction` for background work scheduled from mutations: `await ctx.scheduler.runAfter(0, internal.myModule.sendEmail, { ... })`. Only use `ctx.runAction` from another action if you need to cross runtimes (e.g., default Convex runtime to Node.js). Otherwise, extract shared code into a helper function.

**`"use node"` runtime:** Only add `"use node";` at the top of the file as a last resort when a third-party library requires Node.js APIs. Node.js actions have slower cold starts, and **only actions can be defined in `"use node"` files** (no queries or mutations).

**`See`**

<https://docs.convex.dev/functions/internal-functions>

#### Type parameters[​](#type-parameters-71 "Direct link to Type parameters")

| Name               | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ArgsValidator`    | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnsValidator` | extends `void` \| [`Validator`](/api/modules/values.md#validator)<`any`, `"required"`, `any`> \| [`PropertyValidators`](/api/modules/values.md#propertyvalidators)                                                                                                                                                                                                                                                                                                                                     |
| `ReturnValue`      | extends `any` = `any`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `OneOrZeroArgs`    | extends [`ArgsArray`](/api/modules/server.md#argsarray) \| `OneArgArray`<[`Infer`](/api/modules/values.md#infer)<`ArgsValidator`>> \| `OneArgArray`<[`Expand`](/api/modules/server.md#expand)<{ \[Property in string \| number \| symbol]?: Exclude\<Infer\<ArgsValidator\[Property]>, undefined> } & { \[Property in string \| number \| symbol]: Infer\<ArgsValidator\[Property]> }>> = [`DefaultArgsForOptionalValidator`](/api/modules/server.md#defaultargsforoptionalvalidator)<`ArgsValidator`> |

#### Parameters[​](#parameters-21 "Direct link to Parameters")

| Name   | Type                                                                                                                                                                                                                                                                                                                                      | Description                                                                                                       |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `func` | { `args?`: `ArgsValidator` ; `returns?`: `ReturnsValidator` ; `handler`: (`ctx`: [`GenericActionCtx`](/api/interfaces/server.GenericActionCtx.md)<`any`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` } \| (`ctx`: [`GenericActionCtx`](/api/interfaces/server.GenericActionCtx.md)<`any`>, ...`args`: `OneOrZeroArgs`) => `ReturnValue` | The function. It receives a [GenericActionCtx](/api/interfaces/server.GenericActionCtx.md) as its first argument. |

#### Returns[​](#returns-23 "Direct link to Returns")

[`RegisteredAction`](/api/modules/server.md#registeredaction)<`"internal"`, [`ArgsArrayToObject`](/api/modules/server.md#argsarraytoobject)<`OneOrZeroArgs`>, `ReturnValue`>

The wrapped function. Include this as an `export` to name it and make it accessible.

#### Defined in[​](#defined-in-121 "Direct link to Defined in")

[server/registration.ts:1141](https://github.com/get-convex/convex-js/blob/main/src/server/registration.ts#L1141)

***

### httpActionGeneric[​](#httpactiongeneric "Direct link to httpActionGeneric")

▸ **httpActionGeneric**(`func`): [`PublicHttpAction`](/api/modules/server.md#publichttpaction)

Define a Convex HTTP action.

HTTP actions handle raw HTTP requests and return HTTP responses. They are registered by routing URL paths to them in `convex/http.ts` using [HttpRouter](/api/classes/server.HttpRouter.md). Like regular actions, they can call external APIs and use `ctx.runQuery` / `ctx.runMutation` but do not have direct `ctx.db` access.

**`Example`**

```
// convex/http.ts

import { httpRouter } from "convex/server";

import { httpAction } from "./_generated/server";



const http = httpRouter();



http.route({

  path: "/api/webhook",

  method: "POST",

  handler: httpAction(async (ctx, request) => {

    const body = await request.json();

    // Process the webhook payload...

    return new Response(JSON.stringify({ ok: true }), {

      status: 200,

      headers: { "Content-Type": "application/json" },

    });

  }),

});



export default http;
```

**Best practice:** HTTP actions are registered at the exact path specified. For example, `path: "/api/webhook"` registers at `/api/webhook`.

**`See`**

<https://docs.convex.dev/functions/http-actions>

#### Parameters[​](#parameters-22 "Direct link to Parameters")

| Name   | Type                                                                                                                                                                                    | Description                                                                                                                                             |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `func` | (`ctx`: [`GenericActionCtx`](/api/interfaces/server.GenericActionCtx.md)<[`GenericDataModel`](/api/modules/server.md#genericdatamodel)>, `request`: `Request`) => `Promise`<`Response`> | The function. It receives a [GenericActionCtx](/api/interfaces/server.GenericActionCtx.md) as its first argument, and a `Request` object as its second. |

#### Returns[​](#returns-24 "Direct link to Returns")

[`PublicHttpAction`](/api/modules/server.md#publichttpaction)

The wrapped function. Route a URL path to this function in `convex/http.ts`.

#### Defined in[​](#defined-in-122 "Direct link to Defined in")

[server/impl/registration\_impl.ts:741](https://github.com/get-convex/convex-js/blob/main/src/server/impl/registration_impl.ts#L741)

***

### paginationResultValidator[​](#paginationresultvalidator "Direct link to paginationResultValidator")

▸ **paginationResultValidator**<`T`>(`itemValidator`): [`VObject`](/api/classes/values.VObject.md)<{ `splitCursor`: `undefined` | `null` | `string` ; `pageStatus`: `undefined` | `null` | `"SplitRecommended"` | `"SplitRequired"` ; `page`: `T`\[`"type"`]\[] ; `continueCursor`: `string` ; `isDone`: `boolean` }, { `page`: [`VArray`](/api/classes/values.VArray.md)<`T`\[`"type"`]\[], `T`, `"required"`> ; `continueCursor`: [`VString`](/api/classes/values.VString.md)<`string`, `"required"`> ; `isDone`: [`VBoolean`](/api/classes/values.VBoolean.md)<`boolean`, `"required"`> ; `splitCursor`: [`VUnion`](/api/classes/values.VUnion.md)<`undefined` | `null` | `string`, \[[`VString`](/api/classes/values.VString.md)<`string`, `"required"`>, [`VNull`](/api/classes/values.VNull.md)<`null`, `"required"`>], `"optional"`, `never`> ; `pageStatus`: [`VUnion`](/api/classes/values.VUnion.md)<`undefined` | `null` | `"SplitRecommended"` | `"SplitRequired"`, \[[`VLiteral`](/api/classes/values.VLiteral.md)<`"SplitRecommended"`, `"required"`>, [`VLiteral`](/api/classes/values.VLiteral.md)<`"SplitRequired"`, `"required"`>, [`VNull`](/api/classes/values.VNull.md)<`null`, `"required"`>], `"optional"`, `never`> }, `"required"`, `"page"` | `"continueCursor"` | `"isDone"` | `"splitCursor"` | `"pageStatus"`>

A [Validator](/api/modules/values.md#validator) factory for [PaginationResult](/api/interfaces/server.PaginationResult.md).

Create a validator for the result of calling [paginate](/api/interfaces/server.OrderedQuery.md#paginate) with a given item validator.

For example:

```
const paginationResultValidator = paginationResultValidator(v.object({

  _id: v.id("users"),

  _creationTime: v.number(),

  name: v.string(),

}));
```

#### Type parameters[​](#type-parameters-72 "Direct link to Type parameters")

| Name | Type                                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------ |
| `T`  | extends [`Validator`](/api/modules/values.md#validator)<[`Value`](/api/modules/values.md#value), `"required"`, `string`> |

#### Parameters[​](#parameters-23 "Direct link to Parameters")

| Name            | Type | Description                           |
| --------------- | ---- | ------------------------------------- |
| `itemValidator` | `T`  | A validator for the items in the page |

#### Returns[​](#returns-25 "Direct link to Returns")

[`VObject`](/api/classes/values.VObject.md)<{ `splitCursor`: `undefined` | `null` | `string` ; `pageStatus`: `undefined` | `null` | `"SplitRecommended"` | `"SplitRequired"` ; `page`: `T`\[`"type"`]\[] ; `continueCursor`: `string` ; `isDone`: `boolean` }, { `page`: [`VArray`](/api/classes/values.VArray.md)<`T`\[`"type"`]\[], `T`, `"required"`> ; `continueCursor`: [`VString`](/api/classes/values.VString.md)<`string`, `"required"`> ; `isDone`: [`VBoolean`](/api/classes/values.VBoolean.md)<`boolean`, `"required"`> ; `splitCursor`: [`VUnion`](/api/classes/values.VUnion.md)<`undefined` | `null` | `string`, \[[`VString`](/api/classes/values.VString.md)<`string`, `"required"`>, [`VNull`](/api/classes/values.VNull.md)<`null`, `"required"`>], `"optional"`, `never`> ; `pageStatus`: [`VUnion`](/api/classes/values.VUnion.md)<`undefined` | `null` | `"SplitRecommended"` | `"SplitRequired"`, \[[`VLiteral`](/api/classes/values.VLiteral.md)<`"SplitRecommended"`, `"required"`>, [`VLiteral`](/api/classes/values.VLiteral.md)<`"SplitRequired"`, `"required"`>, [`VNull`](/api/classes/values.VNull.md)<`null`, `"required"`>], `"optional"`, `never`> }, `"required"`, `"page"` | `"continueCursor"` | `"isDone"` | `"splitCursor"` | `"pageStatus"`>

A validator for the pagination result

#### Defined in[​](#defined-in-123 "Direct link to Defined in")

[server/pagination.ts:192](https://github.com/get-convex/convex-js/blob/main/src/server/pagination.ts#L192)

***

### httpRouter[​](#httprouter "Direct link to httpRouter")

▸ **httpRouter**(): [`HttpRouter`](/api/classes/server.HttpRouter.md)

Return a new [HttpRouter](/api/classes/server.HttpRouter.md) object.

#### Returns[​](#returns-26 "Direct link to Returns")

[`HttpRouter`](/api/classes/server.HttpRouter.md)

#### Defined in[​](#defined-in-124 "Direct link to Defined in")

[server/router.ts:47](https://github.com/get-convex/convex-js/blob/main/src/server/router.ts#L47)

***

### defineTable[​](#definetable "Direct link to defineTable")

▸ **defineTable**<`DocumentSchema`>(`documentSchema`): [`TableDefinition`](/api/classes/server.TableDefinition.md)<`DocumentSchema`>

Define a table in a schema.

You can either specify the schema of your documents as an object like

```
defineTable({

  field: v.string()

});
```

or as a schema type like

```
defineTable(

 v.union(

   v.object({...}),

   v.object({...})

 )

);
```

#### Type parameters[​](#type-parameters-73 "Direct link to Type parameters")

| Name             | Type                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| `DocumentSchema` | extends [`Validator`](/api/modules/values.md#validator)<`Record`<`string`, `any`>, `"required"`, `any`> |

#### Parameters[​](#parameters-24 "Direct link to Parameters")

| Name             | Type             | Description                                 |
| ---------------- | ---------------- | ------------------------------------------- |
| `documentSchema` | `DocumentSchema` | The type of documents stored in this table. |

#### Returns[​](#returns-27 "Direct link to Returns")

[`TableDefinition`](/api/classes/server.TableDefinition.md)<`DocumentSchema`>

A [TableDefinition](/api/classes/server.TableDefinition.md) for the table.

#### Defined in[​](#defined-in-125 "Direct link to Defined in")

[server/schema.ts:675](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L675)

▸ **defineTable**<`DocumentSchema`>(`documentSchema`): [`TableDefinition`](/api/classes/server.TableDefinition.md)<[`VObject`](/api/classes/values.VObject.md)<[`ObjectType`](/api/modules/values.md#objecttype)<`DocumentSchema`>, `DocumentSchema`>>

Define a table in a schema.

You can either specify the schema of your documents as an object like

```
defineTable({

  field: v.string()

});
```

or as a schema type like

```
defineTable(

 v.union(

   v.object({...}),

   v.object({...})

 )

);
```

#### Type parameters[​](#type-parameters-74 "Direct link to Type parameters")

| Name             | Type                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `DocumentSchema` | extends `Record`<`string`, [`GenericValidator`](/api/modules/values.md#genericvalidator)> |

#### Parameters[​](#parameters-25 "Direct link to Parameters")

| Name             | Type             | Description                                 |
| ---------------- | ---------------- | ------------------------------------------- |
| `documentSchema` | `DocumentSchema` | The type of documents stored in this table. |

#### Returns[​](#returns-28 "Direct link to Returns")

[`TableDefinition`](/api/classes/server.TableDefinition.md)<[`VObject`](/api/classes/values.VObject.md)<[`ObjectType`](/api/modules/values.md#objecttype)<`DocumentSchema`>, `DocumentSchema`>>

A [TableDefinition](/api/classes/server.TableDefinition.md) for the table.

#### Defined in[​](#defined-in-126 "Direct link to Defined in")

[server/schema.ts:703](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L703)

***

### docValidator[​](#docvalidator-1 "Direct link to docValidator")

▸ **docValidator**<`TableName`, `Table`>(`tableName`, `table`): [`DocValidator`](/api/modules/server.md#docvalidator)<`TableName`, `Table`\[`"validator"`]>

Build the validator for whole documents of a table, by adding the `_id` and `_creationTime` system fields to the table's own validator.

Prefer [doc](/api/classes/server.SchemaDefinition.md#doc) when you have the schema in hand: it checks the table name against the schema.

**`Example`**

```
const messageDoc = docValidator("messages", schema.tables.messages);



export const get = query({

  args: { id: v.id("messages") },

  returns: v.union(messageDoc, v.null()),

  handler: (ctx, args) => ctx.db.get(args.id),

});
```

#### Type parameters[​](#type-parameters-75 "Direct link to Type parameters")

| Name        | Type                                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| `TableName` | extends `string`                                                                                         |
| `Table`     | extends [`TableDefinition`](/api/classes/server.TableDefinition.md)<`any`, `any`, `any`, `any`, `Table`> |

#### Parameters[​](#parameters-26 "Direct link to Parameters")

| Name        | Type        | Description                                                                   |
| ----------- | ----------- | ----------------------------------------------------------------------------- |
| `tableName` | `TableName` | The name of the table, used for the `_id` validator.                          |
| `table`     | `Table`     | The [TableDefinition](/api/classes/server.TableDefinition.md) for that table. |

#### Returns[​](#returns-29 "Direct link to Returns")

[`DocValidator`](/api/modules/server.md#docvalidator)<`TableName`, `Table`\[`"validator"`]>

A validator matching documents of the table.

#### Defined in[​](#defined-in-127 "Direct link to Defined in")

[server/schema.ts:822](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L822)

***

### defineSchema[​](#defineschema "Direct link to defineSchema")

▸ **defineSchema**<`Schema`, `StrictTableNameTypes`>(`schema`, `options?`): [`SchemaDefinition`](/api/classes/server.SchemaDefinition.md)<`Schema`, `StrictTableNameTypes`>

Define the schema of this Convex project.

This should be exported as the default export from a `schema.ts` file in your `convex/` directory. The schema enables runtime validation of documents and provides end-to-end TypeScript type safety.

Every document in Convex automatically has two system fields:

* `_id` - a unique document ID with validator `v.id("tableName")`
* `_creationTime` - a creation timestamp with validator `v.number()`

You do not need to include these in your schema definition, they are added automatically.

**`Example`**

```
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";



export default defineSchema({

  users: defineTable({

    name: v.string(),

    email: v.string(),

  }).index("by_email", ["email"]),



  messages: defineTable({

    body: v.string(),

    userId: v.id("users"),

    channelId: v.id("channels"),

  }).index("by_channel", ["channelId"]),



  channels: defineTable({

    name: v.string(),

  }),



  // Discriminated union table:

  results: defineTable(

    v.union(

      v.object({ kind: v.literal("error"), message: v.string() }),

      v.object({ kind: v.literal("success"), value: v.number() }),

    )

  ),

});
```

**Best practice:** Always include all index fields in the index name. For example, an index on `["field1", "field2"]` should be named `"by_field1_field2"`.

**`See`**

<https://docs.convex.dev/database/schemas>

#### Type parameters[​](#type-parameters-76 "Direct link to Type parameters")

| Name                   | Type                                                            |
| ---------------------- | --------------------------------------------------------------- |
| `Schema`               | extends [`GenericSchema`](/api/modules/server.md#genericschema) |
| `StrictTableNameTypes` | extends `boolean` = `true`                                      |

#### Parameters[​](#parameters-27 "Direct link to Parameters")

| Name       | Type                                                                                           | Description                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `schema`   | `Schema`                                                                                       | A map from table name to [TableDefinition](/api/classes/server.TableDefinition.md) for all of the tables in this project. |
| `options?` | [`DefineSchemaOptions`](/api/interfaces/server.DefineSchemaOptions.md)<`StrictTableNameTypes`> | Optional configuration. See [DefineSchemaOptions](/api/interfaces/server.DefineSchemaOptions.md) for a full description.  |

#### Returns[​](#returns-30 "Direct link to Returns")

[`SchemaDefinition`](/api/classes/server.SchemaDefinition.md)<`Schema`, `StrictTableNameTypes`>

The schema.

#### Defined in[​](#defined-in-128 "Direct link to Defined in")

[server/schema.ts:1062](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L1062)
