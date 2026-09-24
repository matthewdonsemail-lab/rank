> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# `npx convex deployment`

Manage deployments in your project.

## Syntax[​](#syntax "Direct link to Syntax")

```
npx convex deployment [options] [command]
```

## Subcommands[​](#subcommands "Direct link to Subcommands")

* [`npx convex deployment select`](#select) — Select the deployment to use when running commands
* [`npx convex deployment create`](#create) — Create a new deployment for a project
* [`npx convex deployment token`](#token) — Manage access tokens
* [`npx convex deployment usage`](#usage) — Show current usage for each metric
* [`npx convex deployment usage-limits`](#usage-limits) — List and configure deployment usage limits

## `npx convex deployment select`[​](#select "Direct link to select")

Select the deployment to use when running commands.

The deployment will be used by all `npx convex` commands, except `npx convex deploy`. You can also run individual commands on another deployment by using the --deployment flag on that command.

* Select your personal cloud dev deployment in the current project: `npx convex deployment select dev`
* Select your local deployment: `npx convex deployment select local`
* Select a deployment in the same project by its reference: `npx convex deployment select dev/james`
* Select a deployment in another project in the same team: `npx convex deployment select some-project:dev/james`
* Select a deployment in a particular team/project: `npx convex deployment select some-team:some-project:dev/james`

### Syntax[​](#syntax-1 "Direct link to Syntax")

```
npx convex deployment select [options] <deployment>
```

### Arguments[​](#arguments "Direct link to Arguments")

* `<deployment>`

  The deployment to use

## `npx convex deployment create`[​](#create "Direct link to create")

Create a new deployment for a project.

* Create a dev deployment and select it: `npx convex deployment create dev/my-new-feature --type dev --select`
* Create a prod deployment named “staging”: `npx convex deployment create staging --type prod`

### Syntax[​](#syntax-2 "Direct link to Syntax")

```
npx convex deployment create [options] [reference]
```

### Arguments[​](#arguments-1 "Direct link to Arguments")

* `[reference]`

  The reference for the new deployment, e.g. `staging` or `dev/my-feature`. Use `local` to create a local deployment. You can specify a team and project with `team-slug:project-slug:ref` (e.g. `my-team:my-project:staging` or `my-team:my-project:local`). Can be omitted when using `--default`.

### Options[​](#options "Direct link to Options")

* `--type <type>`

  Deployment type

* `--region <region>`

  Deployment region

* `--select`

  Select the new deployment. This will update the Convex environment variables in .env.local. Subsequent `npx convex` commands will run against this deployment.

* `--default`

  Make the new deployment your default production deployment (used by `npx convex deploy`) or your personal dev deployment.

* `--expiration <value>`

  When the deployment expires (e.g. "none", "in 7 days", "2026-04-01T00:00:00Z", or a UNIX timestamp in seconds or milliseconds)

## `npx convex deployment token`[​](#token "Direct link to token")

Create and delete access tokens. Currently supports deploy keys.

### Syntax[​](#syntax-3 "Direct link to Syntax")

```
npx convex deployment token [options] [command]
```

### `npx convex deployment token create`[​](#token-create "Direct link to token-create")

Creates a deploy key that, when set as `CONVEX_DEPLOY_KEY`, scopes all commands to the target deployment.

* Print a new deploy key to stdout: `npx convex deployment token create my-token`
* Save a new deploy key in `.env.local`: `npx convex deployment token create my-token --save-env`
* Save a new deploy key in a custom env file: `npx convex deployment token create ci-token --save-env .env.production`
* Create a key for the project's prod: `npx convex deployment token create ci-token --deployment prod`

#### Syntax[​](#syntax-4 "Direct link to Syntax")

```
npx convex deployment token create [options] <name>
```

#### Arguments[​](#arguments-2 "Direct link to Arguments")

* `<name>`

  Name for the new deploy key

#### Options[​](#options-1 "Direct link to Options")

* `--save-env [path]`

  Save the new key as CONVEX\_DEPLOY\_KEY in an env file instead of printing it. Defaults to .env.local.

* `--prod`

  Create a deploy key for this project's default production deployment.

* `--deployment <deployment>`

  Create a deploy key for a specific deployment. Accepts:

  * a deployment name (e.g. joyful-capybara-123)
  * a deployment reference (e.g. dev/james, staging)
  * `dev` (for your personal dev deployment)
  * `prod` (for your project’s default production deployment)
  * `local` (for your local dev deployment). You can also select deployments in other projects with `project-slug:reference` or `team-slug:project-slug:reference`.

### `npx convex deployment token delete`[​](#token-delete "Direct link to token-delete")

Delete an access token. Currently only deploy keys (deployment-scoped access tokens) are supported.

The positional `<nameOrToken>` can be the unique name of the deploy key (as passed to `token create`) or the deploy key value itself. The target deployment defaults to the currently-selected one; pass `--deployment` to target a different deployment.

* Delete by name: `npx convex deployment token delete my-token`
* Delete by value: `npx convex deployment token delete 'dev:happy-animal-123|ey...'`
* Target prod: `npx convex deployment token delete ci-token --deployment prod`

#### Syntax[​](#syntax-5 "Direct link to Syntax")

```
npx convex deployment token delete [options] <nameOrToken>
```

#### Arguments[​](#arguments-3 "Direct link to Arguments")

* `<nameOrToken>`

  The unique name of the deploy key, or the deploy key value itself.

#### Options[​](#options-2 "Direct link to Options")

* `--prod`

  Delete a deploy key for this project's default production deployment.

* `--deployment <deployment>`

  Delete a deploy key for a specific deployment. Accepts:

  * a deployment name (e.g. joyful-capybara-123)
  * a deployment reference (e.g. dev/james, staging)
  * `dev` (for your personal dev deployment)
  * `prod` (for your project’s default production deployment)
  * `local` (for your local dev deployment). You can also select deployments in other projects with `project-slug:reference` or `team-slug:project-slug:reference`.

## `npx convex deployment usage`[​](#usage "Direct link to usage")

Show usage so far in the current day and calendar month for every metric.

* Show current usage: `npx convex deployment usage`
* Print as JSON: `npx convex deployment usage --json`

### Syntax[​](#syntax-6 "Direct link to Syntax")

```
npx convex deployment usage [options]
```

### Options[​](#options-3 "Direct link to Options")

* `--json`

  Output the usage as JSON.

* `--prod`

  Show current usage for this project's default production deployment.

* `--deployment <deployment>`

  Show current usage for a specific deployment. Accepts:

  * a deployment name (e.g. joyful-capybara-123)
  * a deployment reference (e.g. dev/james, staging)
  * `dev` (for your personal dev deployment)
  * `prod` (for your project’s default production deployment)
  * `local` (for your local dev deployment). You can also select deployments in other projects with `project-slug:reference` or `team-slug:project-slug:reference`.

## `npx convex deployment usage-limits`[​](#usage-limits "Direct link to usage-limits")

List and configure usage limits on your deployment.

A usage limit either warns or pauses your deployment when a metric (function calls, database bandwidth, …) crosses a threshold within a daily or monthly window. Each limit is identified by its (metric, window, type).

* List usage limits: `npx convex deployment usage-limits list`
* Create or update one: `npx convex deployment usage-limits set --metric functionCalls --window day --type disable --limit 1000000`
* Delete one: `npx convex deployment usage-limits remove --metric functionCalls --window day --type disable`

### Syntax[​](#syntax-7 "Direct link to Syntax")

```
npx convex deployment usage-limits [options] [command]
```

### Options[​](#options-4 "Direct link to Options")

* `--prod`

  List and configure usage limits on this project's default production deployment.

* `--deployment <deployment>`

  List and configure usage limits on a specific deployment. Accepts:

  * a deployment name (e.g. joyful-capybara-123)
  * a deployment reference (e.g. dev/james, staging)
  * `dev` (for your personal dev deployment)
  * `prod` (for your project’s default production deployment)
  * `local` (for your local dev deployment). You can also select deployments in other projects with `project-slug:reference` or `team-slug:project-slug:reference`.

### `npx convex deployment usage-limits list`[​](#usage-limits-list "Direct link to usage-limits-list")

List the usage limits configured on your deployment.

* List all usage limits: `npx convex deployment usage-limits list`
* Print as JSON: `npx convex deployment usage-limits list --json`

#### Syntax[​](#syntax-8 "Direct link to Syntax")

```
npx convex deployment usage-limits list [options]
```

#### Options[​](#options-5 "Direct link to Options")

* `--json`

  Output the usage limits as JSON.

### `npx convex deployment usage-limits set`[​](#usage-limits-set "Direct link to usage-limits-set")

Create a usage limit, or update the existing one for the same (metric, window, type). At most one limit exists per combination.

* Set the amount (creates or replaces it):
  <!-- -->
  * `npx convex deployment usage-limits set --metric functionCalls --window day --type disable --limit 1000000`
* Deactivate without deleting: add `--inactive` (use `--active` to re-enable).
* Toggle active state without changing the amount: omit `--limit`.

#### Syntax[​](#syntax-9 "Direct link to Syntax")

```
npx convex deployment usage-limits set [options]
```

#### Options[​](#options-6 "Direct link to Options")

* `--metric <metric>`

  The metric to limit.

* `--window <window>`

  The window the limit is measured over.

* `--type <type>`

  `warning` only notifies; `disable` pauses the deployment when exceeded.

* `--limit <limit>`

  The limit amount, in the metric's native units. Required when creating; kept as-is when omitted while updating.

* `--active`

  Enforce the limit (the default for a new limit).

* `--inactive`

  Create or leave the limit unenforced.

### `npx convex deployment usage-limits remove`[​](#usage-limits-remove "Direct link to usage-limits-remove")

Delete a usage limit, identified by its (metric, window, type).

* `npx convex deployment usage-limits remove --metric functionCalls --window day --type warning`

#### Syntax[​](#syntax-10 "Direct link to Syntax")

```
npx convex deployment usage-limits remove [options]
```

#### Aliases[​](#aliases "Direct link to Aliases")

* `rm`
* `delete`

#### Options[​](#options-7 "Direct link to Options")

* `--metric <metric>`

  The metric to limit.

* `--window <window>`

  The window the limit is measured over.

* `--type <type>`

  `warning` only notifies; `disable` pauses the deployment when exceeded.
