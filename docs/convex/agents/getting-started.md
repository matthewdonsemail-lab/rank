# Getting Started with Agent

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

To install the agent component, you'll need an existing Convex project. New to Convex? Go through the [tutorial](https://docs.convex.dev/tutorial/).

Run `npm create convex` or follow any of the [quickstarts](https://docs.convex.dev/home) to set one up.

## Installation[​](#installation "Direct link to Installation")

These examples use the [Convex AI Gateway](/ai-gateway/overview.md), available to paid teams on Convex Cloud and [project-linked local deployments](/ai-gateway/setup.md#local-development). See [Gateway setup](/ai-gateway/setup.md#vercel-ai-sdk) for package and Node.js runtime requirements. On the Free plan, use an [AI SDK provider](https://ai-sdk.dev/providers/ai-sdk-providers) with your own API key stored in an [environment variable](/production/environment-variables.md).

Install the component and Gateway provider:

```
npm install @convex-dev/agent @convex-dev/ai-sdk-provider ai convex
```

Create a `convex.config.ts` file in your app's `convex/` folder and install the component by calling `use`:

```
// convex/convex.config.ts

import { defineApp } from "convex/server";

import agent from "@convex-dev/agent/convex.config";



const app = defineApp();

app.use(agent);



export default app;
```

Then run `npx convex dev` to generate code for the component. This needs to successfully run once before you start defining Agents.

## Defining your first Agent[​](#defining-your-first-agent "Direct link to Defining your first Agent")

The Gateway provider obtains a service token automatically when the model is called inside a Convex action; no provider API key is needed. See [Gateway setup](/ai-gateway/setup.md) for details.

```
import { components } from "./_generated/api";

import { Agent, stepCountIs } from "@convex-dev/agent";

import { convexGateway } from "@convex-dev/ai-sdk-provider";



const agent = new Agent(components.agent, {

  name: "My Agent",

  languageModel: convexGateway("openai/gpt-5-mini"),

  instructions: "You are a weather forecaster.",

  tools: { getWeather, getGeocoding },

  stopWhen: stepCountIs(3),

});
```

## Basic usage[​](#basic-usage "Direct link to Basic usage")

```
import { action } from "./_generated/server";

import { createThread } from "@convex-dev/agent";

import { v } from "convex/values";



export const helloWorld = action({

  args: { city: v.string() },

  handler: async (ctx, { city }) => {

    const threadId = await createThread(ctx, components.agent);

    const prompt = `What is the weather in ${city}?`;

    const result = await agent.generateText(ctx, { threadId }, { prompt });

    return result.text;

  },

});
```

If you get type errors about `components.agent`, ensure you've run `npx convex dev` to generate code for the component.

That's it! Check out [Agent Usage](/agents/agent-usage.md) to see more details and options.
