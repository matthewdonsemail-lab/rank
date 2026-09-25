import type {
  ContactResolutionContext,
  ContactResolutionState,
} from "../lib/xstate/contact-resolution/index.ts";
import type {
  OutboundReplyAnalysis,
  OutboundThreadContext,
  OutboundThreadState,
} from "../lib/xstate/outbound/index.js";

/**
 * Relational schema definitions for the Rank mock architecture.
 * Mirrors Convex backend tables, @convex-dev/agent component data,
 * @agentmail/convex component data, and Clerk authentication identity.
 */

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "member" | "viewer";
  createdAt: number;
}

export interface AuthOrganization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: "starter" | "growth" | "enterprise";
  membersCount: number;
  createdAt: number;
}

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: string;
  createdAt: number;
}

export interface ApiKey {
  id: string;
  workspaceId: string;
  hashedKey: string;
  label: string;
  scopes: string[];
  lastUsedAt?: number;
  createdAt: number;
}

export interface RankSession {
  id: string;
  workspaceId: string;
  query: string;
  strategy: string;
  model: string;
  candidateCount: number;
  latencyMs: number;
  createdAt: number;
}

export interface Candidate {
  id: string;
  sessionId: string;
  externalId?: string;
  text: string;
  initialScore?: number;
  rerankScore: number;
  confidence?: number;
  finalRank: number;
}

export interface Receipt {
  id: string;
  sessionId: string;
  provider: string;
  model: string;
  tokensUsed: number;
  costUsd: number;
  timestamp: number;
}

export interface BenchmarkRun {
  id: string;
  workspaceId: string;
  dataset: string;
  ndcg10: number;
  mrr: number;
  avgLatencyMs: number;
  completedAt: number;
}

export interface AgentThread {
  id: string;
  workspaceId: string;
  title: string;
  model: string;
  createdAt: number;
}

export interface AgentMessage {
  id: string;
  threadId: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: Array<{
    name: string;
    args: Record<string, unknown>;
    result?: unknown;
  }>;
  createdAt: number;
}

export interface AgentMailInbox {
  id: string;
  workspaceId: string;
  email: string;
  displayName: string;
  createdAt: number;
}

export interface AgentMailThread {
  id: string;
  inboxId: string;
  subject: string;
  messageCount: number;
  lastMessageAt: number;
}

export interface AgentMailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  bodyText: string;
  status: "received" | "processed" | "triaged";
  receivedAt: number;
}

export interface ContactResolutionRecord {
  id: string;
  owner: string;
  outboundThreadId?: string;
  state: ContactResolutionState;
  context: ContactResolutionContext;
  createdAt: number;
  updatedAt: number;
  snapshot?: unknown;
}

export type OutboundDomainStatus = "pending" | "verified" | "warming" | "paused" | "error";
export type OutboundInboxStatus = "active" | "warming" | "paused" | "error";
export type OutboundCampaignStatus = "draft" | "running" | "paused" | "completed" | "cancelled";
export type OutboundDeliveryStatus = "reserved" | "sent" | "failed" | "bounced";

export interface OutboundDomain {
  id: string;
  owner: string;
  domain: string;
  status: OutboundDomainStatus;
  localPartPrefixes: string[];
  dailyLimit: number;
  sentToday: number;
  warmupScore: number;
  createdAt: number;
  updatedAt: number;
}

export interface OutboundInbox {
  id: string;
  owner: string;
  domain: string;
  localPart: string;
  address: string;
  agentMailInboxId?: string;
  displayName: string;
  status: OutboundInboxStatus;
  dailyLimit: number;
  sentToday: number;
  createdAt: number;
  updatedAt: number;
}

export interface OutboundCampaign {
  id: string;
  owner: string;
  name: string;
  goal: "guest_post";
  status: OutboundCampaignStatus;
  dailySendLimit: number;
  createdAt: number;
  updatedAt: number;
}

export interface OutboundThread {
  id: string;
  owner: string;
  campaignId: string;
  state: OutboundThreadState;
  context: OutboundThreadContext;
  labels: string[];
  nextFollowUpAt?: number;
  snapshot?: unknown;
  createdAt: number;
  updatedAt: number;
}

export interface OutboundDelivery {
  id: string;
  owner: string;
  threadId: string;
  idempotencyKey: string;
  provider: string;
  status: OutboundDeliveryStatus;
  providerMessageId?: string;
  attemptedAt: number;
  sentAt?: number;
}

export interface OutboundAnalysisRecord {
  id: string;
  threadId: string;
  analysis: OutboundReplyAnalysis;
  createdAt: number;
}

export interface RankInferenceRequest {
  query: string;
  candidates: Array<{ id?: string; text: string }>;
  model?: string;
  workspaceId?: string;
}

export interface RankInferenceResponse {
  sessionId: string;
  model: string;
  query: string;
  latencyMs: number;
  results: Array<{
    id: string;
    text: string;
    score: number;
    rank: number;
  }>;
}

export interface DocBackingMetadata {
  docPath: string;
  specSection: string;
  specUrl: string;
  requiredFields: string[];
  lastVerified: string;
}

export interface TregTool {
  id: string;
  endpoint: string;
  name: string;
  provider: string;
  category: string;
  approxCostUsd: number;
  description: string;
}

export interface TregCallReceipt {
  callId: string;
  ownerHash: string;
  endpoint: string;
  costMicro: number;
  servedVia: string;
  at: number;
}

export interface TregExecuteRequest {
  owner: string;
  endpoint: string;
  params: Record<string, unknown>;
  maxCostUsd?: number;
}

export interface TregExecuteResponse {
  callId: string;
  endpoint: string;
  result: Record<string, unknown>;
  costMicro: number;
  servedVia: string;
  at: number;
}

export type {
  BrandEntity,
  BrandIdentity,
  BrandLocation,
  BrandVoice,
  BrandOffering,
  BrandPage,
  ChannelProfile,
  BrandMemory,
  BrandIntelligence,
  CommunityPick,
  Autoreply,
  BrandChannel,
} from "../lib/brand/types.ts";

