# Prompt and Source Context

The brand domain provides deterministic context helpers for future model and agent consumers. The current machine chain does not invoke an agent directly.

## Prompt compilation

```ts
import { buildBrandSystemPrompt } from "../../lib/brand/index.js";

const instructions = buildBrandSystemPrompt(brand);
```

The compiler uses the structured identity, voice, memory, offerings, location, and source metadata. Its output is versioned with `PROMPT_VERSION`.

## Source selection

`retrieveSourceRefs(brand, queryText)` ranks indexed `BrandPage` records using keyword overlap and returns canonical URLs with matching passages. The result is serializable context for a caller; it is not a claim that a remote model has been invoked.
