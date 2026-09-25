# Self-Hosting

These instructions cover the repository's current library, mock, and Convex development setup. They do not describe a production public API because that surface is not implemented yet.

## Local Setup

```bash
pnpm install
Copy-Item .env.example .env.local
```

Populate the credentials required by the workflows you intend to run:

```env
NEBIUS_API_KEY=
NEBIUS_BASE_URL=https://api.tokenfactory.nebius.com/v1

FIRECRAWL_API_KEY=
TYPESAFE_API_KEY=
TYPESAFE_BASE_URL=https://api.typesafe.ai
TYPESAFE_DEFAULT_MODEL=jev-latest

TREG_TOKEN=
CONVEX_DEPLOYMENT=dev:your-deployment
```

`NebiusRerankClient` calls the Nebius Token Factory rerank endpoint and requires `NEBIUS_API_KEY`; without it `rerank()` throws instead of returning an unranked list. The default model is `Qwen/Qwen3-Reranker-8B`; set `DEFAULT_RANK_MODEL` to use another rerank model your account can access. It has not yet been run against the live API.

## Verify the Repository

```bash
pnpm test
pnpm build
pnpm mock:verify
pnpm check:machines
pnpm check:docs
```

The mock server is a fixture server for the existing brand, ranking, Convex component, contact-resolution, outbound, provider-adapter, and Treg routes. It is not a production substitute for provider calls.

## Convex Development

```bash
pnpm convex:dev
```

The current Convex workflows are:

- `convex/enrichment.ts`
- `convex/competitorDiscovery.ts`
- `convex/prospectEvaluation.ts`
- `convex/outbound.ts`
- `convex/agent.ts`
- `convex/email.ts`

Each action restores a versioned XState v6 machine, performs one external step, and persists the next state and serializable context.

## Provider Boundaries

- Firecrawl credentials are used by the crawl wrapper and enrichment action.
- Treg credentials are used by competitor discovery.
- `TYPESAFE_API_KEY` is used by prospect evaluation.
- `AGENTMAIL_API_KEY` and `AGENTMAIL_WEBHOOK_SECRET` are required only for live AgentMail transport and signed inbound webhooks.
- The Agent component currently uses `mockModel`; a Nebius token-factory adapter is not configured.
- Machine context must never contain provider clients, sockets, promises, or secrets.

## Upgrading XState References

The project is pinned to the published v6 alpha line:

```bash
pnpm docs:xstate
```

This downloads the authoritative Stately v6 pages with `curl.exe` into the ignored `docs/xstate/upstream/` directory. Project-specific machine contracts remain in `docs/xstate/machines.md` and are checked against source by the machine documentation hook.
