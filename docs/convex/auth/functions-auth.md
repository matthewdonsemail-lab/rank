# Auth in Functions

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

*If you're using Convex Auth, see the [authorization doc](https://labs.convex.dev/auth/authz#use-authentication-state-in-backend-functions).*

Within a Convex [function](/functions/overview.md), you can access information about the currently logged-in user by using the [`auth`](/api/interfaces/server.Auth.md) property of the [`QueryCtx`](/generated-api/server.md#queryctx), [`MutationCtx`](/generated-api/server.md#mutationctx), or [`ActionCtx`](/generated-api/server.md#actionctx) object:

convex/myFunctions.ts

```
import { mutation } from "./_generated/server";



export const myMutation = mutation({

  args: {

    // ...

  },

  handler: async (ctx, args) => {

    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {

      throw new Error("Unauthenticated call to mutation");

    }

    //...

  },

});
```

## User identity fields[​](#user-identity-fields "Direct link to User identity fields")

The [UserIdentity](/api/interfaces/server.UserIdentity.md) object returned by `getUserIdentity` is guaranteed to have `tokenIdentifier`, `subject` and `issuer` fields. Which other fields it will include depends on the identity provider used and the configuration of JWT tokens and [OpenID scopes](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims).

`tokenIdentifier` is a combination of `subject` and `issuer` to ensure uniqueness even when multiple providers are used.

If you followed one of our integrations with Clerk or Auth0 at least the following fields will be present: `familyName`, `givenName`, `nickname`, `pictureUrl`, `updatedAt`, `email`, `emailVerified`. See their corresponding standard definition in the [OpenID docs](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims).

convex/myFunctions.ts

```
import { mutation } from "./_generated/server";



export const myMutation = mutation({

  args: {

    // ...

  },

  handler: async (ctx, args) => {

    const identity = await ctx.auth.getUserIdentity();

    const { tokenIdentifier, name, email } = identity!;

    //...

  },

});
```

### Clerk claims configuration[​](#clerk-claims-configuration "Direct link to Clerk claims configuration")

If you're using Clerk, the fields returned by `getUserIdentity` are determined by the claims configured in your Clerk integration. If you've set custom claims, they will be returned by `getUserIdentity` as well.

Not every claim in the token is returned by `getUserIdentity`:

* Standard OIDC claims are surfaced as named fields (`subject`, `issuer`, `name`, `email`, and so on) rather than as custom claims.
* A few claims are dropped entirely. JWT housekeeping claims (`jti`, `nbf`) and Clerk's `fva` (factor verification age) are not available, the latter because it's time-varying and would bust the query cache. See [our Clerk docs](/auth/clerk.md#factor-verification-age) for an alternative to `fva`.

### Custom JWT Auth[​](#custom-jwt-auth "Direct link to Custom JWT Auth")

If you're using [Custom JWT auth](/auth/advanced/custom-jwt.md) instead of OpenID standard fields you'll find each nested field available at dot-containing-string field names like `identity["properties.email"]`.

## HTTP Actions[​](#http-actions "Direct link to HTTP Actions")

You can also access the user identity from an HTTP action [`ctx.auth.getUserIdentity()`](/api/interfaces/server.Auth.md#getuseridentity), by calling your endpoint with an `Authorization` header including a JWT token:

myPage.ts

```
const jwtToken = "...";



fetch("https://<deployment name>.convex.site/myAction", {

  headers: {

    Authorization: `Bearer ${jwtToken}`,

  },

});
```

Related posts from

<!-- -->

[![Stack](/img/stack-logo-dark.svg)![Stack](/img/stack-logo-light.svg)](https://stack.convex.dev/)
