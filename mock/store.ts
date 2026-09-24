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
}

export const mockStore = new MockStore();
