> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# `npx convex mcp`

Commands to initialize and run a Model Context Protocol server for Convex that can be used with AI tools. This server exposes your Convex codebase to AI tools in a structured way.

## Syntax[​](#syntax "Direct link to Syntax")

```
npx convex mcp [options] [command]
```

## Subcommands[​](#subcommands "Direct link to Subcommands")

* [`npx convex mcp start`](#start) — Start the MCP server

## `npx convex mcp start`[​](#start "Direct link to start")

Start the Model Context Protocol server for Convex that can be used with AI tools.

### Syntax[​](#syntax-1 "Direct link to Syntax")

```
npx convex mcp start [options]
```

### Options[​](#options "Direct link to Options")

* `--project-dir <project-dir>`

  Run the MCP server for a single project. By default, the MCP server can run for multiple projects, and each tool call specifies its project directory.

* `--disable-tools <tool-names>`

  Comma separated list of tool names to disable (options: data, envGet, envList, envRemove, envSet, functionSpec, insights, logs, run, runOneoffQuery, status, tables)

* `--cautiously-allow-production-pii`

  Allow read-only tools (data, logs, queries) on production deployments. These tools may expose PII. Defaults to false.

* `--dangerously-enable-production-deployments`

  DANGEROUSLY allow the MCP server to access production deployments, including mutating tools. Defaults to false.

* `--prod`

  Run the MCP server on this project's default production deployment.

* `--deployment <deployment>`

  Run the MCP server on a specific deployment. Accepts:

  * a deployment name (e.g. joyful-capybara-123)
  * a deployment reference (e.g. dev/james, staging)
  * `dev` (for your personal dev deployment)
  * `prod` (for your project’s default production deployment)
  * `local` (for your local dev deployment). You can also select deployments in other projects with `project-slug:reference` or `team-slug:project-slug:reference`.
