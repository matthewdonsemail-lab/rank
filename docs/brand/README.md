# Brand Entity Specification

One workspace, one brand record. Onboarding creates it from the website URL, the reveal enriches it, the dashboard Brand view edits it, and every reply draft, RAG context, and autonomous agent call reads it.

Nothing in the engine invents business facts - anything the brand has not provided falls back to generic phrasing until real details are added.

## 1. Sections Overview

Every field on the BrandEntity has exactly one defined consumer:

| Section | Holds | Consumed by |
|---|---|---|
| `identity` | name, website, tagline, logo URL | Reply sign-off, resource links, client display |
| `voice` | tone, formality, dos, donts, gold examples | `buildBrandSystemPrompt()` -> agent instructions |
| `channels` | per-channel style, typing snippets, triage flow | `simulateOutbound()` preview, channel generation |
| `memory` | working facts and boundaries (rules) | Compiled into system prompt; retrieved boundaries |
| `offerings` | `{ name, detail }[]` services and products | Reply service-bit, agent tool context |
| `location` | label, lat, lng, radiusKm | Candidate scoping, service area filtering |
| `sources` | indexed website pages (url, title, headings, text) | RAG grounding, reply source citations |
| `intelligence` | selected keyword, competitor domains, communities | Candidate retrieval seeding, query generation |

Two architectural rules:
- Areas live in `location`, never in `voice`. Voice is purely about language dial and tone.
- Offerings are objects (`{ name, detail }`), never bare strings.

## 2. Entity Lifecycle

1. **Extraction**: `extractBrandFromUrl()` derives clean display names and hostname metadata.
2. **Persistence**: The entity is persisted in Convex `brands` table and in-memory mock store.
3. **Compilation**: `buildBrandSystemPrompt()` deterministically compiles the instructions with version pinning (`PROMPT_VERSION = 2`).
4. **Retrieval**: `retrieveSourceRefs()` matches keyword tokens against indexed page headings and text.
5. **Outbound Simulation**: `simulateOutbound()` maps detected context against enabled autoreplies and gold examples.

## 3. Brand Intelligence & Discovery

The `intelligence` block stores:
- `selectedKeyword`: The primary operand phrase chosen during reveal.
- `competitors`: Verified competitor domains, deduped on append.
- `targetCommunities`: Communities (`CommunityPick[]`) where the brand listens and engages.
