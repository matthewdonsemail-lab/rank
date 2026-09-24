# Interface: GenericDatabaseReader\<DataModel>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).GenericDatabaseReader

An interface to read from the database within Convex query functions.

Available as `ctx.db` in queries (read-only) and mutations (read-write). You should generally use the `DatabaseReader` type from `"./_generated/server"`.

The two entry points are:

* [get](/api/interfaces/server.GenericDatabaseReader.md#get), which fetches a single document by table name and [GenericId](/api/modules/values.md#genericid).
* [query](/api/interfaces/server.GenericDatabaseReader.md#query), which starts building a query.

**`Example`**

```
// Fetch a single document by ID:

const user = await ctx.db.get("users", userId);



// Query documents with an index:

const messages = await ctx.db

  .query("messages")

  .withIndex("by_channel", (q) => q.eq("channelId", channelId))

  .order("desc")

  .take(50);
```

**Best practice:** Use `.withIndex()` instead of `.filter()` for efficient queries. Define indexes in your schema for fields you query frequently.

**`See`**

<https://docs.convex.dev/database/reading-data>

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `DataModel` | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel) |

## Hierarchy[​](#hierarchy "Direct link to Hierarchy")

* `BaseDatabaseReader`<`DataModel`>

  ↳ **`GenericDatabaseReader`**

  ↳↳ [`GenericDatabaseWriter`](/api/interfaces/server.GenericDatabaseWriter.md)

## Properties[​](#properties "Direct link to Properties")

### system[​](#system "Direct link to system")

• **system**: `BaseDatabaseReader`<[`SystemDataModel`](/api/interfaces/server.SystemDataModel.md)>

An interface to read from the system tables within Convex query functions.

System tables include `_storage` (file metadata) and `_scheduled_functions` (scheduled function state). Use `ctx.db.system.get()` and `ctx.db.system.query()` just like regular tables.

**`Example`**

```
// Get file metadata from the _storage system table:

const metadata = await ctx.db.system.get("_storage", storageId);

// metadata has: _id, _creationTime, contentType, sha256, size
```

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/database.ts:163](https://github.com/get-convex/convex-js/blob/main/src/server/database.ts#L163)

## Methods[​](#methods "Direct link to Methods")

### get[​](#get "Direct link to get")

▸ **get**<`TableName`>(`table`, `id`): `Promise`<`null` | [`DocumentByName`](/api/modules/server.md#documentbyname)<`DataModel`, `TableName`>>

Fetch a single document from the database by table name and [GenericId](/api/modules/values.md#genericid).

**`Example`**

```
const user = await ctx.db.get("users", userId);
```

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name        | Type             |
| ----------- | ---------------- |
| `TableName` | extends `string` |

#### Parameters[​](#parameters "Direct link to Parameters")

| Name    | Type                                                                     | Description                                                                                   |
| ------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `table` | `TableName`                                                              | The name of the table to fetch the document from.                                             |
| `id`    | [`GenericId`](/api/modules/values.md#genericid)<`NonUnion`<`TableName`>> | The [GenericId](/api/modules/values.md#genericid) of the document to fetch from the database. |

#### Returns[​](#returns "Direct link to Returns")

`Promise`<`null` | [`DocumentByName`](/api/modules/server.md#documentbyname)<`DataModel`, `TableName`>>

* The [GenericDocument](/api/modules/server.md#genericdocument) of the document at the given [GenericId](/api/modules/values.md#genericid), or `null` if it no longer exists.

#### Inherited from[​](#inherited-from "Direct link to Inherited from")

BaseDatabaseReader.get

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/database.ts:30](https://github.com/get-convex/convex-js/blob/main/src/server/database.ts#L30)

▸ **get**<`TableName`>(`id`): `Promise`<`null` | [`DocumentByName`](/api/modules/server.md#documentbyname)<`DataModel`, `TableName`>>

Fetch a single document from the database by its [GenericId](/api/modules/values.md#genericid).

Supported for backwards compatibility. Prefer `db.get(tableName, id)` in new code, or `db.system.get(tableName, id)` for system tables.

#### Type parameters[​](#type-parameters-2 "Direct link to Type parameters")

| Name        | Type             |
| ----------- | ---------------- |
| `TableName` | extends `string` |

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name | Type                                                         | Description                                                                                   |
| ---- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `id` | [`GenericId`](/api/modules/values.md#genericid)<`TableName`> | The [GenericId](/api/modules/values.md#genericid) of the document to fetch from the database. |

#### Returns[​](#returns-1 "Direct link to Returns")

`Promise`<`null` | [`DocumentByName`](/api/modules/server.md#documentbyname)<`DataModel`, `TableName`>>

* The [GenericDocument](/api/modules/server.md#genericdocument) of the document at the given [GenericId](/api/modules/values.md#genericid), or `null` if it no longer exists.

#### Inherited from[​](#inherited-from-1 "Direct link to Inherited from")

BaseDatabaseReader.get

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/database.ts:44](https://github.com/get-convex/convex-js/blob/main/src/server/database.ts#L44)

***

### query[​](#query "Direct link to query")

▸ **query**<`TableName`>(`tableName`): [`QueryInitializer`](/api/interfaces/server.QueryInitializer.md)<[`NamedTableInfo`](/api/modules/server.md#namedtableinfo)<`DataModel`, `TableName`>>

Begin a query for the given table name.

Queries don't execute immediately, so calling this method and extending its query are free until the results are actually used.

#### Type parameters[​](#type-parameters-3 "Direct link to Type parameters")

| Name        | Type             |
| ----------- | ---------------- |
| `TableName` | extends `string` |

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name        | Type        | Description                     |
| ----------- | ----------- | ------------------------------- |
| `tableName` | `TableName` | The name of the table to query. |

#### Returns[​](#returns-2 "Direct link to Returns")

[`QueryInitializer`](/api/interfaces/server.QueryInitializer.md)<[`NamedTableInfo`](/api/modules/server.md#namedtableinfo)<`DataModel`, `TableName`>>

* A [QueryInitializer](/api/interfaces/server.QueryInitializer.md) object to start building a query.

#### Inherited from[​](#inherited-from-2 "Direct link to Inherited from")

BaseDatabaseReader.query

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/database.ts:57](https://github.com/get-convex/convex-js/blob/main/src/server/database.ts#L57)

***

### normalizeId[​](#normalizeid "Direct link to normalizeId")

▸ **normalizeId**<`TableName`>(`tableName`, `id`): `null` | [`GenericId`](/api/modules/values.md#genericid)<`TableName`>

Returns the string ID format for the ID in a given table, or null if the ID is from a different table or is not a valid ID.

This accepts the string ID format as well as the `.toString()` representation of the legacy class-based ID format.

This does not guarantee that the ID exists (i.e. `db.get(tableName, id)` may return `null`).

#### Type parameters[​](#type-parameters-4 "Direct link to Type parameters")

| Name        | Type             |
| ----------- | ---------------- |
| `TableName` | extends `string` |

#### Parameters[​](#parameters-3 "Direct link to Parameters")

| Name        | Type        | Description            |
| ----------- | ----------- | ---------------------- |
| `tableName` | `TableName` | The name of the table. |
| `id`        | `string`    | The ID string.         |

#### Returns[​](#returns-3 "Direct link to Returns")

`null` | [`GenericId`](/api/modules/values.md#genericid)<`TableName`>

#### Inherited from[​](#inherited-from-3 "Direct link to Inherited from")

BaseDatabaseReader.normalizeId

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[server/database.ts:73](https://github.com/get-convex/convex-js/blob/main/src/server/database.ts#L73)
