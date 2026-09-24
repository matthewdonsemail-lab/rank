# Class: CommitTsPlaceholder

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[values](/api/modules/values.md).CommitTsPlaceholder

The placeholder for a transaction's commit timestamp, which is not known until the mutation commits. Write it into a document field via `db.vars.commitTs` and it resolves to an int64 (`bigint`) at commit, ordered by commit order. Reading the field back within the writing mutation yields the placeholder, which cannot be used as a number.

## Constructors[​](#constructors "Direct link to Constructors")

### constructor[​](#constructor "Direct link to constructor")

• **new CommitTsPlaceholder**()

## Methods[​](#methods "Direct link to Methods")

### \[toPrimitive][​](#toprimitive "Direct link to \[toPrimitive]")

▸ **\[toPrimitive]**(`hint`): `string`

#### Parameters[​](#parameters "Direct link to Parameters")

| Name   | Type     |
| ------ | -------- |
| `hint` | `string` |

#### Returns[​](#returns "Direct link to Returns")

`string`

#### Defined in[​](#defined-in "Direct link to Defined in")

[values/value.ts:102](https://github.com/get-convex/convex-js/blob/main/src/values/value.ts#L102)

***

### valueOf[​](#valueof "Direct link to valueOf")

▸ **valueOf**(): `never`

#### Returns[​](#returns-1 "Direct link to Returns")

`never`

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[values/value.ts:109](https://github.com/get-convex/convex-js/blob/main/src/values/value.ts#L109)

***

### toJSON[​](#tojson "Direct link to toJSON")

▸ **toJSON**(): `never`

#### Returns[​](#returns-2 "Direct link to Returns")

`never`

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[values/value.ts:112](https://github.com/get-convex/convex-js/blob/main/src/values/value.ts#L112)

***

### toString[​](#tostring "Direct link to toString")

▸ **toString**(): `string`

#### Returns[​](#returns-3 "Direct link to Returns")

`string`

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[values/value.ts:115](https://github.com/get-convex/convex-js/blob/main/src/values/value.ts#L115)
