import type { DocBackingMetadata, OutboundDomain } from "../schema.ts";

export const docBacking: DocBackingMetadata = {
  docPath: "docs/convex/components/agentmail/README.md",
  specSection: "Domains",
  specUrl: "https://agentmail.to/docs/domains",
  requiredFields: ["id", "owner", "domain", "status", "localPartPrefixes", "dailyLimit", "warmupScore"],
  lastVerified: "2026-09-25",
};

export const mockOutboundDomainsData: OutboundDomain[] = [
  {
    id: "outbound_domain_01",
    owner: "usr_rank_01",
    domain: "outreach.rank.dev",
    status: "verified",
    localPartPrefixes: ["avery", "jordan"],
    dailyLimit: 60,
    sentToday: 14,
    warmupScore: 0.86,
    createdAt: 1758758400000,
    updatedAt: 1758844800000,
  },
  {
    id: "outbound_domain_02",
    owner: "usr_rank_01",
    domain: "studio.rank.dev",
    status: "verified",
    localPartPrefixes: ["avery"],
    dailyLimit: 40,
    sentToday: 6,
    warmupScore: 0.71,
    createdAt: 1758758400000,
    updatedAt: 1758844800000,
  },
  {
    id: "outbound_domain_03",
    owner: "usr_rank_01",
    domain: "newsletter.rank.dev",
    status: "warming",
    localPartPrefixes: ["avery"],
    dailyLimit: 20,
    sentToday: 2,
    warmupScore: 0.38,
    createdAt: 1758758400000,
    updatedAt: 1758844800000,
  },
];

export function handleGetOutboundDomains(owner?: string, status?: string): OutboundDomain[] {
  return mockOutboundDomainsData.filter((domain) => {
    return (!owner || domain.owner === owner) && (!status || domain.status === status);
  });
}

export function createOutboundDomain(input: {
  owner: string;
  domain: string;
  localPartPrefixes?: string[];
  dailyLimit?: number;
  now?: number;
}): OutboundDomain {
  const now = input.now ?? Date.now();
  return {
    id: `outbound_domain_${now}`,
    owner: input.owner,
    domain: input.domain.toLowerCase(),
    status: "pending",
    localPartPrefixes: input.localPartPrefixes ?? [],
    dailyLimit: input.dailyLimit ?? 30,
    sentToday: 0,
    warmupScore: 0,
    createdAt: now,
    updatedAt: now,
  };
}
