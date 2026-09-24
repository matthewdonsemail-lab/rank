import type {
  BrandChannel,
  BrandEntity,
  BrandPage,
  CommunityPick,
  ReplyContext,
  SimulatedReply,
} from './types.ts';
import {
  buildReplyContext as helperBuildReplyContext,
  simulateOutbound as helperSimulateOutbound,
} from './helpers/index.ts';

export interface BrandIntelligenceInput {
  competitors?: string[];
  targetCommunities?: CommunityPick[];
  selectedKeyword?: string;
}

export interface BrandClientOptions {
  baseUrl?: string;
  fetcher?: typeof fetch;
}

/**
 * Standard typed client for Brand entity management, sources indexing,
 * intelligence appending, and reply simulation.
 */
export class BrandClient {
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(options: BrandClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? 'http://localhost:3002').replace(/\/$/, '');
    this.fetcher = options.fetcher ?? fetch;
  }

  public async getBrand(options?: { verifyDocBacking?: boolean }): Promise<BrandEntity | null> {
    const url = new URL(`${this.baseUrl}/api/brand`);
    if (options?.verifyDocBacking) {
      url.searchParams.set('verifyDocBacking', 'true');
    }
    const res = await this.fetcher(url.toString());
    if (!res.ok) throw new Error(`Brand request failed (${res.status})`);
    const data = (await res.json()) as { brand?: BrandEntity | null; data?: { brand?: BrandEntity | null } };
    return data.data ? data.data.brand ?? null : data.brand ?? null;
  }

  public async saveBrand(patch: Partial<BrandEntity>): Promise<BrandEntity> {
    const res = await this.fetcher(`${this.baseUrl}/api/brand`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error ?? `Could not save brand (${res.status})`);
    }
    const data = (await res.json()) as { brand: BrandEntity };
    return data.brand;
  }

  public async appendIntelligence(input: BrandIntelligenceInput): Promise<BrandEntity> {
    const res = await this.fetcher(`${this.baseUrl}/api/brand/intelligence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error ?? `Could not append brand intelligence (${res.status})`);
    }
    const data = (await res.json()) as { brand: BrandEntity };
    return data.brand;
  }

  public async getSources(): Promise<BrandPage[]> {
    const res = await this.fetcher(`${this.baseUrl}/api/brand/sources`);
    if (!res.ok) throw new Error(`Brand sources request failed (${res.status})`);
    const data = (await res.json()) as { sources: BrandPage[] };
    return data.sources;
  }

  public async indexSources(input?: { urls?: string[]; sitemap?: boolean }): Promise<{ brand: BrandEntity; sources: BrandPage[] }> {
    const res = await this.fetcher(`${this.baseUrl}/api/brand/index`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input ?? { sitemap: true }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error ?? `Could not index brand (${res.status})`);
    }
    return (await res.json()) as { brand: BrandEntity; sources: BrandPage[] };
  }

  public async removeSource(url: string): Promise<{ brand: BrandEntity; sources: BrandPage[] }> {
    const res = await this.fetcher(`${this.baseUrl}/api/brand/sources`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error ?? `Could not remove brand source (${res.status})`);
    }
    return (await res.json()) as { brand: BrandEntity; sources: BrandPage[] };
  }

  public async clearBrand(): Promise<void> {
    const res = await this.fetcher(`${this.baseUrl}/api/brand`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Could not clear brand (${res.status})`);
  }

  public async simulateOutbound(channel: BrandChannel, context: string): Promise<SimulatedReply> {
    const brand = await this.getBrand();
    return helperSimulateOutbound(brand, channel, context);
  }

  public async buildReplyContext(eventText: string): Promise<ReplyContext> {
    const brand = await this.getBrand();
    return helperBuildReplyContext(brand, eventText);
  }
}

export const brandClient = new BrandClient();
