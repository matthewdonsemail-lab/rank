import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";
import agentmail from "@agentmail/convex/convex.config";

const app = defineApp();

app.use(agent);
app.use(agentmail);

export default app;
