> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# `npx convex insights`

Show health insights for a Convex deployment over the last 72 hours. Displays OCC conflicts and resource limit issues that may indicate performance problems.

* Show insights: `npx convex insights`
* Include recent events for each insight: `npx convex insights --details`
* Check the production deployment: `npx convex insights --prod`

This command is only available for Convex cloud deployments when logged in as a user.

## Syntax[​](#syntax "Direct link to Syntax")

```
npx convex insights [options]
```

## Options[​](#options "Direct link to Options")

* `--details`

  Show recent events for each insight

* `--json`

  Output insights as JSON

* `--prod`

  Show insights for this project's default production deployment.

* `--deployment <deployment>`

  Show insights for a specific deployment. Accepts:

  * a deployment name (e.g. joyful-capybara-123)
  * a deployment reference (e.g. dev/james, staging)
  * `dev` (for your personal dev deployment)
  * `prod` (for your project’s default production deployment)
  * `local` (for your local dev deployment). You can also select deployments in other projects with `project-slug:reference` or `team-slug:project-slug:reference`.
