# convex.config.ts

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

`convex/convex.config.ts` allows you to [**install components**](/components/using.md) and [**declare environment variables**](/production/environment-variables.md#declaring) for your app. Components add prebuilt features to your backend, and declared environment variables are validated at deploy time and typed in your functions.

convex/convex.config.ts

```
import { defineApp } from "convex/server";

import { v } from "convex/values";

import resend from "@convex-dev/resend/convex.config.js";



const app = defineApp({

  env: {

    RESEND_API_KEY: v.string(),

    RESEND_WEBHOOK_SECRET: v.string(),



    LOG_LEVEL: v.optional(v.union(v.literal("info"), v.literal("error"))),

  },

});



app.use(resend, {

  // Serve the Resend component’s HTTP routes

  // at `https://<deployment>.convex.site/resend/`

  httpPrefix: "/resend/",

  env: {

    RESEND_API_KEY: app.env.RESEND_API_KEY,

    RESEND_WEBHOOK_SECRET: app.env.RESEND_WEBHOOK_SECRET,

  },

});



export default app;
```

## Learn More[​](#learn-more "Direct link to Learn More")

* [Using Components](/components/using.md)
* [Components Overview](/components/overview.md)
* [Environment Variables](/production/environment-variables.md)
