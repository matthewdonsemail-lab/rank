# Convex Agent Component Boundary

`@convex-dev/agent` is installed and mounted in the Convex app. It is the reasoning boundary for the outbound thread machine, while AgentMail remains the transport boundary. The current `mockModel` is an explicit placeholder until a Nebius model adapter is configured.

## Current boundary

- `convex/agent.ts` uses the Agent component's typed `mockModel` as an explicit placeholder until a Nebius model adapter is configured.
- `startOutboundReasoning` creates a persistent Agent thread with the explicit guest-post goal, brand voice, prospect context, confidence, and deal likelihood.
- The returned `agentThreadId` is linked to the outbound state through `linkAgentThread`; it is not treated as an AgentMail thread ID.
- `convex/email.ts` owns the separate AgentMail transport and inbound-label bridge.
- `act` prospect records remain the input to future outreach preparation, while TypeSafe remains the source of initial prospect judgment.

## Nebius adapter boundary

A future Nebius token-factory adapter should:

1. Read the owner-scoped outbound thread and its brand/prospect context.
2. Build the same versioned prompt contract used by `buildOutboundReplyPrompt`.
3. Call the configured Nebius model through a dedicated adapter.
4. Validate the JSON analysis result before sending `ANALYSIS_READY` to the machine.
5. Keep credentials, model clients, and live sockets outside machine context.

The outbound machine and mock Agent route are implemented; live model execution is not.

See [the machine contracts](../../../xstate/machines.md) and [the backend reference](../../../backend-reference.md).
