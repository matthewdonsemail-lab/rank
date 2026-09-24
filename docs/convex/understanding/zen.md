# The Zen of Convex

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[YouTube video player](https://www.youtube.com/embed/dyEWQ9s2ji4?si=ce-M8pt6EWDZ8tfd)

Convex is an opinionated framework, with every element designed to pull developers into [the pit of success](https://blog.codinghorror.com/falling-into-the-pit-of-success/).

The Zen of Convex is a set of guidelines & best practices developers have discovered that keep their projects falling into this wonderful pit.

## Performance<!-- -->

### Double down on the [sync engine](/tutorial/overview.md#how-convex-works)

There's a reason why a deterministic, reactive database is the beating heart of Convex: the more you center your apps around its properties, the better your projects will fare over time. Your projects will be easier to understand and refactor. Your app's performance will stay screaming fast. You won't have any consistency or state management problems.

Use a query for nearly every app read

Queries are the reactive, automatically cacheable, consistent and resilient way to propagate data to your application and its jobs. With very few exceptions, every read operation in your app should happen via a query function.

Keep sync engine functions light & fast

In general, your mutations and queries should be working with less than a few hundred records and should aim to finish in less than 100ms. It's nearly impossible to maintain a snappy, responsive app if your synchronous transactions involve a lot more work than this.

Use actions sparingly and incrementally

Actions are wonderful for batch jobs and/or integrating with outside services. They're very powerful, but they're slower, more expensive, and Convex provides a lot fewer guarantees about their behavior. So never use an action if a query or mutation will get the job done.

### <!-- -->Don't over-complicate client-side state management

Convex builds in a ton of its own caching and consistency controls into the app's client library. Rather than reinvent the wheel, let your client-side code take advantage of these built-in performance boosts.

Let Convex handle caching & consistency

You might be tempted to quickly build your own local cache or state aggregation layer in Convex to sit between your components and your Convex functions. With Convex, most of the time, you won't end up needing this. More often than not, you can bind your components to Convex functions in pretty simple ways and things will Just Work and be plenty fast.

Be thoughtful about the return values of mutations

Mutation return values can be useful to trigger state changes in your app, but it's rarely a good idea to use them to set in-app state to update the UI. Let queries and the sync engine do that.

## Architecture<!-- -->

### <!-- -->Create server-side frameworks using "just code"

Convex's built-in primitives are pretty low level! They're just functions. What about authentication frameworks? What about object-relational mappings? Do you need to wait until Convex ships some in-built feature to get those? Nope. In general, you should solve composition and encapsulation problems in your server-side Convex code using the same methods you use for the rest of your TypeScript code bases. After all, this is why Convex is "just code!" [Stack](https://stack.convex.dev) always has [great](https://stack.convex.dev/functional-relationships-helpers) [examples](https://stack.convex.dev/wrappers-as-middleware-authentication) of ways to tackle [these needs](https://stack.convex.dev/row-level-security).

### <!-- -->Don't misuse actions

Actions are powerful, but it's important to be intentional in how they fit into your app's data flow.

Don't invoke actions directly from your app

In general, it's an anti-pattern to call actions from the browser. Usually, actions are running on some dependent record that should be living in a Convex table. So it's best trigger actions by invoking a mutation that both *writes* that dependent record and *schedules* the subsequent action to run in the background.

Don't think 'background jobs', think 'workflow'

When actions are involved, it's useful to write chains of effects and mutations, such as:

action code → mutation → more action code → mutation.

Then apps or other jobs can follow along with queries.

Record progress one step at a time

While actions *could* work with thousands of records and call dozens of APIs, it's normally best to do smaller batches of work and/or to perform individual transformations with outside services. Then record your progress with a mutation, of course. Using this pattern makes it easy to debug issues, resume partial jobs, and report incremental progress in your app's UI.

## Development workflow<!-- -->

### <!-- -->Keep the dashboard by your side

Working on your Convex project without using the dashboard is like driving a car with your eyes closed. The dashboard lets you view logs, give mutations/queries/actions a test run, make sure your configuration and codebase are as you expect, inspect your tables, generate schemas, etc. It's an invaluable part of your rapid development cycle.

### <!-- -->Don't go it alone

Between these [docs](https://docs.convex.dev), [Stack](https://stack.convex.dev), and [our community](https://convex.dev/community), someone has *probably* encountered the design or architectural issue you're facing. So why try to figure things out the hard way, when you can take advantage of a whole community's experience?

Leverage Convex developer search

With so many great resources from the Convex team & community, it can be hard to know where to look first. If you want a quick way to search across all of these, [we have a portal for that](https://search.convex.dev)!

Join the Convex community

Whether you're stuck on a tricky use case, you have a question or feature request for the Convex team, or you're excited to share the amazing app(s) you've built and help others learn, the Convex community is there for you! Join the party on [Discord](https://convex.dev/community).
