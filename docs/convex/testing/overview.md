# Testing

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Convex makes it easy to test your app via automated tests running in JS or against a real backend, and manually in dev, preview and staging environments.

## Automated tests[​](#automated-tests "Direct link to Automated tests")

### `convex-test` library[​](#convex-test-library "Direct link to convex-test-library")

[Use the `convex-test` library](/testing/convex-test.md) to test your functions in JS via the excellent Vitest testing framework.

### Testing against a real backend[​](#testing-against-a-real-backend "Direct link to Testing against a real backend")

Convex open source builds allow you to test all of your backend logic running on a real [local Convex backend](/testing/convex-backend.md).

### Set up testing in CI[​](#set-up-testing-in-ci "Direct link to Set up testing in CI")

It's a good idea to test your app continuously in a controlled environment. No matter which way automated method you use, it's easy to run them with [GitHub Actions](/testing/ci.md).

<!-- -->

<!-- -->

## Manual tests[​](#manual-tests "Direct link to Manual tests")

### Running a function in dev[​](#running-a-function-in-dev "Direct link to Running a function in dev")

Manually run a function in dev to quickly see if things are working:

* [Run functions from the command line](/cli/reference/run.md)
* [Run functions from the dashboard](/dashboard/deployments/functions.md#running-functions)

### Preview deployments[​](#preview-deployments "Direct link to Preview deployments")

[Use preview deployments](/production/multiple-deployments.md#preview) to get early feedback from your team for your in-progress features.

### Staging environment[​](#staging-environment "Direct link to Staging environment")

You can set up a separate project as a staging environment to test against. See [Deploying Your App to Production](/production/overview.md#staging-environment).
