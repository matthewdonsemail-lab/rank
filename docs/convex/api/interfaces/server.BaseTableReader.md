# Interface: BaseTableReader\<DataModel, TableName>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).BaseTableReader

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name        | Type                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------- |
| `DataModel` | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel)                        |
| `TableName` | extends [`TableNamesInDataModel`](/api/modules/server.md#tablenamesindatamodel)<`DataModel`> |

## Hierarchy[​](#hierarchy "Direct link to Hierarchy")

* **`BaseTableReader`**

  ↳ [`BaseTableWriter`](/api/interfaces/server.BaseTableWriter.md)

## Methods[​](#methods "Direct link to Methods")

### get[​](#get "Direct link to get")

▸ **get**(`id`): `Promise`<`null` | [`DocumentByName`](/api/modules/server.md#documentbyname)<`DataModel`, `TableName`>>

Fetch a single document from the table by its [GenericId](/api/modules/values.md#genericid).

#### Parameters[​](#parameters "Direct link to Parameters")

| Name | Type                                                         | Description                                                                                   |
| ---- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `id` | [`GenericId`](/api/modules/values.md#genericid)<`TableName`> | The [GenericId](/api/modules/values.md#genericid) of the document to fetch from the database. |

#### Returns[​](#returns "Direct link to Returns")

`Promise`<`null` | [`DocumentByName`](/api/modules/server.md#documentbyname)<`DataModel`, `TableName`>>

* The [GenericDocument](/api/modules/server.md#genericdocument) of the document at the given [GenericId](/api/modules/values.md#genericid), or `null` if it no longer exists.

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/database.ts:98](https://github.com/get-convex/convex-js/blob/main/src/server/database.ts#L98)

***

### query[​](#query "Direct link to query")

▸ **query**(): [`QueryInitializer`](/api/interfaces/server.QueryInitializer.md)<[`NamedTableInfo`](/api/modules/server.md#namedtableinfo)<`DataModel`, `TableName`>>

Begin a query for the table.

Queries don't execute immediately, so calling this method and extending its query are free until the results are actually used.

#### Returns[​](#returns-1 "Direct link to Returns")

[`QueryInitializer`](/api/interfaces/server.QueryInitializer.md)<[`NamedTableInfo`](/api/modules/server.md#namedtableinfo)<`DataModel`, `TableName`>>

* A [QueryInitializer](/api/interfaces/server.QueryInitializer.md) object to start building a query.

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/database.ts:110](https://github.com/get-convex/convex-js/blob/main/src/server/database.ts#L110)
