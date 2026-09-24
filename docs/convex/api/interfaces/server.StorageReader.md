# Interface: StorageReader

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).StorageReader

An interface to read files from storage within Convex query functions.

Available as `ctx.storage` in queries (read-only), mutations, and actions.

**`Example`**

```
// Get a URL for a stored file:

const url = await ctx.storage.getUrl(storageId);

if (url) {

  // Use the URL (e.g., return it to the client)

}



// Get file metadata via the system table (preferred over deprecated getMetadata):

const metadata = await ctx.db.system.get("_storage", storageId);

// metadata: { _id, _creationTime, sha256, size, contentType? }
```

**`See`**

<https://docs.convex.dev/file-storage>

## Hierarchy[​](#hierarchy "Direct link to Hierarchy")

* **`StorageReader`**

  ↳ [`StorageWriter`](/api/interfaces/server.StorageWriter.md)

## Methods[​](#methods "Direct link to Methods")

### getUrl[​](#geturl "Direct link to getUrl")

▸ **getUrl**(`storageId`): `Promise`<`null` | `string`>

Get the URL for a file in storage by its `Id<"_storage">`.

The GET response includes a standard HTTP Digest header with a sha256 checksum.

**`Example`**

```
const url = await ctx.storage.getUrl(storageId);
```

#### Parameters[​](#parameters "Direct link to Parameters")

| Name        | Type                                                          | Description                                                    |
| ----------- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| `storageId` | [`GenericId`](/api/modules/values.md#genericid)<`"_storage"`> | The `Id<"_storage">` of the file to fetch from Convex storage. |

#### Returns[​](#returns "Direct link to Returns")

`Promise`<`null` | `string`>

* A URL which fetches the file via an HTTP GET, or `null` if the file no longer exists.

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/storage.ts:91](https://github.com/get-convex/convex-js/blob/main/src/server/storage.ts#L91)

▸ **getUrl**<`T`>(`storageId`): `Promise`<`null` | `string`>

**`Deprecated`**

Passing a string is deprecated, use `storage.getUrl(Id<"_storage">)` instead.

Get the URL for a file in storage by its [StorageId](/api/modules/server.md#storageid).

The GET response includes a standard HTTP Digest header with a sha256 checksum.

#### Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name | Type             |
| ---- | ---------------- |
| `T`  | extends `string` |

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name        | Type                                                 | Description                                                                                 |
| ----------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `storageId` | `T` extends { `__tableName`: `any` } ? `never` : `T` | The [StorageId](/api/modules/server.md#storageid) of the file to fetch from Convex storage. |

#### Returns[​](#returns-1 "Direct link to Returns")

`Promise`<`null` | `string`>

* A url which fetches the file via an HTTP GET, or `null` if it no longer exists.

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/storage.ts:103](https://github.com/get-convex/convex-js/blob/main/src/server/storage.ts#L103)

***

### getMetadata[​](#getmetadata "Direct link to getMetadata")

▸ **getMetadata**(`storageId`): `Promise`<`null` | [`FileMetadata`](/api/modules/server.md#filemetadata)>

**`Deprecated`**

Use `ctx.db.system.get("_storage", storageId)` instead, which returns equivalent metadata from the `_storage` system table (with a slightly different shape):

```
const metadata = await ctx.db.system.get("_storage", storageId);

// { _id, _creationTime, sha256, size, contentType? }
```

Get metadata for a file.

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name        | Type                                                          | Description                       |
| ----------- | ------------------------------------------------------------- | --------------------------------- |
| `storageId` | [`GenericId`](/api/modules/values.md#genericid)<`"_storage"`> | The `Id<"_storage">` of the file. |

#### Returns[​](#returns-2 "Direct link to Returns")

`Promise`<`null` | [`FileMetadata`](/api/modules/server.md#filemetadata)>

* A [FileMetadata](/api/modules/server.md#filemetadata) object if found or `null` if not found.

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/storage.ts:120](https://github.com/get-convex/convex-js/blob/main/src/server/storage.ts#L120)

▸ **getMetadata**<`T`>(`storageId`): `Promise`<`null` | [`FileMetadata`](/api/modules/server.md#filemetadata)>

**`Deprecated`**

Use `ctx.db.system.get("_storage", storageId)` instead.

Get metadata for a file.

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name | Type             |
| ---- | ---------------- |
| `T`  | extends `string` |

#### Parameters[​](#parameters-3 "Direct link to Parameters")

| Name        | Type                                                 | Description                                                    |
| ----------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| `storageId` | `T` extends { `__tableName`: `any` } ? `never` : `T` | The [StorageId](/api/modules/server.md#storageid) of the file. |

#### Returns[​](#returns-3 "Direct link to Returns")

`Promise`<`null` | [`FileMetadata`](/api/modules/server.md#filemetadata)>

* A [FileMetadata](/api/modules/server.md#filemetadata) object if found or `null` if not found.

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/storage.ts:130](https://github.com/get-convex/convex-js/blob/main/src/server/storage.ts#L130)
