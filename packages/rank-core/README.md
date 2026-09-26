# rank-core

Domains shared by every Rank tool. The CLI and the MCP server both import from here, so they read the same environment manifest, touch the filesystem the same way, and describe Rank's capabilities identically.

## Domains

| Domain | Responsibility | Notes |
|---|---|---|
| `env` | Resolve an environment manifest against the process, an env file, and the Convex deployment | Pure. No filesystem, no process access |
| `workspace` | The only module that reads files or resolves the repository root | Returns typed views of the manifest and the registry |
| `convex` | The only module that shells out to the Convex CLI | Degrades to a null result instead of throwing |
| `capabilities` | The capability registry and its consistency checks | Pure |

## The two source-of-truth files

- `config/env-vars.json` — every environment variable Rank reads, who consumes it, whether it is required, what it falls back to, and what breaks without it.
- `config/capabilities.json` — every capability and the CLI command, MCP tool, and HTTP route that expose it.

Both are read by the CLI, the MCP server, and the Convex HTTP routes. `pnpm check:surfaces` fails when a surface drifts from either file, so a capability cannot be advertised on one surface and missing on another.

## Layout

```text
packages/rank-core/src/
├── capabilities/     # registry types, consistency helpers
├── convex/           # deployment-env.ts, the Convex CLI boundary
├── env/              # env.ts plus pure helpers
└── workspace/        # workspace.ts, the filesystem boundary
```

## Tests

```bash
bun test packages/rank-core
bun run packages/rank-core typecheck
```
