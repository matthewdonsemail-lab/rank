import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";
import agentmail from "@agentmail/convex/convex.config";
import treg from "@listeningkit/treg/convex.config";

const app = defineApp();

app.use(agent);
app.use(agentmail);
app.use(treg);

export default app;
