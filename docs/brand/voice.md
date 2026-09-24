# Voice to System Prompt Compiler

The voice compiler `buildBrandSystemPrompt()` transforms structured brand properties into deterministic instructions for language models and autonomous agents.

## 1. Compiler Invariants

- **Deterministic**: The same `BrandEntity` always compiles byte-for-byte to the exact same prompt string.
- **Versioned**: Every compile is stamped with `PROMPT_VERSION = 2`. Historic drafts retain their generation version.
- **Strict Boundary Enforcement**: Prohibitions (`donts`) and working facts (`memory.rules`) are compiled as hard directives.

## 2. Formality Dials

The machine-readable dial controls grammatical style:

- `casual`: Short sentences, contractions, first names, warm sign-off.
- `professional`: Clear sentences, plain-spoken, brief courteous sign-off.
- `formal`: Full grammatical sentences, formal titles, polite sign-off.

## 3. Gold Examples

Gold examples (`BrandVoiceExample[]`) contain high-quality situation-reply pairs. The compiler embeds them so that the model mimics approved phrasing before improvising.
