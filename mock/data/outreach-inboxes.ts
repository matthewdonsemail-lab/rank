import type { DocBackingMetadata, OutboundInbox } from "../schema.ts";

export const docBacking: DocBackingMetadata = {
  docPath: "docs/convex/components/agentmail/README.md",
  specSection: "Inboxes",
  specUrl: "https://agentmail.to/docs/inboxes",
  requiredFields: ["id", "owner", "domain", "localPart", "address", "status", "dailyLimit"],
  lastVerified: "2026-09-25",
};

export const mockOutboundInboxesData: OutboundInbox[] = [
  {
    id: "outbound_inbox_01",
    owner: "usr_rank_01",
    domain: "outreach.rank.dev",
    localPart: "avery",
    address: "avery@outreach.rank.dev",
    agentMailInboxId: "inbox_rank_01",
    displayName: "Avery | Rank Outreach",
    status: "active",
    dailyLimit: 30,
    sentToday: 8,
    createdAt: 1758758400000,
    updatedAt: 1758844800000,
  },
  {
    id: "outbound_inbox_02",
    owner: "usr_rank_01",
    domain: "studio.rank.dev",
    localPart: "avery",
    address: "avery@studio.rank.dev",
    agentMailInboxId: "inbox_rank_02",
    displayName: "Avery | Rank Studio",
    status: "active",
    dailyLimit: 20,
    sentToday: 4,
    createdAt: 1758758400000,
    updatedAt: 1758844800000,
  },
  {
    id: "outbound_inbox_03",
    owner: "usr_rank_01",
    domain: "outreach.rank.dev",
    localPart: "jordan",
    address: "jordan@outreach.rank.dev",
    agentMailInboxId: "inbox_rank_03",
    displayName: "Jordan | Rank Outreach",
    status: "warming",
    dailyLimit: 10,
    sentToday: 1,
    createdAt: 1758758400000,
    updatedAt: 1758844800000,
  },
  {
    id: "outbound_inbox_04",
    owner: "usr_rank_02",
    domain: "newsletter.rank.dev",
    localPart: "sam",
    address: "sam@newsletter.rank.dev",
    agentMailInboxId: "inbox_rank_04",
    displayName: "Sam | Rank Newsletter",
    status: "active",
    dailyLimit: 15,
    sentToday: 3,
    createdAt: 1758758400000,
    updatedAt: 1758844800000,
  },
];

export function handleGetOutboundInboxes(owner?: string, status?: string, domain?: string): OutboundInbox[] {
  return mockOutboundInboxesData.filter((inbox) => {
    return (
      (!owner || inbox.owner === owner) &&
      (!status || inbox.status === status) &&
      (!domain || inbox.domain === domain)
    );
  });
}

export function createOutboundInbox(input: {
  owner: string;
  domain: string;
  localPart: string;
  agentMailInboxId?: string;
  displayName?: string;
  dailyLimit?: number;
  now?: number;
}): OutboundInbox {
  const now = input.now ?? Date.now();
  const domain = input.domain.toLowerCase();
  const localPart = input.localPart.toLowerCase();
  return {
    id: `outbound_inbox_${now}`,
    owner: input.owner,
    domain,
    localPart,
    address: `${localPart}@${domain}`,
    agentMailInboxId: input.agentMailInboxId,
    displayName: input.displayName ?? `${localPart} | Rank Outreach`,
    status: "warming",
    dailyLimit: input.dailyLimit ?? 20,
    sentToday: 0,
    createdAt: now,
    updatedAt: now,
  };
}
