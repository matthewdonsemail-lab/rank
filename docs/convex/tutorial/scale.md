> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# Convex Tutorial: Scaling your app

Convex was designed from the ground up for scale. In the previous section we already talked about how keeping your actions small and most of your logic in queries and mutations are crucial to building fast scalable backends.

Let's talk about a few other ways to keep your app fast and scalable.

[YouTube video player](https://www.youtube.com/embed/7lOGqFHnEsA)

## Indexed queries[​](#indexed-queries "Direct link to Indexed queries")

Indexes tell the database to create a lookup structure to make it really fast to filter data. If, in our chat app we wanted to build a way to look up `messages` from just one user, we'd tell Convex to index the `user` field in the `messages` table and write the query with the `withIndex` syntax.

[Learn how to use indexes](/database/reading-data/indexes/.md).

## Too many writes on the same document[​](#too-many-writes-on-the-same-document "Direct link to Too many writes on the same document")

Let's say you decide to show a counter in your app. You may write a mutation that reads a number field, adds 1, and updates the same field in the database. At some point, this pattern may cause an [optimistic concurrency control conflict](/error.md#1). That means that the database isn't able to handle updating the document that fast. All databases have trouble with this sort of pattern.

There are a [few ways to deal with this](/error.md#remediation), including building something called a sharded counter...

But before you go learn advanced scaling techniques on your own, there is a better way with [Convex Components](/components/overview.md).

## Scaling best practices with Convex Components[​](#scaling-best-practices-with-convex-components "Direct link to Scaling best practices with Convex Components")

In the case of the counter above, the Convex team has already built a [scalable counter](https://www.convex.dev/components/sharded-counter) Convex component for you to use.

Convex Components are deployed along with your Convex backend but have their own tables and functions.

As you build more complicated features like [AI agents](/agents/overview.md), [workflows](https://www.convex.dev/components/workflow), [leaderboards](https://www.convex.dev/components/aggregate), [feature flags](https://www.convex.dev/components/launchdarkly) or [rate limiters](https://www.convex.dev/components/rate-limiter), you may find that there is already a Convex Component that solves this problem. [Learn more about Convex Components here](/components/overview.md).

[Components directory](https://www.convex.dev/components)

## Wrap up[​](#wrap-up "Direct link to Wrap up")

We've covered a lot of ground in this tutorial. We started by [building a chat app](/tutorial/overview.md) with queries, mutations and the database that form the fundamental building blocks of the Convex sync engine. We then called an [external API](/tutorial/actions.md) from our backend, using the scheduler to coordinate the work. Finally, we learned that [Convex Components](/components/overview.md) give you scaling best practices in neat packages.

If you are looking for more tips, read our [best practices](/understanding/best-practices/.md) and join the [community](https://www.convex.dev/community).

Convex enables you to build your MVP fast and then scale to new heights. Many great products have already done so. You're in good company.
