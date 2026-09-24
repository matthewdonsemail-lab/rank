> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# `npx convex dashboard`

Open the dashboard in the browser

## Syntax[​](#syntax "Direct link to Syntax")

```
npx convex dashboard [options]
```

## Aliases[​](#aliases "Direct link to Aliases")

* `dash`

## Options[​](#options "Direct link to Options")

* `--no-open`

  Don't automatically open the dashboard in the default browser

* `--prod`

  Open the dashboard for this project's default production deployment.

* `--deployment <deployment>`

  Open the dashboard for a specific deployment. Accepts:

  * a deployment name (e.g. joyful-capybara-123)
  * a deployment reference (e.g. dev/james, staging)
  * `dev` (for your personal dev deployment)
  * `prod` (for your project’s default production deployment)
  * `local` (for your local dev deployment). You can also select deployments in other projects with `project-slug:reference` or `team-slug:project-slug:reference`.
