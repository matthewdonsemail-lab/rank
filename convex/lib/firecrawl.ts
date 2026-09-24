/** Read a business's own website with Firecrawl and turn it into the facts the brand step needs. */

export const FIRECRAWL_URL = 'https://api.firecrawl.dev/v2/scrape';
export const FORMALITIES = ['casual', 'professional', 'formal'] as const;
export type Formality = typeof FORMALITIES[number];

export type BrandFacts = {
  name: string;
  tagline: string;
  offerings: { name: string; detail: string }[];
  tone?: string;
  formality?: Formality;
  locationLabel?: string;
  logoUrl?: string;
};

const MAX_OFFERINGS = 8;

/** What we ask Firecrawl model to pull out of the page. */
export const BRAND_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'The business name as the site writes it' },
    tagline: { type: 'string', description: 'One short sentence saying what the business does' },
    offerings: {
      type: 'array',
      description: 'The main services or products actually described on the page, at most 8',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, detail: { type: 'string', description: 'One short factual line' } },
        required: ['name'],
      },
    },
    tone: { type: 'string', description: 'How the site sounds in a few words, e.g. friendly and plain-spoken' },
    formality: { type: 'string', enum: [...FORMALITIES] },
    location: { type: 'string', description: 'The town or area the business serves, if the page says so' },
    logo_url: { type: 'string', description: 'Absolute URL of the logo image, if there is one' },
  },
  required: ['name'],
} as const;

/** A public https website, or a human-readable reason it cannot be read. Blocks internal and numeric hosts. */
export function normalizeWebsite(input: string): { ok: true; url: string } | { ok: false; reason: string } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, reason: 'Paste your website address first.' };
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return { ok: false, reason: 'That address does not parse. Check it and try again.' };
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return { ok: false, reason: 'Use a normal website address, like acmeplumbing.com.' };
  const host = url.hostname.toLowerCase();
  const numeric = /^[\d.]+$/.test(host) || host.includes(':') || host.startsWith('[');
  const internal = host === 'localhost' || !host.includes('.') || /\.(local|internal|localhost|lan|home)$/.test(host);
  if (numeric || internal || url.username || url.password) return { ok: false, reason: 'That needs a public website name, like acmeplumbing.com.' };
  url.protocol = 'https:';
  url.hash = '';
  return { ok: true, url: url.toString() };
}

/** What an extraction model writes when the page did not say. */
const NOTHING = /^(n\/?a|none|null|nil|unknown|undefined|not (specified|provided|mentioned|available|stated|applicable)|no (information|data)|-+)\.?$/i;

function clean(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const text = value.replace(/\s+/g, ' ').trim();
  return text && !NOTHING.test(text) ? text.slice(0, max) : undefined;
}

/** Keeps only a logo that is an absolute https address. */
function cleanLogo(value: unknown): string | undefined {
  const text = clean(value, 500);
  if (!text) return undefined;
  try {
    const url = new URL(text);
    return url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Checks, trims and caps website fields. Null when there is no usable business name.
 */
export function parseBrandFacts(raw: unknown): BrandFacts | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  const name = clean(row.name, 120);
  if (!name) return null;
  const offerings: BrandFacts['offerings'] = [];
  if (Array.isArray(row.offerings)) {
    for (const item of row.offerings) {
      if (offerings.length >= MAX_OFFERINGS || typeof item !== 'object' || item === null) continue;
      const offer = item as Record<string, unknown>;
      const offerName = clean(offer.name, 80);
      if (offerName) offerings.push({ name: offerName, detail: clean(offer.detail, 200) ?? '' });
    }
  }
  const formality = FORMALITIES.find((word) => word === row.formality);
  const tone = clean(row.tone, 120);
  const locationLabel = clean(row.location, 120);
  const logoUrl = cleanLogo(row.logo_url);
  return {
    name,
    tagline: clean(row.tagline, 200) ?? '',
    offerings,
    ...(tone ? { tone } : {}),
    ...(formality ? { formality } : {}),
    ...(locationLabel ? { locationLabel } : {}),
    ...(logoUrl ? { logoUrl } : {}),
  };
}

/** One Firecrawl call. */
export async function scrapeBrand(fetcher: typeof fetch, apiKey: string, url: string): Promise<BrandFacts> {
  const res = await fetcher(FIRECRAWL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, formats: [{ type: 'json', schema: BRAND_SCHEMA }], onlyMainContent: true, timeout: 45_000 }),
    signal: AbortSignal.timeout(55_000),
  });
  if (res.status === 401 || res.status === 403) throw new Error('Firecrawl refused the API key');
  if (res.status === 402) throw new Error('The Firecrawl account is out of credits');
  if (res.status === 429) throw new Error('Firecrawl is busy, try again in a minute');
  if (!res.ok) throw new Error(`Firecrawl answered HTTP ${res.status}`);
  const data = (await res.json()) as { success?: unknown; data?: { json?: unknown; metadata?: { statusCode?: unknown } } };
  if (data.success !== true) throw new Error('Firecrawl could not read that website');
  const status = data.data?.metadata?.statusCode;
  if (typeof status === 'number' && status >= 400) throw new Error(`That website answered HTTP ${status}`);
  const facts = parseBrandFacts(data.data?.json);
  if (!facts) throw new Error('That page did not say enough about the business to read a name from it');
  return facts;
}

/** A short summary of the business for the scoring prompt. */
export function businessSummary(brand: { name: string; tagline: string; offerings: { name: string }[] } | null): string | null {
  if (!brand) return null;
  const offers = brand.offerings.slice(0, 6).map((item) => item.name).join(', ');
  const parts = [brand.name, brand.tagline, offers ? `Offers: ${offers}` : ''].filter(Boolean);
  return parts.join(' - ').slice(0, 500);
}

export const FIRECRAWL_MAP_URL = 'https://api.firecrawl.dev/v2/map';

/** One page Firecrawl map found on the site. */
export type SiteLink = {
  url: string;
  title?: string;
};

/**
 * Keep only what the map really found on this site: same-origin https pages,
 * deduped, titles trimmed.
 */
export function parseSiteLinks(raw: unknown, origin: string): SiteLink[] {
  if (typeof raw !== 'object' || raw === null) return [];
  const links = Array.isArray(raw) ? raw : (raw as { links?: unknown }).links;
  if (!Array.isArray(links)) return [];
  const out: SiteLink[] = [];
  const seen = new Set<string>();
  for (const item of links) {
    if (typeof item !== 'object' || item === null) continue;
    const record = item as Record<string, unknown>;
    if (typeof record.url !== 'string') continue;
    let parsed: URL;
    try {
      parsed = new URL(record.url);
    } catch {
      continue;
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') continue;
    if (parsed.origin !== origin) continue;
    parsed.hash = '';
    const url = parsed.toString();
    if (seen.has(url)) continue;
    seen.add(url);
    const title = typeof record.title === 'string' && record.title.trim() ? record.title.trim().slice(0, 120) : undefined;
    out.push(title ? { url, title } : { url });
  }
  return out;
}

/** List the site own pages with Firecrawl map. */
export async function mapSite(fetcher: typeof fetch, apiKey: string, url: string, limit = 25): Promise<SiteLink[]> {
  const res = await fetcher(FIRECRAWL_MAP_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, limit, ignoreQueryParameters: true }),
    signal: AbortSignal.timeout(55_000),
  });
  if (res.status === 401 || res.status === 403) throw new Error('Firecrawl refused the API key');
  if (res.status === 402) throw new Error('The Firecrawl account is out of credits');
  if (res.status === 429) throw new Error('Firecrawl is busy, try again in a minute');
  if (!res.ok) throw new Error(`Firecrawl answered HTTP ${res.status}`);
  const data = (await res.json()) as { success?: unknown; links?: unknown };
  if (data.success !== true || !Array.isArray(data.links)) throw new Error('Firecrawl could not map that website');
  return parseSiteLinks(data.links, new URL(url).origin);
}
