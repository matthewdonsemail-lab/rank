# Channel Communication Profiles

The `channels` dictionary maintains discrete communication and outreach configurations across platform contexts (`facebook`, `x`, and `reddit`), governing tone style, author outreach snippets, triage steps, and response behavior.

## 1. Channel Profile Structure

Each channel entry contains:
- `style`: `'casual' | 'standard'`. Casual styling applies relaxed lowercase typography and fast messaging conventions.
- `examples`: Curated writing snippets for the communication context (fragments, direct responses, natural phrasing, no corporate boilerplate).
- `triage`: Ordered prioritization steps (e.g. initiating direct outreach, qualifying resource fit, scheduling editorial review).
- `autoreplies`: Baseline messages triggered by keyword overlap against inquiry text.

## 2. Autoreply Resolution

When evaluating outbound replies:
1. Enabled channel autoreplies are scored first by token intersection.
2. Ties preserve the user-approved trigger response verbatim.
3. If no autoreply matches, gold voice examples are evaluated.
4. Fallback styling applies channel default sign-offs.
