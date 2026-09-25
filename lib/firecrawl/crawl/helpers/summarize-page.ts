/** The few facts about a page that are worth reading when deciding whether it fits a brand. */
export interface PageSummary {
  title: string | null;
  description: string | null;
  /** The start of the page's own text, cleaned of links, images and menu-like lines. */
  excerpt: string | null;
}

/** The parts of a scrape result this reads. A Firecrawl document has these, and so does anything shaped like one. */
export interface SummarizablePage {
  markdown?: unknown;
  metadata?: { title?: unknown; description?: unknown } | null;
}

const MAX_TITLE = 200;
const MAX_DESCRIPTION = 400;
export const MAX_EXCERPT = 800;

function text(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean ? clean.slice(0, max) : null;
}

/** A line that is navigation or a link list, not a sentence someone wrote about the page's subject. */
function isChrome(line: string): boolean {
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length < 5) return true;
  return /^(skip to|cookie|accept|sign in|log in|subscribe|menu|©|copyright)/i.test(line);
}

/**
 * Turn a scraped page into a title, a description and a short excerpt of real prose. Markdown links and images are
 * reduced to their visible text, headings lose their marks, and short menu-like lines are dropped, so the excerpt is
 * what the page says rather than how it is laid out.
 */
export function summarizePage(page: SummarizablePage): PageSummary {
  const markdown = typeof page.markdown === 'string' ? page.markdown : '';
  const lines = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[#>*\-+\s]+/, '').replace(/[*_`]+/g, '').replace(/\s+/g, ' ').trim())
    .filter((line) => line && !isChrome(line));

  return {
    title: text(page.metadata?.title, MAX_TITLE),
    description: text(page.metadata?.description, MAX_DESCRIPTION),
    excerpt: text(lines.join(' '), MAX_EXCERPT),
  };
}
