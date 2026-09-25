import { describe, expect, it } from 'vitest';
import { mapWithConcurrency } from './map-with-concurrency.js';
import { MAX_EXCERPT, summarizePage } from './summarize-page.js';

const markdown = `
[Skip to content](#main)
# Acme Plumbing
[Home](/) [About](/about) [Contact](/contact)
![logo](https://acme.test/logo.png)

We fix leaking pipes and install new boilerplate systems for homes across Leeds, with same day call outs.

## Services
- Emergency repairs at any hour of the day or night
* Bathroom and kitchen installations for new builds
Sign in to your account
Cookie settings and preferences for this website
`;

describe('summarizePage', () => {
  it('keeps the title and description, cleaned', () => {
    const s = summarizePage({ markdown, metadata: { title: '  Acme   Plumbing ', description: 'Leeds plumbers.' } });
    expect(s.title).toBe('Acme Plumbing');
    expect(s.description).toBe('Leeds plumbers.');
  });

  it('keeps sentences and drops links, images, headings marks, menus and cookie lines', () => {
    const { excerpt } = summarizePage({ markdown });
    expect(excerpt).toContain('We fix leaking pipes and install new boilerplate systems');
    expect(excerpt).toContain('Emergency repairs at any hour');
    expect(excerpt).toContain('Bathroom and kitchen installations');
    expect(excerpt).not.toMatch(/https?:|\]\(|!\[|Skip to|Sign in|Cookie|Home About/);
    expect(excerpt).not.toContain('#');
  });

  it('cuts a long page to the excerpt limit', () => {
    const long = 'This sentence has plenty of ordinary words in it.\n'.repeat(200);
    expect(summarizePage({ markdown: long }).excerpt!.length).toBeLessThanOrEqual(MAX_EXCERPT);
  });

  it('returns nulls for an empty, missing or non-text page', () => {
    const none = { title: null, description: null, excerpt: null };
    expect(summarizePage({})).toEqual(none);
    expect(summarizePage({ markdown: 42, metadata: { title: 7, description: '  ' } })).toEqual(none);
    expect(summarizePage({ markdown: '# Hi\n- a\n- b', metadata: null })).toEqual(none);
  });
});

describe('mapWithConcurrency', () => {
  it('keeps result order, never runs more than the limit at once, and survives a failing item', async () => {
    let running = 0;
    let peak = 0;
    const out = await mapWithConcurrency([1, 2, 3, 4, 5, 6], 2, async (n) => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((r) => setTimeout(r, 5));
      running -= 1;
      if (n === 3) throw new Error('bad page');
      return n * 10;
    });
    expect(out).toEqual([10, 20, undefined, 40, 50, 60]);
    expect(peak).toBe(2);
  });

  it('handles no items', async () => {
    expect(await mapWithConcurrency([], 5, async () => 1)).toEqual([]);
  });
});
