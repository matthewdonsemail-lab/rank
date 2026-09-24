# convex-test

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

The [`convex-test`](https://www.npmjs.com/package/convex-test) library provides a mock implementation of the Convex backend in JavaScript. It enables fast automated testing of the logic in your [functions](/functions/overview.md).

## Example[​](#example "Direct link to Example")

convex/posts.test.ts

```
import { convexTest } from "convex-test";

import { describe, it, expect } from "vitest";

import { api, internal } from "./_generated/api";

import schema from "./schema";



describe("posts.list", () => {

  it("returns empty array when no posts exist", async () => {

    const t = convexTest(schema, modules);



    // Initially, there are no posts, so `list` returns an empty array

    const posts = await t.query(api.posts.list);

    expect(posts).toEqual([]);

  });



  it("returns all posts ordered by creation time when there are posts", async () => {

    const t = convexTest(schema, modules);



    // Create some posts

    await t.mutation(internal.posts.add, {

      title: "First Post",

      content: "This is the first post",

      author: "Alice",

    });

    await t.mutation(internal.posts.add, {

      title: "Second Post",

      content: "This is the second post",

      author: "Bob",

    });



    // `list` returns all posts ordered by creation time

    const posts = await t.query(api.posts.list);

    expect(posts).toHaveLength(2);

    expect(posts[0].title).toBe("Second Post");

    expect(posts[1].title).toBe("First Post");

  });

});



const modules = import.meta.glob("./**/*.ts");
```

You can see more examples in the [test suite](https://github.com/get-convex/convex-test/tree/main/convex) of the convex-test library.

## Get started[​](#get-started "Direct link to Get started")

1. Install test dependencies

   Install [Vitest](https://vitest.dev/) and the [`convex-test`](https://www.npmjs.com/package/convex-test) library.

   ```
   npm install --save-dev convex-test vitest @edge-runtime/vm
   ```

2. Setup NPM scripts

   Add these scripts to your `package.json`

   package.json

   ```
   "scripts": {

     "test": "vitest",

     "test:once": "vitest run",

     "test:debug": "vitest --inspect-brk --no-file-parallelism",

     "test:coverage": "vitest run --coverage --coverage.reporter=text",

   }
   ```

3. Configure Vitest

   Add `vitest.config.ts` file to configure the test environment to better match the Convex runtime.

   If your Convex functions are in a directory other than `convex`

   If your project has a [different name or location configured](/production/project-configuration.md#changing-the-convex-folder-name-or-location) for the `convex/` folder in `convex.json`, you need to call [`import.meta.glob`](https://vitejs.dev/guide/features#glob-import) and pass the result as the second argument to `convexTest`.

   The argument to `import.meta.glob` must be a glob pattern matching all the files containing your Convex functions. The paths are relative to the test file in which `import.meta.glob` is called. It's best to do this in one place in your custom functions folder:

   src/convex/test.setup.ts

   ```
   /// <reference types="vite/client" />

   export const modules = import.meta.glob(

     "./**/!(*.*.*)*.*s"

   );
   ```

   This example glob pattern includes all files with a single extension ending in `s` (like `js` or `ts`) in the `src/convex` folder and any of its children.

   Use the result in your tests:

   src/convex/messages.test.ts

   ```
   import { convexTest } from "convex-test";

   import { test } from "vitest";

   import schema from "./schema";

   import { modules } from "./test.setup";



   test("some behavior", async () => {

     const t = convexTest(schema, modules);

     // use `t`...

   });
   ```

   Set up multiple test environments (e.g. Convex + frontend)

   If you want to use Vitest to test both your Convex functions and your React frontend:

   * With Vitest 4, use the [`projects`](https://vitest.dev/guide/projects) array to define separate configurations per environment:

   vitest.config.ts

   ```
   import { defineConfig } from "vitest/config";



   export default defineConfig({

     test: {

       projects: [

         {

           extends: true,

           test: {

             name: "convex",

             include: ["convex/**/*.test.{ts,js}"],

             environment: "edge-runtime",

           },

         },

         {

           extends: true,

           test: {

             name: "frontend",

             include: ["**/*.test.{ts,tsx,js,jsx}"],

             exclude: ["convex/**"],

             environment: "jsdom",

           },

         },

       ],

     },

   });
   ```

   * With Vitest 3, use [`environmentMatchGlobs`](https://v3.vitest.dev/config/#environmentmatchglobs):

   vitest.config.ts

   ```
   import { defineConfig } from "vitest/config";



   export default defineConfig({

     test: {

       environmentMatchGlobs: [

         // all tests in convex/ will run in edge-runtime

         ["convex/**", "edge-runtime"],

         // all other tests use jsdom

         ["**", "jsdom"],

       ],

     },

   });
   ```

   vitest.config.ts

   ```
   import { defineConfig } from "vitest/config";



   export default defineConfig({

     test: {

       environment: "edge-runtime",

     },

   });
   ```

4. Add a test file

   In your `convex` folder add a file ending in `.test.ts`

   The example test calls the `api.messages.send` mutation twice and then asserts that the `api.messages.list` query returns the expected results.

   convex/messages.test.ts

   ```
   import { convexTest } from "convex-test";

   import { expect, test } from "vitest";

   import { api } from "./_generated/api";

   import schema from "./schema";



   test("sending messages", async () => {

     const t = convexTest(schema);

     await t.mutation(api.messages.send, { body: "Hi!", author: "Sarah" });

     await t.mutation(api.messages.send, { body: "Hey!", author: "Tom" });

     const messages = await t.query(api.messages.list);

     expect(messages).toMatchObject([

       { body: "Hi!", author: "Sarah" },

       { body: "Hey!", author: "Tom" }

     ]);

   });
   ```

5. Run tests

   Start the tests with `npm run test`. When you change the test file or your functions the tests will rerun automatically.

   ```
   npm run test
   ```

If you're not familiar with Vitest, read the [Vitest Getting Started docs](https://vitest.dev/guide) first.

## Using convex-test[​](#using-convex-test "Direct link to Using convex-test")

### Initialize `convexTest`[​](#initialize-convextest "Direct link to initialize-convextest")

The library exports a `convexTest` function which should be called at the start of each of your tests. The function returns an object which is by convention stored in the `t` variable and which provides methods for exercising your Convex functions.

If your project uses a [schema](/database/schemas.md) you should pass it to the `convexTest` function:

convex/myFunctions.test.ts

```
import { convexTest } from "convex-test";

import { test } from "vitest";

import schema from "./schema";



test("some behavior", async () => {

  const t = convexTest(schema);

  // use `t`...

});
```

Passing in the schema is required for the tests to correctly implement schema validation and for correct typing of [`t.run`](#modify-data-outside-of-functions).

If you don't have a schema, call `convexTest()` with no argument.

### Call functions[​](#call-functions "Direct link to Call functions")

Your test can call public and internal Convex [functions](/functions/overview.md) in your project:

convex/myFunctions.test.ts

```
import { convexTest } from "convex-test";

import { test } from "vitest";

import { api, internal } from "./_generated/api";



test("functions", async () => {

  const t = convexTest();

  const x = await t.query(api.myFunctions.myQuery, { a: 1, b: 2 });

  const y = await t.query(internal.myFunctions.internalQuery, { a: 1, b: 2 });

  const z = await t.mutation(api.myFunctions.mutateSomething, { a: 1, b: 2 });

  const w = await t.mutation(internal.myFunctions.mutateSomething, { a: 1 });

  const u = await t.action(api.myFunctions.doSomething, { a: 1, b: 2 });

  const v = await t.action(internal.myFunctions.internalAction, { a: 1, b: 2 });

});
```

### Modify data outside of functions[​](#modify-data-outside-of-functions "Direct link to Modify data outside of functions")

Sometimes you might want to directly [write](/database/writing-data.md) to the mock database or [file storage](/file-storage/overview.md) from your test, without needing a declared function in your project. You can use the `t.run` method which takes a handler that is given a `ctx` that allows reading from and writing to the mock backend:

convex/tasks.test.ts

```
import { convexTest } from "convex-test";

import { expect, test } from "vitest";

import schema from "./schema";



test("functions", async () => {

  const t = convexTest(schema, modules);

  const firstTask = await t.run(async (ctx) => {

    await ctx.db.insert("tasks", { text: "Eat breakfast" });

    return await ctx.db.query("tasks").first();

  });

  expect(firstTask).toMatchObject({ text: "Eat breakfast" });

});



const modules = import.meta.glob("./**/*.ts");
```

### Test helper functions with inline queries, mutations, and actions[​](#test-helper-functions-with-inline-queries-mutations-and-actions "Direct link to Test helper functions with inline queries, mutations, and actions")

Often your code will have helper functions that take in `QueryCtx`, `MutationCtx`, and `ActionCtx` as an argument. With version `0.0.42` and later, you can pass an inline function to `t.query`, `t.mutation`, and `t.action`, similar to `t.run`, but with a `ctx` argument matching the function type.

```
test("helper functions", async () => {

  const t = convexTest();

  const threadId = await t.mutation(async (ctx) => {

    const threadId = await ctx.db.insert("threads", {});

    // insertThreadMessage takes a MutationCtx argument.

    await insertThreadMessage(ctx, threadId, "Hello");

    return threadId;

  });



  const text = await t.action(async (ctx) => {

    // searchForMessages takes an ActionCtx argument.

    const messages = await searchForMessages(ctx, threadId);

    const response = await promptLLM(ctx, threadId, messages);

  });

});
```

### HTTP actions[​](#http-actions "Direct link to HTTP actions")

Your test can call [HTTP actions](/functions/http-actions.md) registered by your router:

convex/http.test.ts

```
import { convexTest } from "convex-test";

import { expect, test } from "vitest";

import schema from "./schema";



test("functions", async () => {

  const t = convexTest(schema, modules);

  const response = await t.fetch("/some/path", { method: "POST" });

  expect(response.status).toBe(200);

});



const modules = import.meta.glob("./**/*.ts");
```

Mocking the global `fetch` function doesn't affect `t.fetch`, but you can use `t.fetch` in a `fetch` mock to route to your HTTP actions.

### Scheduled functions[​](#scheduled-functions "Direct link to Scheduled functions")

One advantage of using a mock implementation running purely in JavaScript is that you can control time in the Vitest test environment. To test implementations relying on [scheduled functions](/scheduling/scheduled-functions.md) use [Vitest's fake timers](https://vitest.dev/guide/mocking.html#timers) in combination with `t.finishInProgressScheduledFunctions`:

convex/scheduling.test.ts

```
import { convexTest } from "convex-test";

import { expect, test, vi } from "vitest";

import { api } from "./_generated/api";

import schema from "./schema";



test("mutation scheduling action", async () => {

  // Enable fake timers

  vi.useFakeTimers();



  const t = convexTest(schema, modules);



  // Call a function that schedules a mutation or action

  const scheduledFunctionId = await t.mutation(

    api.scheduler.mutationSchedulingAction,

    { delayMs: 10000 },

  );



  // Advance the mocked time

  vi.advanceTimersByTime(5000);



  // Advance the mocked time past the scheduled time of the function

  vi.advanceTimersByTime(6000);



  // Or run all currently pending timers

  vi.runAllTimers();



  // At this point the scheduled function will be `inProgress`,

  // now wait for it to finish

  await t.finishInProgressScheduledFunctions();



  // Assert that the scheduled function succeeded or failed

  const scheduledFunctionStatus = await t.run(async (ctx) => {

    return await ctx.db.system.get("_scheduled_functions", scheduledFunctionId);

  });

  expect(scheduledFunctionStatus).toMatchObject({ state: { kind: "success" } });



  // Reset to normal `setTimeout` etc. implementation

  vi.useRealTimers();

});



const modules = import.meta.glob("./**/*.ts");
```

If you have a chain of several scheduled functions, for example a mutation that schedules an action that schedules another action, you can use `t.finishAllScheduledFunctions` to wait for all scheduled functions, including recursively scheduled functions, to finish:

convex/chainedScheduling.test.ts

```
import { convexTest } from "convex-test";

import { expect, test, vi } from "vitest";

import { api } from "./_generated/api";

import schema from "./schema";



test("mutation scheduling action scheduling action", async () => {

  // Enable fake timers

  vi.useFakeTimers();



  const t = convexTest(schema, modules);



  // Call a function that schedules a mutation or action

  await t.mutation(api.scheduler.mutationSchedulingActionSchedulingAction);



  // Wait for all scheduled functions, repeatedly

  // advancing time and waiting for currently in-progress

  // functions to finish

  await t.finishAllScheduledFunctions(vi.runAllTimers);



  // Assert the resulting state after all scheduled functions finished

  const createdTask = await t.run(async (ctx) => {

    return await ctx.db.query("tasks").first();

  });

  expect(createdTask).toMatchObject({ author: "AI" });



  // Reset to normal `setTimeout` etc. implementation

  vi.useRealTimers();

});



const modules = import.meta.glob("./**/*.ts");
```

Check out more examples in [this file](https://github.com/get-convex/convex-test/blob/main/convex/scheduler.test.ts).

### Authentication[​](#authentication "Direct link to Authentication")

To test functions which depend on the current [authenticated](/auth/overview.md) user identity you can create a version of the `t` accessor with given [user identity attributes](/api/interfaces/server.UserIdentity.md). If you don't provide them, `issuer`, `subject` and `tokenIdentifier` will be generated automatically:

convex/tasks.test.ts

```
import { convexTest } from "convex-test";

import { expect, test } from "vitest";

import { api } from "./_generated/api";

import schema from "./schema";



test("authenticated functions", async () => {

  const t = convexTest(schema, modules);



  const asSarah = t.withIdentity({ name: "Sarah" });

  await asSarah.mutation(api.tasks.create, { text: "Add tests" });



  const sarahsTasks = await asSarah.query(api.tasks.list);

  expect(sarahsTasks).toMatchObject([{ text: "Add tests" }]);



  const asLee = t.withIdentity({ name: "Lee" });

  const leesTasks = await asLee.query(api.tasks.list);

  expect(leesTasks).toEqual([]);

});



const modules = import.meta.glob("./**/*.ts");
```

## Vitest tips[​](#vitest-tips "Direct link to Vitest tips")

### Asserting results[​](#asserting-results "Direct link to Asserting results")

See Vitest's [Expect](https://vitest.dev/api/expect.html) reference.

[`toMatchObject()`](https://vitest.dev/api/expect.html#tomatchobject) is particularly helpful when asserting the shape of results without needing to list every object field.

### Asserting errors[​](#asserting-errors "Direct link to Asserting errors")

To assert that a function throws, use [`.rejects.toThrowError()`](https://vitest.dev/api/expect.html#tothrowerror):

convex/messages.test.ts

```
import { convexTest } from "convex-test";

import { expect, test } from "vitest";

import { api } from "./_generated/api";

import schema from "./schema";



test("messages validation", async () => {

  const t = convexTest(schema, modules);

  await expect(async () => {

    await t.mutation(api.messages.send, { body: "", author: "James" });

  }).rejects.toThrowError("Empty message body is not allowed");

});



const modules = import.meta.glob("./**/*.ts");
```

### Mocking `fetch` calls[​](#mocking-fetch-calls "Direct link to mocking-fetch-calls")

You can use Vitest's [vi.stubGlobal](https://vitest.dev/guide/mocking.html#globals) method:

convex/ai.test.ts

```
import { expect, test, vi } from "vitest";

import { api } from "./_generated/api";

import schema from "./schema";

import { convexTest } from "convex-test";



test("ai", async () => {

  const t = convexTest(schema, modules);



  vi.stubGlobal(

    "fetch",

    vi.fn(async () => ({ text: async () => "I am the overlord" }) as Response),

  );



  const reply = await t.action(api.messages.sendAIMessage, { prompt: "hello" });

  expect(reply).toEqual("I am the overlord");



  vi.unstubAllGlobals();

});



const modules = import.meta.glob("./**/*.ts");
```

### Overriding globals inside functions[​](#overriding-globals-inside-functions "Direct link to Overriding globals inside functions")

Some libraries override runtime globals such as `fetch`, `Math`, `Date`, `console`, `process`, or `crypto` while a Convex function runs. `convex-test` scopes those overrides to a single function invocation, so they don't leak into other functions or into your test.

Override a global by assigning a replacement object to it:

convex/globals.test.ts

```
test("overriding Math within a handler", async () => {

  const t = convexTest(schema, modules);

  const originalMath = globalThis.Math;



  const result = await t.run(async () => {

    const replacement: Math = Object.create(globalThis.Math);

    replacement.random = () => 0.5;

    globalThis.Math = replacement;



    return Math.random();

  });



  expect(result).toBe(0.5);

  expect(globalThis.Math).toBe(originalMath);

});
```

The override is visible to the handler and everything it calls directly, including after `await`. Nested calls through `ctx.runQuery`, `ctx.runMutation`, or `ctx.runAction` start from the test's globals and do not inherit it.

#### Assign to the global; don't mutate or redefine it[​](#assign-to-the-global-dont-mutate-or-redefine-it "Direct link to Assign to the global; don't mutate or redefine it")

Isolation works by intercepting assignments to the global itself, so only assignment is scoped to the invocation:

* ✅ `globalThis.Math = replacement`
* ❌ `Math.random = () => 0.5` — mutates the object shared with the rest of the test. Build a replacement object instead, as shown above.
* ❌ `Object.defineProperty(globalThis, "Math", { value: replacement })` — replaces the property rather than assigning through it. `vi.stubGlobal` does this, so avoid it while running queries/mutations/actions.
* ❌ `delete globalThis.crypto` — removes the property. Assign `undefined` instead:

convex/globals.test.ts

```
test("making crypto unavailable within a handler", async () => {

  const t = convexTest(schema, modules);



  const result = await t.run(async () => {

    (globalThis as Record<string, unknown>).crypto = undefined;



    return typeof crypto;

  });



  expect(result).toBe("undefined");

  expect(globalThis.crypto).toBeDefined();

});
```

The property still exists, so `typeof crypto === "undefined"` checks pass, but this doesn't simulate deleting the property.

The ❌ forms change the global for the whole test process, and they also disable the restrictions `convex-test` applies inside queries and mutations, even when used in test setup.

Isolation covers the supported globals that exist and are configurable in your test environment; it doesn't cover custom globals. Overrides made outside a handler are shared test setup — restore them yourself, for example in a `finally` block.

### Measuring test coverage[​](#measuring-test-coverage "Direct link to Measuring test coverage")

You can get a printout of the code coverage provided by your tests. Besides answering the question "how much of my code is covered by tests" it is also helpful to check that your test is actually exercising the code that you want it to exercise.

Run `npm run test:coverage`. It will ask you to install a required dependency the first time you run it.

![example coverage printout](/screenshots/testing_coverage.png)

### Debugging tests[​](#debugging-tests "Direct link to Debugging tests")

You can attach a debugger to the running tests. Read the Vitest [Debugging docs](https://vitest.dev/guide/debugging.html) and then use

`npm run test:debug`.

## Limitations[​](#limitations "Direct link to Limitations")

Since `convex-test` is only a mock implementation, it doesn't have many of the behaviors of the real Convex backend. Still, it should be helpful for testing the logic in your functions, and catching regressions caused by changes to your code.

Some of the ways the mock differs:

* Error messages content. You should not write product logic that relies on the content of error messages thrown by the real backend, as they are always subject to change.

* Limits. The mock doesn't enforce size and time [limits](/production/state/limits.md).

* ID format. Your code should not depend on the document or storage ID format.

* Runtime built-ins. Most of your functions are written for the [Convex default runtime](/functions/runtimes.md), while Vitest uses a mock of Vercel's Edge Runtime, which is similar but might differ from the Convex runtime. You should always test new code manually to make sure it doesn't use built-ins not available in the Convex runtime.

* Some features have only simplified semantics, namely:

  <!-- -->

  * [Text search](/search/overview.md) returns all documents that include a word for which at least one word in the searched string is a prefix. It does not sort the results by relevance.
  * [Vector search](/search/vector-search.md) returns results sorted by cosine similarity, but doesn't use an efficient vector index in its implementation.
  * There is no support for [cron jobs](/scheduling/cron-jobs.md), you should trigger your functions manually from the test.

To test your functions running on a real Convex backend, check out [Testing Local Backend](/testing/convex-backend.md).

## CI[​](#ci "Direct link to CI")

See [Continuous Integration](/testing/ci.md) to run your tests on a shared remote machine.
