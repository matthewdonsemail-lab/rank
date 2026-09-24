import { z } from 'zod';
import type { BrandEntity } from '../types.ts';
import { defaultChannels } from '../types.ts';

export const websiteFactsSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  offerings: z.array(z.object({ name: z.string(), detail: z.string() })),
  tone: z.string().optional(),
  formality: z.enum(['casual', 'professional', 'formal']).optional(),
  locationLabel: z.string().optional(),
  logoUrl: z.string().optional(),
  sourceUrl: z.string(),
});

export type WebsiteFacts = z.infer<typeof websiteFactsSchema>;

export const siteMapSchema = z.object({
  sourceUrl: z.string(),
  links: z.array(z.object({ url: z.string(), title: z.string().optional() })),
});

export type SiteMap = z.infer<typeof siteMapSchema>;

/**
 * Lay what the website actually said over the starting brand. Only fields the site provided replace the
 * defaults; nothing is invented, so a thin page leaves the rest as it was.
 */
export function applyWebsiteFacts(
  base: Omit<BrandEntity, 'updatedAt'>,
  facts: WebsiteFacts
): Omit<BrandEntity, 'updatedAt'> {
  const website = (() => {
    try {
      return new URL(facts.sourceUrl).origin;
    } catch {
      return base.identity.website;
    }
  })();
  return {
    ...base,
    identity: {
      ...base.identity,
      name: facts.name,
      website,
      tagline: facts.tagline || base.identity.tagline,
      ...(facts.logoUrl ? { logoUrl: facts.logoUrl } : {}),
    },
    location: facts.locationLabel ? { ...base.location, label: facts.locationLabel } : base.location,
    voice: {
      ...base.voice,
      ...(facts.tone ? { tone: facts.tone } : {}),
      ...(facts.formality ? { formality: facts.formality } : {}),
    },
    offerings: facts.offerings.length > 0 ? facts.offerings : base.offerings,
    sourceUrl: facts.sourceUrl,
  };
}

function humanizeHost(host: string): string {
  const cleaned = host
    .replace(/^www\./, '')
    .split('.')
    .slice(0, -1)
    .join(' ');
  return cleaned
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** A placeholder brand for someone who skips the website step. */
export function skippedBrand(): Omit<BrandEntity, 'updatedAt'> {
  return {
    id: 'brand-default',
    identity: { name: 'Your business', website: '', tagline: '' },
    location: { label: '', lat: 53.2707, lng: -9.0568, radiusKm: 10 },
    offerings: [],
    voice: {
      tone: 'Friendly, plain-spoken local pro',
      formality: 'professional',
      dos: [],
      donts: [],
      examples: [],
    },
    sources: [],
    channels: defaultChannels(),
    memory: { rules: [] },
    intelligence: { competitors: [], targetCommunities: [] },
    sourceUrl: '',
  };
}

/**
 * Honest brand extraction from a website URL: normalizes URL, derives a display
 * name from the hostname, and seeds a base BrandEntity.
 */
export function extractBrandFromUrl(input: string): Omit<BrandEntity, 'updatedAt'> {
  const trimmed = input.trim();
  if (!trimmed) throw new Error('Paste your website URL first.');
  const normalized = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    throw new Error('That URL does not parse - check it and try again.');
  }
  if (!url.hostname.includes('.')) throw new Error('That URL needs a domain, e.g. acmeplumbing.com.');
  const name = humanizeHost(url.hostname) || url.hostname;
  const website = url.origin + (url.pathname === '/' ? '' : url.pathname);
  return {
    id: 'brand-default',
    identity: {
      name,
      website,
      tagline: '',
    },
    location: { label: '', lat: 53.2707, lng: -9.0568, radiusKm: 10 },
    offerings: [],
    voice: {
      tone: 'Friendly, plain-spoken local pro',
      formality: 'professional',
      dos: [],
      donts: [],
      examples: [],
    },
    sources: [],
    channels: defaultChannels(),
    memory: { rules: [] },
    intelligence: { competitors: [], targetCommunities: [] },
    sourceUrl: url.href,
  };
}
