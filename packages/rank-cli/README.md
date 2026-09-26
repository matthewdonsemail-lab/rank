# rank-cli

Command line access to Rank. Built with [Bun](https://bun.sh); the entrypoint is a thin wrapper and all behaviour lives in testable modules.

## Commands

| Command | What it does |
|---|---|
| `rank install` | Check prerequisites (Bun, Convex CLI, Node), confirm `.env.local` exists, and point at `rank doctor` |
| `rank doctor` | Resolve every environment variable Rank reads and fail if a required one is missing |
| `rank doctor --json` | Same check, machine-readable, for CI |
| `rank doctor --local` | Skip the Convex deployment lookup, for offline or faster runs |
| `rank env` | List each variable, who consumes it, and what breaks without it |
| `rank capabilities` | List every capability and the CLI, MCP, and HTTP surfaces exposing it |

## Install

From a checkout:

```bash
bun install --cwd packages/rank-cli
bun run packages/rank-cli/bin/rank.ts install
```

Or wire it into a package script:

```bash
pnpm cli:doctor
```

## How a variable is resolved

Order matters, because Convex reads app and auth variables from the deployment rather than from a local file:

1. the process environment, so one command can override
2. `.env.local` in the repository root
3. the linked Convex deployment, via `convex env list`

A value found in more than one place is reported with every origin. A `local` scope variable ignores the deployment, because the deployment never provides it.

Secrets are never printed in full: they are shown as a short prefix and suffix with a character count. An unset variable shows its documented fallback, or `(unset)` when the stage would fail closed, and is never masked.

## Layout

Follows the repository convention documented in [`docs/naming-conventions.md`](../../docs/naming-conventions.md):

```text
packages/rank-cli/
├── bin/rank.ts                    # entrypoint: argv in, exit code out
└── src/cli/
    ├── types.ts                   # Command and CommandContext
    ├── cli.ts                     # command registry and dispatcher
    ├── commands/                  # one file per command
    └── helpers/usage.ts           # usage text generated from the registry
```

Shared domains live in [`packages/rank-core`](../rank-core/README.md) so the CLI and the MCP server cannot disagree about the environment.

## Tests

```bash
bun test packages/rank-cli
bun run packages/rank-cli typecheck
```
