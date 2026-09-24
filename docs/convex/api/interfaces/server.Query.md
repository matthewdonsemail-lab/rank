# Interface: Query\<TableInfo>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).Query

The [Query](/api/interfaces/server.Query.md) interface allows functions to read values out of the database.

**If you only need to load an object by ID, use `db.get(tableName, id)` instead.**

Executing a query consists of calling

1. (Optional) [order](/api/interfaces/server.Query.md#order) to define the order
2. (Optional) [filter](/api/interfaces/server.OrderedQuery.md#filter) to refine the results
3. A *consumer* method to obtain the results

Queries are lazily evaluated. No work is done until iteration begins, so constructing and extending a query is free. The query is executed incrementally as the results are iterated over, so early terminating also reduces the cost of the query.

**`Example`**

```
// Use .withIndex() for efficient queries (preferred over .filter()):

const messages = await ctx.db

  .query("messages")

  .withIndex("by_channel", (q) => q.eq("channelId", channelId))

  .order("desc")

  .take(10);



// Async iteration for processing large result sets:

for await (const task of ctx.db.query("tasks")) {

  // Process each task without loading all into memory

}



// Get a single unique result (throws if multiple match):

const user = await ctx.db

  .query("users")

  .withIndex("by_email", (q) => q.eq("email", email))

  .unique();
```

**Common mistake:** `.collect()` loads **all** matching documents into memory. If the result set can grow unbounded as your database grows, this will eventually cause problems. Prefer `.first()`, `.unique()`, `.take(n)`, or pagination instead. Only use `.collect()` on queries with a tightly bounded result set (e.g., items belonging to a single user with a known small limit).

|                                              |                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| **Ordering**                                 |                                                                        |
| [`order("asc")`](#order)                     | Define the order of query results.                                     |
|                                              |                                                                        |
| **Filtering**                                |                                                                        |
| [`filter(...)`](#filter)                     | Filter the query results to only the values that match some condition. |
|                                              |                                                                        |
| **Consuming**                                | Execute a query and return results in different ways.                  |
| [`[Symbol.asyncIterator]()`](#asynciterator) | The query's results can be iterated over using a `for await..of` loop. |
| [`collect()`](#collect)                      | Return all of the results as an array.                                 |
| [`take(n: number)`](#take)                   | Return the first `n` results as an array.                              |
| [`first()`](#first)                          | Return the first result.                                               |
| [`unique()`](#unique)                        | Return the only result, and throw if there is more than one result.    |

To learn more about how to write queries, see [Querying the Database](https://docs.convex.dev/database/reading-data).

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `TableInfo` | extends [`GenericTableInfo`](/api/modules/server.md#generictableinfo) |

## Hierarchy[​](#hierarchy "Direct link to Hierarchy")

* [`OrderedQuery`](/api/interfaces/server.OrderedQuery.md)<`TableInfo`>

  ↳ **`Query`**

  ↳↳ [`QueryInitializer`](/api/interfaces/server.QueryInitializer.md)

## Methods[​](#methods "Direct link to Methods")

### order[​](#order "Direct link to order")

▸ **order**(`order`): [`OrderedQuery`](/api/interfaces/server.OrderedQuery.md)<`TableInfo`>

Define the order of the query output.

Use `"asc"` for an ascending order and `"desc"` for a descending order. If not specified, the order defaults to ascending.

#### Parameters[​](#parameters "Direct link to Parameters")

| Name    | Type                | Description                     |
| ------- | ------------------- | ------------------------------- |
| `order` | `"asc"` \| `"desc"` | The order to return results in. |

#### Returns[​](#returns "Direct link to Returns")

[`OrderedQuery`](/api/interfaces/server.OrderedQuery.md)<`TableInfo`>

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/query.ts:176](https://github.com/get-convex/convex-js/blob/main/src/server/query.ts#L176)

***

### filter[​](#filter "Direct link to filter")

▸ **filter**(`predicate`): [`Query`](/api/interfaces/server.Query.md)<`TableInfo`>

Filter the query output, returning only the values for which `predicate` evaluates to true.

**Important:** Prefer using `.withIndex()` over `.filter()` whenever possible. Filters scan all documents matched so far and discard non-matches, while indexes efficiently skip non-matching documents. Define an index in your schema for fields you filter on frequently.

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name        | Type                                                                                                                                                         | Description                                                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `predicate` | (`q`: [`FilterBuilder`](/api/interfaces/server.FilterBuilder.md)<`TableInfo`>) => [`ExpressionOrValue`](/api/modules/server.md#expressionorvalue)<`boolean`> | An [Expression](/api/classes/server.Expression.md) constructed with the supplied [FilterBuilder](/api/interfaces/server.FilterBuilder.md) that specifies which documents to keep. |

#### Returns[​](#returns-1 "Direct link to Returns")

[`Query`](/api/interfaces/server.Query.md)<`TableInfo`>

* A new [OrderedQuery](/api/interfaces/server.OrderedQuery.md) with the given filter predicate applied.

#### Inherited from[​](#inherited-from "Direct link to Inherited from")

[OrderedQuery](/api/interfaces/server.OrderedQuery.md).[filter](/api/interfaces/server.OrderedQuery.md#filter)

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/query.ts:198](https://github.com/get-convex/convex-js/blob/main/src/server/query.ts#L198)

***

### paginate[​](#paginate "Direct link to paginate")

▸ **paginate**(`paginationOpts`): `Promise`<[`PaginationResult`](/api/interfaces/server.PaginationResult.md)<[`DocumentByInfo`](/api/modules/server.md#documentbyinfo)<`TableInfo`>>>

Load a page of `n` results and obtain a [Cursor](/api/modules/server.md#cursor) for loading more.

Note: If this is called from a reactive query function the number of results may not match `paginationOpts.numItems`!

`paginationOpts.numItems` is only an initial value. After the first invocation, `paginate` will return all items in the original query range. This ensures that all pages will remain adjacent and non-overlapping.

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name             | Type                                                               | Description                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `paginationOpts` | [`PaginationOptions`](/api/interfaces/server.PaginationOptions.md) | A [PaginationOptions](/api/interfaces/server.PaginationOptions.md) object containing the number of items to load and the cursor to start at. |

#### Returns[​](#returns-2 "Direct link to Returns")

`Promise`<[`PaginationResult`](/api/interfaces/server.PaginationResult.md)<[`DocumentByInfo`](/api/modules/server.md#documentbyinfo)<`TableInfo`>>>

A [PaginationResult](/api/interfaces/server.PaginationResult.md) containing the page of results and a cursor to continue paginating.

#### Inherited from[​](#inherited-from-1 "Direct link to Inherited from")

[OrderedQuery](/api/interfaces/server.OrderedQuery.md).[paginate](/api/interfaces/server.OrderedQuery.md#paginate)

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/query.ts:227](https://github.com/get-convex/convex-js/blob/main/src/server/query.ts#L227)

***

### collect[​](#collect "Direct link to collect")

▸ **collect**(): `Promise`<[`DocumentByInfo`](/api/modules/server.md#documentbyinfo)<`TableInfo`>\[]>

Execute the query and return all of the results as an array.

**Warning:** This loads every matching document into memory. If the result set can grow unbounded as your database grows, `.collect()` will eventually cause performance problems or hit limits. Only use `.collect()` when the result set is tightly bounded (e.g., a known small number of items).

Prefer `.first()`, `.unique()`, `.take(n)`, or `.paginate()` when the result set may be large or unbounded. For processing many results without loading all into memory, use the `Query` as an `AsyncIterable` with `for await...of`.

#### Returns[​](#returns-3 "Direct link to Returns")

`Promise`<[`DocumentByInfo`](/api/modules/server.md#documentbyinfo)<`TableInfo`>\[]>

* An array of all of the query's results.

#### Inherited from[​](#inherited-from-2 "Direct link to Inherited from")

[OrderedQuery](/api/interfaces/server.OrderedQuery.md).[collect](/api/interfaces/server.OrderedQuery.md#collect)

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/query.ts:246](https://github.com/get-convex/convex-js/blob/main/src/server/query.ts#L246)

***

### take[​](#take "Direct link to take")

▸ **take**(`n`): `Promise`<[`DocumentByInfo`](/api/modules/server.md#documentbyinfo)<`TableInfo`>\[]>

Execute the query and return the first `n` results.

#### Parameters[​](#parameters-3 "Direct link to Parameters")

| Name | Type     | Description                  |
| ---- | -------- | ---------------------------- |
| `n`  | `number` | The number of items to take. |

#### Returns[​](#returns-4 "Direct link to Returns")

`Promise`<[`DocumentByInfo`](/api/modules/server.md#documentbyinfo)<`TableInfo`>\[]>

* An array of the first `n` results of the query (or less if the query doesn't have `n` results).

#### Inherited from[​](#inherited-from-3 "Direct link to Inherited from")

[OrderedQuery](/api/interfaces/server.OrderedQuery.md).[take](/api/interfaces/server.OrderedQuery.md#take)

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[server/query.ts:255](https://github.com/get-convex/convex-js/blob/main/src/server/query.ts#L255)

***

### first[​](#first "Direct link to first")

▸ **first**(): `Promise`<`null` | [`DocumentByInfo`](/api/modules/server.md#documentbyinfo)<`TableInfo`>>

Execute the query and return the first result if there is one.

#### Returns[​](#returns-5 "Direct link to Returns")

`Promise`<`null` | [`DocumentByInfo`](/api/modules/server.md#documentbyinfo)<`TableInfo`>>

* The first value of the query or `null` if the query returned no results.

#### Inherited from[​](#inherited-from-4 "Direct link to Inherited from")

[OrderedQuery](/api/interfaces/server.OrderedQuery.md).[first](/api/interfaces/server.OrderedQuery.md#first)

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[server/query.ts:262](https://github.com/get-convex/convex-js/blob/main/src/server/query.ts#L262)

***

### unique[​](#unique "Direct link to unique")

▸ **unique**(): `Promise`<`null` | [`DocumentByInfo`](/api/modules/server.md#documentbyinfo)<`TableInfo`>>

Execute the query and return the singular result if there is one.

Use this when you expect exactly zero or one result, for example when querying by a unique field. If the query matches more than one document, this will throw an error.

**`Example`**

```
const user = await ctx.db

  .query("users")

  .withIndex("by_email", (q) => q.eq("email", "alice@example.com"))

  .unique();
```

**`Throws`**

Will throw an error if the query returns more than one result.

#### Returns[​](#returns-6 "Direct link to Returns")

`Promise`<`null` | [`DocumentByInfo`](/api/modules/server.md#documentbyinfo)<`TableInfo`>>

* The single result returned from the query or null if none exists.

#### Inherited from[​](#inherited-from-5 "Direct link to Inherited from")

[OrderedQuery](/api/interfaces/server.OrderedQuery.md).[unique](/api/interfaces/server.OrderedQuery.md#unique)

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[server/query.ts:282](https://github.com/get-convex/convex-js/blob/main/src/server/query.ts#L282)

***

### \[asyncIterator][​](#asynciterator "Direct link to \[asyncIterator]")

▸ **\[asyncIterator]**(): `AsyncIterator`<[`DocumentByInfo`](/api/modules/server.md#documentbyinfo)<`TableInfo`>, `any`, `undefined`>

#### Returns[​](#returns-7 "Direct link to Returns")

`AsyncIterator`<[`DocumentByInfo`](/api/modules/server.md#documentbyinfo)<`TableInfo`>, `any`, `undefined`>

#### Inherited from[​](#inherited-from-6 "Direct link to Inherited from")

[OrderedQuery](/api/interfaces/server.OrderedQuery.md).[\[asyncIterator\]](/api/interfaces/server.OrderedQuery.md#%5Basynciterator%5D)

#### Defined in[​](#defined-in-7 "Direct link to Defined in")

../../node\_modules/.pnpm/typescript\@5.0.4/node\_modules/typescript/lib/lib.es2018.asynciterable.d.ts:38
