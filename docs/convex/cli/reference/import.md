> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# `npx convex import`

Import data from a file to your Convex deployment.

* From a snapshot: `npx convex import snapshot.zip`
* For a single table: `npx convex import --table tableName file.json`

By default, this imports into your dev deployment.

See the data import guide (<https://docs.convex.dev/database/import-export/import>) for details and use cases.

## Syntax[​](#syntax "Direct link to Syntax")

```
npx convex import [options] <path>
```

## Arguments[​](#arguments "Direct link to Arguments")

* `<path>`

  Path to the input file

## Options[​](#options "Direct link to Options")

* `--table <table>`

  Destination table name. Required if format is csv, jsonLines, or jsonArray. Not supported if format is zip.

* `--replace`

  Replace all existing data in any of the imported tables

* `--append`

  Append imported data to any existing tables

* `--replace-all`

  Replace all existing data in the deployment with the imported tables, deleting tables that don't appear in the import file or the schema, and clearing tables that appear in the schema but not in the import file

* `-y, --yes`

  Skip confirmation prompt when import leads to deleting existing documents

* `--format <format>`

  Input file format. This flag is only required if the filename is missing an extension.

  * CSV files must have a header, and each row's entries are interpreted either as a (floating point) number or a string.
  * JSON files must be an array of JSON objects.
  * JSONLines files must have a JSON object per line.
  * ZIP files must have one directory per table, containing \<table>/documents.jsonl. Snapshot exports from the Convex dashboard have this format.

* `--component <path>`

  Path to the component (e.g. "workflow" or "workflow/workpool")

* `--prod`

  Import data into this project's default production deployment.

* `--deployment <deployment>`

  Import data into a specific deployment. Accepts:

  * a deployment name (e.g. joyful-capybara-123)
  * a deployment reference (e.g. dev/james, staging)
  * `dev` (for your personal dev deployment)
  * `prod` (for your project’s default production deployment)
  * `local` (for your local dev deployment). You can also select deployments in other projects with `project-slug:reference` or `team-slug:project-slug:reference`.
