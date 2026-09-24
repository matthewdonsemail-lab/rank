> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# `npx convex function-spec`

List argument and return values to your Convex functions.

By default, this inspects your dev deployment.

## Syntax[​](#syntax "Direct link to Syntax")

```
npx convex function-spec [options]
```

## Options[​](#options "Direct link to Options")

* `--file`

  Output as JSON to a file.

* `--prod`

  Read function metadata from this project's default production deployment.

* `--deployment <deployment>`

  Read function metadata from a specific deployment. Accepts:

  * a deployment name (e.g. joyful-capybara-123)
  * a deployment reference (e.g. dev/james, staging)
  * `dev` (for your personal dev deployment)
  * `prod` (for your project’s default production deployment)
  * `local` (for your local dev deployment). You can also select deployments in other projects with `project-slug:reference` or `team-slug:project-slug:reference`.
