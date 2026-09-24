# Using Cursor with Convex

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[Cursor](https://cursor.com), the AI code editor, makes it easy to write and maintain apps built with Convex. Let's walk through how to set up Cursor for the best possible results with Convex.

## Cursor and Convex[​](#cursor-and-convex "Direct link to Cursor and Convex")

Cursor works great with Convex out of the box. Because Convex is one type-safe TypeScript backend (database, functions, real-time sync, and file storage), Cursor writes code that's caught at compile time, stays transactional, and scales without extra infrastructure, which is plenty to build a chat app, a collaborative editor, or a multiplayer game. Adding the plugin lets you leverage the full power of Convex: Cursor reads your real deployment through the MCP server instead of guessing, catches its own type and deploy errors as it works, and follows the idiomatic Convex patterns the skills encode.

## Install the Convex plugin in Cursor[​](#install-the-convex-plugin-in-cursor "Direct link to Install the Convex plugin in Cursor")

The official Convex plugin makes Cursor work better with your Convex project. It includes:

* **Tools** that let your agent securely interact with your dev deployment (e.g. read the data/logs/insights or run functions).
* **Development hooks** that keep your generated types in sync and catch type and deploy errors as the agent works.
* **Rules, skills, and specialized agents** that teach your agent how to use Convex the most effectively.

See the [Agent Plugins overview](/ai/convex-plugins.md) for everything the plugin bundles.

To install the plugin, go to the *Customize* page of the Agents window, search for the *Convex* plugin and click *Add*.

Installing the Cursor plugin from the Agents window

Alternatively, you can run `/add-plugin convex` from an agent conversation.

Using Cursor Cloud Agents / Cursor CLI

Cursor plugins aren't available in Cloud Agents or the Cursor CLI. In those environments, we recommend installing rules and the MCP server manually.

## Manual setup[​](#manual-setup "Direct link to Manual setup")

If you'd rather not install the plugin, you can wire up rules and the MCP server yourself.

### Add Convex `.cursor/rules`[​](#add-convex-cursorrules "Direct link to add-convex-cursorrules")

To get the best results from Cursor put the model specific `.mdc` files in your project's `.cursor/rules` directory.

* [Convex Cursor Rules](https://convex.link/convex_rules.mdc)

[](/video/showing_where_to_put_convex_rules.mp4)

We're constantly working on improving the quality of these rules for Convex by using rigorous evals. You can help by [contributing to our evals repo](https://github.com/get-convex/convex-evals).

### Setup the Convex MCP Server[​](#setup-the-convex-mcp-server "Direct link to Setup the Convex MCP Server")

The Convex CLI comes with a [Convex Model Context Protocol](/ai/convex-mcp-server.md) (MCP) server built in. The Convex MCP server gives your AI coding agent access to the your Convex deployment to query and optimize your project.

#### Quick Install[​](#quick-install "Direct link to Quick Install")

You can click this handy deep-link below:

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=convex\&config=eyJjb21tYW5kIjoibnB4IC15IGNvbnZleEBsYXRlc3QgbWNwIHN0YXJ0In0%3D)

#### Manual Install[​](#manual-install "Direct link to Manual Install")

To get started with Cursor, open "Cursor Settings > Tools & Integrations", click on "New MCP Server", and add a "convex" section to "mcpServers" in the `mcp.json` file that's opened.

```
{

  "mcpServers": {

    "convex": {

      "command": "npx",

      "args": ["-y", "convex@latest", "mcp", "start"]

    }

  }

}
```

You can also install the Convex MCP [for just one project](https://docs.cursor.com/en/context/mcp#configuration-locations).

After adding the server, ensure the "convex" server is enabled and lit up green (it make take a minute the first time while the NPM package downloads).

Now start asking it questions like:

* Evaluate my convex schema and suggest improvements
* What are this app's public endpoints?
* Run the `my_convex_function` query

## Tips and tricks[​](#tips-and-tricks "Direct link to Tips and tricks")

### Run Convex during development[​](#run-convex-during-development "Direct link to Run Convex during development")

Run Convex (`npx convex dev`) in a terminal while you build so your functions deploy and your app updates live.

With the plugin installed, its development hooks keep your [generated types](https://docs.convex.dev/cli#run-the-convex-dev-server) in sync as the agent works, so it won't get stuck in the linting loop that stale types can otherwise cause. Without the plugin, keeping `npx convex dev` running is what keeps those types fresh.

### Keep your requests small[​](#keep-your-requests-small "Direct link to Keep your requests small")

The best results when using agentic LLMs can be found when keeping the amount of changes you want to make small and git commit frequently. This lets you be more specific around the context you provide the agent and it means the agent doesn't need to do a lot of searching for context.

After each successful prompt or series of prompts it is a good idea to commit your changes so that its simple to rollback to that point should the next prompt cause issues.

### Update and reference your `README.md`[​](#update-and-reference-your-readmemd "Direct link to update-and-reference-your-readmemd")

The agent needs context about the specific business goals for your project. While it can infer some details from the files it reads, this becomes more challenging as your project grows. Providing general information about your project gives the agent a helpful head start.

Rather than including this information in each prompt, it's better to write a comprehensive README.md file in your project root and reference it.

[Some people](https://youtu.be/2PjmPU07KNs?t=145) advocate for crafting a Product Requirements Document (PRD), this may be a good idea for more complex projects.

### Add Convex docs[​](#add-convex-docs "Direct link to Add Convex docs")

Adding Convex docs can let you specifically refer to Convex features when building your app.

From **`Cursor Settings`** > **`Indexing & Docs`** > **`Docs`** add new doc, use the URL "<https://docs.convex.dev/home>"

![Chat UI](data:image/webp;base64,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)

Cursor will then index all of the Convex docs for the LLM to use.

![Chat UI](/assets/images/indexed_docs-90bb59330756c00540015c53da6a484c.webp)

You can then reference those docs in your prompt with the `@Convex` symbol.

![Chat UI](/assets/images/reference_convex_docs-c791c41ddbd7663244fda1c4c59a43d9.webp)

Add more Convex knowledge

You can perform the above steps for <https://stack.convex.dev/> too if you would like to provide even more context to the agent.
