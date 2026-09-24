> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# `npx convex run`

Run a function or evaluate an inline readonly query on your deployment.

* Run a function with JSON arguments: `npx convex run messages:send '{"body": "hello", "author": "me"}'`
* Run a function on prod: `npx convex run messages:list --prod`
* Live-update a query's result: `npx convex run messages:list --watch`
* Push local code before running: `npx convex run messages:send '{}' --push`
* Evaluate an inline readonly query: `npx convex run --inline-query 'await ctx.db.query("messages").take(5)'`

Arguments are specified as a JSON object. By default, this runs on your dev deployment.

## Syntax[​](#syntax "Direct link to Syntax")

```
npx convex run [options] [functionName] [args]
```

## Arguments[​](#arguments "Direct link to Arguments")

* `[functionName]`

  identifier of the function to run, like `listMessages` or `dir/file:myFunction`

* `[args]`

  JSON-formatted arguments object to pass to the function.

## Options[​](#options "Direct link to Options")

* `-w, --watch`

  Watch a query, printing its result if the underlying data changes. Given function must be a query.

* `--inline-query <query>`

  JavaScript to evaluate as a readonly query. The query is completely sandboxed, so it can only read data and cannot modify the database or access the network.

  This is a one-shot query and cannot be combined with `--watch`. Use `--component` to target a mounted component.

  To format the query:

  * Simple expressions are returned automatically, for example: `await ctx.db.query("messages").take(5)`.
  * For multi-statement queries, use an explicit return, for example: `const firstMessage = await ctx.db.query("messages").first(); console.log(firstMessage?._id); return firstMessage;`.
  * For full control, pass a module source that exports a default query, for example: `export default query({ handler: async (ctx) => { return await ctx.db.query("messages").take(10); } })`.

* `--push`

  Push code to deployment before running the function.

* `--identity <identity>`

  JSON-formatted UserIdentity object, e.g. '{ name: "John", address: "0x123" }'

* `--typecheck <mode>`

  Whether to check TypeScript files with `tsc --noEmit`.

* `--typecheck-components`

  Check TypeScript files within component implementations with `tsc --noEmit`.

* `--codegen <mode>`

  Regenerate code in `convex/_generated/`

* `--component <path>`

  Path to the component (e.g. "workflow" or "workflow/workpool")

* `--prod`

  Run the function on this project's default production deployment.

* `--deployment <deployment>`

  Run the function on a specific deployment. Accepts:

  * a deployment name (e.g. joyful-capybara-123)
  * a deployment reference (e.g. dev/james, staging)
  * `dev` (for your personal dev deployment)
  * `prod` (for your project’s default production deployment)
  * `local` (for your local dev deployment). You can also select deployments in other projects with `project-slug:reference` or `team-slug:project-slug:reference`.
