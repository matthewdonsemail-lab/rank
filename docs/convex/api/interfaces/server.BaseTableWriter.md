# Interface: BaseTableWriter\<DataModel, TableName>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).BaseTableWriter

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name        | Type                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------- |
| `DataModel` | extends [`GenericDataModel`](/api/modules/server.md#genericdatamodel)                        |
| `TableName` | extends [`TableNamesInDataModel`](/api/modules/server.md#tablenamesindatamodel)<`DataModel`> |

## Hierarchy[​](#hierarchy "Direct link to Hierarchy")

* [`BaseTableReader`](/api/interfaces/server.BaseTableReader.md)<`DataModel`, `TableName`>

  ↳ **`BaseTableWriter`**

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

#### Inherited from[​](#inherited-from "Direct link to Inherited from")

[BaseTableReader](/api/interfaces/server.BaseTableReader.md).[get](/api/interfaces/server.BaseTableReader.md#get)

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

#### Inherited from[​](#inherited-from-1 "Direct link to Inherited from")

[BaseTableReader](/api/interfaces/server.BaseTableReader.md).[query](/api/interfaces/server.BaseTableReader.md#query)

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/database.ts:110](https://github.com/get-convex/convex-js/blob/main/src/server/database.ts#L110)

***

### insert[​](#insert "Direct link to insert")

▸ **insert**(`value`): `Promise`<[`GenericId`](/api/modules/values.md#genericid)<`TableName`>>

Insert a new document into the table.

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name    | Type                                                                                                                                                     | Description                                                               |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `value` | [`WithoutSystemFields`](/api/modules/server.md#withoutsystemfields)<[`DocumentByName`](/api/modules/server.md#documentbyname)<`DataModel`, `TableName`>> | The [Value](/api/modules/values.md#value) to insert into the given table. |

#### Returns[​](#returns-2 "Direct link to Returns")

`Promise`<[`GenericId`](/api/modules/values.md#genericid)<`TableName`>>

* [GenericId](/api/modules/values.md#genericid) of the new document.

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/database.ts:425](https://github.com/get-convex/convex-js/blob/main/src/server/database.ts#L425)

***

### patch[​](#patch "Direct link to patch")

▸ **patch**(`id`, `value`): `Promise`<`void`>

Patch an existing document, shallow merging it with the given partial document.

New fields are added. Existing fields are overwritten. Fields set to `undefined` are removed.

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name    | Type                                                                                              | Description                                                                                                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`    | [`GenericId`](/api/modules/values.md#genericid)<`TableName`>                                      | The [GenericId](/api/modules/values.md#genericid) of the document to patch.                                                                                                                                             |
| `value` | `PatchValue`<[`DocumentByName`](/api/modules/server.md#documentbyname)<`DataModel`, `TableName`>> | The partial [GenericDocument](/api/modules/server.md#genericdocument) to merge into the specified document. If this new value specifies system fields like `_id`, they must match the document's existing field values. |

#### Returns[​](#returns-3 "Direct link to Returns")

`Promise`<`void`>

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/database.ts:440](https://github.com/get-convex/convex-js/blob/main/src/server/database.ts#L440)

***

### replace[​](#replace "Direct link to replace")

▸ **replace**(`id`, `value`): `Promise`<`void`>

Replace the value of an existing document, overwriting its old value.

#### Parameters[​](#parameters-3 "Direct link to Parameters")

| Name    | Type                                                                                                                                                               | Description                                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`    | [`GenericId`](/api/modules/values.md#genericid)<`TableName`>                                                                                                       | The [GenericId](/api/modules/values.md#genericid) of the document to replace.                                                                                  |
| `value` | [`WithOptionalSystemFields`](/api/modules/server.md#withoptionalsystemfields)<[`DocumentByName`](/api/modules/server.md#documentbyname)<`DataModel`, `TableName`>> | The new [GenericDocument](/api/modules/server.md#genericdocument) for the document. This value can omit the system fields, and the database will fill them in. |

#### Returns[​](#returns-4 "Direct link to Returns")

`Promise`<`void`>

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[server/database.ts:452](https://github.com/get-convex/convex-js/blob/main/src/server/database.ts#L452)

***

### delete[​](#delete "Direct link to delete")

▸ **delete**(`id`): `Promise`<`void`>

Delete an existing document.

#### Parameters[​](#parameters-4 "Direct link to Parameters")

| Name | Type                                                         | Description                                                                  |
| ---- | ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `id` | [`GenericId`](/api/modules/values.md#genericid)<`TableName`> | The [GenericId](/api/modules/values.md#genericid) of the document to remove. |

#### Returns[​](#returns-5 "Direct link to Returns")

`Promise`<`void`>

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[server/database.ts:462](https://github.com/get-convex/convex-js/blob/main/src/server/database.ts#L462)
