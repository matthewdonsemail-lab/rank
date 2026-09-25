# Voice Compiler

`buildBrandSystemPrompt()` turns structured brand properties into deterministic prompt text for future model consumers.

## Invariants

- The same `BrandEntity` produces the same prompt.
- The compiler stamps `PROMPT_VERSION = 2`.
- User-provided rules and memory boundaries are included as explicit context.
- Formality controls the language register: `casual`, `professional`, or `formal`.
- Gold examples are included as approved style references.

The compiler is a pure helper. It does not call a model, send a message, or persist an agent thread.
