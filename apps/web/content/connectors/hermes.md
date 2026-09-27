# Hermes Agent connector for Rank

Hermes Agent (NousResearch) consumes Rank over MCP (stdio) for tool calls and
over the `rank` CLI for scripted work. Both routes reuse the operator's
`.rank/` session from a prior `rank login`; neither mints identities.

Sources: [Use MCP with Hermes](http://hermes-agent.nousresearch.com/docs/guides/use-mcp-with-hermes),
[MCP Config Reference](http://hermes-agent.nousresearch.com/docs/reference/mcp-config-reference),
[MCP (Model Context Protocol)](http://hermes-agent.nousresearch.com/docs/user-guide/features/mcp).

## MCP (tool calls)

Add one server to `config.yaml`. Replace `<repo>` with the absolute path of
this repository checkout. Authenticate first with `rank login`, or export
`CONVEX_URL` and `RANK_AUTH_TOKEN` in the server environment.

```yaml
mcp_servers:
  rank:
    command: "bun"
    args: ["<repo>/packages/rank-mcp/bin/rank-mcp.ts"]
    env:
      CONVEX_URL: "https://perceptive-cow-413.convex.cloud"
```

Then start Hermes (`hermes chat`) and verify: the banner/status shows the MCP
integration, or run `hermes mcp test rank` from a shell — it connects, lists
the discovered tools, and exits `0` on success. Reload after config changes
with `/reload-mcp`.

Available tools: `rank_doctor`, `rank_describe_environment`,
`rank_list_capabilities`, `rank_evaluate_prospect` (text plus
`structuredContent`).

## CLI (scripted work)

```bash
bun <repo>/packages/rank-cli/bin/rank.ts evaluate --url <prospect-url> --json
```

## Limits

- Start with this one server and ask Hermes what tools it sees before adding
  more.
- Coming from Claude Code? `hermes import-agent claude-code` migrates the MCP
  block, skills, and instructions automatically.
- There is no MCP-over-HTTP server, so the `url` form has nothing to point at.
