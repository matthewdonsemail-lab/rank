# Testing Local Backend

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Alternatively to [`convex-test`](/testing/convex-test.md) you can test your functions using the [open-source version of the Convex backend](https://github.com/get-convex/convex-backend).

## Getting Started[​](#getting-started "Direct link to Getting Started")

Follow [this guide](https://stack.convex.dev/testing-with-local-oss-backend) for the instructions.

Compared to `convex-test`, which uses a JS mock of the backend, running your tests against the real backend has these advantages:

* Your tests will run against the same code as your Convex production (as long you keep the local backend up-to-date).
* Limits on argument, data, query sizes are enforced.
* You can bootstrap a large test dataset from a data import.
* You can test your client code in combination with your backend logic.

## Limitations[​](#limitations "Direct link to Limitations")

Note that testing against the local backend also has some drawbacks:

* It requires setting up the local backend, which is more involved.
* No control over time and any scheduled functions will run as scheduled.
* Crons will also run unless disabled via [`IS_TEST`](https://stack.convex.dev/testing-with-local-oss-backend#setting-up-a-local-backend).
* No way to mock `fetch` calls.
* No way to mock dependencies or parts of the codebase.
* No way to control randomness (tests may not be deterministic).
* No way to set environment variable values from within tests.

To test your functions in JS with a mocked Convex backend, check out [convex-test](/testing/convex-test.md).

## CI[​](#ci "Direct link to CI")

See [Continuous Integration](/testing/ci.md) to run your tests on a shared remote machine.
