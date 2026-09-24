# auth.config.ts

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

`convex/auth.config.ts` allows you to set up [**authentication providers**](/auth/overview.md), which issue the JWTs your deployment accepts to identify users. Your functions can then [read the authenticated user from `ctx.auth`](/auth/functions-auth.md).

convex/auth.config.ts

```
import { AuthConfig } from "convex/server";

import { env } from "./_generated/server";



export default {

  providers: [

    // Setting up Convex Auth

    {

      domain: env.CONVEX_SITE_URL,

      applicationID: "convex",

    },



    // Setting up an OIDC provider (e.g. Auth0, Clerk, or custom)

    {

      domain: env.CLERK_JWT_ISSUER_DOMAIN,

      applicationID: "convex",

    },



    // Setting up a custom JWT provider

    {

      type: "customJwt",

      applicationID: "your-application-id",

      issuer: "https://your.issuer.url.com",

      jwks: "https://your.issuer.url.com/.well-known/jwks.json",

      algorithm: "RS256",

    },

  ],

} satisfies AuthConfig;
```

## Learn More[​](#learn-more "Direct link to Learn More")

Follow the setup guide for your authentication provider:

* [Convex Auth](/auth/convex-auth.md)
* [Clerk](/auth/clerk.md)
* [WorkOS](/auth/authkit/.md)
* [Auth0](/auth/auth0.md)
* [Custom OIDC](/auth/advanced/custom-auth.md)
* [Custom JWT](/auth/advanced/custom-jwt.md)
