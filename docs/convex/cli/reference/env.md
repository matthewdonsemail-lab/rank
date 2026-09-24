> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# `npx convex env`

Set and view environment variables on your deployment

* Set a variable: `npx convex env set NAME 'value'`
* Set interactively: `npx convex env set NAME`
* Set multiple from file: `npx convex env set --from-file .env`
* Unset a variable: `npx convex env remove NAME`
* List all variables and their values: `npx convex env list`
* List only variable names (no values): `npx convex env list --names-only`
* Print a variable's value: `npx convex env get NAME`

By default, this sets and views variables on your dev deployment.

See the environment variables guide (<https://docs.convex.dev/production/environment-variables>) to learn more.

## Syntax[​](#syntax "Direct link to Syntax")

```
npx convex env [options] [command]
```

## Options[​](#options "Direct link to Options")

* `--prod`

  Set and view environment variables on this project's default production deployment.

* `--deployment <deployment>`

  Set and view environment variables on a specific deployment. Accepts:

  * a deployment name (e.g. joyful-capybara-123)
  * a deployment reference (e.g. dev/james, staging)
  * `dev` (for your personal dev deployment)
  * `prod` (for your project’s default production deployment)
  * `local` (for your local dev deployment). You can also select deployments in other projects with `project-slug:reference` or `team-slug:project-slug:reference`.

## Subcommands[​](#subcommands "Direct link to Subcommands")

* [`npx convex env set`](#set) — Set a variable
* [`npx convex env get`](#get) — Print a variable's value
* [`npx convex env remove`](#remove) — Unset a variable
* [`npx convex env list`](#list) — List all environment variables and their values
* [`npx convex env default`](#default) — Manage project-level default environment variables

## `npx convex env set`[​](#set "Direct link to set")

Set environment variables on your deployment.

* `npx convex env set NAME 'value'`
* `npx convex env set NAME # omit a value to set one interactively`
* `npx convex env set NAME --from-file value.txt`
* `npx convex env set --from-file .env.defaults`

When setting multiple values, it will refuse all changes if any variables are already set to different values by default. Pass --force to overwrite the provided values.

To keep secrets out of your shell history, omit the value to pipe it in via stdin, for instance:

* `pbpaste | npx convex env set API_KEY` (macOS)
* `Get-Clipboard | npx convex env set API_KEY` (Windows PowerShell)

To update many variables at once, save them with `npx convex env list > .env.convex`, edit the file, then reapply the changes with `npx convex env set --force < .env.convex`.

### Syntax[​](#syntax-1 "Direct link to Syntax")

```
npx convex env set [options] [name] [value]
```

### Arguments[​](#arguments "Direct link to Arguments")

* `[name]`

  The name of the environment variable to set.

* `[value]`

  The value to set the variable to. Omit to set it interactively.

### Options[​](#options-1 "Direct link to Options")

* `--from-file <file>`

  Read environment variables from a .env file. Without --force, fails if any existing variable has a different value.

* `--force`

  When setting multiple variables, overwrite existing environment variable values instead of failing on mismatch.

## `npx convex env get`[​](#get "Direct link to get")

Print a variable's value: `npx convex env get NAME`

### Syntax[​](#syntax-2 "Direct link to Syntax")

```
npx convex env get [options] <name>
```

### Arguments[​](#arguments-1 "Direct link to Arguments")

* `<name>`

  The name of the environment variable to print.

## `npx convex env remove`[​](#remove "Direct link to remove")

Unset a variable: `npx convex env remove NAME` If the variable doesn't exist, the command doesn't do anything and succeeds.

### Syntax[​](#syntax-3 "Direct link to Syntax")

```
npx convex env remove [options] <name>
```

### Aliases[​](#aliases "Direct link to Aliases")

* `rm`
* `unset`

### Arguments[​](#arguments-2 "Direct link to Arguments")

* `<name>`

  The name of the environment variable to unset.

## `npx convex env list`[​](#list "Direct link to list")

* List all variables and their values: `npx convex env list`
* List only variable names (no values): `npx convex env list --names-only`
* Save all variables to a file: `npx convex env list > .env.convex`
* Append to a file: `npx convex env list >> .env.convex`

### Syntax[​](#syntax-4 "Direct link to Syntax")

```
npx convex env list [options]
```

### Options[​](#options-2 "Direct link to Options")

* `--names-only`

  List only the names of environment variables, without their values

## `npx convex env default`[​](#default "Direct link to default")

Manage default environment variables for your project.

The default environment variables read and written to by this command are the ones for the deployment type of the current deployment (i.e. dev in most cases), unless --type is provided.

* Set a default variable: `npx convex env default set NAME 'value'`
* Unset a default variable: `npx convex env default remove NAME`
* List all default variables and their values: `npx convex env default list`
* List only default variable names (no values): `npx convex env default list --names-only`
* Print a default variable's value: `npx convex env default get NAME`

### Syntax[​](#syntax-5 "Direct link to Syntax")

```
npx convex env default [options] [command]
```

### `npx convex env default set`[​](#default-set "Direct link to default-set")

Set default environment variables for your project's deployment type.

* `npx convex env default set NAME 'value'`
* `npx convex env default set NAME # omit a value to set one interactively`
* `npx convex env default set NAME --from-file value.txt`
* `npx convex env default set --from-file .env.defaults`

When setting multiple values, it will refuse all changes if any variables are already set to different values by default. Pass --force to overwrite the provided values.

The deployment type is determined by the current deployment (local maps to dev), or by --type if provided.

#### Syntax[​](#syntax-6 "Direct link to Syntax")

```
npx convex env default set [options] [name] [value]
```

#### Arguments[​](#arguments-3 "Direct link to Arguments")

* `[name]`

  The name of the default environment variable to set.

* `[value]`

  The value to set the variable to. Omit to set it interactively.

#### Options[​](#options-3 "Direct link to Options")

* `--from-file <file>`

  Read environment variables from a .env file. Without --force, fails if any existing variable has a different value.

* `--force`

  When setting multiple variables, overwrite existing environment variable values instead of failing on mismatch.

* `--type <type>`

  Manage default env vars for the given deployment type (dev, preview, prod) instead of inferring from the current deployment.

* `--project <project>`

  Select a project manually. Accepts `team-slug:project-slug` or just `project-slug` (team inferred from your current project). Requires --type.

### `npx convex env default get`[​](#default-get "Direct link to default-get")

Print a default variable's value: `npx convex env default get NAME` The deployment type is determined by the current deployment (local maps to dev), or by --type if provided.

#### Syntax[​](#syntax-7 "Direct link to Syntax")

```
npx convex env default get [options] <name>
```

#### Arguments[​](#arguments-4 "Direct link to Arguments")

* `<name>`

  The name of the default environment variable to print.

#### Options[​](#options-4 "Direct link to Options")

* `--type <type>`

  Manage default env vars for the given deployment type (dev, preview, prod) instead of inferring from the current deployment.

* `--project <project>`

  Select a project manually. Accepts `team-slug:project-slug` or just `project-slug` (team inferred from your current project). Requires --type.

### `npx convex env default remove`[​](#default-remove "Direct link to default-remove")

Unset a default variable.

* `npx convex env default remove NAME`

If the variable doesn't exist, the command doesn't do anything and succeeds.

The deployment type is determined by the current deployment (local maps to dev), or by --type if provided.

#### Syntax[​](#syntax-8 "Direct link to Syntax")

```
npx convex env default remove [options] <name>
```

#### Aliases[​](#aliases-1 "Direct link to Aliases")

* `rm`
* `unset`

#### Arguments[​](#arguments-5 "Direct link to Arguments")

* `<name>`

  The name of the default environment variable to unset.

#### Options[​](#options-5 "Direct link to Options")

* `--type <type>`

  Manage default env vars for the given deployment type (dev, preview, prod) instead of inferring from the current deployment.

* `--project <project>`

  Select a project manually. Accepts `team-slug:project-slug` or just `project-slug` (team inferred from your current project). Requires --type.

### `npx convex env default list`[​](#default-list "Direct link to default-list")

* List all default variables and their values: `npx convex env default list`
* List only default variable names (no values): `npx convex env default list --names-only`

The deployment type is determined by the current deployment (local maps to dev), or by --type if provided.

#### Syntax[​](#syntax-9 "Direct link to Syntax")

```
npx convex env default list [options]
```

#### Options[​](#options-6 "Direct link to Options")

* `--names-only`

  List only the names of environment variables, without their values

* `--type <type>`

  Manage default env vars for the given deployment type (dev, preview, prod) instead of inferring from the current deployment.

* `--project <project>`

  Select a project manually. Accepts `team-slug:project-slug` or just `project-slug` (team inferred from your current project). Requires --type.
