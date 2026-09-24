# Custom OIDC Provider

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

**Note: This is an advanced feature!** We recommend sticking with the [supported third-party authentication providers](/auth/overview.md).

Convex can be integrated with any identity provider supporting the [OpenID Connect](https://openid.net/connect/) protocol. At minimum this means that the provider can issue [ID tokens](https://openid.net/specs/openid-connect-core-1_0.html#IDToken) and exposes the corresponding [JWKS](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets). The ID token is passed from the client to your Convex backend which ensures that the token is valid and enables you to query the user information embedded in the token, as described in [Auth in Functions](/auth/functions-auth.md).

## Server-side integration[​](#server-side-integration "Direct link to Server-side integration")

Just like with [Clerk](/auth/clerk.md) and [Auth0](/auth/auth0.md), the backend needs to be aware of the domain of the Issuer and your application's specific applicationID for a given identity provider.

Add these to your `convex/auth.config.ts` file:

convex/auth.config.ts

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

The `applicationID` property must exactly match the `aud` field of your JWT and the `domain` property must exactly match the `iss` field of the JWT. Use a tool like [jwt.io](https://jwt.io/) to view an JWT and confirm these fields match exactly.

If multiple providers are provided, the first one fulfilling the above criteria will be used.

If you're not able to obtain tokens with an `aud` field, you'll need to instead configure a [Custom JWT](/auth/advanced/custom-jwt.md). If you're not sure if your token is an OIDC ID token, check [the spec](https://openid.net/specs/openid-connect-core-1_0-final.html#rfc.section.2) for a list of all required fields.

OIDC requires the routes `${domain}/.well-known/jwks.json` and `${domain}/.well-known/openid-configuration`. `domain` may include a path like `https://your.issuer.url.com/api/auth`. This isn't common for third party auth providers but may be useful if you're implementing OIDC on your own server.

## Client-side integration[​](#client-side-integration "Direct link to Client-side integration")

### Integrating a new identity provider[​](#integrating-a-new-identity-provider "Direct link to Integrating a new identity provider")

The [`ConvexProviderWithAuth`](/api/modules/react.md#convexproviderwithauth) component provides a convenient abstraction for building an auth integration similar to the ones Convex provides for [Clerk](/auth/clerk.md) and [Auth0](/auth/auth0.md).

In the following example we build an integration with an imaginary "ProviderX", whose React integration includes `AuthProviderXReactProvider` and `useProviderXAuth` hook.

First we replace `ConvexProvider` with `AuthProviderXReactProvider` wrapping `ConvexProviderWithAuth` at the root of our app:

src/index.tsx

```
import { AuthProviderXReactProvider } from "providerX";

import { ConvexProviderWithAuth } from "convex/react";



root.render(

  <StrictMode>

    <AuthProviderXReactProvider>

      <ConvexProviderWithAuth client={convex} useAuth={useAuthFromProviderX}>

        <App />

      </ConvexProviderWithAuth>

    </AuthProviderXReactProvider>

  </StrictMode>,

);
```

All we really need is to implement the `useAuthFromProviderX` hook which gets passed to the `ConvexProviderWithAuth` component.

This `useAuthFromProviderX` hook provides a translation between the auth provider API and the [`ConvexReactClient`](/api/classes/react.ConvexReactClient.md) API, which is ultimately responsible for making sure that the ID token is passed down to your Convex backend.

src/ConvexProviderWithProviderX.tsx

```
function useAuthFromProviderX() {

  const { isLoading, isAuthenticated, getToken } = useProviderXAuth();

  const fetchAccessToken = useCallback(

    async ({ forceRefreshToken }) => {

      // Here you can do whatever transformation to get the ID Token

      // or null

      // Make sure to fetch a new token when `forceRefreshToken` is true

      return await getToken({ ignoreCache: forceRefreshToken });

    },

    // If `getToken` isn't correctly memoized

    // remove it from this dependency array

    [getToken],

  );

  return useMemo(

    () => ({

      // Whether the auth provider is in a loading state

      isLoading: isLoading,

      // Whether the auth provider has the user signed in

      isAuthenticated: isAuthenticated ?? false,

      // The async function to fetch the ID token

      fetchAccessToken,

    }),

    [isLoading, isAuthenticated, fetchAccessToken],

  );

}
```

### Using the new provider[​](#using-the-new-provider "Direct link to Using the new provider")

If you successfully follow the steps above you can now use the standard Convex utilities for checking the authentication state: the [`useConvexAuth()`](/api/modules/react.md#useconvexauth) hook and the [`Authenticated`](/api/modules/react.md#authenticated), [`Unauthenticated`](/api/modules/react.md#authenticated), [`AuthLoading`](/api/modules/react.md#authloading) and [`AuthRefreshing`](/api/modules/react.md#authrefreshing) helper components.

### Debugging[​](#debugging "Direct link to Debugging")

See [Debugging Authentication](/auth/debug.md).

Related posts from

<!-- -->

[![Stack](/img/stack-logo-dark.svg)![Stack](/img/stack-logo-light.svg)](https://stack.convex.dev/)
