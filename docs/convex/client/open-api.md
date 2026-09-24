# OpenAPI & Other Languages

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

While Convex doesn't have first-party clients for languages such as Go, Java, or C++, you can generate [OpenAPI](https://swagger.io/specification/) specifications from your Convex deployment to create type-safe clients for languages that aren't currently supported. Under the hood, this uses our [HTTP API](/http-api/.md). This means that your queries will not be reactive/real-time.

OAS generation is in beta

OAS generation<!-- --> <!-- -->is<!-- --> currently a [beta feature](/production/state/.md#beta-features). If you have feedback or feature requests, [let us know on Discord](https://convex.dev/community)!

## Setup[​](#setup "Direct link to Setup")

1. Install the Convex Helpers npm package

   Install the `convex-helpers` package, which contains a CLI command to generate an Open API specification.

   ```
   npm install convex-helpers
   ```

2. Generate an OpenAPI specification

   Running this command will call into your configured Convex deployment and generate an `convex-spec.yaml` file based on it. You can see additional flags by passing `--help` to the command.

   ```
   npx convex-helpers open-api-spec
   ```

3. Generate a type-safe client

   You can use a separate tools to generate a client from the `convex-spec.yaml` file. Some popular options are [OpenAPI Tools](https://github.com/OpenAPITools/openapi-generator) and [Swagger](https://swagger.io/tools/swagger-codegen/).

   ```
   # convex-spec.yaml

   openapi: 3.0.3

   info:

     title: Convex App - OpenAPI 3.0

     version: 0.0.0

     servers:

       - url: "{hostUrl}"

     description: Convex App API

     ...
   ```

## Example[​](#example "Direct link to Example")

Below are code snippets of what this workflow looks like in action.

```
npm i openapi-generator-cli

npx openapi-generator-cli generate -i convex-spec.yaml -g go -o convex_client
```

These snippets include three different files:

* `convex/convex.config.ts` - [declares](/production/environment-variables.md#declaring) the `CONVEX_AUTH_TOKEN` environment variable that `loadOne` checks
* `convex/load.ts` - contains Convex function definitions
* `convex.go` - contains `Go` code that uses a generated, type-safe `HTTP` client.

convex/convex.config.ts

```
import { defineApp } from "convex/server";

import { v } from "convex/values";



const app = defineApp({

  env: {

    // Shared secret that callers of `loadOne` must pass as the `token` argument.

    CONVEX_AUTH_TOKEN: v.string(),

    // Optional: notifications are only sent when this is set

    SLACK_WEBHOOK_URL: v.optional(v.string()),

  },

});



export default app;
```

convex/load.ts

```
import { v } from "convex/values";

import { env, query } from "./_generated/server";

import { LinkTable } from "./schema";



export const loadOne = query({

  args: { normalizedId: v.string(), token: v.string() },

  returns: v.union(

    v.object({

      ...LinkTable.validator.fields,

      _creationTime: v.number(),

      _id: v.id("links"),

    }),

    v.null(),

  ),

  handler: async (ctx, { normalizedId, token }) => {

    if (token === "" || token !== env.CONVEX_AUTH_TOKEN) {

      throw new Error("Invalid authorization token");

    }

    return await ctx.db

      .query("links")

      .withIndex("by_normalizedId", (q) => q.eq("normalizedId", normalizedId))

      .first();

  },

});
```

convex.go

```
type Link struct {

	Short    string // the "foo" part of http://go/foo

	Long     string // the target URL or text/template pattern to run

	Created  time.Time

	LastEdit time.Time // when the link was last edited

	Owner    string    // user@domain

}



func (c *ConvexDB) Load(short string) (*Link, error) { 

  request := *convex.NewRequestLoadLoadOne(*convex.NewRequestLoadLoadOneArgs(short, c.token))

  resp, httpRes, err := c.client.QueryAPI.ApiRunLoadLoadOnePost(context.Background()).RequestLoadLoadOne(request).Execute()

  validationErr := validateResponse(httpRes.StatusCode, err, resp.Status) if

  validationErr != nil { return nil, validationErr }



  linkDoc := resp.Value.Get()

  if linkDoc == nil {

    err := fs.ErrNotExist

    return nil, err

  }

  link := Link{

    Short:    linkDoc.Short,

    Long:     linkDoc.Long,

    Created:  time.Unix(int64(linkDoc.Created), 0),

    LastEdit: time.Unix(int64(linkDoc.LastEdit), 0),

    Owner:    linkDoc.Owner,

  }



  return &link, nil
```

## Limits[​](#limits "Direct link to Limits")

* Argument and return value validators are not required, but they will enrich the types of your OpenAPI spec. Where validators aren't defined, we default to `v.any()` as the validator.
* You cannot call internal functions from outside of your Convex deployment.
* We currently do not support `bigints` or `bytes`.
