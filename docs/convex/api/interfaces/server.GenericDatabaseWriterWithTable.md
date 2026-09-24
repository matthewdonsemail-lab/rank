# Interface: GenericDatabaseWriterWithTable\<DataModel>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).GenericDatabaseWriterWithTable

An interface to read from and write to the database within Convex mutation functions.

You should generally use the `DatabaseWriter` type from `"./_generated/server"`.

Convex guarantees that all writes within a single mutation are executed atomically, so you never have to worry about partial writes leaving your data in an inconsistent state. See [the Convex Guide](https://docs.convex.dev/understanding/convex-fundamentals/functions#atomicity-and-optimistic-concurrency-control) for the guarantees Convex provides your functions.

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name        | Type                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `DataModel` | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel) |

## Hierarchy[​](#hierarchy "Direct link to Hierarchy")

* [`GenericDatabaseReaderWithTable`](/api/interfaces/server.GenericDatabaseReaderWithTable.md)<`DataModel`>

  ↳ **`GenericDatabaseWriterWithTable`**

## Properties[​](#properties "Direct link to Properties")

### system[​](#system "Direct link to system")

• **system**: `BaseDatabaseReaderWithTable`<[`SystemDataModel`](/api/interfaces/server.SystemDataModel.md)>

An interface to read from the system tables within Convex query functions

The two entry points are:

* [get](/api/interfaces/server.GenericDatabaseReader.md#get), which fetches a single document by its [GenericId](/api/modules/values.md#genericid).
* [query](/api/interfaces/server.GenericDatabaseReader.md#query), which starts building a query.

#### Inherited from[​](#inherited-from "Direct link to Inherited from")

[GenericDatabaseReaderWithTable](/api/interfaces/server.GenericDatabaseReaderWithTable.md).[system](/api/interfaces/server.GenericDatabaseReaderWithTable.md#system)

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/database.ts:179](https://github.com/get-convex/convex-js/blob/main/src/server/database.ts#L179)

## Methods[​](#methods "Direct link to Methods")

### table[​](#table "Direct link to table")

▸ **table**<`TableName`>(`tableName`): [`BaseTableWriter`](/api/interfaces/server.BaseTableWriter.md)<`DataModel`, `TableName`>

Scope the database to a specific table.

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name        | Type             |
| ----------- | ---------------- |
| `TableName` | extends `string` |

#### Parameters[​](#parameters "Direct link to Parameters")

| Name        | Type        |
| ----------- | ----------- |
| `tableName` | `TableName` |

#### Returns[​](#returns "Direct link to Returns")

[`BaseTableWriter`](/api/interfaces/server.BaseTableWriter.md)<`DataModel`, `TableName`>

#### Overrides[​](#overrides "Direct link to Overrides")

[GenericDatabaseReaderWithTable](/api/interfaces/server.GenericDatabaseReaderWithTable.md).[table](/api/interfaces/server.GenericDatabaseReaderWithTable.md#table)

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/database.ts:410](https://github.com/get-convex/convex-js/blob/main/src/server/database.ts#L410)
