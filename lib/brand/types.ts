/**
 * Brand shapes: the single BrandEntity the whole app reads - identity,
 * location, voice, offerings, plus the intelligence the reveal step
 * discovers - and the query object the inspect-form follow-ups build from
 * an event + brand.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export interface BrandIdentity {
  /** Display name, e.g. "Acme Plumbing". */
  name: string;
  /** Canonical website URL the profile was extracted from. */
  website: string;
  /** One-line description; empty when the lookup could not infer one. */
  tagline: string;
  /** Logo URL, when the lookup finds one. */
  logoUrl?: string;
}

export interface BrandLocation {
  /** Human label, e.g. "Galway, County Galway, Ireland". */
  label: string;
  /** Default latitude. */
  lat: number;
  /** Default longitude. */
  lng: number;
  /** Service / delivery radius in km. */
  radiusKm: number;
}

export interface BrandVoiceExample {
  /** Post type this gold reply answers, e.g. "question" | "complaint" | "praise". */
  situation: string;
  /** The exact reply the agent should mimic. */
  reply: string;
}

/** Machine-readable language dial: greeting style, contractions, sign-off length. */
export type BrandFormality = 'casual' | 'professional' | 'formal';

/**
 * How replies should read. Purely about language - never geography (areas
 * live in location). The single consumer is buildBrandSystemPrompt(),
 * which compiles these fields into the agent instructions.
 */
export interface BrandVoice {
  /** One-line headline, e.g. "Friendly, plain-spoken local pro". */
  tone: string;
  formality: BrandFormality;
  /** Hard rules, each independently enforceable, e.g. "Lead with the fix". */
  dos: string[];
  /** Hard prohibitions, e.g. "Never quote a price in a reply". */
  donts: string[];
  /** 2-3 gold replies the agent mimics before it improvises. */
  examples: BrandVoiceExample[];
}

/** One service / product with the one-line detail the agent quotes. */
export interface BrandOffering {
  name: string;
  detail: string;
}

/** Index state of one website page: quotable, queued, or retryable. */
export type BrandPageStatus = 'indexed' | 'pending' | 'failed';

/** One indexed website page - the unit the RAG namespace stores. */
export interface BrandPage {
  url: string;
  title: string;
  headings: string[];
  text: string;
  status: BrandPageStatus;
  /** ISO timestamp of the last fetch. */
  fetchedAt: string;
}

/** A cited source attached to a draft - the mock mirror of RAG hits. */
export interface BrandSourceRef {
  url: string;
  excerpt: string;
}

/** How the agent texts on one channel: raw and human, or standard. */
export type ChannelStyle = 'casual' | 'standard';

/** Channels with distinct response profiles. */
export type BrandChannel = 'facebook' | 'x' | 'reddit';

/**
 * One base auto-reply on a channel. When enabled, it is passed through with
 * the rest of the brand metadata into the reply context, so the outbound
 * reply stays tailored in-context to the actual thing that was said.
 */
export interface Autoreply {
  /** Stable id for list edits. */
  id: string;
  /** When this base reply applies, e.g. "same-day quote request". */
  trigger: string;
  /** The exact base reply the agent sends (and adapts to context). */
  reply: string;
  /** Only enabled entries reach the reply context. */
  enabled: boolean;
}

/**
 * How the agent talks on one channel. Examples are raw chat snippets typed
 * like a human on that channel - fragments, no sign-offs - never brand-book
 * rules. Triage is what the agent pushes for first, in order. Autoreplies
 * are the toggleable base lines that flow into the reply context when on.
 */
export interface ChannelProfile {
  style: ChannelStyle;
  examples: string[];
  triage: string[];
  autoreplies: Autoreply[];
}

/** Working facts & boundaries the agent must keep in mind. */
export interface BrandMemory {
  rules: string[];
}

export interface BrandIntelligence {
  /** The related keyword the user picked during the reveal. */
  selectedKeyword?: string;
  /** Competitor domains confirmed during the reveal. */
  competitors: string[];
  /** Communities the user chose to listen in. */
  targetCommunities: CommunityPick[];
}

/**
 * The central brand record - one entity, one store key. Onboarding creates
 * the base (identity, location defaults, voice); the reveal enriches
 * intelligence as each machine step completes; DashboardBrand edits it;
 * listings, groups, and reply drafting all read it.
 */
export interface BrandEntity {
  /** "brand-default" (single workspace for now). */
  id: string;
  identity: BrandIdentity;
  location: BrandLocation;
  voice: BrandVoice;
  /** Services / products with quotable one-line details. */
  offerings: BrandOffering[];
  /** Indexed website pages - the future RAG namespace content. */
  sources: BrandPage[];
  /** Per-channel response profiles - how the agent texts each place. */
  channels: Record<BrandChannel, ChannelProfile>;
  /** Agent memory bank: pricing baselines, boundaries, jobs taken/declined. */
  memory: BrandMemory;
  intelligence: BrandIntelligence;
  /** URL the profile was extracted from (mock lookup for now). */
  sourceUrl: string;
  /** ISO timestamp of the last save. */
  updatedAt: string;
}

/** The three follow-up actions on the event inspect sheet. */
export type AiFollowUpAction = 'related' | 'communities' | 'reply';

/** A keyword target the brand wants to rank for, with example ranking pages. */
export interface KeywordTargetEntry {
  phrase: string;
  intent: string;
  pages: { title: string; href: string }[];
}

/** A Google Search / Dorking strategy card the user can select. */
export interface SearchStrategyEntry {
  id: string;
  category: string;
  title: string;
  problem: string;
  /** Query template with {keyword} and {site} placeholders. */
  dork: string;
}

/** The saved keyword + search-strategy mapping for the rest of the workflow. */
export interface KeywordStrategyMapping {
  targets: KeywordTargetEntry[];
  strategies: SearchStrategyEntry[];
  selectedPhrase?: string;
  competitors?: string[];
  groups?: CommunityPick[];
  interested?: string[];
  savedAt: string;
}

/** A community suggestion the reveal surfaced. */
export interface CommunityPick {
  id: string;
  platform: string;
  name: string;
  detail: string;
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function isCommunityPick(value: unknown): value is CommunityPick {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.platform === 'string' &&
    typeof value.name === 'string' &&
    typeof value.detail === 'string'
  );
}

export function isBrandVoiceExample(value: unknown): value is BrandVoiceExample {
  return (
    isRecord(value) && typeof value.situation === 'string' && typeof value.reply === 'string'
  );
}

export function isBrandOffering(value: unknown): value is BrandOffering {
  return isRecord(value) && typeof value.name === 'string' && typeof value.detail === 'string';
}

export function isBrandPage(value: unknown): value is BrandPage {
  return (
    isRecord(value) &&
    typeof value.url === 'string' &&
    typeof value.title === 'string' &&
    isStringArray(value.headings) &&
    typeof value.text === 'string' &&
    (value.status === 'indexed' || value.status === 'pending' || value.status === 'failed') &&
    typeof value.fetchedAt === 'string'
  );
}

export function isAutoreply(value: unknown): value is Autoreply {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.trigger === 'string' &&
    typeof value.reply === 'string' &&
    typeof value.enabled === 'boolean'
  );
}

export function isChannelProfile(value: unknown): value is ChannelProfile {
  return (
    isRecord(value) &&
    (value.style === 'casual' || value.style === 'standard') &&
    isStringArray(value.examples) &&
    isStringArray(value.triage) &&
    Array.isArray(value.autoreplies) &&
    (value.autoreplies as unknown[]).every(isAutoreply)
  );
}

export const BRAND_CHANNELS: BrandChannel[] = ['facebook', 'x', 'reddit'];

/** Fresh channel profiles: casual where buyers haggle, standard elsewhere. */
export function defaultChannels(): Record<BrandChannel, ChannelProfile> {
  const blank = (style: ChannelStyle): ChannelProfile => ({
    style,
    examples: [],
    triage: [],
    autoreplies: [],
  });
  return { facebook: blank('casual'), x: blank('standard'), reddit: blank('standard') };
}

export function isChannelMap(value: unknown): value is Record<BrandChannel, ChannelProfile> {
  return (
    isRecord(value) &&
    BRAND_CHANNELS.every((channel) => isChannelProfile(value[channel]))
  );
}

/**
 * Old rows predate per-channel autoreplies - keep the saved style, examples
 * and triage per channel and default the list to empty, instead of dropping
 * the whole map back to blanks.
 */
export function migrateChannelMap(value: Record<string, unknown>): Record<BrandChannel, ChannelProfile> {
  const fallback = defaultChannels();
  const next = { ...fallback };
  for (const channel of BRAND_CHANNELS) {
    const raw = value[channel];
    if (isChannelProfile(raw)) {
      next[channel] = raw;
    } else if (isRecord(raw)) {
      next[channel] = {
        style: raw.style === 'casual' || raw.style === 'standard' ? raw.style : fallback[channel].style,
        examples: Array.isArray(raw.examples)
          ? (raw.examples as unknown[]).filter((line): line is string => typeof line === 'string')
          : [],
        triage: Array.isArray(raw.triage)
          ? (raw.triage as unknown[]).filter((line): line is string => typeof line === 'string')
          : [],
        autoreplies: Array.isArray(raw.autoreplies)
          ? (raw.autoreplies as unknown[]).filter(isAutoreply)
          : [],
      };
    }
  }
  return next;
}

/** Runtime guard for the persisted brand row (shared by the store + server). */
export function isBrandEntity(value: unknown): value is BrandEntity {
  if (!isRecord(value)) return false;
  const { id, identity, location, voice, offerings, sources, channels, memory, intelligence, sourceUrl, updatedAt } = value;
  if (typeof id !== 'string') return false;
  if (!isRecord(identity) || typeof identity.name !== 'string' || typeof identity.website !== 'string') return false;
  if (typeof identity.tagline !== 'string') return false;
  if (
    !isRecord(location) ||
    typeof location.label !== 'string' ||
    typeof location.lat !== 'number' ||
    typeof location.lng !== 'number' ||
    typeof location.radiusKm !== 'number'
  )
    return false;
  if (
    !isRecord(voice) ||
    typeof voice.tone !== 'string' ||
    (voice.formality !== 'casual' && voice.formality !== 'professional' && voice.formality !== 'formal') ||
    !isStringArray(voice.dos) ||
    !isStringArray(voice.donts) ||
    !Array.isArray(voice.examples) ||
    !(voice.examples as unknown[]).every(isBrandVoiceExample)
  )
    return false;
  if (!Array.isArray(offerings) || !(offerings as unknown[]).every(isBrandOffering)) return false;
  if (!Array.isArray(sources) || !(sources as unknown[]).every(isBrandPage)) return false;
  if (!isChannelMap(channels)) return false;
  if (!isRecord(memory) || !isStringArray(memory.rules)) return false;
  if (!isRecord(intelligence) || !isStringArray(intelligence.competitors)) return false;
  if (
    intelligence.selectedKeyword !== undefined &&
    typeof intelligence.selectedKeyword !== 'string'
  )
    return false;
  if (!Array.isArray(intelligence.targetCommunities)) return false;
  if (
    !(intelligence.targetCommunities as unknown[]).every(isCommunityPick)
  )
    return false;
  return typeof sourceUrl === 'string' && typeof updatedAt === 'string';
}

/**
 * Migrate a persisted row into the v2 shape. Accepts v1 rows (bare-string
 * offerings, voice.serviceAreas, no sources/formality/dos/donts) and
 * returns null for anything unrecognizable.
 */
export function migrateBrandEntity(value: unknown): BrandEntity | null {
  if (isBrandEntity(value)) return value;
  if (!isRecord(value)) return null;
  try {
    const record = value as Record<string, unknown>;
    const voice = (isRecord(record.voice) ? record.voice : {}) as Record<string, unknown>;
    const location = (isRecord(record.location) ? record.location : {}) as Record<string, unknown>;
    const identity = (isRecord(record.identity) ? record.identity : {}) as Record<string, unknown>;
    const intelligence = (isRecord(record.intelligence) ? record.intelligence : {}) as Record<string, unknown>;
    const rawOfferings = Array.isArray(record.offerings) ? (record.offerings as unknown[]) : [];
    const offerings: BrandOffering[] = rawOfferings
      .map((offering) =>
        typeof offering === 'string'
          ? { name: offering, detail: '' }
          : isBrandOffering(offering)
            ? offering
            : { name: String((offering as { name?: unknown })?.name ?? ''), detail: '' }
      )
      .filter((offering) => offering.name.length > 0);
    const legacyAreas = Array.isArray(voice.serviceAreas)
      ? (voice.serviceAreas as unknown[]).filter((area): area is string => typeof area === 'string')
      : [];
    const label =
      typeof location.label === 'string' && location.label.length > 0
        ? location.label
        : legacyAreas.join(', ');
    const rawSources = Array.isArray(record.sources) ? (record.sources as unknown[]) : [];
    const formality =
      voice.formality === 'casual' || voice.formality === 'professional' || voice.formality === 'formal'
        ? voice.formality
        : 'professional';
    const candidate: BrandEntity = {
      id: typeof record.id === 'string' ? record.id : 'brand-default',
      identity: {
        name: typeof identity.name === 'string' ? identity.name : '',
        website: typeof identity.website === 'string' ? identity.website : '',
        tagline: typeof identity.tagline === 'string' ? identity.tagline : '',
        ...(typeof identity.logoUrl === 'string' ? { logoUrl: identity.logoUrl } : {}),
      },
      location: {
        label,
        lat: typeof location.lat === 'number' ? location.lat : 53.2707,
        lng: typeof location.lng === 'number' ? location.lng : -9.0568,
        radiusKm: typeof location.radiusKm === 'number' ? location.radiusKm : 10,
      },
      voice: {
        tone: typeof voice.tone === 'string' ? voice.tone : 'Friendly, plain-spoken local pro',
        formality,
        dos: Array.isArray(voice.dos) ? (voice.dos as unknown[]).filter((line): line is string => typeof line === 'string') : [],
        donts: Array.isArray(voice.donts) ? (voice.donts as unknown[]).filter((line): line is string => typeof line === 'string') : [],
        examples: Array.isArray(voice.examples) ? (voice.examples as unknown[]).filter(isBrandVoiceExample) : [],
      },
      offerings,
      sources: rawSources.filter(isBrandPage),
      channels: migrateChannelMap(isRecord(record.channels) ? record.channels : {}),
      memory: {
        rules: isRecord(record.memory) && Array.isArray(record.memory.rules)
          ? (record.memory.rules as unknown[]).filter((line): line is string => typeof line === 'string')
          : [],
      },
      intelligence: {
        ...(typeof intelligence.selectedKeyword === 'string' ? { selectedKeyword: intelligence.selectedKeyword } : {}),
        competitors: Array.isArray(intelligence.competitors)
          ? (intelligence.competitors as unknown[]).filter((line): line is string => typeof line === 'string')
          : [],
        targetCommunities: Array.isArray(intelligence.targetCommunities)
          ? (intelligence.targetCommunities as unknown[]).filter(isCommunityPick)
          : [],
      },
      sourceUrl: typeof record.sourceUrl === 'string' ? record.sourceUrl : '',
      updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : new Date(0).toISOString(),
    };
    return isBrandEntity(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

export interface MatchedAutoreply {
  /** Channel whose list held the winning entry. */
  channel: BrandChannel;
  /** Trigger of the winning entry. */
  trigger: string;
  /** Base reply text the draft sends verbatim. */
  reply: string;
}

export interface AiQuery {
  action: AiFollowUpAction;
  eventId: string;
  keywordId: string;
  platform: string;
  author: string;
  group: string;
  type: string;
  sentiment: string;
  text: string;
  url: string;
  trackedPhrases: string[];
  brand: BrandEntity | null;
  promptVersion: number;
  sourceRefs: BrandSourceRef[];
  matchedAutoreply?: MatchedAutoreply;
}

export interface ReplyContext {
  systemPrompt: string;
  promptVersion: number;
  sourceRefs: BrandSourceRef[];
}

export interface SimulatedReply {
  text: string;
  matched: boolean;
  matchedSource: 'autoreply' | 'example' | 'fallback';
  matchedTrigger?: string;
}

export interface SuggestedResource {
  kind: 'video' | 'guide' | 'page';
  title: string;
  url: string;
  blurb: string;
}
