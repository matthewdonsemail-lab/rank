import type { BrandEntity, DocBackingMetadata } from "../schema.ts";
import { defaultChannels, isBrandEntity, isBrandOffering, isRecord } from "../../lib/brand/types.ts";

/**
 * Route: GET /api/brand, PUT /api/brand, DELETE /api/brand
 * Description: Source-of-truth brand entity for personality, voice rules, offerings, and RAG grounding.
 * Backed by authoritative documentation in docs/brand/README.md.
 */
export const docBacking: DocBackingMetadata = {
  docPath: "docs/brand/README.md",
  specSection: "Brand Entity Shape & Lifecycle",
  specUrl: "https://listeningkit.com/docs/brand",
  requiredFields: [
    "id",
    "identity",
    "location",
    "voice",
    "offerings",
    "sources",
    "channels",
    "memory",
    "intelligence",
    "sourceUrl",
    "updatedAt",
  ],
  lastVerified: "2026-09-25",
};

export const mockBrandData: BrandEntity = {
  id: "brand-default",
  identity: {
    name: "Rank by ListeningKit",
    website: "https://listeningkit.com",
    tagline: "Autonomous AI ranking and candidate evaluation",
    logoUrl: "https://listeningkit.com/brand-assets/logo.png",
  },
  location: {
    label: "Galway, County Galway, Ireland",
    lat: 53.2707,
    lng: -9.0568,
    radiusKm: 25,
  },
  voice: {
    tone: "Friendly, plain-spoken local pro",
    formality: "professional",
    dos: [
      "Lead with direct answers",
      "Cite verified benchmarks and latency numbers",
      "Quote exact service details from offerings",
    ],
    donts: [
      "Never invent facts or pricing",
      "Never quote unverified metrics",
      "Never contradict memory boundaries",
    ],
    examples: [
      {
        situation: "question",
        reply: "Hi there - great question. We run sub-15ms cross-encoder reranking on Nebius AI Studio. DM us and we will get you set up.",
      },
      {
        situation: "complaint",
        reply: "Really sorry about the latency spike. DM us your session ID and we will triage the model throughput immediately.",
      },
      {
        situation: "praise",
        reply: "Thank you! Reviews like this keep the engineering crew going. If you ever need low-latency reranking again, you know where to find us.",
      },
    ],
  },
  offerings: [
    {
      name: "Nebius Cross-Encoder Reranking",
      detail: "Sub-15ms latency reranking with BAAI/bge-reranker-v2-m3",
    },
    {
      name: "Convex Agent Routing",
      detail: "Multi-model autonomous agent session orchestration",
    },
    {
      name: "Treg Tool Spend Tracking",
      detail: "Micro-dollar budget enforcement and metering",
    },
  ],
  sources: [
    {
      url: "https://listeningkit.com",
      title: "Home - Rank by ListeningKit",
      headings: ["Overview", "Why Choose Rank"],
      text: "Rank by ListeningKit delivers ultra-low latency AI ranking on Nebius infrastructure. Every request is metered and verified.",
      status: "indexed",
      fetchedAt: "2026-09-25T00:00:00.000Z",
    },
    {
      url: "https://listeningkit.com/services",
      title: "Services - Rank by ListeningKit",
      headings: ["Inference", "Reranking"],
      text: "Services include cross-encoder scoring, reciprocal rank fusion, and benchmark evaluations with zero hidden fees.",
      status: "indexed",
      fetchedAt: "2026-09-25T00:00:00.000Z",
    },
  ],
  channels: defaultChannels(),
  memory: {
    rules: [
      "Default provider is Nebius AI Studio",
      "Always track tool calls via Treg spend ledger",
      "Reject unauthenticated requests to live API",
    ],
  },
  intelligence: {
    selectedKeyword: "cross-encoder reranking",
    competitors: ["cohere.com", "jina.ai", "voyageai.com"],
    targetCommunities: [
      {
        id: "comm_reddit_ml",
        platform: "reddit",
        name: "r/MachineLearning",
        detail: "Discussions on neural search, embeddings, and reranker latency",
      },
      {
        id: "comm_x_ai",
        platform: "x",
        name: "AI Engineers",
        detail: "Practitioners sharing benchmarks and model inference tips",
      },
    ],
  },
  sourceUrl: "https://listeningkit.com",
  updatedAt: "2026-09-25T00:00:00.000Z",
};

export function handleGetBrand(brand: BrandEntity | null): { brand: BrandEntity | null } {
  return { brand };
}

export function handlePutBrand(
  body: Partial<BrandEntity>,
  currentBrand: BrandEntity | null
): { brand: BrandEntity } {
  const base: Omit<BrandEntity, "updatedAt"> = currentBrand ?? {
    id: "brand-default",
    identity: { name: "", website: "", tagline: "" },
    location: { label: "", lat: 53.2707, lng: -9.0568, radiusKm: 10 },
    voice: {
      tone: "Friendly, plain-spoken local pro",
      formality: "professional",
      dos: [],
      donts: [],
      examples: [],
    },
    offerings: [],
    sources: [],
    channels: defaultChannels(),
    memory: { rules: [] },
    intelligence: { competitors: [], targetCommunities: [] },
    sourceUrl: "",
  };

  const channelPatch = isRecord(body.channels) ? body.channels : {};
  const mergedChannels = { ...base.channels };
  for (const channel of ["facebook", "x", "reddit"] as const) {
    const patch = (channelPatch as any)[channel];
    if (patch) {
      mergedChannels[channel] = { ...mergedChannels[channel], ...patch };
    }
  }

  const next: BrandEntity = {
    ...base,
    ...body,
    id: "brand-default",
    identity: { ...base.identity, ...body.identity },
    location: { ...base.location, ...body.location },
    voice: { ...base.voice, ...body.voice },
    offerings: Array.isArray(body.offerings)
      ? (body.offerings as unknown[]).filter(isBrandOffering)
      : base.offerings,
    sources: Array.isArray(body.sources) ? body.sources : base.sources,
    channels: mergedChannels,
    memory: {
      rules: Array.isArray(body.memory?.rules)
        ? (body.memory.rules as unknown[]).filter((line): line is string => typeof line === "string")
        : base.memory.rules,
    },
    intelligence: { ...base.intelligence, ...body.intelligence },
    updatedAt: new Date().toISOString(),
  };

  if (!isBrandEntity(next)) {
    throw new Error("Invalid brand payload");
  }

  return { brand: next };
}

export function handleDeleteBrand(): { brand: null } {
  return { brand: null };
}
