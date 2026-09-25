# Brand Domain

`lib/brand` is the source-of-truth domain for the structured brand record used by the current mock API and future model consumers.

## BrandEntity sections

| Section | Contents | Current consumers |
|---|---|---|
| `identity` | Name, website, tagline, logo | Display and source indexing |
| `voice` | Tone, formality, rules, examples | `buildBrandSystemPrompt()` |
| `channels` | Optional channel profiles and examples | `simulateOutbound()` and typed helpers |
| `memory` | User-provided facts and boundaries | Prompt compilation |
| `offerings` | Named products and services | Prompt and reply context |
| `location` | Location label and coordinates | Typed brand context |
| `sources` | Indexed `BrandPage` records | `retrieveSourceRefs()` |
| `intelligence` | Keywords, competitors, communities | Typed brand context |

## Implemented operations

- `extractBrandFromUrl()` derives initial identity and hostname metadata.
- `BrandClient` reads and updates the mock/API brand record and source list.
- `buildBrandSystemPrompt()` deterministically compiles a versioned prompt.
- `retrieveSourceRefs()` performs keyword-overlap source selection.
- `simulateOutbound()` produces a local simulated reply; it does not send mail.

The current machine chain consumes the structured brand record as context. Agent execution and remote model calls are separate future integrations.
