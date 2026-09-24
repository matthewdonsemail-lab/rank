> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# `npx convex export`

Export data, and optionally file storage, from your Convex deployment to a ZIP file.

* Export to a directory: `npx convex export --path dir/`
* Export to a ZIP file: `npx convex export --path snapshot.zip`
* Include file storage: `npx convex export --include-file-storage --path dir/`

By default, this exports from your dev deployment.

See the data export guide (<https://docs.convex.dev/database/import-export/export>) for details and use cases.

## Syntax[​](#syntax "Direct link to Syntax")

```
npx convex export [options]
```

## Options[​](#options "Direct link to Options")

* `--path <zipFilePath>`

  Exports data into a ZIP file at this path, which may be a directory or unoccupied .zip path

* `--include-file-storage`

  Includes stored files (<https://dashboard.convex.dev/deployment/files>) in a \_storage folder within the ZIP file

* `--prod`

  Export data from this project's default production deployment.

* `--deployment <deployment>`

  Export data from a specific deployment. Accepts:

  * a deployment name (e.g. joyful-capybara-123)
  * a deployment reference (e.g. dev/james, staging)
  * `dev` (for your personal dev deployment)
  * `prod` (for your project’s default production deployment)
  * `local` (for your local dev deployment). You can also select deployments in other projects with `project-slug:reference` or `team-slug:project-slug:reference`.
