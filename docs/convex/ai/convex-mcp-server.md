# Convex MCP Server

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

The Convex [Model Context Protocol](https://docs.cursor.com/context/model-context-protocol) (MCP) server provides several tools that allow AI agents to interact with your Convex deployment.

## Setup[​](#setup "Direct link to Setup")

Add the following command to your MCP servers configuration:

```
npx -y convex@latest mcp start
```

Or see editor-specific instructions:

* [Codex](/ai/using-codex.md#setup-the-convex-mcp-server)
* [GitHub Copilot](/ai/using-github-copilot.md#setup-the-convex-mcp-server)
* [![](/assets/images/conductor-logo-fa2224a9c0b89cba358b3a954a8e9051.png)](/ai/using-conductor.md#setup-the-convex-mcp-server)

  [Conductor](/ai/using-conductor.md#setup-the-convex-mcp-server)

When using  Claude Code or  Cursor, we recommend installing the [Convex plugin](/ai/overview.md#plugins), which automatically starts the MCP server.

## Configuration Options[​](#configuration-options "Direct link to Configuration Options")

The MCP server supports several command-line options to customize its behavior.

info

For the full list of options, see the [`npx convex mcp` CLI reference](/cli/reference/mcp.md).

### Project Directory[​](#project-directory "Direct link to Project Directory")

The tools provided by the MCP server require agents to select a deployment. To find the right deployment to use, agents use the `status` tool.

By default, `status` uses the current project directory. If you want to use another project directory by default or run `npx convex mcp` from a folder that is not a Convex project, you can change the project `status` uses with the `--project-dir` flag:

```
npx -y convex@latest mcp start --project-dir /path/to/project
```

warning

Setting `--project-dir` doesn’t prevent agents from manually providing a custom `projectDir` in the `status` tool call. It also does not prevent the agent from running tools in deployments that belong to other projects. If you need to enforce security boundaries, check out [*Security*](#security).

### Deployment Selection[​](#deployment-selection "Direct link to Deployment Selection")

By default, the MCP server connects to your development deployment. You can specify a different deployment using these options:

* `--prod`: Run the MCP server on your project's production deployment (requires `--dangerously-enable-production-deployments`)
* `--preview-name <name>`: Run on a preview deployment with the given name
* `--deployment-name <name>`: Run on a specific deployment by name
* `--env-file <path>`: Path to a custom environment file for choosing the deployment (e.g., containing `CONVEX_DEPLOYMENT` or `CONVEX_SELF_HOSTED_URL`). Uses the same format as `.env.local` or `.env` files.

### Production Deployments[​](#production-deployments "Direct link to Production Deployments")

By default, the MCP server cannot access production deployments. This is a safety measure to prevent accidental modifications to production data. If you need to access production deployments, you must explicitly enable this:

```
npx -y convex@latest mcp start --dangerously-enable-production-deployments
```

Use with care

Enabling production access allows the MCP server to read and modify data in your production deployment. Only enable this when you specifically need to interact with production, and be careful with any operations that modify data.

### Disabling Tools[​](#disabling-tools "Direct link to Disabling Tools")

You can disable specific tools if you want to restrict what the MCP server can do:

```
npx -y convex@latest mcp start --disable-tools data,run,envSet
```

Available tools that can be disabled: `data`, `envGet`, `envList`, `envRemove`, `envSet`, `functionSpec`, `insights`, `logs`, `run`, `runOneoffQuery`, `status`, `tables`

## Available Tools[​](#available-tools "Direct link to Available Tools")

### Deployment Tools[​](#deployment-tools "Direct link to Deployment Tools")

* **`status`**: Queries available deployments and returns a deployment selector that can be used with other tools. This is typically the first tool you'll use to find your Convex deployment.

### Table Tools[​](#table-tools "Direct link to Table Tools")

* **`tables`**: Lists all tables in a deployment along with their:

  * Declared schemas (if present)
  * Inferred schemas (automatically tracked by Convex)
  * Table names and metadata

* **`data`**: Allows pagination through documents in a specified table.

* **`runOneoffQuery`**: Enables writing and executing sandboxed JavaScript queries against your deployment's data. These queries are read-only and cannot modify the database.

### Function Tools[​](#function-tools "Direct link to Function Tools")

* **`functionSpec`**: Provides metadata about all deployed functions, including:

  * Function types
  * Visibility settings
  * Interface specifications

* **`run`**: Executes deployed Convex functions with provided arguments.

* **`logs`**: Fetches a chunk of recent function execution log entries, similar to `npx convex logs` but as structured objects.

### Insights Tools[​](#insights-tools "Direct link to Insights Tools")

* **`insights`**: Fetches health insights for a deployment over the last 72 hours. Reports OCC (Optimistic Concurrency Control) conflicts and resource limit issues (bytes read, documents read) that may indicate performance problems or failing functions. Includes recent events with request IDs for debugging.

### Environment Variable Tools[​](#environment-variable-tools "Direct link to Environment Variable Tools")

* **`envList`**: Lists all environment variables for a deployment
* **`envGet`**: Retrieves the value of a specific environment variable
* **`envSet`**: Sets a new environment variable or updates an existing one
* **`envRemove`**: Removes an environment variable from the deployment

## Security[​](#security "Direct link to Security")

The MCP server is safe by default: in [production deployments](/production/multiple-deployments.md#deployment-types), agents can’t access PII, and they can only perform read-only operations.

If necessary, you can customize the MCP server settings to grant more permissions in production deployments, or limit the MCP server to a single deployment.

info

If your agent is allowed to run `npx convex` commands independently, they will be run with the full authorization of your credentials, unless you use a [scoped deploy key](/cli/deploy-key-types.md#deployment-token).

### Allowed tools by deployment type[​](#allowed-tools-by-deployment-type "Direct link to Allowed tools by deployment type")

By default, the MCP server only allows **operations on [non-production deployments](/production/multiple-deployments.md#deployment-types)** and **safe operations on [production deployments](/production/multiple-deployments.md#deployment-types)** (i.e. actions that are read-only and don’t expose PII or environment variables).

You can start the MCP server with `--cautiously-allow-production-pii` or `--dangerously-enable-production-deployments` to allow your agents to perform more actions on production deployments.

<!-- -->

| Tool category                                                                          | Default | `--cautiously-allow-production-pii` | `--dangerously-enable-production-deployments` |
| :------------------------------------------------------------------------------------- | :-----: | :---------------------------------: | :-------------------------------------------: |
| [**Non-production deployments**](/production/multiple-deployments.md#deployment-types) |         |                                     |                                               |
| All operations                                                                         |    ✅   |                  ✅                 |                       ✅                      |
| [**Production deployments**](/production/multiple-deployments.md#deployment-types)     |         |                                     |                                               |
| Non-PII read-only operations<br />(`insights`, `tables`, `functionSpec`)               |    ✅   |                  ✅                 |                       ✅                      |
| PII read-only operations<br />(`data`, `logs`, `runOneoffQuery`)                       |    ❌   |                  ✅                 |                       ✅                      |
| Reading environment variables<br />(`envGet`, `envList`)                               |    ❌   |                  ❌                 |                       ✅                      |
| Write operations<br />(`run`, `envSet`, `envRemove`)                                   |    ❌   |                  ❌                 |                       ✅                      |

If you want to disable access to particular tools, you can also use the `--disable-tools` CLI flag.

### Limit access to a specific deployment[​](#limit-access-to-a-specific-deployment "Direct link to Limit access to a specific deployment")

By default, the MCP server uses the user’s global authentication credentials (set up through `npx convex login`) to access deployments. As a result, agents using the MCP can access all projects that your Convex account has access to.

If you want to restrict the MCP server to a particular deployment, [generate a deploy key](/cli/deploy-key-types.md#deployment-token) and set the `CONVEX_DEPLOY_KEY` environment variable.

```
CONVEX_DEPLOY_KEY="dev:happy-capybara-849|…=" npx -y convex@latest mcp start
```

Limitation

The `insights` tool is not available when the MCP server is started with `CONVEX_DEPLOY_KEY` (for both production and non-production deployments).

Related posts from

<!-- -->

[![Stack](/img/stack-logo-dark.svg)![Stack](/img/stack-logo-light.svg)](https://stack.convex.dev/)
