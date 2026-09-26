# rank-mcp

A Model Context Protocol server exposing Rank over stdio. Tool names come from `config/capabilities.json`, so this server can only advertise capabilities the CLI and HTTP surfaces also expose.

## Run it

```bash
bun install --cwd packages/rank-mcp
bun run packages/rank-mcp/bin/rank-mcp.ts
```

The server speaks MCP over stdin and stdout. stdout carries protocol frames only, so every diagnostic goes to stderr.

## Client configuration

```json
{
  "mcpServers": {
    "rank": {
      "command": "bun",
      "args": ["run", "/path/to/rank/packages/rank-mcp/bin/rank-mcp.ts"]
    }
  }
}
```

## Tools

| Tool | Capability | What it returns |
|---|---|---|
| `rank_doctor` | `env.doctor` | The environment preflight report, grouped by pipeline stage |
| `rank_describe_environment` | `env.describe` | Every variable Rank reads, who consumes it, and what breaks without it |
| `rank_list_capabilities` | `capabilities.list` | Every capability and its CLI, MCP, and HTTP surfaces |

Tools take no arguments today. A tool with a failing implementation returns a readable error as tool content rather than breaking the transport, and a tool the registry advertises but the server does not implement is reported on stderr at startup.

Secrets are masked in every response. `rank_doctor` resolves from local sources only and does not shell out to the Convex CLI, because a tool call should not spawn a subprocess.

## Adding a tool

1. Add the capability to `config/capabilities.json` with all three surfaces.
2. Implement it in `src/mcp/tools.ts` and export it from `TOOLS`.
3. Run `pnpm check:surfaces`, then `bun test packages/rank-mcp`.

Step 3 fails if the registry and the implementation disagree, which is the point.

## Layout

```text
packages/rank-mcp/
├── bin/rank-mcp.ts    # entrypoint
└── src/mcp/
    ├── types.ts       # tool definition and context types
    ├── server.ts      # MCP server wiring
    ├── tools.ts       # one implementation per capability
    └── helpers/       # pure tool-definition derivation
```

## Tests

```bash
bun test packages/rank-mcp
bun run packages/rank-mcp typecheck
```

The tests connect a real MCP client over an in-memory transport, so protocol wiring is covered, not just the tool bodies.
