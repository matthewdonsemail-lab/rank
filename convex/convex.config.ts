import { defineApp } from "convex/server";
import { v } from "convex/values";
import agent from "@convex-dev/agent/convex.config";
import agentmail from "@agentmail/convex/convex.config";
import firecrawl from "@firecrawl/firecrawl-convex/convex.config";
import treg from "@listeningkit/treg/convex.config";
import telnyx from "@listeningkit/telnyx/convex.config";

const app = defineApp({
  env: {
    FIRECRAWL_API_KEY: v.string(),
    FIRECRAWL_API_URL: v.optional(v.string()),
    FIRECRAWL_WEBHOOK_SECRET: v.optional(v.string()),
    NEBIUS_API_KEY: v.optional(v.string()),
    NEBIUS_BASE_URL: v.optional(v.string()),
    DEFAULT_RANK_MODEL: v.optional(v.string()),
    TYPESAFE_API_KEY: v.optional(v.string()),
    TYPESAFE_BASE_URL: v.optional(v.string()),
    TYPESAFE_DEFAULT_MODEL: v.optional(v.string()),
    TELNYX_API_KEY: v.optional(v.string()),
    TELNYX_PUBLIC_KEY: v.optional(v.string()),
    TELNYX_FROM_NUMBER: v.optional(v.string()),
    TELNYX_API_BASE_URL: v.optional(v.string()),
  },
});

app.use(agent);
app.use(agentmail);
app.use(firecrawl, {
  httpPrefix: "/firecrawl/",
  env: {
    FIRECRAWL_API_KEY: app.env.FIRECRAWL_API_KEY,
    FIRECRAWL_API_URL: app.env.FIRECRAWL_API_URL,
    FIRECRAWL_WEBHOOK_SECRET: app.env.FIRECRAWL_WEBHOOK_SECRET,
  },
});
app.use(treg);
app.use(telnyx, {
  env: {
    TELNYX_API_KEY: app.env.TELNYX_API_KEY,
    TELNYX_PUBLIC_KEY: app.env.TELNYX_PUBLIC_KEY,
    TELNYX_FROM_NUMBER: app.env.TELNYX_FROM_NUMBER,
    TELNYX_API_BASE_URL: app.env.TELNYX_API_BASE_URL,
  },
});

export default app;
