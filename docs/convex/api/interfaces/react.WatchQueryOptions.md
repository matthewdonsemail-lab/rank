# Interface: WatchQueryOptions

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[react](/api/modules/react.md).WatchQueryOptions

Options for [watchQuery](/api/classes/react.ConvexReactClient.md#watchquery).

## Properties[​](#properties "Direct link to Properties")

### journal[​](#journal "Direct link to journal")

• `Optional` **journal**: [`QueryJournal`](/api/modules/browser.md#queryjournal)

An (optional) journal produced from a previous execution of this query function.

If there is an existing subscription to a query function with the same name and arguments, this journal will have no effect.

#### Defined in[​](#defined-in "Direct link to Defined in")

[react/client.ts:255](https://github.com/get-convex/convex-js/blob/main/src/react/client.ts#L255)
