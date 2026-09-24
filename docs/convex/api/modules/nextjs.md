# Module: nextjs

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Helpers for integrating Convex into Next.js applications using server rendering.

This module contains:

1. [preloadQuery](/api/modules/nextjs.md#preloadquery), for preloading data for reactive client components.
2. [fetchQuery](/api/modules/nextjs.md#fetchquery), [fetchMutation](/api/modules/nextjs.md#fetchmutation) and [fetchAction](/api/modules/nextjs.md#fetchaction) for loading and mutating Convex data from Next.js Server Components, Server Actions and Route Handlers.

## Usage[​](#usage "Direct link to Usage")

All exported functions assume that a Convex deployment URL is set in the `NEXT_PUBLIC_CONVEX_URL` environment variable. `npx convex dev` will automatically set it during local development.

### Preloading data[​](#preloading-data "Direct link to Preloading data")

Preload data inside a Server Component:

```
import { preloadQuery } from "convex/nextjs";

import { api } from "@/convex/_generated/api";

import ClientComponent from "./ClientComponent";



export async function ServerComponent() {

  const preloaded = await preloadQuery(api.foo.baz);

  return <ClientComponent preloaded={preloaded} />;

}
```

And pass it to a Client Component:

```
import { Preloaded, usePreloadedQuery } from "convex/react";

import { api } from "@/convex/_generated/api";



export function ClientComponent(props: {

  preloaded: Preloaded<typeof api.foo.baz>;

}) {

  const data = usePreloadedQuery(props.preloaded);

  // render `data`...

}
```

## Type Aliases[​](#type-aliases "Direct link to Type Aliases")

### NextjsOptions[​](#nextjsoptions "Direct link to NextjsOptions")

Ƭ **NextjsOptions**: `Object`

Options to [preloadQuery](/api/modules/nextjs.md#preloadquery), [fetchQuery](/api/modules/nextjs.md#fetchquery), [fetchMutation](/api/modules/nextjs.md#fetchmutation) and [fetchAction](/api/modules/nextjs.md#fetchaction).

#### Type declaration[​](#type-declaration "Direct link to Type declaration")

| Name                            | Type      | Description                                                                                                                                                                                                                                |
| ------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `token?`                        | `string`  | The JWT-encoded OpenID Connect authentication token to use for the function call.                                                                                                                                                          |
| `url?`                          | `string`  | The URL of the Convex deployment to use for the function call. Defaults to `process.env.NEXT_PUBLIC_CONVEX_URL` if not provided. Explicitly passing undefined here (such as from missing ENV variables) will throw an error in the future. |
| `skipConvexDeploymentUrlCheck?` | `boolean` | Skip validating that the Convex deployment URL looks like `https://happy-animal-123.convex.cloud` or localhost. This can be useful if running a self-hosted Convex backend that uses a different URL. The default value is `false`         |

#### Defined in[​](#defined-in "Direct link to Defined in")

[nextjs/index.ts:61](https://github.com/get-convex/convex-js/blob/main/src/nextjs/index.ts#L61)

## Functions[​](#functions "Direct link to Functions")

### preloadQuery[​](#preloadquery "Direct link to preloadQuery")

▸ **preloadQuery**<`Query`>(`query`, `...args`): `Promise`<[`Preloaded`](/api/modules/react.md#preloaded)<`Query`>>

Execute a Convex query function and return a `Preloaded` payload which can be passed to [usePreloadedQuery](/api/modules/react.md#usepreloadedquery) in a Client Component.

#### Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`> |

#### Parameters[​](#parameters "Direct link to Parameters")

| Name      | Type                                                                                                                        | Description                                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `query`   | `Query`                                                                                                                     | a [FunctionReference](/api/modules/server.md#functionreference) for the public query to run like `api.dir1.dir2.filename.func`. |
| `...args` | [`ArgsAndOptions`](/api/modules/server.md#argsandoptions)<`Query`, [`NextjsOptions`](/api/modules/nextjs.md#nextjsoptions)> | The arguments object for the query. If this is omitted, the arguments will be `{}`.                                             |

#### Returns[​](#returns "Direct link to Returns")

`Promise`<[`Preloaded`](/api/modules/react.md#preloaded)<`Query`>>

A promise of the `Preloaded` payload.

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[nextjs/index.ts:102](https://github.com/get-convex/convex-js/blob/main/src/nextjs/index.ts#L102)

***

### preloadedQueryResult[​](#preloadedqueryresult "Direct link to preloadedQueryResult")

▸ **preloadedQueryResult**<`Query`>(`preloaded`): [`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>

Returns the result of executing a query via [preloadQuery](/api/modules/nextjs.md#preloadquery).

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`> |

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name        | Type                                                    | Description                                                                              |
| ----------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `preloaded` | [`Preloaded`](/api/modules/react.md#preloaded)<`Query`> | The `Preloaded` payload returned by [preloadQuery](/api/modules/nextjs.md#preloadquery). |

#### Returns[​](#returns-1 "Direct link to Returns")

[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>

The query result.

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[nextjs/index.ts:123](https://github.com/get-convex/convex-js/blob/main/src/nextjs/index.ts#L123)

***

### fetchQuery[​](#fetchquery "Direct link to fetchQuery")

▸ **fetchQuery**<`Query`>(`query`, `...args`): `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

Execute a Convex query function.

#### Type parameters[​](#type-parameters-2 "Direct link to Type parameters")

| Name    | Type                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Query` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"query"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"query"`> |

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name      | Type                                                                                                                        | Description                                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `query`   | `Query`                                                                                                                     | a [FunctionReference](/api/modules/server.md#functionreference) for the public query to run like `api.dir1.dir2.filename.func`. |
| `...args` | [`ArgsAndOptions`](/api/modules/server.md#argsandoptions)<`Query`, [`NextjsOptions`](/api/modules/nextjs.md#nextjsoptions)> | The arguments object for the query. If this is omitted, the arguments will be `{}`.                                             |

#### Returns[​](#returns-2 "Direct link to Returns")

`Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Query`>>

A promise of the query's result.

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[nextjs/index.ts:139](https://github.com/get-convex/convex-js/blob/main/src/nextjs/index.ts#L139)

***

### fetchMutation[​](#fetchmutation "Direct link to fetchMutation")

▸ **fetchMutation**<`Mutation`>(`mutation`, `...args`): `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Mutation`>>

Execute a Convex mutation function.

#### Type parameters[​](#type-parameters-3 "Direct link to Type parameters")

| Name       | Type                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Mutation` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"mutation"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"mutation"`> |

#### Parameters[​](#parameters-3 "Direct link to Parameters")

| Name       | Type                                                                                                                           | Description                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `mutation` | `Mutation`                                                                                                                     | A [FunctionReference](/api/modules/server.md#functionreference) for the public mutation to run like `api.dir1.dir2.filename.func`. |
| `...args`  | [`ArgsAndOptions`](/api/modules/server.md#argsandoptions)<`Mutation`, [`NextjsOptions`](/api/modules/nextjs.md#nextjsoptions)> | The arguments object for the mutation. If this is omitted, the arguments will be `{}`.                                             |

#### Returns[​](#returns-3 "Direct link to Returns")

`Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Mutation`>>

A promise of the mutation's result.

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[nextjs/index.ts:160](https://github.com/get-convex/convex-js/blob/main/src/nextjs/index.ts#L160)

***

### fetchAction[​](#fetchaction "Direct link to fetchAction")

▸ **fetchAction**<`Action`>(`action`, `...args`): `Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Action`>>

Execute a Convex action function.

#### Type parameters[​](#type-parameters-4 "Direct link to Type parameters")

| Name     | Type                                                                                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Action` | extends [`FunctionReference`](/api/modules/server.md#functionreference)<`"action"`> \| [`FunctionReference_future`](/api/modules/server.md#functionreference_future)<`"action"`> |

#### Parameters[​](#parameters-4 "Direct link to Parameters")

| Name      | Type                                                                                                                         | Description                                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `action`  | `Action`                                                                                                                     | A [FunctionReference](/api/modules/server.md#functionreference) for the public action to run like `api.dir1.dir2.filename.func`. |
| `...args` | [`ArgsAndOptions`](/api/modules/server.md#argsandoptions)<`Action`, [`NextjsOptions`](/api/modules/nextjs.md#nextjsoptions)> | The arguments object for the action. If this is omitted, the arguments will be `{}`.                                             |

#### Returns[​](#returns-4 "Direct link to Returns")

`Promise`<[`FunctionReturnType`](/api/modules/server.md#functionreturntype)<`Action`>>

A promise of the action's result.

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[nextjs/index.ts:183](https://github.com/get-convex/convex-js/blob/main/src/nextjs/index.ts#L183)
