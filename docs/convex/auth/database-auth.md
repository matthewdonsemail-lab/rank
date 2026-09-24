# Storing Users in the Convex Database

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

*If you're using [Convex Auth](/auth/convex-auth.md) the user information is already stored in your database. There's nothing else you need to implement.*

You might want to store user information directly in your Convex database, for the following reasons:

* Your functions need information about other users, not just about the currently logged-in user
* Your functions need access to information other than the fields available in the [Open ID Connect JWT](/auth/functions-auth.md)

There are two ways you can choose from for storing user information in your database (but only the second one allows storing information not contained in the JWT):

1. Have your app's [client call a mutation](#call-a-mutation-from-the-client) that stores the information from the JWT available on [`ctx.auth`](/api/interfaces/server.Auth.md)
2. [Implement a webhook](#set-up-webhooks) and have your identity provider call it whenever user information changes

## Call a mutation from the client[​](#call-a-mutation-from-the-client "Direct link to Call a mutation from the client")

**Example:** [Convex Authentication with Clerk](https://github.com/get-convex/convex-demos/tree/main/users-and-clerk)

### (optional) Users table schema[​](#optional-users-table-schema "Direct link to (optional) Users table schema")

You can define a `"users"` table, optionally with an [index](/database/reading-data/indexes/.md) for efficient looking up the users in the database.

In the examples below we will use the `tokenIdentifier` from the `ctx.auth.getUserIdentity()` to identify the user, but you could use the `subject` field (which is usually set to the unique user ID from your auth provider) or even `email`, if your authentication provider provides email verification and you have it enabled.

Which field you use will determine how multiple providers interact, and how hard it will be to migrate to a different provider.

convex/schema.ts

```
users: defineTable({

  name: v.string(),

  tokenIdentifier: v.string(),

}).index("by_token", ["tokenIdentifier"]),
```

### Mutation for storing current user[​](#mutation-for-storing-current-user "Direct link to Mutation for storing current user")

This is an example of a mutation that stores the user's `name` and `tokenIdentifier`:

convex/users.tsx

```
import { mutation } from "./_generated/server";



export const store = mutation({

  args: {},

  handler: async (ctx) => {

    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {

      throw new Error("Called storeUser without authentication present");

    }



    // Check if we've already stored this identity before.

    // Note: If you don't want to define an index right away, you can use

    // ctx.db.query("users")

    //  .filter(q => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))

    //  .unique();

    const user = await ctx.db

      .query("users")

      .withIndex("by_token", (q) =>

        q.eq("tokenIdentifier", identity.tokenIdentifier),

      )

      .unique();

    if (user !== null) {

      // If we've seen this identity before but the name has changed, patch the value.

      if (user.name !== identity.name) {

        await ctx.db.patch("users", user._id, { name: identity.name });

      }

      return user._id;

    }

    // If it's a new identity, create a new `User`.

    return await ctx.db.insert("users", {

      name: identity.name ?? "Anonymous",

      tokenIdentifier: identity.tokenIdentifier,

    });

  },

});
```

### Calling the store user mutation from React[​](#calling-the-store-user-mutation-from-react "Direct link to Calling the store user mutation from React")

You can call this mutation when the user logs in from a `useEffect` hook. After the mutation succeeds you can update local state to reflect that the user has been stored.

This helper hook that does the job:

src/useStoreUserEffect.ts

```
import { useUser } from "@clerk/react";

import { useConvexAuth } from "convex/react";

import { useEffect, useState } from "react";

import { useMutation } from "convex/react";

import { api } from "../convex/_generated/api";

import { Id } from "../convex/_generated/dataModel";



export function useStoreUserEffect() {

  const { isLoading, isAuthenticated } = useConvexAuth();

  const { user } = useUser();

  // When this state is set we know the server

  // has stored the user.

  const [userId, setUserId] = useState<Id<"users"> | null>(null);

  const storeUser = useMutation(api.users.store);

  // Call the `storeUser` mutation function to store

  // the current user in the `users` table and return the `Id` value.

  useEffect(() => {

    // If the user is not logged in don't do anything

    if (!isAuthenticated) {

      return;

    }

    // Store the user in the database.

    // Recall that `storeUser` gets the user information via the `auth`

    // object on the server. You don't need to pass anything manually here.

    async function createUser() {

      const id = await storeUser();

      setUserId(id);

    }

    createUser();

    return () => setUserId(null);

    // Make sure the effect reruns if the user logs in with

    // a different identity

  }, [isAuthenticated, storeUser, user?.id]);

  // Combine the local state with the state from context

  return {

    isLoading: isLoading || (isAuthenticated && userId === null),

    isAuthenticated: isAuthenticated && userId !== null,

  };

}
```

You can use this hook in your top-level component. If your queries need the user document to be present, make sure that you only render the components that call them after the user has been stored:

src/App.tsx

```
import { SignInButton, UserButton } from "@clerk/react";

import { useQuery } from "convex/react";

import { api } from "../convex/_generated/api";

import { useStoreUserEffect } from "./useStoreUserEffect.js";



function App() {

  const { isLoading, isAuthenticated } = useStoreUserEffect();

  return (

    <main>

      {isLoading ? (

        <>Loading...</>

      ) : !isAuthenticated ? (

        <SignInButton />

      ) : (

        <>

          <UserButton />

          <Content />

        </>

      )}

    </main>

  );

}



function Content() {

  const messages = useQuery(api.messages.getForCurrentUser);

  return <div>Authenticated content: {messages?.length}</div>;

}



export default App;
```

In this way the `useStoreUserEffect` hook replaces the `useConvexAuth` hook.

### Using the current user's document ID[​](#using-the-current-users-document-id "Direct link to Using the current user's document ID")

Similarly to the store user mutation, you can retrieve the current user's ID, or throw an error if the user hasn't been stored.

Now that you have users stored as documents in your Convex database, you can use their IDs as foreign keys in other documents:

convex/messages.ts

```
import { v } from "convex/values";

import { mutation } from "./_generated/server";



export const send = mutation({

  args: { body: v.string() },

  handler: async (ctx, args) => {

    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {

      throw new Error("Unauthenticated call to mutation");

    }

    const user = await ctx.db

      .query("users")

      .withIndex("by_token", (q) =>

        q.eq("tokenIdentifier", identity.tokenIdentifier),

      )

      .unique();

    if (!user) {

      throw new Error("Unauthenticated call to mutation");

    }

    await ctx.db.insert("messages", { body: args.body, user: user._id });

  },

});

    // do something with `user`...

}

});
```

### Loading users by their ID[​](#loading-users-by-their-id "Direct link to Loading users by their ID")

The information about other users can be retrieved via their IDs:

convex/messages.ts

```
import { query } from "./_generated/server";



export const list = query({

  args: {},

  handler: async (ctx) => {

    const messages = await ctx.db.query("messages").collect();

    return Promise.all(

      messages.map(async (message) => {

        // For each message in this channel, fetch the `User` who wrote it and

        // insert their name into the `author` field.

        const user = await ctx.db.get("users", message.user);

        return {

          author: user?.name ?? "Anonymous",

          ...message,

        };

      }),

    );

  },

});
```

## Set up webhooks[​](#set-up-webhooks "Direct link to Set up webhooks")

This guide will use Clerk, but Auth0 can be set up similarly via [Auth0 Actions](https://auth0.com/docs/customize/actions/actions-overview).

With this implementation Clerk will call your Convex backend via an HTTP endpoint any time a user signs up, updates or deletes their account.

**Example:** [Convex Authentication with Clerk and Webhooks](https://github.com/get-convex/convex-demos/tree/main/users-and-clerk-webhooks)

### Configure the webhook endpoint in Clerk[​](#configure-the-webhook-endpoint-in-clerk "Direct link to Configure the webhook endpoint in Clerk")

On your Clerk dashboard, go to *Webhooks*, click on *+ Add Endpoint*.

Set *Endpoint URL* to `https://<your deployment name>.convex.site/clerk-users-webhook` (note the domain ends in **`.site`**, not `.cloud`). You can see your deployment name in the `.env.local` file in your project directory, or on your Convex dashboard as part of the [Deployment URL](/dashboard/deployments/deployment-settings.md). For example, the endpoint URL could be: `https://happy-horse-123.convex.site/clerk-users-webhook`.

In *Message Filtering*, select **user** for all user events (scroll down or use the search input).

Click on *Create*.

After the endpoint is saved, copy the *Signing Secret* (on the right side of the UI), it should start with `whsec_`. Set it as the value of the `CLERK_WEBHOOK_SECRET` environment variable in your Convex [dashboard](https://dashboard.convex.dev).

### (optional) Users table schema[​](#optional-users-table-schema-1 "Direct link to (optional) Users table schema")

You can define a `"users"` table, optionally with an [index](/database/reading-data/indexes/.md) for efficient looking up the users in the database.

In the examples below we will use the `subject` from the `ctx.auth.getUserIdentity()` to identify the user, which should be set to the Clerk user ID.

convex/schema.ts

```
users: defineTable({

  name: v.string(),

  // this the Clerk ID, stored in the subject JWT field

  externalId: v.string(),

}).index("byExternalId", ["externalId"]),
```

### Mutations for upserting and deleting users[​](#mutations-for-upserting-and-deleting-users "Direct link to Mutations for upserting and deleting users")

This is an example of mutations that handle the updates received via the webhook:

convex/users.ts

```
import { internalMutation, query, QueryCtx } from "./_generated/server";

import { UserJSON } from "@clerk/backend";

import { v, Validator } from "convex/values";



export const current = query({

  args: {},

  handler: async (ctx) => {

    return await getCurrentUser(ctx);

  },

});



export const upsertFromClerk = internalMutation({

  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk

  async handler(ctx, { data }) {

    const userAttributes = {

      name: `${data.first_name} ${data.last_name}`,

      externalId: data.id,

    };



    const user = await userByExternalId(ctx, data.id);

    if (user === null) {

      await ctx.db.insert("users", userAttributes);

    } else {

      await ctx.db.patch("users", user._id, userAttributes);

    }

  },

});



export const deleteFromClerk = internalMutation({

  args: { clerkUserId: v.string() },

  async handler(ctx, { clerkUserId }) {

    const user = await userByExternalId(ctx, clerkUserId);



    if (user !== null) {

      await ctx.db.delete("users", user._id);

    } else {

      console.warn(

        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,

      );

    }

  },

});



export async function getCurrentUserOrThrow(ctx: QueryCtx) {

  const userRecord = await getCurrentUser(ctx);

  if (!userRecord) throw new Error("Can't get current user");

  return userRecord;

}



export async function getCurrentUser(ctx: QueryCtx) {

  const identity = await ctx.auth.getUserIdentity();

  if (identity === null) {

    return null;

  }

  return await userByExternalId(ctx, identity.subject);

}



async function userByExternalId(ctx: QueryCtx, externalId: string) {

  return await ctx.db

    .query("users")

    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))

    .unique();

}
```

There are also a few helpers in this file:

* `current` exposes the user information to the client, which will helps the client determine whether the webhook already succeeded
* `upsertFromClerk` will be called when a user signs up or when they update their account
* `deleteFromClerk` will be called when a user deletes their account via Clerk UI from your app
* `getCurrentUserOrThrow` retrieves the currently logged-in user or throws an error
* `getCurrentUser` retrieves the currently logged-in user or returns null
* `userByExternalId` retrieves a user given the Clerk ID, and is used only for retrieving the current user or when updating an existing user via the webhook

### Webhook endpoint implementation[​](#webhook-endpoint-implementation "Direct link to Webhook endpoint implementation")

This how the actual HTTP endpoint can be implemented:

convex/http.ts

```
import { httpRouter } from "convex/server";

import { env, httpAction } from "./_generated/server";

import { internal } from "./_generated/api";

import type { WebhookEvent } from "@clerk/backend";

import { Webhook } from "svix";



const http = httpRouter();



http.route({

  path: "/clerk-users-webhook",

  method: "POST",

  handler: httpAction(async (ctx, request) => {

    const event = await validateRequest(request);

    if (!event) {

      return new Response("Error occured", { status: 400 });

    }

    switch (event.type) {

      case "user.created": // intentional fallthrough

      case "user.updated":

        await ctx.runMutation(internal.users.upsertFromClerk, {

          data: event.data,

        });

        break;



      case "user.deleted": {

        const clerkUserId = event.data.id!;

        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId });

        break;

      }

      default:

        console.log("Ignored Clerk webhook event", event.type);

    }



    return new Response(null, { status: 200 });

  }),

});



async function validateRequest(req: Request): Promise<WebhookEvent | null> {

  const payloadString = await req.text();

  const svixHeaders = {

    "svix-id": req.headers.get("svix-id")!,

    "svix-timestamp": req.headers.get("svix-timestamp")!,

    "svix-signature": req.headers.get("svix-signature")!,

  };

  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);

  try {

    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;

  } catch (error) {

    console.error("Error verifying webhook event", error);

    return null;

  }

}



export default http;
```

If you deploy your code now and sign in, you should see the user being created in your Convex database.

### Using the current user's document[​](#using-the-current-users-document "Direct link to Using the current user's document")

You can use the helpers defined before to retrieve the current user's document.

Now that you have users stored as documents in your Convex database, you can use their IDs as foreign keys in other documents:

convex/messages.ts

```
import { v } from "convex/values";

import { mutation } from "./_generated/server";

import { getCurrentUserOrThrow } from "./users";



export const send = mutation({

  args: { body: v.string() },

  handler: async (ctx, args) => {

    const user = await getCurrentUserOrThrow(ctx);

    await ctx.db.insert("messages", { body: args.body, userId: user._id });

  },

});
```

### Loading users by their ID[​](#loading-users-by-their-id-1 "Direct link to Loading users by their ID")

The information about other users can be retrieved via their IDs:

convex/messages.ts

```
export const list = query({

  args: {},

  handler: async (ctx) => {

    const messages = await ctx.db.query("messages").collect();

    return Promise.all(

      messages.map(async (message) => {

        // For each message in this channel, fetch the `User` who wrote it and

        // insert their name into the `author` field.

        const user = await ctx.db.get("users", message.user);

        return {

          author: user?.name ?? "Anonymous",

          ...message,

        };

      }),

    );

  },

});
```

### Waiting for current user to be stored[​](#waiting-for-current-user-to-be-stored "Direct link to Waiting for current user to be stored")

If you want to use the current user's document in a query, make sure that the user has already been stored. You can do this by explicitly checking for this condition before rendering the components that call the query, or before redirecting to the authenticated portion of your app.

For example you can define a hook that determines the current authentication state of the client, taking into account whether the current user has been stored:

src/useCurrentUser.ts

```
import { useConvexAuth, useQuery } from "convex/react";

import { api } from "../convex/_generated/api";



export function useCurrentUser() {

  const { isLoading, isAuthenticated } = useConvexAuth();

  const user = useQuery(api.users.current);

  // Combine the authentication state with the user existence check

  return {

    isLoading: isLoading || (isAuthenticated && user === null),

    isAuthenticated: isAuthenticated && user !== null,

  };

}
```

And then you can use it to render the appropriate components:

src/App.tsx

```
import { useCurrentUser } from "./useCurrentUser";



export default function App() {

  const { isLoading, isAuthenticated } = useCurrentUser();

  return (

    <main>

      {isLoading ? (

        <>Loading...</>

      ) : isAuthenticated ? (

        <Content />

      ) : (

        <LoginPage />

      )}

    </main>

  );

}
```
