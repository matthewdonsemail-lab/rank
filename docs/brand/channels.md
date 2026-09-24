# Channel Response Profiles

The `channels` dictionary maintains discrete communication configurations across social platforms: `facebook`, `x`, and `reddit`.

## 1. Channel Profile Structure

Each channel entry contains:
- `style`: `'casual' | 'standard'`. Casual channels apply all-lowercase typography and fast chatting conventions.
- `examples`: Human typing snippets for the channel (fragments, quick responses, no corporate boilerplate).
- `triage`: Ordered prioritization steps (e.g. asking for DM, qualifying budget, booking inspection).
- `autoreplies`: Enabled baseline messages triggered by keyword overlap against lead text.

## 2. Autoreply Resolution

When evaluating outbound replies:
1. Enabled channel autoreplies are scored first by token intersection.
2. Ties preserve the user-approved trigger response verbatim.
3. If no autoreply matches, gold voice examples are evaluated.
4. Fallback styling applies channel default sign-offs.
