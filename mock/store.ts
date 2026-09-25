import type {
  AuthUser,
  AuthOrganization,
  Workspace,
  ApiKey,
  RankSession,
  Candidate,
  Receipt,
  BenchmarkRun,
  AgentThread,
  AgentMessage,
  AgentMailInbox,
  AgentMailThread,
  AgentMailMessage,
  OutboundDomain,
  OutboundInbox,
  OutboundCampaign,
  OutboundThread,
  OutboundDelivery,
  ContactResolutionRecord,
  TregTool,
  TregCallReceipt,
  BrandEntity,
  BrandPage,
} from "./schema.ts";

import { mockAuthUserData } from "./data/auth-user.ts";
import { mockAuthOrganizationData } from "./data/auth-organization.ts";
import { mockWorkspacesData } from "./data/workspaces.ts";
import { mockApiKeysData } from "./data/api-keys.ts";
import { mockRankSessionsData } from "./data/rank-sessions.ts";
import { mockCandidatesData } from "./data/candidates.ts";
import { mockReceiptsData } from "./data/receipts.ts";
import { mockBenchmarkRunsData } from "./data/benchmark-runs.ts";
import { mockAgentThreadsData } from "./data/agent-threads.ts";
import { mockAgentMessagesData } from "./data/agent-messages.ts";
import { mockAgentMailInboxesData } from "./data/agentmail-inboxes.ts";
import { mockAgentMailThreadsData } from "./data/agentmail-threads.ts";
import { mockAgentMailMessagesData } from "./data/agentmail-messages.ts";
import {
  mockOutboundDomainsData,
  createOutboundDomain,
} from "./data/outreach-domains.ts";
import {
  mockOutboundInboxesData,
  createOutboundInbox,
} from "./data/outreach-inboxes.ts";
import {
  mockOutboundCampaignsData,
  createOutboundCampaign,
} from "./data/outreach-campaigns.ts";
import {
  mockOutboundThreadsData,
  createOutboundThread,
  transitionOutboundThread,
} from "./data/outreach-threads.ts";
import {
  mockContactResolutionData,
  createContactResolutionRecord,
  transitionContactResolutionRecord,
} from "./data/outreach-contact-resolution.ts";
import { mockTregToolsData } from "./data/treg-tools.ts";
import { mockTregCallsData } from "./data/treg-calls.ts";
import { normalizeInboxPrefix, selectSharedInbox } from "../lib/xstate/outbound/index.ts";
import { mockBrandData, handlePutBrand } from "./data/brand.ts";
import { handlePostBrandIndex, handleDeleteBrandSource } from "./data/brand-sources.ts";
import { handlePostBrandIntelligence, type BrandIntelligenceInput } from "./data/brand-intelligence.ts";

/**
 * In-memory relational store maintaining foreign key relationships across
 * Convex backend tables, components, and Clerk identity without touching live Convex.
 */
export class MockStore {
  public authUsers: AuthUser[] = [{ ...mockAuthUserData }];
  public authOrganizations: AuthOrganization[] = [{ ...mockAuthOrganizationData }];
  public workspaces: Workspace[] = mockWorkspacesData.map((w) => ({ ...w }));
  public apiKeys: ApiKey[] = mockApiKeysData.map((k) => ({ ...k }));
  public rankSessions: RankSession[] = mockRankSessionsData.map((s) => ({ ...s }));
  public candidates: Candidate[] = mockCandidatesData.map((c) => ({ ...c }));
  public receipts: Receipt[] = mockReceiptsData.map((r) => ({ ...r }));
  public benchmarkRuns: BenchmarkRun[] = mockBenchmarkRunsData.map((b) => ({ ...b }));
  public agentThreads: AgentThread[] = mockAgentThreadsData.map((t) => ({ ...t }));
  public agentMessages: AgentMessage[] = mockAgentMessagesData.map((m) => ({ ...m }));
  public agentMailInboxes: AgentMailInbox[] = mockAgentMailInboxesData.map((i) => ({ ...i }));
  public agentMailThreads: AgentMailThread[] = mockAgentMailThreadsData.map((t) => ({ ...t }));
  public agentMailMessages: AgentMailMessage[] = mockAgentMailMessagesData.map((m) => ({ ...m }));
  public outboundDomains: OutboundDomain[] = mockOutboundDomainsData.map((d) => ({ ...d }));
  public outboundInboxes: OutboundInbox[] = mockOutboundInboxesData.map((i) => ({ ...i }));
  public outboundCampaigns: OutboundCampaign[] = mockOutboundCampaignsData.map((c) => ({ ...c }));
  public outboundThreads: OutboundThread[] = mockOutboundThreadsData.map((t) => ({ ...t }));
  public contactResolutions: ContactResolutionRecord[] = mockContactResolutionData.map((r) => ({ ...r }));
  public outboundDeliveries: OutboundDelivery[] = [];
  public tregTools: TregTool[] = mockTregToolsData.map((t) => ({ ...t }));
  public tregCalls: TregCallReceipt[] = mockTregCallsData.map((c) => ({ ...c }));
  public brand: BrandEntity | null = JSON.parse(JSON.stringify(mockBrandData));

  // Query helpers by relation
  public getWorkspaceBySlug(slug: string): Workspace | undefined {
    return this.workspaces.find((w) => w.slug === slug);
  }

  public getApiKeysByWorkspace(workspaceId: string): ApiKey[] {
    return this.apiKeys.filter((k) => k.workspaceId === workspaceId);
  }

  public getRankSessionsByWorkspace(workspaceId: string): RankSession[] {
    return this.rankSessions.filter((s) => s.workspaceId === workspaceId);
  }

  public getCandidatesBySession(sessionId: string): Candidate[] {
    return this.candidates
      .filter((c) => c.sessionId === sessionId)
      .sort((a, b) => a.finalRank - b.finalRank);
  }

  public getReceiptBySession(sessionId: string): Receipt | undefined {
    return this.receipts.find((r) => r.sessionId === sessionId);
  }

  public getBenchmarkRunsByWorkspace(workspaceId: string): BenchmarkRun[] {
    return this.benchmarkRuns.filter((b) => b.workspaceId === workspaceId);
  }

  public getAgentThreadsByWorkspace(workspaceId: string): AgentThread[] {
    return this.agentThreads.filter((t) => t.workspaceId === workspaceId);
  }

  public getAgentMessagesByThread(threadId: string): AgentMessage[] {
    return this.agentMessages.filter((m) => m.threadId === threadId);
  }

  public getAgentMailInboxesByWorkspace(workspaceId: string): AgentMailInbox[] {
    return this.agentMailInboxes.filter((i) => i.workspaceId === workspaceId);
  }

  public getAgentMailThreadsByInbox(inboxId: string): AgentMailThread[] {
    return this.agentMailThreads.filter((t) => t.inboxId === inboxId);
  }

  public getAgentMailMessagesByThread(threadId: string): AgentMailMessage[] {
    return this.agentMailMessages.filter((m) => m.threadId === threadId);
  }

  public getOutboundDomains(owner?: string, status?: string): OutboundDomain[] {
    return this.outboundDomains.filter((domain) => {
      return (!owner || domain.owner === owner) && (!status || domain.status === status);
    });
  }

  public getOutboundInboxes(owner?: string, status?: string, domain?: string): OutboundInbox[] {
    return this.outboundInboxes.filter((inbox) => {
      return (
        (!owner || inbox.owner === owner) &&
        (!status || inbox.status === status) &&
        (!domain || inbox.domain === domain)
      );
    });
  }

  public selectOutboundInbox(owner: string, preferredDomain?: string): OutboundInbox | null {
    const selected = selectSharedInbox({
      domains: this.outboundDomains
        .filter((domain) => domain.owner === owner)
        .map((domain) => ({ domain: domain.domain, status: domain.status, warmupScore: domain.warmupScore })),
      inboxes: this.outboundInboxes
        .filter((inbox) => inbox.owner === owner)
        .map((inbox) => ({
          id: inbox.id,
          domain: inbox.domain,
          localPart: inbox.localPart,
          address: inbox.address,
          status: inbox.status,
          dailyLimit: inbox.dailyLimit,
          sentToday: inbox.sentToday,
        })),
      preferredDomain,
    });
    return selected ? this.outboundInboxes.find((inbox) => inbox.id === selected.id) ?? null : null;
  }

  public getOutboundCampaigns(owner?: string, status?: string): OutboundCampaign[] {
    return this.outboundCampaigns.filter((campaign) => {
      return (!owner || campaign.owner === owner) && (!status || campaign.status === status);
    });
  }

  public getOutboundThreads(filter?: { owner?: string; campaignId?: string; state?: string }): OutboundThread[] {
    return this.outboundThreads.filter((thread) => {
      return (
        (!filter?.owner || thread.owner === filter.owner) &&
        (!filter?.campaignId || thread.campaignId === filter.campaignId) &&
        (!filter?.state || thread.state === filter.state)
      );
    });
  }

  public getOutboundThread(threadId: string): OutboundThread | undefined {
    return this.outboundThreads.find((thread) => thread.id === threadId);
  }

  public getContactResolutions(owner?: string, state?: string): ContactResolutionRecord[] {
    return this.contactResolutions.filter((resolution) => {
      return (!owner || resolution.owner === owner) && (!state || resolution.state === state);
    });
  }

  public getContactResolution(resolutionId: string): ContactResolutionRecord | undefined {
    return this.contactResolutions.find((resolution) => resolution.id === resolutionId);
  }

  public insertContactResolution(input: Parameters<typeof createContactResolutionRecord>[0]): ContactResolutionRecord {
    const resolution = createContactResolutionRecord(input);
    this.contactResolutions.unshift(resolution);
    return resolution;
  }

  public transitionContactResolution(
    resolutionId: string,
    event: Parameters<typeof transitionContactResolutionRecord>[1],
  ): ContactResolutionRecord | undefined {
    const index = this.contactResolutions.findIndex((resolution) => resolution.id === resolutionId);
    if (index < 0) return undefined;
    const resolution = transitionContactResolutionRecord(this.contactResolutions[index], event);
    this.contactResolutions[index] = resolution;
    return resolution;
  }

  public getOutboundDeliveries(owner?: string, threadId?: string): OutboundDelivery[] {
    return this.outboundDeliveries.filter((delivery) => {
      return (!owner || delivery.owner === owner) && (!threadId || delivery.threadId === threadId);
    });
  }

  public insertOutboundDomain(input: Parameters<typeof createOutboundDomain>[0]): OutboundDomain {
    const existing = this.outboundDomains.find(
      (domain) => domain.owner === input.owner && domain.domain === input.domain.toLowerCase(),
    );
    if (existing) return existing;
    const domain = createOutboundDomain(input);
    this.outboundDomains.push(domain);
    return domain;
  }

  public insertOutboundInbox(input: Parameters<typeof createOutboundInbox>[0]): OutboundInbox {
    const localPart = normalizeInboxPrefix(input.localPart);
    const normalizedInput = { ...input, localPart };
    const address = `${localPart}@${input.domain.toLowerCase()}`;
    const existing = this.outboundInboxes.find(
      (inbox) => inbox.owner === input.owner && inbox.address === address,
    );
    if (existing) return existing;
    const inbox = createOutboundInbox(normalizedInput);
    this.outboundInboxes.push(inbox);
    return inbox;
  }

  public insertOutboundCampaign(input: Parameters<typeof createOutboundCampaign>[0]): OutboundCampaign {
    const campaign = createOutboundCampaign(input);
    this.outboundCampaigns.unshift(campaign);
    return campaign;
  }

  public insertOutboundThread(input: Parameters<typeof createOutboundThread>[0]): OutboundThread {
    const thread = createOutboundThread(input);
    this.outboundThreads.unshift(thread);
    return thread;
  }

  public transitionOutboundThread(threadId: string, event: Parameters<typeof transitionOutboundThread>[1]): OutboundThread | undefined {
    const index = this.outboundThreads.findIndex((thread) => thread.id === threadId);
    if (index < 0) return undefined;
    const thread = transitionOutboundThread(this.outboundThreads[index], event);
    this.outboundThreads[index] = thread;
    return thread;
  }

  public insertOutboundDelivery(delivery: OutboundDelivery): OutboundDelivery {
    const existing = this.outboundDeliveries.find(
      (item) => item.owner === delivery.owner && item.idempotencyKey === delivery.idempotencyKey,
    );
    if (existing) return existing;
    this.outboundDeliveries.unshift(delivery);
    return delivery;
  }

  // Composite relational tree lookups
  public getFullSession(sessionId: string) {
    const session = this.rankSessions.find((s) => s.id === sessionId);
    if (!session) return null;
    return {
      session,
      candidates: this.getCandidatesBySession(sessionId),
      receipt: this.getReceiptBySession(sessionId) || null,
    };
  }

  public getFullWorkspace(workspaceId: string) {
    const workspace = this.workspaces.find((w) => w.id === workspaceId);
    if (!workspace) return null;
    return {
      workspace,
      apiKeys: this.getApiKeysByWorkspace(workspaceId),
      rankSessions: this.getRankSessionsByWorkspace(workspaceId),
      benchmarkRuns: this.getBenchmarkRunsByWorkspace(workspaceId),
      agentThreads: this.getAgentThreadsByWorkspace(workspaceId),
      agentMailInboxes: this.getAgentMailInboxesByWorkspace(workspaceId),
    };
  }

  // In-memory insert
  public insertRankSession(session: RankSession, candidates: Candidate[], receipt: Receipt) {
    this.rankSessions.unshift(session);
    this.candidates.push(...candidates);
    this.receipts.push(receipt);
  }

  // Treg developer tools helpers
  public getTregTools(filter?: { category?: string; provider?: string }): TregTool[] {
    let list = this.tregTools;
    if (filter?.category) list = list.filter((t) => t.category === filter.category);
    if (filter?.provider) list = list.filter((t) => t.provider.toLowerCase() === filter.provider?.toLowerCase());
    return list;
  }

  public getTregCalls(ownerHash?: string): TregCallReceipt[] {
    if (ownerHash) return this.tregCalls.filter((c) => c.ownerHash === ownerHash);
    return this.tregCalls;
  }

  public insertTregCall(call: TregCallReceipt) {
    this.tregCalls.unshift(call);
  }

  // Brand entity management
  public getBrand(): BrandEntity | null {
    return this.brand;
  }

  public upsertBrand(patch: Partial<BrandEntity>): BrandEntity {
    const { brand } = handlePutBrand(patch, this.brand);
    this.brand = brand;
    return brand;
  }

  public appendBrandIntelligence(input: BrandIntelligenceInput): BrandEntity {
    const { brand } = handlePostBrandIntelligence(input, this.brand);
    this.brand = brand;
    return brand;
  }

  public getBrandSources(): BrandPage[] {
    return this.brand?.sources ?? [];
  }

  public indexBrandSources(input?: { urls?: string[]; sitemap?: boolean }): { brand: BrandEntity; sources: BrandPage[] } {
    const res = handlePostBrandIndex(input ?? {}, this.brand);
    this.brand = res.brand;
    return res;
  }

  public removeBrandSource(url: string): { brand: BrandEntity; sources: BrandPage[] } {
    const res = handleDeleteBrandSource(url, this.brand);
    this.brand = res.brand;
    return res;
  }

  public clearBrand(): void {
    this.brand = null;
  }
}

export const mockStore = new MockStore();
