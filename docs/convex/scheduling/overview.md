# Scheduling

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Convex lets you easily schedule a function to run once or repeatedly in the future. This allows you to build durable workflows like sending a welcome email a day after someone joins or regularly reconciling your accounts with Stripe. Convex provides two different features for scheduling:

* [Scheduled Functions](/scheduling/scheduled-functions.md) can be scheduled durably by any other function to run at a later point in time. You can schedule functions minutes, days, and even months in the future.
* [Cron Jobs](/scheduling/cron-jobs.md) schedule functions to run on a recurring basis, such as daily.

## Durable function components[​](#durable-function-components "Direct link to Durable function components")

Built-in scheduled functions and crons work well for simpler apps and workflows. If you're operating at high scale or need more specific guarantees, use the following higher-level [components](/components/overview.md) for durable functions.

[Convex Component](https://www.convex.dev/components/workpool)

### [Workpool](https://www.convex.dev/components/workpool)

[Workpool give critical tasks priority by organizing async operations into separate, customizable queues.](https://www.convex.dev/components/workpool)

[Convex Component](https://www.convex.dev/components/workflow)

### [Workflow](https://www.convex.dev/components/workflow)

[Simplify programming long running code flows. Workflows execute durably with configurable retries and delays.](https://www.convex.dev/components/workflow)

[Convex Component](https://www.convex.dev/components/crons)

### [Crons](https://www.convex.dev/components/crons)

[Use cronspec to run functions on a repeated schedule at runtime.](https://www.convex.dev/components/crons)

Related posts from

<!-- -->

[![Stack](/img/stack-logo-dark.svg)![Stack](/img/stack-logo-light.svg)](https://stack.convex.dev/)
