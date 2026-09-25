import { createActor } from "xstate";
import { contactResolutionMachine, type ContactResolutionContext, type ContactResolutionEvent, type ContactResolutionInput } from "../../lib/xstate/contact-resolution/index.ts";
import type { ContactResolutionRecord, DocBackingMetadata } from "../schema.ts";

export const docBacking: DocBackingMetadata = {
  docPath: "docs/agentmail/email-deliverability.md",
  specSection: "Deliverability and contact resolution",
  specUrl: "https://agentmail.to/docs/email-deliverability",
  requiredFields: ["id", "owner", "state", "context", "createdAt", "updatedAt"],
  lastVerified: "2026-09-25",
};

const input: ContactResolutionInput = {
  owner: "usr_rank_01",
  domain: "example.com",
  candidateEmail: "avery@example.com",
  contactName: "Avery Editor",
  publicationUrl: "https://example.com/about",
  startedAt: 1758758400000,
};

function snapshotFor(source: ContactResolutionInput, events: ContactResolutionEvent[]): unknown {
  const actor = createActor(contactResolutionMachine, { input: source }).start();
  for (const event of events) actor.send(event);
  return JSON.parse(JSON.stringify(actor.getPersistedSnapshot()));
}

const firstSnapshot = snapshotFor(input, [
  { type: "START", at: 1758758401000 },
  { type: "DOMAIN_VERIFIED", at: 1758758402000, verificationSource: "dns", confidence: 0.9 },
  { type: "CONTACT_RESOLVED", at: 1758758403000, email: "avery@example.com", verificationSource: "publication-page", confidence: 0.88 },
]);
const firstContext = (firstSnapshot as { context: ContactResolutionContext }).context;
const secondInput: ContactResolutionInput = {
  owner: "usr_rank_01",
  domain: "another.example",
  candidateEmail: "editor@another.example",
  contactName: "Morgan Editor",
  publicationUrl: "https://another.example/about",
  startedAt: 1758758400000,
};
const secondSnapshot = snapshotFor(secondInput, [
  { type: "START", at: 1758758401000 },
  { type: "DOMAIN_VERIFIED", at: 1758758460000, verificationSource: "dns", confidence: 0.7 },
]);
const secondContext = (secondSnapshot as { context: ContactResolutionContext }).context;

export const mockContactResolutionData: ContactResolutionRecord[] = [
  {
    id: "contact_resolution_01",
    owner: input.owner,
    outboundThreadId: "outbound_thread_01",
    state: "deliverable",
    context: firstContext,
    createdAt: input.startedAt,
    updatedAt: firstContext.updatedAt,
    snapshot: firstSnapshot,
  },
  {
    id: "contact_resolution_02",
    owner: "usr_rank_01",
    outboundThreadId: "outbound_thread_02",
    state: "checking_contact",
    context: secondContext,
    createdAt: 1758758400000,
    updatedAt: secondContext.updatedAt,
    snapshot: secondSnapshot,
  },
];

export function handleGetContactResolutions(owner?: string, state?: string): ContactResolutionRecord[] {
  return mockContactResolutionData.filter((resolution) => {
    return (!owner || resolution.owner === owner) && (!state || resolution.state === state);
  });
}

export function createContactResolutionRecord(input: {
  owner: string;
  outboundThreadId?: string;
  domain: string;
  candidateEmail: string;
  contactName: string;
  publicationUrl: string;
  now?: number;
}): ContactResolutionRecord {
  const now = input.now ?? Date.now();
  const context: ContactResolutionContext = {
    owner: input.owner,
    domain: input.domain,
    candidateEmail: input.candidateEmail,
    contactName: input.contactName,
    publicationUrl: input.publicationUrl,
    resolvedEmail: null,
    verificationSource: null,
    confidence: null,
    reason: null,
    attempt: 0,
    checkedAt: null,
    error: null,
    startedAt: now,
    updatedAt: now,
  };
  return {
    id: `contact_resolution_${now}`,
    owner: input.owner,
    outboundThreadId: input.outboundThreadId,
    state: "idle",
    context,
    createdAt: now,
    updatedAt: now,
  };
}

export function transitionContactResolutionRecord(
  record: ContactResolutionRecord,
  event: ContactResolutionEvent,
): ContactResolutionRecord {
  const actor = createActor(contactResolutionMachine, {
    input: {
      owner: record.context.owner,
      domain: record.context.domain,
      candidateEmail: record.context.candidateEmail,
      contactName: record.context.contactName,
      publicationUrl: record.context.publicationUrl,
      startedAt: record.context.startedAt,
    },
  }).start();
  if (record.state !== "idle") {
    const snapshot = (record as ContactResolutionRecord & { snapshot?: unknown }).snapshot;
    if (snapshot) {
      const restored = createActor(contactResolutionMachine, {
        input: {
          owner: record.context.owner,
          domain: record.context.domain,
          candidateEmail: record.context.candidateEmail,
          contactName: record.context.contactName,
          publicationUrl: record.context.publicationUrl,
          startedAt: record.context.startedAt,
        },
        snapshot: snapshot as never,
      }).start();
      restored.send(event);
      const restoredSnapshot = JSON.parse(JSON.stringify(restored.getPersistedSnapshot()));
      const context = (restoredSnapshot as { context: ContactResolutionContext }).context;
      return {
        ...record,
        state: (restoredSnapshot as { value: ContactResolutionRecord["state"] }).value,
        context,
        updatedAt: context.updatedAt,
        snapshot: restoredSnapshot,
      };
    }
  }
  actor.send(event);
  const snapshot = JSON.parse(JSON.stringify(actor.getPersistedSnapshot()));
  const context = (snapshot as { context: ContactResolutionContext }).context;
  return {
    ...record,
    state: (snapshot as { value: ContactResolutionRecord["state"] }).value,
    context,
    updatedAt: context.updatedAt,
    snapshot,
  };
}
