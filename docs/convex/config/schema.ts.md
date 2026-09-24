# schema.ts

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

`convex/schema.ts` allows you to declare your [**tables**](/database/schemas.md) and their [**indexes**](/database/reading-data/indexes/.md). Convex derives your document types from it, and validates every insert and update in the declared tables — unless you turn that off with [`schemaValidation: false`](/database/schemas.md#schemavalidation-boolean). Documents in tables the schema doesn’t list are never validated.

The file is optional: without it, no schema is enforced on your documents. If you don’t have a schema yet, you can [generate one from the dashboard](/dashboard/deployments/schema.md#viewing-the-schema-file).

convex/schema.ts

```
import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";



export default defineSchema({

  messages: defineTable({

    body: v.string(),

    author: v.id("users"),

  }).index("by_author", ["author"]),

});
```

## Learn More[​](#learn-more "Direct link to Learn More")

* [Schemas](/database/schemas.md)
* [Indexes](/database/reading-data/indexes/.md)
* [Schema in the Dashboard](/dashboard/deployments/schema.md)
