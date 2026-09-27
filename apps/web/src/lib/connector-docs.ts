/**
 * Connector docs loader — the Fumadocs pattern adapted to this Vite app.
 *
 * Fumadocs splits the job three ways: content files with frontmatter,
 * `_meta.json` for nav order and titles, and a loader (`loader({ baseUrl,
 * source })`) exposing `getPage(slug)` over the collection. This module is
 * that loader for `apps/web/content/connectors/`: `getConnectorPages()` walks
 * the `_meta.json` order and `getConnectorPage(id)` resolves one slug,
 * returning frontmatter plus body. Unknown slugs resolve to `undefined` and
 * the route redirects to the index — the equivalent of Fumadocs' notFound().
 *
 * Parity is enforced, not hoped for: `connectors.test.ts` asserts the
 * `_meta.json` keys equal the registry ids in order and every frontmatter
 * title equals the registry name, so nav, pages, CLI, MCP, and web cannot
 * name different connectors.
 */
import meta from "../../content/connectors/_meta.json";
import hermesGuide from "../../content/connectors/hermes.md?raw";
import claudeGuide from "../../content/connectors/claude.md?raw";
import codexGuide from "../../content/connectors/codex.md?raw";
import museGuide from "../../content/connectors/muse.md?raw";

const BODIES: Record<string, string> = {
  hermes: hermesGuide,
  claude: claudeGuide,
  codex: codexGuide,
  muse: museGuide,
};

export interface ConnectorDocPage {
  id: string;
  title: string;
  description: string;
  body: string;
}

/** Split `---` frontmatter from the body. Throws on malformed content so a
 * broken guide fails loudly in dev instead of rendering half a page. */
export function parseFrontmatter(raw: string): { title: string; description: string; body: string } {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(normalized);
  if (!match) throw new Error("Connector guide is missing frontmatter (title, description).");
  const fields: Record<string, string> = {};
  for (const line of (match[1] ?? "").split("\n")) {
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  const title = fields["title"] ?? "";
  const description = fields["description"] ?? "";
  if (!title || !description) throw new Error("Connector guide frontmatter needs a title and a description.");
  return { title, description, body: (match[2] ?? "").trimStart() };
}

/** Slugs in `_meta.json` order. */
export function getConnectorSlugs(): string[] {
  return Object.keys(meta as Record<string, string>);
}

export function getConnectorPage(id: string): ConnectorDocPage | undefined {
  const raw = BODIES[id];
  if (raw === undefined) return undefined;
  const { title, description, body } = parseFrontmatter(raw);
  return { id, title, description, body };
}

export function getConnectorPages(): ConnectorDocPage[] {
  const pages: ConnectorDocPage[] = [];
  for (const id of getConnectorSlugs()) {
    const page = getConnectorPage(id);
    if (page) pages.push(page);
  }
  return pages;
}
