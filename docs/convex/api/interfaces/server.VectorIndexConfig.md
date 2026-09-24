# Interface: VectorIndexConfig\<VectorField, FilterFields>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).VectorIndexConfig

The configuration for a vector index.

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name           | Type             |
| -------------- | ---------------- |
| `VectorField`  | extends `string` |
| `FilterFields` | extends `string` |

## Properties[​](#properties "Direct link to Properties")

### vectorField[​](#vectorfield "Direct link to vectorField")

• **vectorField**: `VectorField`

The field to index for vector search.

This must be a field of type `v.array(v.float64())` (or a union)

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/schema.ts:130](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L130)

***

### dimensions[​](#dimensions "Direct link to dimensions")

• **dimensions**: `number`

The length of the vectors indexed. This must be between 2 and 2048 inclusive.

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/schema.ts:134](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L134)

***

### filterFields[​](#filterfields "Direct link to filterFields")

• `Optional` **filterFields**: `FilterFields`\[]

Additional fields to index for fast filtering when running vector searches.

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/schema.ts:138](https://github.com/get-convex/convex-js/blob/main/src/server/schema.ts#L138)
