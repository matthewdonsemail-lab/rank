# Using Convex with Vercel

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Hosting your Convex app on Vercel allows you to automatically re-deploy both your backend and your frontend whenever you push your code.

## Deploying to Vercel[​](#deploying-to-vercel "Direct link to Deploying to Vercel")

### Using the Vercel Marketplace[​](#using-the-vercel-marketplace "Direct link to Using the Vercel Marketplace")

info

Projects deployed with the Vercel marketplace will be a part of their own Convex team. If you already have a Convex team, you may [follow these instructions](/production/hosting/vercel.md#connecting-your-convex-project-to-vercel).

Convex is available on the [Vercel Marketplace](https://vercel.com/marketplace/convex). You may create, deploy, and pay for (if using a paid subscription) for your Convex projects through Vercel by using the marketplace.

Convex projects created through the Vercel Marketplace will automatically be configured to deploy automatically.

Quickly deploy a template project to the Vercel Marketplace:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fget-convex%2Fvercel-marketplace-convex\&project-name=vercel-with-convex\&repository-name=vercel-with-convex\&demo-title=Convex%20with%20Vercel\&demo-description=A%20minimal%20template%20showcasing%20using%20Convex%20with%20Vercel\&demo-url=https%3A%2F%2Fconvex-vercel-template-demo.previews.convex.dev%2F\&products=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22convex%22%2C%22productSlug%22%3A%22convex%22%2C%22protocol%22%3A%22storage%22%7D%5D)

### Connecting your Convex project to Vercel[​](#connecting-your-convex-project-to-vercel "Direct link to Connecting your Convex project to Vercel")

#### Using a template[​](#using-a-template "Direct link to Using a template")

To start a new project quickly, you may click this button and follow the instructions to quickly deploy your Convex project to Vercel.

**Note:** You'll need to create a project on the Convex dashboard to use this template.

[![Deploy with
Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fget-convex%2Fvercel-marketplace-convex\&project-name=vercel-with-convex\&repository-name=vercel-with-convex\&demo-title=Convex%20with%20Vercel\&demo-description=A%20minimal%20template%20showcasing%20using%20Convex%20with%20Vercel\&demo-url=https%3A%2F%2Fconvex-vercel-template-demo.previews.convex.dev%2F\&products=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22convex%22%2C%22productSlug%22%3A%22convex%22%2C%22protocol%22%3A%22storage%22%7D%5D)

#### From scratch[​](#from-scratch "Direct link to From scratch")

This guide assumes you already have a working React app with Convex. If not follow the [Convex React Quickstart](/quickstart/react.md) first. Then:

1. Create a Vercel account

   If you haven't done so, create a [Vercel](https://vercel.com) account. This is free for small projects and should take less than a minute to set up.

2. Link your project on Vercel

   Create a Vercel project at <https://vercel.com/new> and link it to the source code repository for your project on GitHub or other Git platform.

   ![Vercel import project](/assets/images/vercel_import-ea7ec18cd8c5e5575158bcf032698bc7.png)

3. Override the Build command

   Override the "Build command" to be `npx convex deploy --cmd 'npm run build'`.

   If your project lives in a subdirectory of your repository you'll also need to change *Root Directory* above accordingly.

   ![Vercel build settings](/assets/images/vercel_build_command-236a66a2e7e2091d610883c56954dcb9.png)

4. Set up the CONVEX\_DEPLOY\_KEY environment variable

   On your [Convex Dashboard](https://dashboard.convex.dev/), create a production deployment for your project if one does not exist already. Go to the *General* tab on the *Deployment Settings* page for the production deployment. Click the *Generate Production Deploy Key* button to generate a **Production** deploy key. When scoping the key's permissions, enable the `deployment:deploy` permission so the key can deploy your functions (see [Role Actions](/team-management/role-actions.md#data-plane-and-runtime) for all available actions). Then click the copy button to copy the key.

   In Vercel, click *Environment Variables*. Create an environment variable named `CONVEX_DEPLOY_KEY` and paste in your deploy key. Under *Environment*, uncheck all except *Production* and click *Save*.

   ![Vercel environment variable CONVEX\_DEPLOY\_KEY](/assets/images/vercel_prod_deploy_key_df730e5f65427ae68f68b48af225995b.png)

5. Deploy your site

   Now click the *Deploy* button and your work here is done!

Vercel will automatically publish your site to an URL like `https://<site-name>.vercel.app`, shown on the page after deploying. Every time you push to your Git repository, Vercel will automatically deploy your Convex functions and publish your site changes.

Using a Custom Domain?

If you're using a custom domain to serve your Convex functions, you'll need additional configuration. See [Custom Domains](/production/custom-domains.md) for more information.

### How it works[​](#how-it-works "Direct link to How it works")

In Vercel, we overrode the *Build Command* to be `npx convex deploy --cmd 'npm run build'`.

`npx convex deploy` will read `CONVEX_DEPLOY_KEY` from the environment and use it to set the `CONVEX_URL` (or similarly named) environment variable to point to your **production** deployment.

Your frontend framework of choice invoked by `npm run build` will read the `CONVEX_URL` (or similarly named) environment variable to point your deployed site (via `ConvexReactClient`) at your **production** deployment.

Finally, `npx convex deploy` will push your Convex functions to your production deployment.

Now, your production deployment has your newest functions and your app is configured to connect to it.

You can use `--cmd-url-env-var-name` to customize the variable name used by your frontend code if the `deploy` command cannot infer it, like

```
npx convex deploy --cmd-url-env-var-name CUSTOM_CONVEX_URL --cmd 'npm run build'
```

### Authentication[​](#authentication "Direct link to Authentication")

You will want to configure your [authentication](/auth/overview.md) provider (Clerk, Auth0 or other) to accept your production URL. Note that Clerk does not support `https://<site-name>.vercel.app`, so you'll have to configure a custom domain.

## Preview Deployments[​](#preview-deployments "Direct link to Preview Deployments")

Vercel Preview Deployments allow you to preview changes to your app before they're merged in. In order to preview both changes to frontend code and Convex functions, you can set up [Convex preview deployments](/production/multiple-deployments.md#preview).

This will create a fresh Convex backend for each preview and leave your production and development deployments unaffected.

This assumes you have already followed the steps in [Deploying to Vercel](#deploying-to-vercel) above.

1. Set up the CONVEX\_DEPLOY\_KEY environment variable

   On your [Convex Dashboard](https://dashboard.convex.dev/) go to your project's *Settings* page. Click the *Generate Preview Deploy Key* button to generate a **Preview** deploy key. Then click the copy button to copy the key.

   In Vercel, click *Environment Variables*. Create an environment variable named `CONVEX_DEPLOY_KEY` and paste in your deploy key. Under *Environment*, uncheck all except *Preview* and click *Save*.

   ![Vercel environment variable CONVEX\_DEPLOY\_KEY](/assets/images/vercel_preview_deploy_key_bb1badeb35323ef9c06516982aa5c8c7.png)

2. (optional) Set up default environment variables

   If your app depends on certain Convex environment variables, you can set up [default environment variables](/production/environment-variables.md#project-environment-variable-defaults) for preview and development deployments in your project.

   ![Project default environment variables](/screenshots/storybook/components_project_default_environment_variables_light.webp)

3. (optional) Run a function to set up initial data

   Vercel Preview Deployments run against fresh Convex backends, which do not share data with development or production Convex deployments. You can call a Convex function to set up data by adding `--preview-run 'functionName'` to the `npx convex deploy` command. This function will only be run for preview deployments, and will be ignored when deploying to production.

   Vercel > Settings > Build & Development settings > Build Command

   ```
   npx convex deploy --cmd 'npm run build' --preview-run 'functionName'
   ```

4. Now test out creating a PR and generating a Preview Deployment!

   You can find the Convex deployment for your branch in the Convex dashboard, in the deployment switcher at the top-left of any deployment page.

   ![Preview deployment in the deployment switcher](/screenshots/storybook/pages_project_deployment_data_preview_deployment_switcher_light.webp)

### How it works[​](#how-it-works-1 "Direct link to How it works")

For Preview Deployments, `npx convex deploy` will read `CONVEX_DEPLOY_KEY` from the environment, and use it to create a Convex deployment associated with the Git branch name for the Vercel Preview Deployment. It will set the `CONVEX_URL` (or similarly named) environment variable to point to the new Convex deployment.

Your frontend framework of choice invoked by `npm run build` will read the `CONVEX_URL` environment variable and point your deployed site (via `ConvexReactClient`) at the Convex preview deployment.

Finally, `npx convex deploy` will push your Convex functions to the preview deployment and run the `--preview-run` function (if provided). This deployment has separate functions, data, crons and all other configuration from any other deployments.

`npx convex deploy` will infer the Git branch name for Vercel, Netlify, GitHub, and GitLab environments, but the `--preview-create` option can be used to customize the name associated with the newly created deployment.

Production deployments will work exactly the same as before.
