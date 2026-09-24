# Troubleshooting

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Common errors when using [`convex-svelte`](/client/svelte/overview.md) and how to fix them.

## `effect_in_teardown` error[​](#effect_in_teardown-error "Direct link to effect_in_teardown-error")

If you encounter `effect_in_teardown` errors when using `useQuery` in components that can be conditionally rendered (like dialogs, modals, or popups), this is caused by wrapping `useQuery` in a `$derived` block that depends on reactive state.

When `useQuery` is wrapped in `$derived`, state changes during component cleanup can trigger re-evaluation of the `$derived`, which attempts to create a new `useQuery` instance. Since `useQuery` internally creates a `$effect`, and effects cannot be created during cleanup, this throws an error.

Use [Skipping queries](/client/svelte/reactivity.md#skipping-queries) instead. By calling `useQuery` unconditionally at the top level and passing a function that returns `'skip'`, the function is evaluated inside `useQuery`'s own effect tracking, preventing query recreation during cleanup.

## Missing `setupConvex()` error[​](#missing-setupconvex-error "Direct link to missing-setupconvex-error")

If you see `No ConvexClient was found in Svelte context`, make sure `setupConvex()` is called in a parent layout or component (e.g. `+layout.svelte`) before any child component calls `useQuery()` or `useConvexClient()`. See [Setup](/client/svelte/overview.md#setup).

## String query names[​](#string-query-names "Direct link to String query names")

Query references must be `api.*` function references, not plain strings. If you pass a string like `"messages.list"`, you will get an error. Always import and use `api` from your generated API:

```
import { api } from "../convex/_generated/api.js";
```
