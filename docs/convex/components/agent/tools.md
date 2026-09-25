# Agent Tools and Model Boundary

The Agent component can expose Convex functions as tools. Rank currently uses it for outbound reasoning sessions, while the transport remains in AgentMail.

The current boundary includes:

- `startOutboundReasoning` in `convex/agent.ts`.
- `buildOutboundReplyPrompt` in `lib/xstate/outbound/agent-prompt.ts`.
- `recordReplyAnalysis` in `convex/outbound.ts`.
- A mock model placeholder until a Nebius token-factory adapter is configured.

A future Nebius tool must validate its arguments, run in the correct Convex runtime, validate the returned analysis, and persist the result before the outbound machine receives `ANALYSIS_READY`. `NebiusRerankClient` calls the Nebius rerank endpoint from a library client, but it is not registered as an agent tool and no Convex function calls it yet.

See [docs/xstate/machines.md](../../../xstate/machines.md).
