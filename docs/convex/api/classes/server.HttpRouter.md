# Class: HttpRouter

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).HttpRouter

HTTP router for specifying the paths and methods of [httpActionGeneric](/api/modules/server.md#httpactiongeneric)s

An example `convex/http.js` file might look like this.

```
import { httpRouter } from "convex/server";

import { getMessagesByAuthor } from "./getMessagesByAuthor";

import { httpAction } from "./_generated/server";



const http = httpRouter();



// HTTP actions can be defined inline...

http.route({

  path: "/message",

  method: "POST",

  handler: httpAction(async ({ runMutation }, request) => {

    const { author, body } = await request.json();



    await runMutation(api.sendMessage.default, { body, author });

    return new Response(null, {

      status: 200,

    });

  })

});



// ...or they can be imported from other files.

http.route({

  path: "/getMessagesByAuthor",

  method: "GET",

  handler: getMessagesByAuthor,

});



// Convex expects the router to be the default export of `convex/http.js`.

export default http;
```

## Constructors[​](#constructors "Direct link to Constructors")

### constructor[​](#constructor "Direct link to constructor")

• **new HttpRouter**()

## Properties[​](#properties "Direct link to Properties")

### exactRoutes[​](#exactroutes "Direct link to exactRoutes")

• **exactRoutes**: `Map`<`string`, `Map`<`"GET"` | `"POST"` | `"PUT"` | `"DELETE"` | `"OPTIONS"` | `"PATCH"`, [`PublicHttpAction`](/api/modules/server.md#publichttpaction)>>

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/router.ts:143](https://github.com/get-convex/convex-js/blob/main/src/server/router.ts#L143)

***

### prefixRoutes[​](#prefixroutes "Direct link to prefixRoutes")

• **prefixRoutes**: `Map`<`"GET"` | `"POST"` | `"PUT"` | `"DELETE"` | `"OPTIONS"` | `"PATCH"`, `Map`<`string`, [`PublicHttpAction`](/api/modules/server.md#publichttpaction)>>

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/router.ts:144](https://github.com/get-convex/convex-js/blob/main/src/server/router.ts#L144)

***

### isRouter[​](#isrouter "Direct link to isRouter")

• **isRouter**: `true`

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/router.ts:145](https://github.com/get-convex/convex-js/blob/main/src/server/router.ts#L145)

## Methods[​](#methods "Direct link to Methods")

### route[​](#route "Direct link to route")

▸ **route**(`spec`): `void`

Specify an HttpAction to be used to respond to requests for an HTTP method (e.g. "GET") and a path or pathPrefix.

Paths must begin with a slash. Path prefixes must also end in a slash.

```
// matches `/profile` (but not `/profile/`)

http.route({ path: "/profile", method: "GET", handler: getProfile})



// matches `/profiles/`, `/profiles/abc`, and `/profiles/a/c/b` (but not `/profile`)

http.route({ pathPrefix: "/profile/", method: "GET", handler: getProfile})
```

#### Parameters[​](#parameters "Direct link to Parameters")

| Name   | Type                                            |
| ------ | ----------------------------------------------- |
| `spec` | [`RouteSpec`](/api/modules/server.md#routespec) |

#### Returns[​](#returns "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/router.ts:161](https://github.com/get-convex/convex-js/blob/main/src/server/router.ts#L161)

***

### getRoutes[​](#getroutes "Direct link to getRoutes")

▸ **getRoutes**(): readonly \[`string`, `"GET"` | `"POST"` | `"PUT"` | `"DELETE"` | `"OPTIONS"` | `"PATCH"`, [`PublicHttpAction`](/api/modules/server.md#publichttpaction)]\[]

Returns a list of routed HTTP actions.

These are used to populate the list of routes shown in the Functions page of the Convex dashboard.

#### Returns[​](#returns-1 "Direct link to Returns")

readonly \[`string`, `"GET"` | `"POST"` | `"PUT"` | `"DELETE"` | `"OPTIONS"` | `"PATCH"`, [`PublicHttpAction`](/api/modules/server.md#publichttpaction)]\[]

* an array of \[path, method, endpoint] tuples.

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[server/router.ts:229](https://github.com/get-convex/convex-js/blob/main/src/server/router.ts#L229)

***

### lookup[​](#lookup "Direct link to lookup")

▸ **lookup**(`path`, `method`): `null` | readonly \[[`PublicHttpAction`](/api/modules/server.md#publichttpaction), `"GET"` | `"POST"` | `"PUT"` | `"DELETE"` | `"OPTIONS"` | `"PATCH"`, `string`]

Returns the appropriate HTTP action and its routed request path and method.

The path and method returned are used for logging and metrics, and should match up with one of the routes returned by `getRoutes`.

For example,

```
http.route({ pathPrefix: "/profile/", method: "GET", handler: getProfile});



http.lookup("/profile/abc", "GET") // returns [getProfile, "GET", "/profile/*"]
```

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name     | Type                                                                                 |
| -------- | ------------------------------------------------------------------------------------ |
| `path`   | `string`                                                                             |
| `method` | `"GET"` \| `"POST"` \| `"PUT"` \| `"DELETE"` \| `"OPTIONS"` \| `"PATCH"` \| `"HEAD"` |

#### Returns[​](#returns-2 "Direct link to Returns")

`null` | readonly \[[`PublicHttpAction`](/api/modules/server.md#publichttpaction), `"GET"` | `"POST"` | `"PUT"` | `"DELETE"` | `"OPTIONS"` | `"PATCH"`, `string`]

* a tuple \[[PublicHttpAction](/api/modules/server.md#publichttpaction), method, path] or null.

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[server/router.ts:275](https://github.com/get-convex/convex-js/blob/main/src/server/router.ts#L275)

***

### runRequest[​](#runrequest "Direct link to runRequest")

▸ **runRequest**(`argsStr`, `requestRoute`): `Promise`<`string`>

Given a JSON string representation of a Request object, return a Response by routing the request and running the appropriate endpoint or returning a 404 Response.

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name           | Type     | Description                                  |
| -------------- | -------- | -------------------------------------------- |
| `argsStr`      | `string` | a JSON string representing a Request object. |
| `requestRoute` | `string` | -                                            |

#### Returns[​](#returns-3 "Direct link to Returns")

`Promise`<`string`>

* a Response object.

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[server/router.ts:304](https://github.com/get-convex/convex-js/blob/main/src/server/router.ts#L304)
