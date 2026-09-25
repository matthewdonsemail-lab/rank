import type { DocBackingMetadata, OutboundCampaign } from "../schema.ts";

export const docBacking: DocBackingMetadata = {
  docPath: "docs/convex/components/agentmail/README.md",
  specSection: "Threads and Labels",
  specUrl: "https://agentmail.to/docs/threads",
  requiredFields: ["id", "owner", "name", "goal", "status", "dailySendLimit"],
  lastVerified: "2026-09-25",
};

export const mockOutboundCampaignsData: OutboundCampaign[] = [
  {
    id: "outbound_campaign_01",
    owner: "usr_rank_01",
    name: "2026 guest post partnerships",
    goal: "guest_post",
    status: "running",
    dailySendLimit: 50,
    createdAt: 1758758400000,
    updatedAt: 1758844800000,
  },
  {
    id: "outbound_campaign_02",
    owner: "usr_rank_01",
    name: "Spring editorial test",
    goal: "guest_post",
    status: "draft",
    dailySendLimit: 10,
    createdAt: 1758758400000,
    updatedAt: 1758758400000,
  },
];

export function handleGetOutboundCampaigns(owner?: string, status?: string): OutboundCampaign[] {
  return mockOutboundCampaignsData.filter((campaign) => {
    return (!owner || campaign.owner === owner) && (!status || campaign.status === status);
  });
}

export function createOutboundCampaign(input: {
  owner: string;
  name: string;
  dailySendLimit?: number;
  now?: number;
}): OutboundCampaign {
  const now = input.now ?? Date.now();
  return {
    id: `outbound_campaign_${now}`,
    owner: input.owner,
    name: input.name,
    goal: "guest_post",
    status: "draft",
    dailySendLimit: input.dailySendLimit ?? 25,
    createdAt: now,
    updatedAt: now,
  };
}
