import { ConvexError, v } from 'convex/values';
import { FirecrawlCrawlClient } from '../lib/firecrawl/crawl/index.js';
import { components, internal } from './_generated/api.js';
import { BRAND_SCHEMA, businessSummary, normalizeWebsite, parseBrandFacts, type BrandFacts } from './lib/firecrawl.js';
import { action, internalMutation, query, requireOwner } from './lib/server.js';

const firecrawl = FirecrawlCrawlClient.fromComponent(components.firecrawl);

const COOLDOWN_MS = 30_000;

const factsValidator = v.object({
  name: v.string(),
  tagline: v.string(),
  offerings: v.array(v.object({ name: v.string(), detail: v.string() })),
  tone: v.optional(v.string()),
  formality: v.optional(v.union(v.literal('casual'), v.literal('professional'), v.literal('formal'))),
  locationLabel: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
});

function plainReason(error: unknown): string {
  if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
    return 'That website took too long to read. Try again.';
  }
  return error instanceof Error && error.message ? error.message : 'Could not read that website.';
}

/**
 * Read the person own website with Firecrawl and remember what it says about the business.
 */
export const extractFromWebsite = action({
  args: { url: v.string() },
  handler: async (ctx, args): Promise<BrandFacts & { sourceUrl: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Authentication required');
    const owner = identity.tokenIdentifier;
    const target = normalizeWebsite(args.url);
    if (!target.ok) throw new ConvexError(target.reason);

    const claimRef = (internal as any).brand?.claim ?? 'brand:claim';
    await ctx.runMutation(claimRef, { owner, kind: 'facts' });

    let facts: BrandFacts | null;
    try {
      const result = await firecrawl.scrape(ctx, target.url, {
        formats: [{ type: 'json', schema: BRAND_SCHEMA as Record<string, unknown> }],
        onlyMainContent: true,
      });
      facts = parseBrandFacts(result.json);
    } catch (error) {
      console.error('brand: Firecrawl failed', error instanceof Error ? error.message : error);
      throw new ConvexError(plainReason(error));
    }

    if (!facts) throw new ConvexError('That page did not say enough about the business to read a name from it');

    const storeRef = (internal as any).brand?.store ?? 'brand:store';
    await ctx.runMutation(storeRef, { owner, sourceUrl: target.url, facts });
    return { ...facts, sourceUrl: target.url };
  },
});

/**
 * List the person own website pages with Firecrawl map.
 */
export const mapWebsite = action({
  args: { url: v.string() },
  handler: async (ctx, args): Promise<{ sourceUrl: string; links: { url: string; title?: string }[] }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Authentication required');
    const owner = identity.tokenIdentifier;
    const target = normalizeWebsite(args.url);
    if (!target.ok) throw new ConvexError(target.reason);

    const claimRef = (internal as any).brand?.claim ?? 'brand:claim';
    await ctx.runMutation(claimRef, { owner, kind: 'map' });

    try {
      const result = await firecrawl.map(ctx, target.url, {
        limit: 25,
        ignoreQueryParameters: true,
      });
      return { sourceUrl: target.url, links: result.links.slice(0, 7) };
    } catch (error) {
      console.error('brand: Firecrawl map failed', error instanceof Error ? error.message : error);
      throw new ConvexError(plainReason(error));
    }
  },
});

/** Starts a read of one kind: refuses a second one inside the cooldown. */
export const claim = internalMutation({
  args: { owner: v.string(), kind: v.union(v.literal('facts'), v.literal('map')) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const row = await ctx.db
      .query('brands')
      .withIndex('by_owner', (q) => q.eq('owner', args.owner))
      .first();
    const last = args.kind === 'map' ? (row?.lastMapAt ?? 0) : (row?.lastAttemptAt ?? 0);
    if (now - last < COOLDOWN_MS) {
      throw new ConvexError('Please wait a few seconds before reading again.');
    }
    const stamp = args.kind === 'map' ? { lastMapAt: now } : { lastAttemptAt: now };
    if (row) {
      await ctx.db.patch(row._id, stamp);
    } else {
      await ctx.db.insert('brands', {
        owner: args.owner,
        sourceUrl: '',
        name: '',
        tagline: '',
        offerings: [],
        fetchedAt: 0,
        lastAttemptAt: args.kind === 'facts' ? now : 0,
        ...(args.kind === 'map' ? { lastMapAt: now } : {}),
      });
    }
    return null;
  },
});

export const store = internalMutation({
  args: { owner: v.string(), sourceUrl: v.string(), facts: factsValidator },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('brands')
      .withIndex('by_owner', (q) => q.eq('owner', args.owner))
      .first();
    const fields = {
      owner: args.owner,
      sourceUrl: args.sourceUrl,
      ...args.facts,
      fetchedAt: Date.now(),
      lastAttemptAt: row?.lastAttemptAt ?? Date.now(),
      ...(row?.lastMapAt !== undefined ? { lastMapAt: row.lastMapAt } : {}),
    };
    if (row) {
      await ctx.db.replace(row._id, fields);
    } else {
      await ctx.db.insert('brands', fields);
    }
    return null;
  },
});

/** What was last read from this person website, or null if they have not done that. */
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);
    const row = await ctx.db
      .query('brands')
      .withIndex('by_owner', (q) => q.eq('owner', owner))
      .first();
    if (!row || row.fetchedAt === 0) return null;
    return {
      sourceUrl: row.sourceUrl,
      name: row.name,
      tagline: row.tagline,
      offerings: row.offerings,
      tone: row.tone ?? null,
      formality: row.formality ?? null,
      locationLabel: row.locationLabel ?? null,
      logoUrl: row.logoUrl ?? null,
      fetchedAt: row.fetchedAt,
      summary: businessSummary(row),
    };
  },
});
