# Machine Contracts

The machine files under `lib/xstate/**/machine.ts` are the source of truth for workflow states, events, and versioned snapshots. The inventory below is generated and checked by `scripts/check-machine-docs.mjs`; a machine cannot be added, removed, or changed without updating the tracked manifest, this document, and the machine diagram.

The runtime is XState v6 (`xstate@6.0.0-alpha.59`). Upstream v6 references are installed locally with `pnpm docs:xstate` under `docs/xstate/upstream/`; the project contract remains in this directory.

## Machine Inventory

<!-- machine-inventory:start -->
| Source | Machine | ID | Version | States | Events | Test |
|---|---|---|---|---|---|---|
| [`lib/xstate/enrichment/machine.ts`](../../lib/xstate/enrichment/machine.ts) | `brandEnrichmentMachine` | `brand-enrichment` | `1` | idle → mapping → scraping → extracting → failed → completed → cancelled | CANCEL, EXTRACT_FAILED, EXTRACT_SUCCEEDED, MAP_FAILED, MAP_SUCCEEDED, RETRY, SCRAPE_FAILED, SCRAPE_SUCCEEDED, START | [`lib/xstate/enrichment/machine.test.ts`](../../lib/xstate/enrichment/machine.test.ts) |
| [`lib/xstate/competitor-discovery/machine.ts`](../../lib/xstate/competitor-discovery/machine.ts) | `competitorDiscoveryMachine` | `competitor-discovery` | `1` | idle → discovering → normalizing → failed → completed → cancelled | CANCEL, CANDIDATES_READY, COMPETITORS_RECEIVED, DISCOVERY_FAILED, NORMALIZATION_FAILED, RETRY, START | [`lib/xstate/competitor-discovery/machine.test.ts`](../../lib/xstate/competitor-discovery/machine.test.ts) |
| [`lib/xstate/prospect-evaluation/machine.ts`](../../lib/xstate/prospect-evaluation/machine.ts) | `prospectEvaluationMachine` | `prospect-evaluation` | `1` | idle → evaluating → failed → completed → cancelled | CANCEL, EVALUATION_FAILED, JUDGMENT_READY, RETRY, START | [`lib/xstate/prospect-evaluation/machine.test.ts`](../../lib/xstate/prospect-evaluation/machine.test.ts) |
| [`lib/xstate/contact-resolution/machine.ts`](../../lib/xstate/contact-resolution/machine.ts) | `contactResolutionMachine` | `contact-resolution` | `1` | idle → checking_domain → checking_contact → deliverable → needs_alternate → bounced → failed → cancelled | CANCEL, CONTACT_RESOLVED, CONTACT_UNRESOLVED, DELIVERY_BOUNCED, DOMAIN_UNUSABLE, DOMAIN_VERIFIED, FAIL, RETRY, START | [`lib/xstate/contact-resolution/machine.test.ts`](../../lib/xstate/contact-resolution/machine.test.ts) |
| [`lib/xstate/outbound/machine.ts`](../../lib/xstate/outbound/machine.ts) | `outboundThreadMachine` | `outboundThread` | `1` | idle → drafting → review_required → ready_to_send → sending → awaiting_reply → analyzing_reply → follow_up_scheduled → follow_up_due → engaged → negotiating → scheduled → closed_won → closed_lost → failed → cancelled | ANALYSIS_READY, APPROVE, ASSIGN_INBOX, ATTACH_AGENTMAIL_THREAD, ATTACH_AGENT_THREAD, CANCEL, CLOSE_LOST, CLOSE_WON, DELIVERY_BOUNCED, DRAFT_READY, FAIL, FOLLOW_UP_DUE, FOLLOW_UP_SENT, GUEST_POST_SCHEDULED, NEGOTIATION_STARTED, REANALYZE, REPLY_RECEIVED, RETRY, SCHEDULE_FOLLOW_UP, SEND, SENT, START | [`lib/xstate/outbound/machine.test.ts`](../../lib/xstate/outbound/machine.test.ts) |
<!-- machine-inventory:end -->

## Workflow Chain

The current backend chain is:

1. `brandEnrichmentMachine` maps and scrapes a source site, then extracts structured brand facts.
2. `competitorDiscoveryMachine` queries competitor sources and normalizes candidate domains.
3. `prospectEvaluationMachine` calls TypeSafe System One and records `act`, `review`, or `drop`.
4. `contactResolutionMachine` checks the sending domain and contact, preserving alternate-contact and bounce paths.
5. `outboundThreadMachine` turns a resolved prospect into a guest-post conversation, separates Agent reasoning from AgentMail transport, records reply intent and deal likelihood, and schedules follow-ups.

The Convex actions in `convex/enrichment.ts`, `convex/competitorDiscovery.ts`, `convex/prospectEvaluation.ts`, `convex/outbound.ts`, `convex/agent.ts`, and `convex/email.ts` perform external work or provider bridging. They restore the relevant actor from persisted state, perform one step, send a typed event, and persist the resulting v6 snapshot context. Network calls do not live in guards or transition functions.

## Persistence Contract

Each machine declares a stable `id` and `version`. Persisted actors are JSON-round-tripped before restoration. XState v5 snapshots are not treated as v6 snapshots; any future snapshot shape change requires an explicit migration or a deliberate reset. The current Convex records store the state and serializable context separately, while the machine tests verify the native v6 snapshot round trip.

## Authoring Rules

- Use `setup()` with `types<T>()` schemas or Standard Schema schemas.
- Use inline v6 transition functions and return shallow `context` patches.
- Keep external I/O in Convex actions, not machine transitions.
- Keep every state and event covered by a machine test.
- Regenerate documentation after a machine change:

```bash
node scripts/check-machine-docs.mjs --write
```
