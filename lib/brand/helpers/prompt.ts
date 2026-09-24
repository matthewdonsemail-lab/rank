import type { BrandChannel, BrandEntity, BrandSourceRef, ReplyContext, SimulatedReply } from '../types.ts';

/**
 * Voice -> system prompt compiler. Deterministic and versioned: the same
 * brand always compiles to the same prompt, and every draft records the
 * version that produced it so voice edits never silently rewrite history.
 */
export const PROMPT_VERSION = 2;

const FORMALITY_LINES: Record<BrandEntity['voice']['formality'], string> = {
  casual: 'Keep it casual: contractions, short sentences, first names, a warm sign-off.',
  professional: 'Keep it professional but plain-spoken: clear sentences, no jargon, a brief sign-off.',
  formal: 'Keep it formal: full sentences, titles where known, a courteous sign-off.',
};

/**
 * Compile the exact system prompt the agent receives - identity line, tone
 * and formality rules, offerings with details, dos / don'ts verbatim, then
 * the gold examples in full.
 */
export function buildBrandSystemPrompt(brand: BrandEntity): string {
  const lines: string[] = [
    `You speak as ${brand.identity.name}${brand.identity.tagline ? ` - ${brand.identity.tagline}` : ''}.`,
    `Voice: ${brand.voice.tone}`,
    FORMALITY_LINES[brand.voice.formality],
  ];
  if (brand.offerings.length > 0) {
    lines.push('Services you can mention:');
    for (const offering of brand.offerings) {
      lines.push(`- ${offering.name}${offering.detail ? `: ${offering.detail}` : ''}`);
    }
  }
  if (brand.location.label) {
    lines.push(`Service area: ${brand.location.label}.`);
  }
  if (brand.memory.rules.length > 0) {
    lines.push('Working facts - never contradict these:');
    for (const rule of brand.memory.rules) {
      lines.push(`- ${rule}`);
    }
  }
  for (const rule of brand.voice.dos) {
    lines.push(`Do: ${rule}`);
  }
  for (const rule of brand.voice.donts) {
    lines.push(`Never: ${rule}`);
  }
  if (brand.voice.examples.length > 0) {
    lines.push('Example replies to mimic:');
    for (const example of brand.voice.examples) {
      lines.push(`[${example.situation}] ${example.reply}`);
    }
  }
  const enabledAutoreplies = (['facebook', 'x', 'reddit'] as const).flatMap((channel) =>
    brand.channels[channel].autoreplies
      .filter((entry) => entry.enabled && entry.reply.trim())
      .map((entry) => ({ channel, entry }))
  );
  if (enabledAutoreplies.length > 0) {
    lines.push('Enabled base replies - when the lead context matches a trigger, adapt that reply to their actual words and send it:');
    for (const { channel, entry } of enabledAutoreplies) {
      const trigger = entry.trigger.trim() ? `[${channel} . ${entry.trigger.trim()}] ` : `[${channel}] `;
      lines.push(`- ${trigger}${entry.reply.trim()}`);
    }
  }
  return lines.join('\n');
}

/** Up-front retrieval over indexed sources: rank by keyword overlap. */
export function retrieveSourceRefs(
  brand: BrandEntity,
  query: string,
  limit = 2
): BrandSourceRef[] {
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 4);
  if (tokens.length === 0) return [];
  const scored = brand.sources
    .filter((page) => page.status === 'indexed')
    .map((page) => {
      const haystack = `${page.title} ${page.headings.join(' ')} ${page.text}`.toLowerCase();
      const score = tokens.filter((token) => haystack.includes(token)).length;
      return { page, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ page }) => ({
    url: page.url,
    excerpt: page.text.slice(0, 160),
  }));
}

/**
 * Build the full reply context for an event: compiled prompt + retrieved
 * sources. The live agent passes this as system prompt and up-front RAG
 * messages; mock draftReply reads the same object.
 */
export function buildReplyContext(brand: BrandEntity | null, eventText: string): ReplyContext {
  if (!brand) {
    return { systemPrompt: '', promptVersion: PROMPT_VERSION, sourceRefs: [] };
  }
  return {
    systemPrompt: buildBrandSystemPrompt(brand),
    promptVersion: PROMPT_VERSION,
    sourceRefs: retrieveSourceRefs(brand, eventText),
  };
}

const FIRST_TOUCH_FALLBACK = {
  casual: 'hey, saw your post - we could have a hand on that this week, want the details?',
  standard: 'Hi - saw your post, we can help with that. Happy to send over the details?',
} as const;

function wordsOf(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 4);
}

/**
 * Live preview of the agent outbound first touch on one channel: picks the
 * gold example with the most word overlap against the detected post / lead
 * context (first example wins ties), applies the channel style (casual =
 * all-lowercase), then pushes the first triage step. Deterministic.
 */
export function simulateOutbound(
  brand: BrandEntity | null,
  channel: BrandChannel,
  context: string
): SimulatedReply {
  const profile = brand?.channels[channel];
  const detected = wordsOf(context);
  let best: string | null = null;
  let bestSource: 'autoreply' | 'example' = 'autoreply';
  let bestTrigger: string | undefined;
  let bestScore = 0;

  for (const entry of profile?.autoreplies.filter((candidate) => candidate.enabled && candidate.reply.trim()) ?? []) {
    const haystack = `${entry.trigger} ${entry.reply}`.toLowerCase();
    const score = detected.filter((token) => haystack.includes(token)).length;
    if (score > bestScore) {
      bestScore = score;
      best = entry.reply;
      bestSource = 'autoreply';
      bestTrigger = entry.trigger.trim() || undefined;
    }
  }
  for (const example of profile?.examples ?? []) {
    const haystack = example.toLowerCase();
    const score = detected.filter((token) => haystack.includes(token)).length;
    if (score > bestScore) {
      bestScore = score;
      best = example;
      bestSource = 'example';
      bestTrigger = undefined;
    }
  }
  const base = best ?? profile?.examples[0] ?? FIRST_TOUCH_FALLBACK[profile?.style ?? 'casual'];
  const style = profile?.style ?? 'casual';
  const styled = style === 'casual' ? base.toLowerCase() : base;
  const source: SimulatedReply['matchedSource'] = best === null ? 'fallback' : bestSource;
  const outcome = {
    matched: best !== null,
    matchedSource: source,
    ...(bestTrigger ? { matchedTrigger: bestTrigger } : {}),
  };
  const nudge = profile?.triage[0]?.trim();
  if (!nudge) return { text: styled, ...outcome };
  const styledNudge = style === 'casual' ? nudge.toLowerCase() : nudge;
  const joined = styled.endsWith('?') ? styled : `${styled}?`;
  return { text: `${joined} ${styledNudge}`, ...outcome };
}
