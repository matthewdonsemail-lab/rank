# Local Deployments for Development

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Instead of syncing code to a Convex dev deployment hosted in the cloud, you can develop against a deployment running on your own computer. You can even use the Convex dashboard with local deployments!

## Background on deployments in Convex[​](#background-on-deployments-in-convex "Direct link to Background on deployments in Convex")

Each Convex deployment contains its own data, functions, scheduled functions, etc. A project has one production deployment, up to one cloud deployment for development per team member, and potentially many transient [preview deployments](/production/multiple-deployments.md#preview).

You can also develop with Convex using a deployment running on your own machine. Since the deployment is running locally, code sync is faster and means resources like functions calls and database bandwidth don't count against [the quotas for your Convex plan](https://www.convex.dev/pricing).

[AI Gateway](/ai-gateway/setup.md#local-development) requests still use the cloud gateway and are charged to the linked project's team, even when your functions run locally.

You can use local deployments with an existing Convex project, and view your deployment in the Convex dashboard under your project. You can also use local deployments without a Convex account and debug and inspect them with a locally running version of the Convex dashboard.

## Using local deployments[​](#using-local-deployments "Direct link to Using local deployments")

Local deployments are in beta

Local deployments<!-- --> <!-- -->are<!-- --> currently a [beta feature](/production/state/.md#beta-features). If you have feedback or feature requests, [let us know on Discord](https://convex.dev/community)!

While using local deployments, the local Convex backend runs as a subprocess of the `npx convex dev` command and exits when that command is stopped. This means a `convex dev` command must be running in order to run other commands like `npx convex run` against this local deployment or for your frontend to connect to this deployment.

State for local backends is stored in a `.convex` directory in your project.

### Anonymous development[​](#anonymous-development "Direct link to Anonymous development")

You can use local deployments to develop with Convex without having to create an account. Whenever you want to create an account to deploy your app to production or to use more Convex features, you can use `npx convex login` to link your local deployments with your account.

### Local deployments for an existing project[​](#local-deployments-for-an-existing-project "Direct link to Local deployments for an existing project")

To use a local deployment for an existing project, run:

```
npx convex deployment select local
```

The CLI commands you run next (for instance `npx convex dev`) will target your local deployment.

If you want to go back to your personal cloud dev deployment, run:

```
npx convex deployment select dev
```

## Local deployments vs. production[​](#local-deployments-vs-production "Direct link to Local deployments vs. production")

Local deployments are not recommended for production use: they're development deployments, i.e. logs for function results and full stack traces for error responses are sent to connected clients.

For running a production application, you can use a production deployment hosted on the Convex cloud. Learn more about deploying to production [here](/production/overview.md).

Alternatively, you can self-host a production deployment using the [open source convex-backend repo](https://github.com/get-convex/convex-backend).

## Limitations[​](#limitations "Direct link to Limitations")

* **No Public URL** - Cloud deployments have public URL to receive incoming HTTP requests from services like Twilio, but local deployments listen for HTTP requests on your own computer. Similarly, you can't power websites with Convex WebSocket connections unless your users browsers know how to reach your computer. Set up a proxy like ngrok or use a cloud deployment for these uses cases.

* **Node actions require specific Node.js versions** - Running Node.js actions (actions defined in files with `"use node;"`) requires having the same version of Node.js as your project is [configured for](/production/project-configuration.md#configuring-the-nodejs-version). By default this is Node.js 20 today, though this may change in the future. To resolve this you can install and set up [nvm](https://github.com/nvm-sh/nvm) and then install the required Node.js version. You don't need to use this version for the rest of your project.

* **Node.js actions run directly on your computer** - Like a normal Node.js server, code running in Node.js actions has unrestricted filesystem access. Queries, mutations, and Convex runtime actions still run in isolated environments.

* Logs get cleared out every time a `npx convex dev` command is restarted.

* []()**Using the dashboard with Safari**: Safari [blocks requests to localhost](https://bugs.webkit.org/show_bug.cgi?id=171934), which prevents the dashboard from working with local deployments. We recommend using another browser if you’re using local deployments.

* []()**Using the dashboard with Brave**: Brave [blocks requests to localhost by default](https://brave.com/privacy-updates/27-localhost-permission/), which prevents the dashboard from working with local deployments. You can use the following workaround:

  * Go to `brave://flags/`
  * Enable the `#brave-localhost-access-permission` flag
  * Go back to the Convex dashboard
  * Click on **View Site Information** (![View Site Information icon](/screenshots/brave-site-information.png)) in the URL bar, then on **Site settings**
  * Change the setting for **Localhost access** to **Allow**
