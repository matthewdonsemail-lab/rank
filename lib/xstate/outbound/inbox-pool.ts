export type PoolDomainStatus = "pending" | "verified" | "warming" | "paused" | "error";
export type PoolInboxStatus = "active" | "warming" | "paused" | "error";

export interface InboxPoolItem {
  id: string;
  domain: string;
  localPart: string;
  address: string;
  status: PoolInboxStatus;
  dailyLimit: number;
  sentToday: number;
  warmupScore?: number;
}

export interface DomainPoolItem {
  domain: string;
  status: PoolDomainStatus;
  warmupScore?: number;
}

export function normalizeInboxPrefix(name: string): string {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!normalized) throw new Error("Inbox prefix cannot be empty");
  return normalized.slice(0, 64);
}

export function buildPrefixedInboxAddress(name: string, domain: string): string {
  return `${normalizeInboxPrefix(name)}@${domain.trim().toLowerCase()}`;
}

export function selectSharedInbox(input: {
  inboxes: InboxPoolItem[];
  domains: DomainPoolItem[];
  preferredDomain?: string;
}): InboxPoolItem | null {
  const domainByName = new Map(input.domains.map((domain) => [domain.domain, domain]));
  const candidates = input.inboxes
    .filter((inbox) => inbox.status === "active" || inbox.status === "warming")
    .filter((inbox) => inbox.sentToday < inbox.dailyLimit)
    .filter((inbox) => {
      const domain = domainByName.get(inbox.domain);
      return domain?.status === "verified" || domain?.status === "warming";
    })
    .filter((inbox) => !input.preferredDomain || inbox.domain === input.preferredDomain)
    .map((inbox) => {
      const domain = domainByName.get(inbox.domain);
      const utilization = inbox.sentToday / Math.max(inbox.dailyLimit, 1);
      const score =
        (inbox.status === "active" ? 2 : 1) +
        (1 - utilization) +
        (domain?.warmupScore ?? 0) +
        (inbox.warmupScore ?? 0);
      return { inbox, score };
    })
    .sort((left, right) => right.score - left.score || left.inbox.id.localeCompare(right.inbox.id));
  return candidates[0]?.inbox ?? null;
}
