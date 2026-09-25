# Agent Component Architecture

The Agent component is mounted as an isolated Convex sandbox with its own thread and message tables. It is the reasoning boundary for outbound reply analysis, separate from AgentMail transport.

## Current flow

```text
Owner-scoped outbound thread
        |
        v
Convex Agent action
        |
        +--> read brand, prospect, goal, confidence, and deal likelihood
        +--> build versioned outbound prompt
        +--> create persistent Agent thread
        +--> return analysis text for validation
        +--> link agentThreadId to outbound machine context
```

`convex/agent.ts` currently uses the component's typed `mockModel` as an explicit placeholder until a Nebius token-factory adapter is configured. `convex/email.ts` remains responsible for AgentMail messages and inbound labels.

The outbound machine is `outboundThreadMachine`; enrichment, competitor discovery, and prospect evaluation remain separate upstream machines. A live model adapter must validate its JSON result before sending `ANALYSIS_READY`, and credentials/live clients must stay outside machine context.
