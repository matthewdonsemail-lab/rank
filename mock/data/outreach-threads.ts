import { createActor } from "xstate";
import { outboundThreadMachine } from "../../lib/xstate/outbound/index.ts";
import type {
  OutboundBrandContext,
  OutboundProspect,
  OutboundThreadContext,
  OutboundThreadEvent,
  OutboundThreadInput,
} from "../../lib/xstate/outbound/index.ts";
import type { DocBackingMetadata, OutboundThread } from "../schema.ts";

export const docBacking: DocBackingMetadata = {
  docPath: "docs/convex/components/agentmail/README.md",
  specSection: "Threads and Human Review",
  specUrl: "https://agentmail.to/docs/threads",
  requiredFields: ["id", "owner", "campaignId", "state", "context", "labels"],
  lastVerified: "2026-09-25",
};

const firstInput: OutboundThreadInput = {
  owner: "usr_rank_01",
  campaignId: "outbound_campaign_01",
  prospect: {
    name: "Avery Editor",
    email: "avery@example.com",
    url: "https://example.com",
    publication: "Example Journal",
    fitRationale: "Strong topical fit and prior guest contributions.",
  },
  brand: {
    name: "Rank",
    voice: "direct, useful, evidence-led",
    guestPostAngle: "A practical guide to evaluating link opportunities.",
  },
  createdAt: 1758758400000,
};

const secondInput: OutboundThreadInput = {
  owner: "usr_rank_01",
  campaignId: "outbound_campaign_02",
  prospect: {
    name: "Morgan Editor",
    email: "morgan@another.example",
    url: "https://another.example",
    publication: "Another Journal",
    fitRationale: "Relevant audience with a clear guest-post program.",
  },
  brand: firstInput.brand,
  createdAt: 1758758400000,
};

function snapshotFor(input: OutboundThreadInput, events: OutboundThreadEvent[]): unknown {
  const actor = createActor(outboundThreadMachine, { input }).start();
  for (const event of events) actor.send(event);
  return JSON.parse(JSON.stringify(actor.getPersistedSnapshot()));
}

function fixture(
  id: string,
  input: OutboundThreadInput,
  events: OutboundThreadEvent[],
  state: OutboundThread["state"],
  labels: string[],
): OutboundThread {
  const snapshot = snapshotFor(input, events);
  const context = (snapshot as { context: OutboundThreadContext }).context;
  return {
    id,
    owner: input.owner,
    campaignId: input.campaignId,
    state,
    context,
    labels,
    nextFollowUpAt: context.nextFollowUpAt ?? undefined,
    createdAt: input.createdAt,
    updatedAt: context.updatedAt,
    snapshot,
  };
}

export const mockOutboundThreadsData: OutboundThread[] = [
  fixture(
    "outbound_thread_01",
     firstInput,
     [
       { type: "START", at: 1758758401000 },
       { type: "ATTACH_AGENT_THREAD", at: 1758758401100, threadId: "ath_rank_02" },
       {
         type: "ATTACH_AGENTMAIL_THREAD",
         at: 1758758401200,
         threadId: "mth_rank_01",
         inboxId: "outbound_inbox_01",
       },
       {
        type: "DRAFT_READY",
        at: 1758758402000,
        draft: {
          subject: "A practical link-quality field guide for Example Journal",
          text: "Hi Avery, I have a practical field guide that your readers would find useful.",
          labels: ["outbound", "guest-post"],
        },
      },
      { type: "APPROVE", at: 1758758403000 },
      { type: "SEND", at: 1758758404000, idempotencyKey: "outbound_delivery_01" },
      { type: "SENT", at: 1758758405000, messageId: "outbound_message_01", threadId: "mth_rank_01" },
      { type: "REPLY_RECEIVED", at: 1758758460000, messageId: "outbound_reply_01", threadId: "mth_rank_01" },
      {
        type: "ANALYSIS_READY",
        at: 1758758461000,
        analysis: {
          intent: "interested",
          sentiment: 0.72,
          confidence: 0.9,
          dealLikelihood: 0.78,
          nextAction: "qualify",
          labels: ["reply:positive"],
          rationale: "The editor asked for a pitch and publication timeline.",
        },
      },
    ],
    "engaged",
    ["outbound", "guest-post", "deal:high"],
  ),
  fixture(
    "outbound_thread_02",
    secondInput,
    [
      { type: "START", at: 1758758401000 },
      { type: "ATTACH_AGENT_THREAD", at: 1758758401100, threadId: "ath_rank_02" },
      {
        type: "ATTACH_AGENTMAIL_THREAD",
        at: 1758758401200,
        threadId: "mth_rank_02",
        inboxId: "outbound_inbox_02",
      },
    ],
    "drafting",
    ["outbound", "guest-post", "drafting"],
  ),
];

export function handleGetOutboundThreads(filter?: {
  owner?: string;
  campaignId?: string;
  state?: string;
}): OutboundThread[] {
  return mockOutboundThreadsData.filter((thread) => {
    return (
      (!filter?.owner || thread.owner === filter.owner) &&
      (!filter?.campaignId || thread.campaignId === filter.campaignId) &&
      (!filter?.state || thread.state === filter.state)
    );
  });
}

export function createOutboundThread(input: {
  owner: string;
  campaignId: string;
  prospect: OutboundProspect;
  brand: OutboundBrandContext;
  now?: number;
}): OutboundThread {
  const now = input.now ?? Date.now();
  const actor = createActor(outboundThreadMachine, {
    input: { ...input, createdAt: now },
  }).start();
  actor.send({ type: "START", at: now });
  const snapshot = JSON.parse(JSON.stringify(actor.getPersistedSnapshot()));
  const context = (snapshot as { context: OutboundThreadContext }).context;
  return {
    id: `outbound_thread_${now}`,
    owner: input.owner,
    campaignId: input.campaignId,
    state: "drafting",
    context,
    labels: context.labels,
    createdAt: now,
    updatedAt: now,
    snapshot,
  };
}

export function transitionOutboundThread(thread: OutboundThread, event: OutboundThreadEvent): OutboundThread {
  const actor = createActor(outboundThreadMachine, {
    input: {
      owner: thread.context.owner,
      campaignId: thread.context.campaignId,
      prospect: thread.context.prospect,
      brand: thread.context.brand,
      createdAt: thread.context.createdAt,
    },
    snapshot: thread.snapshot as never,
  }).start();
  actor.send(event);
  const snapshot = JSON.parse(JSON.stringify(actor.getPersistedSnapshot()));
  const context = (snapshot as { context: OutboundThreadContext }).context;
  return {
    ...thread,
    state: (snapshot as { value: OutboundThread["state"] }).value,
    context,
    labels: context.labels,
    nextFollowUpAt: context.nextFollowUpAt ?? undefined,
    updatedAt: context.updatedAt,
    snapshot,
  };
}
