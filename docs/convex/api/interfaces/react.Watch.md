# Interface: Watch\<T>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[react](/api/modules/react.md).Watch

A watch on the output of a Convex query function.

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name |
| ---- |
| `T`  |

## Methods[​](#methods "Direct link to Methods")

### onUpdate[​](#onupdate "Direct link to onUpdate")

▸ **onUpdate**(`callback`): () => `void`

Initiate a watch on the output of a query.

This will subscribe to this query and call the callback whenever the query result changes.

**Important: If the client is already subscribed to this query with the same arguments this callback will not be invoked until the query result is updated.** To get the current, local result call [localQueryResult](/api/interfaces/react.Watch.md#localqueryresult).

#### Parameters[​](#parameters "Direct link to Parameters")

| Name       | Type         | Description                                                |
| ---------- | ------------ | ---------------------------------------------------------- |
| `callback` | () => `void` | Function that is called whenever the query result changes. |

#### Returns[​](#returns "Direct link to Returns")

`fn`

* A function that disposes of the subscription.

▸ (): `void`

Initiate a watch on the output of a query.

This will subscribe to this query and call the callback whenever the query result changes.

**Important: If the client is already subscribed to this query with the same arguments this callback will not be invoked until the query result is updated.** To get the current, local result call [localQueryResult](/api/interfaces/react.Watch.md#localqueryresult).

##### Returns[​](#returns-1 "Direct link to Returns")

`void`

* A function that disposes of the subscription.

#### Defined in[​](#defined-in "Direct link to Defined in")

[react/client.ts:184](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L184)

***

### localQueryResult[​](#localqueryresult "Direct link to localQueryResult")

▸ **localQueryResult**(): `undefined` | `T`

Get the current result of a query.

This will only return a result if we're already subscribed to the query and have received a result from the server or the query value has been set optimistically.

**`Throws`**

An error if the query encountered an error on the server.

#### Returns[​](#returns-2 "Direct link to Returns")

`undefined` | `T`

The result of the query or `undefined` if it isn't known.

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[react/client.ts:196](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L196)

***

### journal[​](#journal "Direct link to journal")

▸ **journal**(): `undefined` | [`QueryJournal`](/api/modules/browser.md#queryjournal)

Get the current [QueryJournal](/api/modules/browser.md#queryjournal) for this query.

If we have not yet received a result for this query, this will be `undefined`.

#### Returns[​](#returns-3 "Direct link to Returns")

`undefined` | [`QueryJournal`](/api/modules/browser.md#queryjournal)

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[react/client.ts:208](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L208)
