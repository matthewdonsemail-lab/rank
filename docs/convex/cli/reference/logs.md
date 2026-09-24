> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# `npx convex logs`

Stream function logs from your Convex deployment. By default, this streams from your project's dev deployment.

## Syntax[​](#syntax "Direct link to Syntax")

```
npx convex logs [options]
```

## Options[​](#options "Direct link to Options")

* `--history [n]`

  Show `n` most recent logs. Defaults to showing all available logs.

* `--success`

  Print a log line for every successful function execution

* `--jsonl`

  Output raw log events as JSONL

* `--prod`

  Watch logs from this project's default production deployment.

* `--deployment <deployment>`

  Watch logs from a specific deployment. Accepts:

  * a deployment name (e.g. joyful-capybara-123)
  * a deployment reference (e.g. dev/james, staging)
  * `dev` (for your personal dev deployment)
  * `prod` (for your project’s default production deployment)
  * `local` (for your local dev deployment). You can also select deployments in other projects with `project-slug:reference` or `team-slug:project-slug:reference`.
