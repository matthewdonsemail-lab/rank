---
title: Claude Code
description: Connect Claude Code to Rank over MCP stdio or the rank CLI.
---

Claude Code consumes Rank over MCP (stdio) for tool calls and over the `rank`
CLI for scripted work. Both routes reuse the operator's `.rank/` session from
a prior `rank login`; neither mints identities.

Sources: [Connect Claude Code to tools via MCP](http://code.claude.com/docs/en/mcp),
[Claude Code MCP Commands](https://www.mcpbundles.com/blog/claude-code-mcp-tools).

## MCP (tool calls)

Register the stdio server. Replace `<repo>` with the absolute path of this
repository checkout — agent hosts do not share our working directory, so the
path must be absolute. Authenticate first with `rank login`, or export
`CONVEX_URL` and `RANK_AUTH_TOKEN` in the server environment.

```bash
claude mcp add --transport stdio rank --scope project \
  --env CONVEX_URL=https://perceptive-cow-413.convex.cloud \
  -- bun <repo>/packages/rank-mcp/bin/rank-mcp.ts
```

Or as JSON (equivalent):

```bash
claude mcp add-json rank '{"command":"bun","args":["<repo>/packages/rank-mcp/bin/rank-mcp.ts"],"env":{"CONVEX_URL":"https://perceptive-cow-413.convex.cloud"}}'
```

Verify:

```bash
claude mcp list
```

Then in session, `/mcp` shows server status. Available tools: `rank_doctor`,
`rank_describe_environment`, `rank_list_capabilities`, `rank_evaluate_prospect`
(text plus `structuredContent` with run ID, state, judgment, scores, reasons,
and provenance).

## CLI (scripted work)

```bash
bun <repo>/packages/rank-cli/bin/rank.ts evaluate --url <prospect-url> --json
bun <repo>/packages/rank-cli/bin/rank.ts doctor
```

`--json` output is stable for agent parsing. Never prompt-gate on it: the CLI
already skips prompts when stdout is not a TTY or `--json` is passed.

## Limits

- `MAX_MCP_OUTPUT_TOKENS` defaults to 25,000. Large evaluations can hit it;
  raise it or read `structuredContent`, which stays small.
- Prefer `--scope project` so the team shares one server entry (scopes are
  `local`, `project`, or `user`).
- On Windows, wrap the spawn in `cmd /c` so the process terminates cleanly.
- There is no MCP-over-HTTP server, so `--transport http` has nothing to
  point at.
