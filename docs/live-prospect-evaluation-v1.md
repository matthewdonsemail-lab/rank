# Live Prospect Evaluation v1

The first milestone is deliberately narrow: **one brand → one discovery run → a handful of candidates → one real homepage read and rerank → a saved judgment a human can inspect.** Nothing contacts a prospect. Outreach automation is explicitly out of scope until this bar is met.

This checklist records verified current state, not intent. Every claim below was checked against the code at the time of writing.

## Credentials on the development deployment

Every variable the code reads is now declared in `convex/convex.config.ts`, so nothing is unsettable by construction. Current state:

| Variable | State | Effect when missing |
|---|---|---|
| `FIRECRAWL_API_KEY` | set | Brand/source reads fail; run status records it |
| `TYPESAFE_API_KEY` | set | Judgment step fails closed |
| `TYPESAFE_DEFAULT_MODEL` | set to `jev-latest` | Falls back to `jev-latest` in code anyway |
| `CLERK_JWT_ISSUER` / `CLERK_JWT_AUDIENCE` | set | No authenticated callers |
| `NEBIUS_API_KEY` | **not set** | Rerank records `skipped` with "NEBIUS_API_KEY is not set"; candidates keep discovery order |
| `NEBIUS_BASE_URL` / `DEFAULT_RANK_MODEL` | not set | Code defaults apply: `https://api.tokenfactory.nebius.com/v1` and the built-in rerank model |
| `FIRECRAWL_WEBHOOK_SECRET` | not set | Crawl completion callbacks in `webhook` mode are unverified; use `poll` mode or set it |

`CLERK_JWT_*` are read by `convex/auth.config.ts`, which Convex validates separately from the app env table. `FIRECRAWL_*` and `TELNYX_*` are forwarded into their components' own env namespaces through `app.use(...)`, so Rank's code never reads them directly.

Setting a credential is not the same as verifying the stage. Every open box below still needs an observed run.

## Scope

In scope:

- Brand grounding and source enrichment through the Firecrawl boundary
- Competitor discovery through the Treg boundary
- Candidate homepage reads, reranking, and the `act` / `review` / `drop` judgment
- A human being able to inspect the evidence behind a judgment

Out of scope for this milestone: unattended sending, follow-up sequences, and the SMS channel.

## Acceptance criteria

### 1. Brand facts are real, sourced, and failures are visible

- [x] Brand facts persist with source URLs and an inspectable run status
- [x] Brand/save boundary never invents facts when a read fails
- [ ] One real brand verified end to end on a development deployment with `FIRECRAWL_API_KEY` set

### 2. Discovery returns normalized candidates with run metadata

- [x] Candidates normalized to URLs/domains with provider and run metadata recorded
- [ ] One real discovery request verified end to end, with cost and error surface recorded

### 3. A candidate page is actually fetched, and the evidence is inspectable

- [x] Homepages are fetched for up to `MAX_HOMEPAGES` candidates, five at a time (`convex/prospectEvaluation.ts:629`)
- [x] Whether a page was read is recorded per prospect (`metrics.homepageRead`)
- [ ] **Gap:** only a boolean is stored. The fetch timestamp, per-candidate fetch error, and page title/description/excerpt as *evidence* are not persisted separately, so a reviewer cannot see exactly what the reranker read or why a read failed.
- [ ] Candidates beyond the homepage cap are ranked on discovery data alone. That is honest, but the record should say so explicitly rather than leaving `homepageRead: false` as the only signal.

### 4. Reranking runs remotely and records its provenance

- [x] `convex/prospectEvaluation.ts:636` constructs `NebiusRerankClient` when `NEBIUS_API_KEY` is set, so the rerank step is in the run path
- [x] An unranked list is never stored as ranked: `rankCandidates` keeps discovery order and records `skipped` or `failed` in `metrics.rerankStatus`
- [x] Fake-network tests cover request/response handling
- [x] `NEBIUS_API_KEY` is declared in `convex/convex.config.ts` so it can be set on a deployment
- [ ] **Gap:** provenance is dropped. `metrics` stores `rerankScore` and the `rerankStatus` string only — the `RankStatus` reason, the rerank model, and latency are computed and then discarded.
- [ ] **Gap:** the client has never been exercised against the Token Factory API. Set `NEBIUS_API_KEY` and run one real candidate.
- [ ] `baselineRank` stays test-only and must never be reachable from a Convex action.

### 5. The judgment is schema-valid, evidence-linked, and fails safe

- [x] `TypeSafeEvaluator` returns a validated `act` / `review` / `drop` decision with confidence and reasons
- [x] Missing evidence or a failed call routes to `review` or `failed` rather than an optimistic `act`
- [x] `drop` rows stay queryable for audit and are never silently deleted
- [ ] One real judgment inspected end to end, with the evidence that produced it

### 6. A human can inspect and change the disposition, auditably

- [x] Read paths exist: `getProspectEvaluation`, `listActiveProspects`, `listReviewProspects`, `listDroppedProspects`
- [ ] **Gap:** there is no mutation to change or approve a judgment. `convex/prospectEvaluation.ts` exposes create/save/advance/retry/cancel and read queries, and nothing else. The only `APPROVE` in the repo is the outbound guest-post draft event (`convex/outbound.ts:115`), which is a later stage.
- [ ] No audit record of a human decision, so a changed disposition cannot be distinguished from a model one.

### 7. Re-runs are safe

- [x] A repeat run does not overwrite prior judgments; each run creates its own row
- [ ] **Verify:** a repeated run against the same discovery run does not create uncontrolled duplicates
- [ ] **Verify:** a transient provider failure produces `skipped`/`failed`, never a false `drop`

### 8. Test coverage for the failure paths

- [x] Success path
- [x] Missing credentials (`rankCandidates` returns `skipped` with a reason)
- [x] Provider timeout/error (`rankCandidates` returns `failed` with a reason)
- [x] Malformed model output (client response validation)
- [ ] Unreadable candidate page asserted end to end through the evaluation action
- [ ] Duplicate/retry behavior asserted end to end

## Definition of done

1. One real brand, one discovery run, a handful of candidates, one real rerank, and a saved judgment inspected by a human.
2. Rerank provenance (model, reason, latency) and homepage fetch evidence are persisted, not discarded.
3. A human can change a disposition and the change is auditable.
4. Every box above that is unticked is either done or explicitly deferred with a reason.

## Related, deliberately not started

- Agent reasoning still uses the Agent component's `mockModel`; replacing it is a separate milestone.
- The AgentMail transport boundary is mounted but credentials are not configured, and no complete send → reply → follow-up path has been verified.
- Telnyx SMS is mounted as a component (`convex/telnyx.ts`, `/telnyx/webhook`) and is **not** part of this flow. Rank's own schema has no SMS tables; the component keeps messages and webhook events in its own isolated partition. Treat SMS as a separate channel with its own consent and opt-out design, and do not reuse email fields.
- Whether `prospectEvaluations` is the durable opportunity record or only a run record is still open. Outbound threads reference prospect details embedded in context rather than a stable prospect ID. Decide before adding message tables.
