import type { BrandPage } from '../types.ts';

/**
 * Deterministic seed pages for a freshly extracted brand - the mock stand-in
 * for the sitemap fetch. No network: the same hostname always seeds the same
 * four pages (homepage, services, about, contact) with text that names the
 * brand, so drafts and prompt previews have real copy to quote.
 */
export function seedSourcesFor(website: string, brandName: string): BrandPage[] {
  const base = website.replace(/\/$/, '');
  const fetchedAt = new Date().toISOString();
  const page = (
    path: string,
    title: string,
    headings: string[],
    text: string
  ): BrandPage => ({
    url: `${base}${path}`,
    title: `${title} - ${brandName}`,
    headings,
    text,
    status: 'indexed',
    fetchedAt,
  });

  return [
    page(
      '',
      'Home',
      ['Welcome', 'Why choose us'],
      `${brandName} - heard across social. ${brandName} serves local customers with fast response times and plain-spoken quotes. Call or message for a free estimate.`
    ),
    page(
      '/services',
      'Services',
      ['What we do', 'Service area'],
      `${brandName} services include emergency callouts, boiler installs, and leak repair. Every job is quoted up front with no hidden fees.`
    ),
    page(
      '/about',
      'About',
      ['Our story', 'The crew'],
      `${brandName} is a locally run crew with years on the tools. We answer our own phones and stand behind every job.`
    ),
    page(
      '/contact',
      'Contact',
      ['Get in touch', 'Hours'],
      `Reach ${brandName} by phone or message, seven days a week. Emergency callouts answered around the clock.`
    ),
  ];
}

/** Re-resolve a sitemap into the seed page list (mock: same four pages). */
export function resolveSitemap(website: string, brandName: string): BrandPage[] {
  return seedSourcesFor(website, brandName);
}
