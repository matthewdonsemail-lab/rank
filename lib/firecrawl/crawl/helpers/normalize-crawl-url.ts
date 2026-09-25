export type NormalizedCrawlUrl =
  | { ok: true; url: string }
  | { ok: false; reason: string };

const BLOCKED_SUFFIXES = [".local", ".internal", ".localhost", ".lan", ".home"];

function isNumericHost(hostname: string): boolean {
  return /^\d+(?:\.\d+){0,3}$/.test(hostname) || hostname.includes(":");
}

export function normalizeCrawlUrl(input: string): NormalizedCrawlUrl {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, reason: "A crawl URL is required." };

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return { ok: false, reason: "The crawl URL is not valid." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "The crawl URL must use HTTP or HTTPS." };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
  const blocked = BLOCKED_SUFFIXES.some((suffix) => hostname === suffix.slice(1) || hostname.endsWith(suffix));
  if (!hostname || hostname === "localhost" || blocked || isNumericHost(hostname) || parsed.username || parsed.password) {
    return { ok: false, reason: "The crawl URL must be a public website." };
  }

  parsed.protocol = "https:";
  parsed.hash = "";
  return { ok: true, url: parsed.toString() };
}
