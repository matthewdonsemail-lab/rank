# Contributing

## Development loop

```bash
pnpm install
pnpm test
pnpm build
pnpm mock:verify
```

## Machine changes

1. Change or add the machine under `lib/xstate/<domain>/machine.ts`.
2. Add or update its colocated `machine.test.ts`.
3. Update the machine's stable `id` or `version` when its persisted contract changes.
4. Regenerate the manifest, inventory, and machine diagram:

```bash
node scripts/check-machine-docs.mjs --write
```

5. Run `pnpm check:machines` and `pnpm check:docs`.

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
