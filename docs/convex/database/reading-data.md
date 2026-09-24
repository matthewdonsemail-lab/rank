# Reading Data

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[Query](/functions/query-functions.md) and [mutation](/functions/mutation-functions.md) functions can read data from database tables using *document ids* and *document queries*.

## Reading a single document[​](#reading-a-single-document "Direct link to Reading a single document")

Given a single document's id you can read its data with the [`db.get`](/api/interfaces/server.GenericDatabaseReader.md#get) method:

convex/tasks.ts

```
import { query } from "./_generated/server";

import { v } from "convex/values";



export const getTask = query({

  args: { taskId: v.id("tasks") },

  handler: async (ctx, args) => {

    const task = await ctx.db.get("tasks", args.taskId);

    // do something with `task`

  },

});
```

**Note**: You should use the `v.id` validator like in the example above to make sure you are not exposing data from tables other than the ones you intended.

## Querying documents[​](#querying-documents "Direct link to Querying documents")

Document queries always begin by choosing the table to query with the [`db.query`](/api/interfaces/server.GenericDatabaseReader.md#query) method:

convex/tasks.ts

```
import { query } from "./_generated/server";



export const listTasks = query({

  args: {},

  handler: async (ctx) => {

    const tasks = await ctx.db.query("tasks").collect();

    // do something with `tasks`

  },

});
```

Then you can:

1. filter
2. order
3. and `await` the results

We'll see how this works in the examples below.

## Filtering your query[​](#filtering-your-query "Direct link to Filtering your query")

The best way to filter in Convex is to use indexes. Indexes build a special internal structure in your database to speed up lookups.

There are two steps to using indexes:

1. Define the index in your `convex/schema.ts` file.
2. Query via the `withIndex()` syntax.

### 1. Define the index[​](#1-define-the-index "Direct link to 1. Define the index")

If you aren't familiar with how to create a Convex schema, read the [schema doc](/database/schemas.md).

Let’s assume you’re building a chat app and want to get all messages in a particular channel. You can define a new index called `by_channel` on the `messages` table by using the `.index()` method in your schema.

convex/schema.ts

```
import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";



// Define a messages table with an index.

export default defineSchema({

  messages: defineTable({

    channel: v.id("channels"),

    body: v.string(),

    user: v.id("users"),

  }).index("by_channel", ["channel"]),

});
```

### 2. Filter a query with an index[​](#2-filter-a-query-with-an-index "Direct link to 2. Filter a query with an index")

In your query function, you can now filter your `messages` table by using the `by_channel` index.

```
const messages = await ctx.db

  .query("messages")

  .withIndex("by_channel", (q) => q.eq("channel", channel))

  .collect();
```

In Convex, you must explicitly use the `withIndex()` syntax to ensure your database uses the index. This differs from a more traditional SQL database, where the database implicitly chooses to use an index based on heuristics. The Convex approach leads to fewer surprises in the long run.

You can create an index across multiple fields at once, query a specific range of data, and change the order of your query result. [Read the complete index documentation](/database/reading-data/indexes/.md) to learn more.

Convex also supports a slower filtering mechanism that effectively loops through the table to match the filter. This can be useful if you know your table will be small (low thousands of rows), you're prototyping, or you want to filter an index query further. You can read more about filters [here](/database/reading-data/filters.md).

## Ordering[​](#ordering "Direct link to Ordering")

By default Convex always returns documents ordered by [`_creationTime`](/database/types.md#system-fields).

You can use [`.order("asc" | "desc")`](/api/interfaces/server.Query.md#order) to pick whether the order is ascending or descending. If the order isn't specified, it defaults to ascending.

```
// Get all messages, oldest to newest.

const messages = await ctx.db.query("messages").order("asc").collect();
```

```
// Get all messages, newest to oldest.

const messages = await ctx.db.query("messages").order("desc").collect();
```

If you need to sort on a field other than `_creationTime` and your document query returns a small number of documents (on the order of hundreds rather than thousands of documents), consider sorting in JavaScript:

```
// Get top 10 most liked messages, assuming messages is a fairly small table:

const messages = await ctx.db.query("messages").collect();

const topTenMostLikedMessages = recentMessages

  .sort((a, b) => b.likes - a.likes)

  .slice(0, 10);
```

For document queries that return larger numbers of documents, you'll want to use an [index](/database/reading-data/indexes/.md) to improve the performance. Document queries that use indexes will be [ordered based on the columns in the index](/database/reading-data/indexes/.md#sorting-with-indexes) and can avoid slow table scans.

```
// Get the top 20 most liked messages of all time, using the "by_likes" index.

const messages = await ctx.db

  .query("messages")

  .withIndex("by_likes")

  .order("desc")

  .take(20);
```

See [Limits](/database/reading-data/indexes/.md#limits) for details.

### Ordering of different types of values[​](#ordering-of-different-types-of-values "Direct link to Ordering of different types of values")

A single field can have values of any [Convex type](/database/types.md). When there are values of different types in an indexed field, their ascending order is as follows:

No value set (`undefined`) < Null (`null`) < Int64 (`bigint`) < Float64 (`number`) < Boolean (`boolean`) < String (`string`) < Bytes (`ArrayBuffer`) < Array (`Array`) < Object (`Object`)

The same ordering is used by the filtering comparison operators `q.lt()`, `q.lte()`, `q.gt()` and `q.gte()`.

## Retrieving results[​](#retrieving-results "Direct link to Retrieving results")

Most of our previous examples have ended the document query with the [`.collect()`](/api/interfaces/server.Query.md#collect) method, which returns all the documents that match your filters. Here are the other options for retrieving results.

### Taking `n` results[​](#taking-n-results "Direct link to taking-n-results")

[`.take(n)`](/api/interfaces/server.Query.md#take) selects only the first `n` results that match your query.

```
const users = await ctx.db.query("users").take(5);
```

### Finding the first result[​](#finding-the-first-result "Direct link to Finding the first result")

[`.first()`](/api/interfaces/server.Query.md#first) selects the first document that matches your query and returns `null` if no documents were found.

```
// We expect only one user with that email address.

const userOrNull = await ctx.db

  .query("users")

  .withIndex("by_email", (q) => q.eq("email", "test@example.com"))

  .first();
```

### Using a unique result[​](#using-a-unique-result "Direct link to Using a unique result")

[`.unique()`](/api/interfaces/server.Query.md#unique) selects the single document from your query or returns `null` if no documents were found. If there are multiple results it will throw an exception.

```
// Our counter table only has one document.

const counterOrNull = await ctx.db.query("counter").unique();
```

### Loading a page of results[​](#loading-a-page-of-results "Direct link to Loading a page of results")

[`.paginate(opts)`](/api/interfaces/server.OrderedQuery.md#paginate) loads a page of results and returns a [`Cursor`](/api/modules/server.md#cursor) for loading additional results.

See [Paginated Queries](/database/pagination.md) to learn more.

## More complex queries[​](#more-complex-queries "Direct link to More complex queries")

Convex prefers to have a few, simple ways to walk through and select documents from tables. In Convex, there is no specific query language for complex logic like a join, an aggregation, or a group by.

Instead, you can write the complex logic in JavaScript! Convex guarantees that the results will be consistent.

### Join[​](#join "Direct link to Join")

Table join might look like:

convex/events.ts

```
import { query } from "./_generated/server";

import { v } from "convex/values";



export const eventAttendees = query({

  args: { eventId: v.id("events") },

  handler: async (ctx, args) => {

    const event = await ctx.db.get("events", args.eventId);

    if (!event) return [];



    // Join on attendees via an index lookup

    const attendees = await ctx.db

      .query("attendees")

      .withIndex("by_eventId", (q) => q.eq("eventId", event._id))

      .take(10_000); // Safeguard: only return the first 10k users

    // Join attendees on users via a direct lookup

    return Promise.all(

      attendees.map(async (attendee) => {

        const user = await ctx.db.get("users", attendee.userId);

        return {

          name: user?.name,

          userId: user?._id,

          attendeeId: attendee._id,

        };

      }),

    );

  },

});
```

Note: by using Promise.all, the user documents will be fetched from the database in parallel, making join patterns like this very fast.

### Aggregation[​](#aggregation "Direct link to Aggregation")

Here's an example of computing an average:

convex/grades.ts

```
import { query } from "./_generated/server";

import { v } from "convex/values";



export const averageGrade = query({

  args: { studentId: v.string() },

  handler: async (ctx, args) => {

    const grades = await ctx.db

      .query("grades")

      .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))

      .collect();



    const sum = grades.reduce((soFar, { grade }) => soFar + grade, 0);

    return sum / grades.length;

  },

});
```

Computing aggregates over large sets of values

Note: Convex enforces [limits](/production/state/limits.md) on how many documents can be read in one query or mutation, in order to keep your app fast and the database happy. If you need more scalable aggregate options (for example to handle frequent updates or large tables), consider using the [Sharded Counter](https://www.convex.dev/components/sharded-counter) or [Aggregate](https://www.convex.dev/components/aggregate) components. These components can help you handle high-throughput counters, sums, or computations without looping through the whole table.

### Group by[​](#group-by "Direct link to Group by")

Here's an example of grouping and counting:

convex/grades.ts

```
import { query } from "./_generated/server";

import { v } from "convex/values";



export const numGradesBySubjectForStudent = query({

  args: { studentId: v.string() },

  handler: async (ctx, args) => {

    const grades = await ctx.db

      .query("grades")

      .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))

      .collect();



    const counts: Record<string, number> = {};

    for (const { subject } of grades) {

      counts[subject] = (counts[subject] ?? 0) + 1;

    }

    return counts;

  },

});
```

As with the previous example, we use `.collect()` with the assumption that a given student won't have more grades than we can fetch in one query. See [transaction limits](/production/state/limits.md)) and these [tools for constraining bandwidth usage](/database/writing-data.md#write-performance-and-limits).

## Explore the syntax on the dashboard[​](#explore-the-syntax-on-the-dashboard "Direct link to Explore the syntax on the dashboard")

You can try out the syntax described above directly from the dashboard by [writing a custom test query](/dashboard/deployments/data.md#writing-custom-queries).

Related posts from

<!-- -->

[![Stack](/img/stack-logo-dark.svg)![Stack](/img/stack-logo-light.svg)](https://stack.convex.dev/)
