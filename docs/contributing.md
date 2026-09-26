# Contributing

## Development loop

```bash
pnpm install
pnpm test
pnpm build
pnpm mock:verify
```

## Pre-push checks

Install the repository's local Git hooks after cloning:

```bash
pnpm exec lefthook install
```

Before pushing, Lefthook runs the checks listed in `lefthook.yml`. Run the same
gate manually with:

```bash
pnpm run check:pre-push
```

The hook is a local guardrail, not a substitute for CI: local hooks may not be
installed or may be bypassed, so CI should run `pnpm run check:pre-push`
independently.

Runtimes are split by area, not by preference. The repository itself installs,
tests, and builds with pnpm and Node. The `rank-core`, `rank-cli`, and
`rank-mcp` tooling packages run their type checks and tests under Bun
(`pnpm run check:tooling`), so install Bun as well before running the full
pre-push gate.

## Machine changes

1. Change or add the machine under `lib/xstate/<domain>/machine.ts`.
2. Add or update its colocated `machine.test.ts`.
3. Update the machine's stable `id` or `version` when its persisted contract changes.
4. Regenerate the manifest, inventory, and machine diagram:

```bash
pnpm run generate:machine-docs
```

5. Run `pnpm run check:machine-docs` and `pnpm run check:project-docs`.
6. Review the generated diff. The manifest, the marked inventory in
   `docs/xstate/machines.md`, and `docs/diagrams/machine-pipeline.mmd` are
   generated from machine source; edit the source and regenerate rather than
   hand-editing those generated sections.

External provider calls belong in Convex actions. Keep machine transitions deterministic and serializable.

## Code boundaries

- Use the `lib/{library}/{domainname}/helpers/` structure.
- Keep helpers pure and explicitly re-exported.
- Keep provider secrets in the runtime environment.
- Do not document a provider, endpoint, or machine state until its implementation and tests exist.

## XState references

The project uses the published v6 alpha package. Refresh the upstream reference pages with:

```bash
pnpm docs:xstate
```
