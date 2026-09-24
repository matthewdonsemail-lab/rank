# Using Convex with Netlify

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Hosting your Convex app on Netlify allows you to automatically re-deploy both your backend and your frontend whenever you push your code.

## Deploying to Netlify[​](#deploying-to-netlify "Direct link to Deploying to Netlify")

This guide assumes you already have a working React app with Convex. If not follow the [Convex React Quickstart](/quickstart/react.md) first. Then:

1. Create a Netlify account

   If you haven't done so, create a [Netlify](https://netlify.com) account. This is free for small projects and should take less than a minute to set up.

2. Link your project on Netlify

   Create a Netlify project at <https://app.netlify.com/start> and link it to the source code repository for your project on GitHub or other Git platform.

   ![Netlify import project](/assets/images/netlify_import-a65616c6c06a44eacbd8dd6a58e9ec6b.png)

3. Override the Build command

   Override the *Build command* to be `npx convex deploy --cmd 'npm run build'`.

   If your project lives in a subdirectory of your repository you'll also need to change *Base directory* in Netlify accordingly.

   ![Netlify build settings](/assets/images/netlify_build_settings-3003b87fdb3b152f78ef5e794fb43c4c.png)

4. Set up the CONVEX\_DEPLOY\_KEY environment variable

   On your [Convex Dashboard](https://dashboard.convex.dev/), create a production deployment for your project if one does not exist already. Go to the *General* tab on the *Deployment Settings* page for the production deployment. Click the *Generate Production Deploy Key* button to generate a **Production** deploy key. When scoping the key's permissions, enable the `deployment:deploy` permission so the key can deploy your functions (see [Role Actions](/team-management/role-actions.md#data-plane-and-runtime) for all available actions). Then click the copy button to copy the key.

   In Netlify, click *Add environment variables* and *New variable*.

   Create an environment variable `CONVEX_DEPLOY_KEY` and paste in your deploy key.

   ![Netlify environment variable CONVEX\_DEPLOY\_KEY](/assets/images/netlify_prod_deploy_key_e92a5b4d1f17a3c7df3612f3574f3cdf.png)

5. Deploy your site

   Now click the *Deploy* button and your work here is done!

Netlify will automatically publish your site to a URL `https://<site-name>.netlify.app` listed at the top of the site overview page. Every time you push to your git repository, Netlify will automatically deploy your Convex functions and publish your site changes.

Using a Custom Domain?

If you're using a custom domain to serve your Convex functions, you'll need additional configuration. See [Custom Domains](/production/custom-domains.md) for more information.

### How it works[​](#how-it-works "Direct link to How it works")

In Netlify, we overrode the *Build Command* to be `npx convex deploy --cmd 'npm run build'`.

`npx convex deploy` will read `CONVEX_DEPLOY_KEY` from the environment and use it to set the `CONVEX_URL` (or similarly named) environment variable to point to your **production** deployment.

Your frontend framework of choice invoked by `npm run build` will read the `CONVEX_URL` environment variable and point your deployed site (via `ConvexReactClient`) at your **production** deployment.

Finally, `npx convex deploy` will push your Convex functions to your production deployment.

Now, your production deployment has your newest functions and your app is configured to connect to it.

You can use `--cmd-url-env-var-name` to customize the variable name used by your frontend code if the `deploy` command cannot infer it, like

```
npx convex deploy --cmd-url-env-var-name CUSTOM_CONVEX_URL --cmd 'npm run build'
```

## Authentication[​](#authentication "Direct link to Authentication")

You will want to configure your [authentication](/auth/overview.md) provider (Clerk, Auth0 or other) to accept your production `<site-name>.netlify.app` URL.

## Deploy Previews[​](#deploy-previews "Direct link to Deploy Previews")

Netlify's Deploy Previews allow you to preview changes to your app before they're merged in. In order to preview both changes to frontend code and Convex functions, you can set up [Convex preview deployments](/production/multiple-deployments.md#preview).

This will create a fresh Convex backend for each preview and leave your production and development deployments unaffected.

This assumes you have already followed the steps in [Deploying to Netlify](#deploying-to-netlify) above.

1. Set up the CONVEX\_DEPLOY\_KEY environment variable

   On your [Convex Dashboard](https://dashboard.convex.dev/) go to your project's *Settings* page. Click the *Generate Preview Deploy Key* button to generate a **Preview** deploy key. Then click the copy button to copy the key.

   In Netlify, click *Site configuration* > *Environment variables*. Edit your existing `CONVEX_DEPLOY_KEY` environment variable. Select *Different value for each deploy context* and paste the key under *Deploy Previews*.

   ![Netlify environment variable CONVEX\_DEPLOY\_KEY](/assets/images/netlify_preview_deploy_key_51d8c3210b827a6946d8f9997987616a.png)

2. (optional) Set up default environment variables

   If your app depends on certain Convex environment variables, you can set up [default environment variables](/production/environment-variables.md#project-environment-variable-defaults) for preview and development deployments in your project.

   ![Project default environment variables](/screenshots/storybook/components_project_default_environment_variables_light.webp)

3. (optional) Run a function to set up initial data

   Deploy Previews run against fresh Convex backends, which do not share data with development or production Convex deployments. You can call a Convex function to set up data by adding `--preview-run 'functionName'` to the `npx convex deploy` command. This function will only be run for preview deployments, and will be ignored when deploying to production.

   Netlify > Site configuration > Build & deploy > Build settings > Build command

   ```
   npx convex deploy --cmd 'npm run build' --preview-run 'functionName'
   ```

4. Now test out creating a PR and generating a Deploy Preview!

   You can find the Convex deployment for your branch in the Convex dashboard, in the deployment switcher at the top-left of any deployment page.

   ![Preview deployment in the deployment switcher](/screenshots/storybook/pages_project_deployment_data_preview_deployment_switcher_light.webp)

### How it works[​](#how-it-works-1 "Direct link to How it works")

For Deploy Previews, `npx convex deploy` will read `CONVEX_DEPLOY_KEY` from the environment, and use it to create a Convex deployment associated with the Git branch name for the Deploy Preview. It will set the `CONVEX_URL` (or similarly named) environment variable to point to the new Convex deployment.

Your frontend framework of choice invoked by `npm run build` will read the `CONVEX_URL` environment variable and point your deployed site (via `ConvexReactClient`) at the Convex preview deployment.

Finally, `npx convex deploy` will push your Convex functions to the preview deployment and run the `--preview-run` function (if provided). This deployment has separate functions, data, crons and all other configuration from any other deployments.

`npx convex deploy` will infer the Git branch name for Vercel, Netlify, GitHub, and GitLab environments, but the `--preview-create` option can be used to customize the name associated with the newly created deployment.

Production deployments will work exactly the same as before.
