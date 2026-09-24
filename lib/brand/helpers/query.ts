import type {
  AiFollowUpAction,
  AiQuery,
  BrandChannel,
  BrandEntity,
  MatchedAutoreply,
  SuggestedResource,
} from '../types.ts';
import { buildReplyContext, PROMPT_VERSION } from './prompt.ts';

export interface BrandQueryEvent {
  id: string;
  keywordId: string;
  platform: string;
  author: string;
  group: string;
  type: string;
  sentiment: string;
  text: string;
  url: string;
}

/**
 * Build the query a follow-up action runs: the captured event plus the
 * brand snapshot the mock AI drafts against.
 */
export function buildAiQuery(
  action: AiFollowUpAction,
  event: BrandQueryEvent,
  brand: BrandEntity | null,
  trackedPhrases: string[]
): AiQuery {
  const context = buildReplyContext(brand, event.text);
  const matchedAutoreply = matchAutoreply(brand, event.platform, event.text);
  return {
    action,
    eventId: event.id,
    keywordId: event.keywordId,
    platform: event.platform,
    author: event.author,
    group: event.group,
    type: event.type,
    sentiment: event.sentiment,
    text: event.text,
    url: event.url,
    trackedPhrases,
    brand,
    promptVersion: context.promptVersion,
    sourceRefs: context.sourceRefs,
    ...(matchedAutoreply ? { matchedAutoreply } : {}),
  };
}

export { PROMPT_VERSION };

const STOPWORDS = new Set(
  'a,an,and,are,as,at,be,but,by,can,could,did,do,does,for,from,had,has,have,here,how,if,in,into,is,it,its,just,like,look,looking,me,my,need,not,now,of,off,on,one,or,our,out,over,said,so,some,supposed,take,than,that,the,their,there,they,this,three,through,to,too,very,was,we,were,what,when,where,which,who,will,with,you,your,anyone,dealt,lately,pointers,week,alone,weekend,list,adding,quick,call,someone,cost,supposed,whole,still,waiting,third,month,quoted,double,neighbour,paid,again,shoutout,crew,sorted,visit,done,dusted,half,feared,spotless,work,anybody,dealt,threads,about,show,fuming,flooded,utility,room,legends,quote,recommendations'.split(
    ','
  )
);

function tokensOf(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .map((word) => word.replace(/^'+|'+$/g, ''))
    .filter((word) => word.length >= 4 && !STOPWORDS.has(word));
}

/**
 * Candidate keyword phrases from the event text: surviving single tokens
 * plus adjacent bigrams, minus anything already tracked. Deterministic.
 */
export function suggestKeywords(
  event: Pick<BrandQueryEvent, 'text'>,
  trackedPhrases: string[],
  limit = 5
): string[] {
  const tracked = new Set(trackedPhrases.map((phrase) => phrase.toLowerCase().trim()));
  const tokens = tokensOf(event.text).filter((token) => ![...tracked].some((phrase) => phrase.includes(token)));
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (phrase: string) => {
    const clean = phrase.trim();
    if (!clean || tracked.has(clean) || seen.has(clean)) return;
    seen.add(clean);
    if (out.length < limit) out.push(clean);
  };
  for (let i = 0; i < tokens.length && out.length < limit; i++) {
    if (i + 1 < tokens.length) push(`${tokens[i]} ${tokens[i + 1]}`);
    push(tokens[i]);
  }
  return out;
}

/**
 * Suggestions across several texts (post body plus replies).
 */
export function suggestAcross(
  texts: string[],
  event: BrandQueryEvent,
  excluded: string[],
  limit = 5
): string[] {
  const out: string[] = [];
  for (const text of texts) {
    if (out.length >= limit) break;
    for (const phrase of suggestKeywords({ text }, [...excluded, ...out], limit)) {
      if (out.length >= limit) break;
      if (!out.includes(phrase)) out.push(phrase);
    }
  }
  return out;
}

const BRAND_CHANNELS: BrandChannel[] = ['facebook', 'x', 'reddit'];

function channelForPlatform(platform: string): BrandChannel | null {
  const normalized = platform.toLowerCase();
  if (normalized.includes('facebook') || normalized.includes('marketplace')) return 'facebook';
  if (normalized === 'x' || normalized.includes('twitter')) return 'x';
  if (normalized.includes('reddit')) return 'reddit';
  return null;
}

/**
 * Best enabled autoreply for an event: scores the event text against each
 * candidate trigger + reply.
 */
export function matchAutoreply(
  brand: BrandEntity | null,
  platform: string,
  text: string
): MatchedAutoreply | null {
  if (!brand) return null;
  const tokens = tokensOf(text);
  if (tokens.length === 0) return null;
  const preferred = channelForPlatform(platform);
  const ordered = [...(preferred ? [preferred] : []), ...BRAND_CHANNELS.filter((channel) => channel !== preferred)];
  let best: MatchedAutoreply | null = null;
  let bestScore = 0;

  for (const channel of ordered) {
    for (const entry of brand.channels[channel].autoreplies) {
      if (!entry.enabled || !entry.reply.trim()) continue;
      const haystack = `${entry.trigger} ${entry.reply}`.toLowerCase();
      const score = tokens.filter((token) => haystack.includes(token)).length;
      if (score > bestScore) {
        bestScore = score;
        best = { channel, trigger: entry.trigger.trim(), reply: entry.reply.trim() };
      }
    }
  }
  return best;
}

/**
 * Mock reply draft: a matched enabled autoreply sends verbatim - it is the
 * approved base line for that situation. Otherwise the event words
 * answered in the brand voice.
 */
export function draftReply(query: AiQuery): string {
  if (query.matchedAutoreply) return query.matchedAutoreply.reply;
  const brandName = query.brand?.identity.name;
  const offering = query.brand?.offerings[0]?.name;
  const area = query.brand?.location.label || undefined;
  const signoff = brandName ? ` - ${brandName}` : ' - the team';
  const serviceBit = offering ? ` We do ${offering.toLowerCase()}${area ? ` across ${area}` : ''}.` : '';

  switch (query.type) {
    case 'question':
      return `Hi ${query.author} - great question.${serviceBit} Send us a DM with the details and we'll sort a time that suits.${signoff}`;
    case 'complaint':
      return `Hi ${query.author} - really sorry about this, that's not how it should go.${serviceBit} DM us your details and we'll make it right.${signoff}`;
    case 'praise':
      return `Thank you ${query.author}! Reviews like this keep the crew going.${serviceBit ? ` If you ever need ${offering?.toLowerCase()} again, you know where to find us.` : ''}${signoff}`;
    default:
      return `Hi ${query.author} - thanks for posting this.${serviceBit} Give us a shout if we can help.${signoff}`;
  }
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'topic';
}

function youtubeSearchUrl(brandName: string, topic: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${brandName} ${topic}`)}`;
}

/**
 * Suggested resource to attach to a reply: matched to the post topic.
 */
export function suggestResource(query: AiQuery): SuggestedResource {
  const brand = query.brand;
  const topic = query.trackedPhrases[0]?.trim() || 'this';
  const site = brand?.identity.website.replace(/\/$/, '');
  const brandName = brand?.identity.name ?? 'the team';
  let hash = 0;
  for (let i = 0; i < query.eventId.length; i++) hash = (hash * 31 + query.eventId.charCodeAt(i)) | 0;
  const roll = Math.abs(hash);

  const video: SuggestedResource = {
    kind: 'video',
    title: `${brandName} on ${topic} - worth a watch`,
    url: youtubeSearchUrl(brand?.identity.name ?? topic, topic),
    blurb: `Someone talking through ${topic} on camera - lands better than a wall of text.`,
  };
  const siteGuide: SuggestedResource | null = site
    ? {
        kind: 'guide',
        title: `${topic} - how we handle it`,
        url: `${site}/guides/${slugify(topic)}`,
        blurb: `The write-up on ${topic}, straight from the site.`,
      }
    : null;
  const supportPage: SuggestedResource | null = site
    ? {
        kind: 'page',
        title: `Support - ${brandName}`,
        url: `${site}/support`,
        blurb: `Somewhere to send them that isn't the thread.`,
      }
    : null;
  const reviewsPage: SuggestedResource | null = site
    ? {
        kind: 'page',
        title: `Reviews - ${brandName}`,
        url: `${site}/reviews`,
        blurb: `Strike while they're happy - point them at the reviews page.`,
      }
    : null;
  const servicesPage: SuggestedResource | null = site
    ? {
        kind: 'page',
        title: `${brandName} - services`,
        url: `${site}/services`,
        blurb: `The services page, for when curiosity turns into intent.`,
      }
    : null;

  const pools: Record<string, (SuggestedResource | null)[]> = {
    question: [video, siteGuide],
    complaint: [supportPage, video],
    praise: [reviewsPage, video],
    mention: [servicesPage, video],
  };
  const pool = (pools[query.type] ?? [video]).filter(
    (resource): resource is SuggestedResource => resource !== null
  );
  return pool[roll % pool.length] ?? video;
}
