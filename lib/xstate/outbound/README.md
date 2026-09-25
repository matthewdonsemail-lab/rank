# Outbound Thread Machine

`outboundThreadMachine` is an XState v6 machine for owner-scoped guest-post outreach.
The outbound machine models one contact conversation inside a guest-post campaign. A campaign owns many threads; each thread keeps its own persisted XState snapshot and provider links.

## Provider separation

- `agentThreadId` identifies the Convex Agent reasoning conversation.
- `agentMailThreadId` identifies the AgentMail email thread.
- `agentMailInboxId` identifies the shared inbox selected for delivery; `ASSIGN_INBOX` writes that provider ID into the state context before the first send.
- `agentMailMessageId` identifies the latest sent or received message.
- `idempotencyKey` protects one delivery attempt from duplicate sends.

Agent and AgentMail identifiers are intentionally independent. The Agent may reason about an email without owning the transport thread, and the same email may be reviewed by multiple Agent conversations.

## States

| State | Meaning |
| --- | --- |
| `idle` | Thread record exists but outreach has not started. |
| `drafting` | A personalized guest-post pitch is being prepared. |
| `review_required` | Draft is waiting for human approval. |
| `ready_to_send` | Approved draft is ready for an assigned inbox. |
| `sending` | A delivery attempt has an idempotency key. |
| `awaiting_reply` | First message was accepted; the thread is waiting for response. |
| `analyzing_reply` | Reply sentiment, intent, confidence, and deal likelihood are being judged. |
| `follow_up_scheduled` | A follow-up time is stored in context. |
| `follow_up_due` | The scheduler has released the follow-up. |
| `engaged` | The reply is positive or asks a qualifying question. |
| `negotiating` | The publication is discussing terms or timing. |
| `scheduled` | A guest post is agreed and scheduled. |
| `closed_won` | The collaboration completed successfully. |
| `closed_lost` | The prospect declined or the opportunity expired. |
| `failed` | Delivery or analysis failed and can be retried. |
| `cancelled` | The campaign or thread was stopped. |

## Reply resolution

`DELIVERY_BOUNCED` moves sending or waiting conversations to `failed` with a bounce label. `ANALYSIS_READY` stores the judge's result and resolves the state from intent:

- `interested` and `question` -> `engaged`
- `accepted` -> `scheduled`
- `negative` -> `closed_lost`
- `bounce` -> `failed`
- `unknown` -> `review_required`

A human can send `REANALYZE` from `review_required` to produce a new judgment without losing the original thread context. The context also stores generated labels for intent, sentiment band, confidence band, deal-likelihood band, and next action. The state machine never sends automatically after a reply; a follow-up must be scheduled and pass through the same approval boundary.

## Domain and inbox pool

A user can register many verified sending domains. For each domain, Rank creates shared inbox addresses using the user's name as the local part, for example `avery@outreach.example.com`. The pool stores daily limits, warm-up status, and sent counts so a scheduler can choose a healthy inbox without overloading one address.

## Persistence

Use `JSON.stringify(actor.getPersistedSnapshot())` for storage and pass the parsed value as `snapshot` when restoring the actor. The Convex `outboundThreads.context` field stores the machine context, while the top-level state and labels support indexed queues.
