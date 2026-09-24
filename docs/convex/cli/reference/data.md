> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# `npx convex data`

Inspect your Convex deployment's database.

* List tables: `npx convex data`
* List documents in a table: `npx convex data tableName`

By default, this inspects your dev deployment.

This works with system tables, such as `_storage`, in addition to your own tables.

## Syntax[​](#syntax "Direct link to Syntax")

```
npx convex data [options] [table]
```

## Arguments[​](#arguments "Direct link to Arguments")

* `[table]`

  If specified, list documents in this table.

## Options[​](#options "Direct link to Options")

* `--limit <n>`

  List only the `n` the most recently created documents.

* `--order <choice>`

  Order the documents by their `_creationTime`.

* `--component <path>`

  Path to the component (e.g. "workflow" or "workflow/workpool")

* `--format <format>`

  Format to print the data in. This flag is only required if the filename is missing an extension.

  * jsonArray (aka json): print the data as a JSON array of objects.
  * jsonLines (aka jsonl): print the data as a JSON object per line.
  * pretty: print the data in a human-readable format.

* `--prod`

  Inspect the database in this project's default production deployment.

* `--deployment <deployment>`

  Inspect the database in a specific deployment. Accepts:

  * a deployment name (e.g. joyful-capybara-123)
  * a deployment reference (e.g. dev/james, staging)
  * `dev` (for your personal dev deployment)
  * `prod` (for your project’s default production deployment)
  * `local` (for your local dev deployment). You can also select deployments in other projects with `project-slug:reference` or `team-slug:project-slug:reference`.
