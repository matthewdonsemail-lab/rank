# Authentication

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Convex deployment endpoints are exposed to the open internet and the claims clients make about who they are must be authenticated to identify users and restrict what data they can see and edit.

Convex is compatible with most authentication providers because it uses OpenID Connect (based on OAuth) ID tokens in the form of JWTs to authenticate WebSocket connections or RPCs. These JWTs can be provided by any service (including your own Convex backend) that implement the appropriate OAuth endpoints to verify them.

## Third-party authentication platforms[​](#third-party-authentication-platforms "Direct link to Third-party authentication platforms")

Leveraging a Convex integration with a third-party auth provider provides the most comprehensive authentication solutions. Integrating another service provides a ton of functionality like passkeys, two-factor auth, spam protection, and more on top of the authentication basics.

* [Clerk](/auth/clerk.md) has great Next.js and React Native support
* [WorkOS AuthKit](/auth/authkit/.md) is built for B2B apps and free for up to 1M users
* [Auth0](/auth/auth0.md) is more established with more bells and whistles
* [Custom Auth Integration](/auth/advanced/custom-auth.md) allow any OpenID Connect-compatible identity provider to be used for authentication

After you integrate one of these, learn more about accessing authentication information in [Functions](/auth/functions-auth.md) and storing user information in the [Database](/auth/database-auth.md).

## The Convex Auth Library[​](#the-convex-auth-library "Direct link to The Convex Auth Library")

For client-side React and React Native mobile apps you can implement auth directly in Convex with the [Convex Auth](/auth/convex-auth.md) library. This [npm package](https://github.com/get-convex/convex-auth) runs on your Convex deployment and helps you build a custom sign-up/sign-in flow via social identity providers, one-time email or SMS access codes, or via passwords.

Convex Auth is in beta (it isn't complete and may change in backward-incompatible ways) and doesn't provide as many features as third party auth integrations. Since it doesn't require signing up for another service it's the quickest way to get auth up and running.

Convex Auth is in beta

Convex Auth<!-- --> <!-- -->is<!-- --> currently a [beta feature](/production/state/.md#beta-features). If you have feedback or feature requests, [let us know on Discord](https://convex.dev/community)!

Support for Next.js is under active development. If you'd like to help test this experimental support please [give it a try](https://labs.convex.dev/auth)!

## Debugging[​](#debugging "Direct link to Debugging")

If you run into issues consult the [Debugging](/auth/debug.md) guide.

## Service Authentication[​](#service-authentication "Direct link to Service Authentication")

Servers you control or third party services can call Convex functions but may not be able to obtain OpenID JWTs and often do not represent the actions of a specific user.

Say you're running some inference on a [Modal](https://modal.com/) server written in Python. When that server subscribes to a Convex query it doesn't do so with credentials of a particular end-user, rather it's looking for relevant tasks for any users that need that inference task, say summarizing and translating a conversation, completed.

To provide access to Convex queries, mutations, and actions to an external service you can write public functions accessible to the internet that check a shared secret, for example from an environment variable, before doing anything else.

## Authorization[​](#authorization "Direct link to Authorization")

Convex enables a traditional three tier application structure: a client/UI for your app, a backend that handles user requests, and a database for queries. This architecture lets you check every public request against any authorization rules you can define in code.

This means Convex doesn't need an opinionated authorization framework like RLS, which is required in client oriented databases like Firebase or Supabase. This flexibility lets you build and use an [authorization framework](https://en.wikipedia.org/wiki/Authorization) for your needs.

That said, the most common way is to simply write code that checks if the user is logged in and if they are allowed to do the requested action at the beginning of each public function.

For example, the following function enforces that only the currently authenticated user can remove their own user image:

```
export const removeUserImage = mutation({

  args: {},

  handler: async (ctx) => {

    const userId = await getAuthUserId(ctx);

    if (!userId) {

      return;

    }

    ctx.db.patch("users", userId, { imageId: undefined, image: undefined });

  },

});
```

Related posts from

<!-- -->

[![Stack](/img/stack-logo-dark.svg)![Stack](/img/stack-logo-light.svg)](https://stack.convex.dev/)
