# XState v6

This directory contains the project-specific XState v6 contracts and links to the upstream reference installed by `pnpm docs:xstate`.

- Package: `xstate`
- Installed version: `xstate@6.0.0-alpha.59`
- Upstream index: `https://stately.ai/llms.txt`
- Upstream v6 pages: `docs/xstate/upstream/docs/xstate/v6/`
- Project machine sources: `lib/xstate/**/machine.ts`

## Contents

- [Machine contracts](machines.md)
- [Setup](setup.md)
- [Actors](actors.md)
- [Persistence](persistence.md)
- [Testing](testing.md)

The project uses XState as a serializable transition model. Convex owns durable workflow records and performs external operations; it does not depend on an actor remaining alive between requests.
