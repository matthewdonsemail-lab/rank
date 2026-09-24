# Using Conductor with Convex

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[Conductor](https://conductor.build) is a Mac app that lets you run many coding agents in parallel, each in its own isolated workspace. Conductor pairs naturally with Convex because each agent can run its own `convex dev` against its own deployment without stepping on the others.

## Starting a new project[​](#starting-a-new-project "Direct link to Starting a new project")

Create a new Conductor workspace on an empty directory and describe what you want to build. The agent handles the rest. It runs `npm create convex@latest`, `npx convex ai-files install` (which writes a managed Convex section into `CLAUDE.md` and `AGENTS.md` and installs Convex [Agent Skills](/ai/agent-skills.md) into `.agents/skills/`), and `npx convex dev --once`, which [auto-provisions a local backend](/cli/agent-mode.md#local-backend) without prompting for login because the agent's shell is non-interactive.

To give each Conductor workspace its own cloud dev deployment automatically, wire the [per-worktree recipe](/cli/agent-mode.md#worktree-setups) into your project's `conductor.json` setup script.

If you'd rather scaffold the project yourself first and then point Conductor at it, the manual sequence is:

```
npm create convex@latest my-app

cd my-app

npx convex ai-files install
```

Then in Conductor, click **New workspace** and point it at `my-app`.

## Adding to an existing project[​](#adding-to-an-existing-project "Direct link to Adding to an existing project")

If your project already has Convex set up, run these two steps from a Conductor workspace terminal to make the agent Convex-aware.

### Add Convex Rules[​](#add-convex-rules "Direct link to Add Convex Rules")

Conductor workspaces use Claude Code under the hood, so the same Convex AI files apply.

```
npx convex ai-files install
```

This creates or updates `CLAUDE.md` (and `AGENTS.md`) and installs Convex [Agent Skills](/ai/agent-skills.md) into `.agents/skills/` so the agent can use specialized workflows like setting up auth, designing a schema, and running migrations.

See [Convex AI files](/ai/overview.md#convex-ai-files) for more on managing these files.

### Setup the Convex MCP Server[​](#setup-the-convex-mcp-server "Direct link to Setup the Convex MCP Server")

The Convex CLI comes with a [Convex Model Context Protocol](/ai/convex-mcp-server.md) (MCP) server built in. The Convex MCP server gives the agent access to your Convex deployment to query and optimize your project.

In each Conductor workspace, add the MCP server with:

```
claude mcp add-json convex '{"type":"stdio","command":"npx","args":["convex","mcp","start"]}'
```

Now you can ask the agent questions like:

* Evaluate my convex schema and suggest improvements
* What are this app's public endpoints?
* Run the `my_convex_function` query
