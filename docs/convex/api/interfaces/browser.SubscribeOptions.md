# Interface: SubscribeOptions

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[browser](/api/modules/browser.md).SubscribeOptions

Options for [subscribe](/api/classes/browser.BaseConvexClient.md#subscribe).

## Properties[​](#properties "Direct link to Properties")

### journal[​](#journal "Direct link to journal")

• `Optional` **journal**: [`QueryJournal`](/api/modules/browser.md#queryjournal)

An (optional) journal produced from a previous execution of this query function.

If there is an existing subscription to a query function with the same name and arguments, this journal will have no effect.

#### Defined in[​](#defined-in "Direct link to Defined in")

[browser/sync/client.ts:206](https://github.com/get-convex/convex-js/blob/main/src/browser/sync/client.ts#L206)
