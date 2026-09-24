# Agent Mode

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

When logged in on your own machine, agents like Cursor and Claude Code can run CLI commands like `npx convex env list` that use your logged-in credentials run commands against your personal dev environment as if you ran the commands yourself. This works well when you're collaborating with an agent; just like when the agent runs `git commit -am "Fix."`, the commit will use your local git credentials.

But when cloud-based coding agents like Jules, Devin, Codex, or Cursor Cloud Agents run Convex CLI commands, they can't log in. And if you do log in for them, the agent will use your default dev deployment to develop, conflicting with your own changes!

You have two options for giving an agent its own isolated Convex environment:

1. **Local backend** — the agent runs Convex locally, storing its data in a `.convex/` folder. Best for ephemeral agents that don't require webhooks or default environment variables.
2. **Cloud dev deployment per agent** — the agent gets its own real Convex cloud deployment. Best when the agent needs default environment variables, inbound public http traffic, such as webhooks, or integrations that don't run locally.

## Local backend[​](#local-backend "Direct link to Local backend")

The CLI will spin up a separate Convex backend on the VM where the agent is working ([anonymous development](/cli/local-deployments.md)), with no need for a Convex login or deploy key.

A typical setup script:

```
npm i

npx convex dev --once
```

or with bun:

```
bun i

bun x convex dev --once
```

The setup script needs "full" internet access the first time so the CLI can download the local backend binary.

In non-interactive shells (the typical case for an agent's setup script), `npx convex` will never prompt the agent to log in — when no deployment is already configured and `CONVEX_DEPLOY_KEY` isn't set, the CLI defaults to provisioning a local deployment automatically.

## Cloud dev deployment per agent[​](#cloud-dev-deployment-per-agent "Direct link to Cloud dev deployment per agent")

If the agent needs a real cloud deployment (e.g. for dashboard access, crons, or integrations that aren't available locally), provision a fresh dev deployment in your project and hand the agent a deploy key scoped only to it:

```
# Create a new dev deployment and select it.

npx convex deployment create --type dev --select \

  team-slug:project-slug:dev/$USER/$(basename "$PWD") \

  --expiration "in 5 days"



# Mint a deploy key scoped only to this deployment and save it as

# CONVEX_DEPLOY_KEY in .env.local.

npx convex deployment token create agent-token --save-env



# Push code once.

npx convex dev --once
```

Once `CONVEX_DEPLOY_KEY` is set in `.env.local`, the agent can only push to and develop against its own dev deployment — not prod or other developers' deployments.

If the agent needs environment variables, the easiest path is to set them as [project environment variable defaults](/production/environment-variables.md#project-environment-variable-defaults) so they're applied automatically to every new cloud deployment. You can also seed values directly with `npx convex env set` (which accepts variables on stdin or via `--from-file`).

`env set` needs a deployment to be configured first, so run it *after* `deployment create` (or after `npx convex init` for a local backend) and *before* `npx convex dev --once` so the deployed code sees the new values.

See [Creating and deleting deploy keys from the CLI](/cli/deploy-key-types.md#deployment-token) for the full options on `npx convex deployment token`.

## Worktree setups[​](#worktree-setups "Direct link to Worktree setups")

If you use a tool that creates a separate worktree for each agent task (Codex, Conductor, Cursor local worktrees, T3 Code), you can wire the cloud deployment-per-agent recipe into the tool's setup script so each worktree gets its own dev deployment automatically.

When including `--select`, the deployment created during setup will be the one used by `npx convex` commands run from that worktree afterward. Replace `my-team` and `my-project` with your team and project slugs in the snippets below.

Using the Codex app

Open the Codex app settings and go to *Environments*. Select the environment for your project or create one if needed. Use the following setup script:

```
npm ci && npx convex deployment create --type=dev my-team:my-project:dev/$USER-codex/$(basename \"$(dirname \"$CODEX_WORKTREE_PATH\")\") --select
```

When starting a new worktree, select the environment that you just created.

Using Conductor

Add the following setup command to the `conductor.json` file of your project:

```
{

  "scripts": {

    "setup": "npm ci && npx convex deployment create --type=dev my-team:my-project:dev/$USER-conductor/$CONDUCTOR_WORKSPACE_NAME --select"

  }

}
```

Using Cursor local worktrees

Add the following setup command to the `.cursor/worktrees.json` file of your project:

```
{

  "setup-worktree": [

    "npm ci",

    "npx convex deployment create --type=dev my-team:my-project:dev/$USER-cursor/$(basename \"$PWD\") --select"

  ]

}
```

Using T3 Code

Click on **Add action** in the top bar. Enable *Run automatically on worktree creation* and use the following command:

```
npm ci && npx convex deployment create --type=dev my-team:my-project:dev/$USER-t3code/$(basename "$PWD" | sed 's/^t3code-//') --select
```

To also mint a per-worktree deploy key, append the `npx convex deployment token create agent-token --save-env` step from the [cloud-deployment recipe](#cloud-dev-deployment-per-agent) after the `deployment create` line.

## Switching between cloud and local[​](#switching-between-cloud-and-local "Direct link to Switching between cloud and local")

You can flip a worktree between a cloud and local deployment at any time:

```
# Create and select a local deployment for this worktree.

npx convex deployment create local --select



# Or, if a local deployment already exists, just select it.

npx convex deployment select local
```

`npx convex deployment select <ref>` switches back to a cloud deployment by its reference (or `dev`/`prod`).
