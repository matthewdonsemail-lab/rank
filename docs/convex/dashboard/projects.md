# Projects

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

![Dashboard Projects View](/screenshots/storybook/pages_projects_light.webp)

A project corresponds to a codebase that uses Convex, which contains a production deployment and one personal deployment for each team member.

Clicking on a project in the [landing page](https://dashboard.convex.dev) will redirect you to project details.

## Creating a project[​](#creating-a-project "Direct link to Creating a project")

Projects can be created from the dashboard or from the CLI with [`npx convex dev`](/cli/reference/dev.md). To create a project from the dashboard click on the Create Project button.

## Switching projects[​](#switching-projects "Direct link to Switching projects")

Once you're inside a project, click the project name at the top of the dashboard to switch to another project in the team. Typing filters the team's projects, and the caret at the end of each row opens that project's pages and [deployments](/dashboard/deployments/.md), so you can jump straight into one of them.

![Project switcher](/screenshots/storybook/pages_project_deployment_data_project_switcher_light.webp)

## Project Settings[​](#project-settings "Direct link to Project Settings")

You can access project-level settings by clicking on the triple-dot `⋮` button on each Project card on the Projects page.

![Project card menu](/screenshots/storybook/components_project_card_light.webp)

On the [Project Settings page](https://dashboard.convex.dev/project/settings), you can:

* Update your project's name and slug.
* Manage the project's Admins. See [Roles and Permissions](/dashboard/teams/teams.md#roles-and-permissions) for more details.
* View the amount of [usage metrics](/dashboard/teams/teams.md#usage) your project has consumed.
* Manage [custom domains](/production/custom-domains.md) for your production deployment (in Deployment Settings).
* Generate deploy keys for your production deployment (in Deployment Settings) and preview deployments.
* Create and edit [default environment variables](/production/environment-variables.md#project-environment-variable-defaults).
* View instructions to regain access to your project, should you lose track of your `CONVEX_DEPLOYMENT` config.
* Permanently delete the project.

![Project settings](/screenshots/storybook/pages_project_project_settings_light.webp)

## Transferring a project to another team[​](#transferring-a-project-to-another-team "Direct link to Transferring a project to another team")

You can move a project to another team you’re a member of from the [Project Settings page](https://dashboard.convex.dev/project/settings#transfer-project). The project keeps its slug, deployments, data, environment variables, and deploy keys — only its owning team changes.

After the transfer, the project URL changes from `https://dashboard.convex.dev/t/<old-team>/<project>` to `https://dashboard.convex.dev/t/<new-team>/<project>`. Members of the source team lose access to the project, unless they have permissions on the new team allowing them to see the project.

![Transfer project](/screenshots/storybook/components_transfer_project_light.webp)

To transfer a project:

* You need to be an admin on the **source team** (or have the `project:transfer` permission if using [custom roles](/team-management/custom-roles.md))
* You also need to be an admin on the **destination team** (or have the `project:receive` permission if using [custom roles](/team-management/custom-roles.md)).

## Deleting a project[​](#deleting-a-project "Direct link to Deleting a project")

To delete a project, click on the triple-dot `⋮` button on the Project card and select "Delete". You may also delete your project from the Project Settings page.

Once a project is deleted, it cannot be recovered. All deployments and data associated with the project will be permanently removed. When deleting a project from the dashboard, you will be asked to confirm the deletion. Projects with activity in the production deployment will have additional confirmation steps to prevent accidental deletion.

![Delete project](/assets/images/project_delete-6db8dd21ba528b6c7ce4063a54e2d7f0.png)
