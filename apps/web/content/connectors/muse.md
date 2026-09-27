# Muse connector for Rank

> **Status: design draft for remote use, working locally.** Muse builds remote
> connectors from OpenAPI plus OAuth or API key. Rank has no public REST API
> and no OAuth/API-key issuer — `convex/http.ts` serves three read-only
> metadata routes plus provider webhooks, and `prospect.evaluate` over HTTP is
> explicitly deferred in `config/capabilities.json`. Do not hand Muse the
> `openapi-rank.yaml` paths in this directory as callable; they are a design
> draft, labeled as such. What works today is below.

## What works today

If the Muse environment has this repository checked out with `bun` available,
it can use Rank exactly like any other local agent surface:

- **CLI (scripted):** `bun <repo>/packages/rank-cli/bin/rank.ts evaluate --url <prospect-url> --json`,
  plus `rank doctor`, `rank whoami`, `rank capabilities`. Authenticate first
  with `rank login`; the session lives in `.rank/`.
- **MCP (tools):** spawn `bun <repo>/packages/rank-mcp/bin/rank-mcp.ts` over
  stdio. Same four tools as every other MCP client (`rank_doctor`,
  `rank_describe_environment`, `rank_list_capabilities`,
  `rank_evaluate_prospect` with text plus `structuredContent`).

Both routes reuse the operator's `.rank/` session; neither mints identities.

## What a real remote Muse connector needs

A reachable HTTPS endpoint exposing real operations, with auth, ownership
checks, rate limits, idempotency, and documented errors. Concretely:

1. An authenticated public route for `prospect.evaluate` (currently deferred —
   see the `connectors.list` catalog entry and `config/capabilities.json`).
2. An OAuth or API-key issuer for Muse to authenticate against.
3. An OpenAPI document generated from those routes — not the draft in
   `openapi-rank.yaml`, which must be reconciled or retired at that point.

Until then, any Muse connector claiming these endpoints is calling fiction.

## Limits

- Muse connectors run in Meta's cloud, not on the operator's machine, so a
  local checkout is out of reach for the standard custom-connector flow.
- The scraped reference files in this directory (`connector-platform.html`,
  `help-center-connectors.html`, `muse-code*.html`) describe Meta's platform,
  not Rank; they are context, not a contract.
