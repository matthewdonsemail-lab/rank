# Muse connector for Rank

Codex consumes Rank over MCP (stdio) for tool calls and over the `rank` CLI
for scripted work. Both routes reuse the operator's `.rank/` session from a
prior `rank login`; neither mints identities.

Sources: [MCP Server Configuration](https://deepwiki.com/openai/codex/6.1-mcp-server-configuration),
[codex mcp subcommand](https://codex.danielvaughan.com/2026/05/07/codex-mcp-subcommand-managing-mcp-servers-from-the-terminal),
[MCP.Directory setup guide](https://mcp.directory/clients/codex).

## MCP (tool calls)

Declare the server under `[mcp_servers]` in `config.toml`. Replace `<repo>`
with the absolute path of this repository checkout. Authenticate first with
`rank login`, or export `CONVEX_URL` and `RANK_AUTH_TOKEN` in the server
environment.

```toml
[mcp_servers.rank]
command = "bun"
args = ["<repo>/packages/rank-mcp/bin/rank-mcp.ts"]

[mcp_servers.rank.env]
CONVEX_URL = "https://perceptive-cow-413.convex.cloud"
```

Verify with `codex mcp list`. Available tools: `rank_doctor`,
`rank_describe_environment`, `rank_list_capabilities`, `rank_evaluate_prospect`
(text plus `structuredContent`).

## CLI (scripted work)

```bash
bun <repo>/packages/rank-cli/bin/rank.ts evaluate --url <prospect-url> --json
```

## Limits

- The table is `[mcp_servers]` — the `[mcp.servers.*]` spelling is silently
  ignored ([openai/codex#3441](https://github.com/openai/codex/issues/3441)).
- Every stdio entry must declare `command`; there is no default binary.
- `codex mcp add` covers transport, env, and bearer tokens; timeouts and tool
  allowlists need direct TOML edits.
- There is no MCP-over-HTTP server, so the `url` form has nothing to point at.
