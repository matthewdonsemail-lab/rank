export type ParsedSite = { ok: true; url: string; host: string } | { ok: false; reason: string };

/**
 * Turn what someone types after the fixed "www." in the hero box into a public https address.
 * Accepts a bare domain (acme.com), a pasted address (https://www.acme.com/pricing) or a sub-domain, and keeps only the
 * host. Anything that is not a public site name is refused with a plain sentence.
 */
export function parseWebsite(input: string): ParsedSite {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, reason: 'Type your website address first.' };

  const withoutScheme = trimmed.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
  const host = withoutScheme.split(/[/?#]/)[0].replace(/^www\./i, '').toLowerCase();

  if (host.includes('@') || host.includes(':')) return { ok: false, reason: 'Use just the site name, like acme.com.' };
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(host)) {
    return { ok: false, reason: 'That does not look like a website address. Try something like acme.com.' };
  }
  if (/\.(local|internal|localhost|lan|home)$/.test(host)) return { ok: false, reason: 'That needs a public website name, like acme.com.' };
  return { ok: true, url: `https://${host}`, host };
}
