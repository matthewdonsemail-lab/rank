# Class: Expression\<T>

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).Expression

Expressions are evaluated to produce a [Value](/api/modules/values.md#value) in the course of executing a query.

To construct an expression, use the [FilterBuilder](/api/interfaces/server.FilterBuilder.md) provided within [filter](/api/interfaces/server.OrderedQuery.md#filter).

## Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name | Type                                                           | Description                                 |
| ---- | -------------------------------------------------------------- | ------------------------------------------- |
| `T`  | extends [`Value`](/api/modules/values.md#value) \| `undefined` | The type that this expression evaluates to. |
