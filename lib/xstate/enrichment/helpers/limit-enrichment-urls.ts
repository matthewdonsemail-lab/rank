const MAX_MAPPED_URLS = 25;

export function limitEnrichmentUrls(urls: string[], maximum = MAX_MAPPED_URLS): string[] {
  return Array.from(new Set(urls.filter((url) => typeof url === "string" && url.trim()))).slice(0, maximum);
}
