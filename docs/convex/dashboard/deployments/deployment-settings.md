# Settings

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

The [deployment settings page](https://dashboard.convex.dev/deployment/settings) gives you access to information and configuration options related to a specific deployment.

## General[​](#general "Direct link to General")

The [General page](https://dashboard.convex.dev/deployment/settings) shows information about the deployment and lets you configure it:

* **Deployment summary** - the deployment's name, type, region, deployment class, the running Convex version, and when it was last deployed and backed up. It also shows the URL the deployment is hosted at and the URL that HTTP Actions are served from. (Some Convex integrations require these URLs for configuration.)

* **Deploy keys** - generate, view, and delete the deployment's deploy keys, used to [integrate with build tools such as Netlify and Vercel](/production/hosting/.md) and to [sync data with Fivetran and Airbyte](/production/integrations/streaming-import-export.md).

* **Advanced settings**

  * **Deployment reference** - edit the deployment's reference.
  * **Stream function logs** - control whether function logs are streamed to connected clients.
  * **Dashboard edit confirmation** - require confirmation before editing data from the dashboard.
  * **Deployment expiration** - for non-production deployments, set an expiration time after which the deployment is automatically deleted.

* **[Pause deployment](/production/pause-deployment.md)** - temporarily stop the deployment from running any functions (including scheduled functions and cron jobs), then resume it later.

* **Delete deployment** - permanently delete the deployment and all of its data.

* **Transfer deployment** - move the deployment to another project in the same team.

![Deployment Settings Dashboard Page](/screenshots/storybook/pages_project_deployment_deployment_settings_light.webp)

### Creating Deploy Keys[​](#creating-deploy-keys "Direct link to Creating Deploy Keys")

When you create a deploy key you can scope it to only have permission to perform specific actions.

For a CI/CD pipeline that runs `npx convex deploy`, enable the `deployment:deploy` permission, which grants the ability to push code, schema, and auth configuration to the deployment.

For CLI usage or AI Agents using the Convex CLI, you may want to enable more permissions, such as the ability to view deployment logs and read/write data or environment variables.

See [Role Actions](/team-management/role-actions.md#data-plane-and-runtime) for the full list of actions a deploy key can be granted.

![Create Deploy Key panel with the deployment:deploy permission enabled](/screenshots/storybook/pages_project_deployment_deployment_settings_create_deploy_key_light.webp)

## Environment Variables[​](#environment-variables "Direct link to Environment Variables")

The [environment variables page](https://dashboard.convex.dev/deployment/settings/environment-variables) lets you add, change, remove and copy the deployment's [environment variables](/production/environment-variables.md).

![Deployment settings environment variables page](/screenshots/storybook/pages_project_deployment_settings_environment_variables_light.webp)

## Usage Limits[​](#usage-limits "Direct link to Usage Limits")

The [usage limits page](https://dashboard.convex.dev/deployment/settings/usage-limits) lets you cap how much the deployment can consume per day or month. See [Usage Limits](/production/usage-limits.md).

## Authentication[​](#authentication "Direct link to Authentication")

The [authentication page](https://dashboard.convex.dev/deployment/settings/authentication) shows the values configured in your `auth.config.js` for user [authentication](/auth/overview.md) implementation.

## Backup & Restore[​](#backup--restore "Direct link to Backup & Restore")

The [backup & restore page](https://dashboard.convex.dev/deployment/settings/backups) lets you [backup](/database/backup-restore.md) the data stored in your deployment's database and file storage. On this page, you can schedule periodic backups.

![deployment settings export page](/screenshots/storybook/pages_project_deployment_settings_backups_light.webp)

## Integrations[​](#integrations "Direct link to Integrations")

The integrations page allows you to configure [log streaming](/production/integrations/.md), [exception reporting](/production/integrations/.md), and [streaming export](/production/integrations/streaming-import-export.md) integrations.
