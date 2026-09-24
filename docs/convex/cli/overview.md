# CLI

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

The Convex command-line interface (CLI) is your interface for managing Convex projects and Convex functions.

To install the CLI, run:

```
npm install convex
```

The available CLI commands are:

* [`npx convex dev`](/cli/reference/dev.md) —
  <!-- -->
  Develop against a dev deployment, watching for changes
* [`npx convex deploy`](/cli/reference/deploy.md) —
  <!-- -->
  Deploy to a production or preview deployment
* [`npx convex run`](/cli/reference/run.md) —
  <!-- -->
  Run a function or evaluate an inline readonly query on your deployment
* [`npx convex import`](/cli/reference/import.md) —
  <!-- -->
  Import data from a file to your deployment
* [`npx convex dashboard`](/cli/reference/dashboard.md) —
  <!-- -->
  Open the dashboard in the browser
* [`npx convex docs`](/cli/reference/docs.md) —
  <!-- -->
  Open the docs in the browser
* [`npx convex logs`](/cli/reference/logs.md) —
  <!-- -->
  Watch logs from your deployment
* [`npx convex export`](/cli/reference/export.md) —
  <!-- -->
  Export data from your deployment to a ZIP file
* [`npx convex env`](/cli/reference/env.md) —
  <!-- -->
  Set and view environment variables
* [`npx convex data`](/cli/reference/data.md) —
  <!-- -->
  List tables and print data from your database
* [`npx convex deployment`](/cli/reference/deployment.md) —
  <!-- -->
  Manage deployments
* [`npx convex project`](/cli/reference/project.md) —
  <!-- -->
  Manage projects
* [`npx convex codegen`](/cli/reference/codegen.md) —
  <!-- -->
  Generate backend type definitions
* [`npx convex update`](/cli/reference/update.md) —
  <!-- -->
  Print instructions for updating the convex package
* [`npx convex logout`](/cli/reference/logout.md) —
  <!-- -->
  Log out of Convex on this machine
* [`npx convex function-spec`](/cli/reference/function-spec.md) —
  <!-- -->
  List function metadata from your deployment
* [`npx convex insights`](/cli/reference/insights.md) —
  <!-- -->
  Show health insights for your deployment
* [`npx convex mcp`](/cli/reference/mcp.md) —
  <!-- -->
  Manage the Model Context Protocol server for Convex \[BETA]
* [`npx convex ai-files`](/cli/reference/ai-files.md) —
  <!-- -->
  Manage Convex AI files

## Configure[​](#configure "Direct link to Configure")

### Create a new project[​](#create-a-new-project "Direct link to Create a new project")

The first time you run

```
npx convex dev
```

it will ask you to log in your device and create a new Convex project. It will then create:

1. The `convex/` directory: This is the home for your query and mutation functions.
2. `.env.local` with `CONVEX_DEPLOYMENT` variable: This is the main configuration for your Convex project. It is the name of your development deployment.

### Recreate project configuration[​](#recreate-project-configuration "Direct link to Recreate project configuration")

Run

```
npx convex dev
```

in a project directory without a set `CONVEX_DEPLOYMENT` to configure a new or existing project.

### Log out[​](#log-out "Direct link to Log out")

```
npx convex logout
```

Remove the existing Convex credentials from your device, so subsequent commands like `npx convex dev` can use a different Convex account.

## Develop[​](#develop "Direct link to Develop")

### Run the Convex dev server[​](#run-the-convex-dev-server "Direct link to Run the Convex dev server")

```
npx convex dev
```

Watches the local filesystem. When you change a [function](/functions/overview.md) or the [schema](/database/schemas.md), the new versions are pushed to your dev deployment and the [generated types](/generated-api/.md) in `convex/_generated` are updated. By default, logs from your dev deployment are displayed in the terminal.

It's also possible to [run a Convex deployment locally](/cli/local-deployments.md) for development.

### Open the dashboard[​](#open-the-dashboard "Direct link to Open the dashboard")

```
npx convex dashboard
```

Open the [Convex dashboard](/dashboard/overview.md).

### Open the docs[​](#open-the-docs "Direct link to Open the docs")

```
npx convex docs
```

Get back to these docs!

### Run Convex functions[​](#run-convex-functions "Direct link to Run Convex functions")

```
npx convex run <functionName> [args]
```

Run a public or internal Convex query, mutation, or action on your development deployment.

Arguments are specified as a JSON object.

```
npx convex run messages:send '{"body": "hello", "author": "me"}'
```

Add `--watch` to live update the results of a query. Add `--push` to push local code to the deployment before running the function.

Use `--prod` to run functions in the production deployment for a project.

#### Run an inline query[​](#run-an-inline-query "Direct link to Run an inline query")

You can also evaluate a readonly inline query on your deployment:

```
npx convex run --inline-query 'await ctx.db.query("messages").take(5)'
```

For multi-statement queries, use an explicit `return`:

```
npx convex run --inline-query 'const firstMessage = await ctx.db.query("messages").first(); console.log(firstMessage?._id); return firstMessage;'
```

If you need full control, you can pass a full module source that exports a default query:

```
npx convex run --inline-query 'export default query({ handler: async (ctx) => { console.log("Write and test your query function here!"); return await ctx.db.query("YOUR_TABLE_NAME").take(10); }, })'
```

The function call is also completely sandboxed, so it can only read data and cannot modify the database or access the network.

Use `--component <path>` to run the inline query inside a mounted component. Use `--prod` to run the inline query on the production deployment for a project.

### Tail deployment logs[​](#tail-deployment-logs "Direct link to Tail deployment logs")

You can choose how to pipe logs from your dev deployment to your console:

```
# Show all logs continuously

npx convex dev --tail-logs always



# Pause logs during deploys to see sync issues (default)

npx convex dev



# Don't display logs while developing

npx convex dev --tail-logs disable



# Tail logs without deploying

npx convex logs
```

Use `--prod` with `npx convex logs` to tail the prod deployment logs instead.

### Import data from a file[​](#import-data-from-a-file "Direct link to Import data from a file")

```
npx convex import --table <tableName> <path>

npx convex import <path>.zip
```

See description and use-cases: [data import](/database/import-export/import.md).

### Export data to a file[​](#export-data-to-a-file "Direct link to Export data to a file")

```
npx convex export --path <directoryPath>

npx convex export --path <filePath>.zip

npx convex export --include-file-storage --path <path>
```

See description and use-cases: [data export](/database/import-export/export.md).

### Display data from tables[​](#display-data-from-tables "Direct link to Display data from tables")

```
npx convex data  # lists tables

npx convex data <table>
```

Display a simple view of the [dashboard data page](/dashboard/deployments/data.md) in the command line.

The command supports `--limit` and `--order` flags to change data displayed. For more complex filters, use the dashboard data page or write a [query](/database/reading-data/.md).

The `npx convex data <table>` command works with [system tables](/database/advanced/system-tables.md), such as `_storage`, in addition to your own tables.

### Show deployment health insights[​](#show-deployment-health-insights "Direct link to Show deployment health insights")

```
npx convex insights

npx convex insights --details

npx convex insights --prod
```

Show health insights for a Convex deployment over the last 72 hours. Reports [OCC (Optimistic Concurrency Control)](/error.md#1) conflicts and resource limit issues that may indicate performance problems.

Add `--details` to include recent events for each insight. Use `--prod` to check the production deployment, `--preview-name <name>` for a preview deployment, or `--deployment-name <name>` for a specific deployment.

### Read and write environment variables[​](#read-and-write-environment-variables "Direct link to Read and write environment variables")

```
npx convex env list

npx convex env get <name>

npx convex env set <name> <value>

npx convex env remove <name>
```

See and update the [deployment environment variables](/production/environment-variables.md). You can alternatively use the [settings page on the dashboard](/dashboard/deployments/deployment-settings.md#environment-variables).

Tip: to avoid secrets from ending up in your terminal shell history, you can pass the value via stdin, from a file, or interactively.

Useful commands:

```
# Set a value interactively

npx convex env set API_KEY



# Set from MacOS clipboard

pbpaste | npx convex env set API_KEY

# Windows PowerShell

Get-Clipboard | npx convex env set API_KEY



# Read a value from a file

npx convex env set PUBLIC_KEY --from-file key.pub



# Set multiple variables via a file

npx convex env set --from-file .env.defaults



# Save environment variables to a file

npx convex env list >> .env.convex  # append

npx convex env list >  .env.convex  # overwrite



# Update values after editing them locally:

npx convex env set --force < .env.convex
```

Note: to set variables on your production deployment, pass `--prod`.

## Deploy[​](#deploy "Direct link to Deploy")

### Deploy Convex functions to production[​](#deploy-convex-functions-to-production "Direct link to Deploy Convex functions to production")

```
npx convex deploy
```

The target deployment to push to is determined like this:

1. If the `CONVEX_DEPLOY_KEY` environment variable is set (typical in CI), then it is the deployment associated with that key.
2. If the `CONVEX_DEPLOYMENT` environment variable is set (typical during local development), then the target deployment is the production deployment of the project that the deployment specified by `CONVEX_DEPLOYMENT` belongs to. This allows you to deploy to your prod deployment while developing against your dev deployment.

This command will:

1. Run a command if specified with `--cmd`. The command will have CONVEX\_URL (or similar) environment variable available:

   <!-- -->

   ```
   npx convex deploy --cmd "npm run build"
   ```

   <!-- -->

   You can customize the URL environment variable name with `--cmd-url-env-var-name`:

   <!-- -->

   ```
   npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name CUSTOM_CONVEX_URL
   ```

2. Typecheck your Convex functions.

3. Regenerate the [generated code](/generated-api/.md) in the `convex/_generated` directory.

4. Bundle your Convex functions and their dependencies.

5. Push your functions, [indexes](/database/reading-data/indexes/.md), and [schema](/database/schemas.md) to production.

Once this command succeeds the new functions will be available immediately.

### Deploy Convex functions to a [preview deployment](/production/multiple-deployments.md#preview)[​](#deploy-convex-functions-to-a-preview-deployment "Direct link to deploy-convex-functions-to-a-preview-deployment")

```
npx convex deploy
```

When run with the `CONVEX_DEPLOY_KEY` environment variable containing a [Preview Deploy Key](/cli/deploy-key-types.md#deploying-to-preview-deployments), this command will:

1. Create a new Convex deployment. `npx convex deploy` will infer the Git branch name for Vercel, Netlify, GitHub, and GitLab environments, or the `--preview-create` option can be used to customize the name associated with the newly created deployment.

   ```
   npx convex deploy --preview-create my-branch-name
   ```

2. Run a command if specified with `--cmd`. The command will have CONVEX\_URL (or similar) environment variable available:

   ```
   npx convex deploy --cmd "npm run build"
   ```

   You can customize the URL environment variable name with `--cmd-url-env-var-name`:

   ```
   npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name CUSTOM_CONVEX_URL
   ```

3. Typecheck your Convex functions.

4. Regenerate the [generated code](/generated-api/.md) in the `convex/_generated` directory.

5. Bundle your Convex functions and their dependencies.

6. Push your functions, [indexes](/database/reading-data/indexes/.md), and [schema](/database/schemas.md) to the deployment.

7. Run a function specified by `--preview-run` (similar to the `--run` option for `npx convex dev`).

   ```
   npx convex deploy --preview-run myFunction
   ```

See the [Vercel](/production/hosting/vercel.md#preview-deployments) or [Netlify](/production/hosting/netlify.md#deploy-previews) hosting guide for setting up frontend and backend previews together.

### Update generated code[​](#update-generated-code "Direct link to Update generated code")

```
npx convex codegen
```

The [generated code](/generated-api/.md) in the `convex/_generated` directory includes types required for a TypeScript typecheck. This code is generated whenever necessary while running `npx convex dev` and this code should be committed to the repo (your code won't typecheck without it!).

In the rare cases it's useful to regenerate code (e.g. in CI to ensure that the correct code was checked it) you can use this command.

Generating code can require communicating with a convex deployment in order to evaluate configuration files in the Convex JavaScript runtime. This doesn't modify the code running on the deployment.
