# Application Errors

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

If you have expected ways your functions might fail, you can either return different values or throw `ConvexError`s.

## Returning different values[​](#returning-different-values "Direct link to Returning different values")

If you're using TypeScript different return types can enforce that you're handling error scenarios.

For example, a `createUser` mutation could return

```
Id<"users"> | { error: "EMAIL_ADDRESS_IN_USE" };
```

to express that either the mutation succeeded or the email address was already taken.

This ensures that you remember to handle these cases in your UI.

## Throwing application errors[​](#throwing-application-errors "Direct link to Throwing application errors")

You might prefer to throw errors for the following reasons:

* You can use the exception bubbling mechanism to throw from a deeply nested function call, instead of manually propagating error results up the call stack. This will work for `runQuery`, `runMutation` and `runAction` calls in [actions](/functions/actions.md) too.
* In [mutations](/functions/mutation-functions.md), throwing an error will prevent the mutation transaction from committing
* On the client, it might be simpler to handle all kinds of errors, both expected and unexpected, uniformly

Convex provides an error subclass, [`ConvexError`](/api/classes/values.ConvexError.md), which can be used to carry information from the backend to the client:

convex/myFunctions.ts

```
import { ConvexError } from "convex/values";

import { mutation } from "./_generated/server";



export const assignRole = mutation({

  args: {

    // ...

  },

  handler: (ctx, args) => {

    const isTaken = isRoleTaken(/* ... */);

    if (isTaken) {

      throw new ConvexError("Role is already taken");

    }

    // ...

  },

});
```

### Application error `data` payload[​](#application-error-data-payload "Direct link to application-error-data-payload")

You can pass the same [data types](/database/types.md) supported by function arguments, return types and the database, to the `ConvexError` constructor. This data will be stored on the `data` property of the error:

```
// error.data === "My fancy error message"

throw new ConvexError("My fancy error message");



// error.data === {message: "My fancy error message", code: 123, severity: "high"}

throw new ConvexError({

  message: "My fancy error message",

  code: 123,

  severity: "high",

});



// error.data === {code: 123, severity: "high"}

throw new ConvexError({

  code: 123,

  severity: "high",

});
```

Error payloads more complicated than a simple `string` are helpful for more structured error logging, or for handling sets of errors differently on the client.

## Handling application errors on the client[​](#handling-application-errors-on-the-client "Direct link to Handling application errors on the client")

On the client, application errors also use the `ConvexError` class, and the data they carry can be accessed via the `data` property:

src/App.tsx

```
import { ConvexError } from "convex/values";

import { useMutation } from "convex/react";

import { api } from "../convex/_generated/api";



export function MyApp() {

  const doSomething = useMutation(api.myFunctions.mutateSomething);

  const handleSomething = async () => {

    try {

      await doSomething({ a: 1, b: 2 });

    } catch (error) {

      const errorMessage =

        // Check whether the error is an application error

        error instanceof ConvexError

          ? // Access data and cast it to the type we expect

            (error.data as { message: string }).message

          : // Must be some developer error,

            // and prod deployments will not

            // reveal any more information about it

            // to the client

            "Unexpected error occurred";

      // do something with `errorMessage`

    }

  };

  // ...

}
```
