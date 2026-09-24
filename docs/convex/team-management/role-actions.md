# Role Actions

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Convex represents every permission you can grant on a team, project, or deployment as a named **role action**. Both the built-in team roles (Admin and Developer) and [custom roles](/team-management/custom-roles.md) are defined in terms of the same set of role actions, so this page works as a reference for both:

* If you're using built-in roles, scan the columns below to see which permissions each role gets.
* If you're writing a [custom role](/team-management/custom-roles.md), pick the action names you want to allow or deny.

## Conventions[​](#conventions "Direct link to Conventions")

Each table lists role actions for one kind of resource, with a column per built-in role:

* **Team Admin** is granted to any team member with the built-in Admin role.
* **Team Developer** is granted to any team member with the built-in Developer role. Members assigned custom roles do **not** receive Developer-level access.
* **Project Admin** is granted to any team member who additionally holds the Project Admin role on the specific project that owns the resource. Project Admin sits alongside the member's built-in or custom role; Team Admins implicitly have Project Admin on every project.

Cells use these markers:

* ✓ - the role grants this action.
* ✗ - the role does not grant this action.
* ✓ *non-prod* - the role grants this action only on non-production deployments. Granting the action on a production deployment requires Team Admin or Project Admin on that project.
* N/A - the action does not apply to that role (e.g. Project Admin on team-scoped actions).

## Team[​](#team "Direct link to Team")

Resource leaf: `team:*`.

| Action               | Description                    | Team Admin | Team Developer |
| -------------------- | ------------------------------ | ---------- | -------------- |
| `team:update`        | Change the team name and slug. | ✓          | ✗              |
| `team:delete`        | Delete the team.               | ✓          | ✗              |
| `team:auditLog:view` | View the team's audit log.     | ✓          | ✓              |
| `team:usage:view`    | View the team's usage page.    | ✓          | ✓              |

info

Both `team:auditLog:view` and `team:usage:view` reveal the existence of every project on the team. The audit log contains entries that reference projects and deployments across the whole team, and the usage page breaks down consumption per project. Grant these actions only to members who should know what projects the team has, even if they cannot otherwise access those projects.

## Billing[​](#billing "Direct link to Billing")

Resource leaf: `billing:*`.

| Action                                                                             | Description                                                     | Team Admin | Team Developer |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------- | -------------- |
| `billing:paymentMethod:update`, `billing:contact:update`, `billing:address:update` | Change billing details.                                         | ✓          | ✗              |
| `billing:subscription:changePlan`                                                  | Create, resume, cancel, or change the team's subscription plan. | ✓          | ✗              |
| `billing:spendingLimit:update`                                                     | Set warning and disable spending limits.                        | ✓          | ✗              |
| `billing:view`                                                                     | Read billing details.                                           | ✓          | ✓              |
| `billing:invoices:view`                                                            | Read invoices.                                                  | ✓          | ✗              |

## OAuth applications[​](#oauth-applications "Direct link to OAuth applications")

Resource leaf: `oauthApplication:*`.

| Action                                                                          | Description                          | Team Admin | Team Developer |
| ------------------------------------------------------------------------------- | ------------------------------------ | ---------- | -------------- |
| `oauthApplication:create`, `oauthApplication:update`, `oauthApplication:delete` | Manage OAuth applications.           | ✓          | ✗              |
| `oauthApplication:generateClientSecret`                                         | Generate a client secret for an app. | ✓          | ✗              |
| `oauthApplication:view`                                                         | View OAuth applications.             | ✓          | ✓              |

## SSO[​](#sso "Direct link to SSO")

Resource leaf: `sso:*`.

| Action                                    | Description                   | Team Admin | Team Developer |
| ----------------------------------------- | ----------------------------- | ---------- | -------------- |
| `sso:enable`, `sso:disable`, `sso:update` | Manage the SSO configuration. | ✓          | ✗              |
| `sso:view`                                | View the SSO configuration.   | ✓          | ✓              |

## Authentication domains[​](#authentication-domains "Direct link to Authentication domains")

Resource leaf: `team:*`. These cover the **Authentication Domains** section of the [team authentication page](/team-management/sso.md), which both SSO and [Directory Sync](/team-management/directory-sync.md) read.

| Action                                     | Description                  | Team Admin | Team Developer |
| ------------------------------------------ | ---------------------------- | ---------- | -------------- |
| `team:domain:create`, `team:domain:delete` | Add and remove team domains. | ✓          | ✗              |
| `team:domain:view`                         | View the team's domains.     | ✓          | ✓              |

## Directory Sync[​](#directory-sync "Direct link to Directory Sync")

Resource leaf: `directorySync:*`.

| Action                                                                 | Description                              | Team Admin | Team Developer |
| ---------------------------------------------------------------------- | ---------------------------------------- | ---------- | -------------- |
| `directorySync:enable`, `directorySync:disable`                        | Turn directory management on and off.    | ✓          | ✗              |
| `directorySync:updateGroupMapping`, `directorySync:deleteGroupMapping` | Change the role a directory group gives. | ✓          | ✗              |
| `directorySync:view`                                                   | View the Directory Sync configuration.   | ✓          | ✓              |

Reviewing the staged roster before enabling Directory Sync also requires `member:view`, because it lists each team member and their role.

## Team integrations[​](#team-integrations "Direct link to Team integrations")

Resource leaf: `integration:*`.

| Action                                                           | Description                     | Team Admin | Team Developer |
| ---------------------------------------------------------------- | ------------------------------- | ---------- | -------------- |
| `integration:create`, `integration:update`, `integration:delete` | Manage team-level integrations. | ✓          | ✗              |
| `integration:view`                                               | View team-level integrations.   | ✓          | ✓              |

## Members[​](#members "Direct link to Members")

Resource leaf: `member:*`.

| Action                                                      | Description                       | Team Admin | Team Developer |
| ----------------------------------------------------------- | --------------------------------- | ---------- | -------------- |
| `member:view`                                               | View the team's members.          | ✓          | ✓              |
| `member:invite`, `member:cancelInvitation`, `member:remove` | Manage team membership.           | ✓          | ✗              |
| `member:updateRole`                                         | Change a team member's team role. | ✓          | ✗              |

## Custom roles[​](#custom-roles "Direct link to Custom roles")

Resource leaf: `customRole:*`.

| Action            | Description                              | Team Admin | Team Developer |
| ----------------- | ---------------------------------------- | ---------- | -------------- |
| `customRole:view` | View the team's custom role definitions. | ✓          | ✓              |

`customRole:create`, `customRole:update`, and `customRole:delete` are reserved for Team Admins and cannot be granted through a custom role.

## Projects[​](#projects "Direct link to Projects")

Resource leaf: `project:*` (or `project:slug=…`, `project:id=…`). Project Admin applies on the specific project the action targets.

| Action                                | Description                                           | Team Admin | Team Developer | Project Admin |
| ------------------------------------- | ----------------------------------------------------- | ---------- | -------------- | ------------- |
| `project:create`                      | Create new projects.                                  | ✓          | ✓              | N/A           |
| `project:view`                        | View projects in the team.                            | ✓          | ✓              | ✓             |
| `project:update`, `project:delete`    | Update or delete a project.                           | ✓          | ✗              | ✓             |
| `project:updateMemberRole`            | Assign or remove the Project Admin role on a project. | ✓          | ✗              | ✓             |
| `project:transfer`, `project:receive` | Transfer projects between teams.                      | ✓          | ✗              | ✗             |

## Default project environment variables[​](#default-project-environment-variables "Direct link to Default project environment variables")

Resource leaf: `project:…:defaultEnvironmentVariable:*`.

| Action                                                                                                        | Description                                   | Team Admin | Team Developer | Project Admin |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------- | -------------- | ------------- |
| `defaultEnvironmentVariable:view`                                                                             | View default project environment variables.   | ✓          | ✓              | ✓             |
| `defaultEnvironmentVariable:create`, `defaultEnvironmentVariable:update`, `defaultEnvironmentVariable:delete` | Manage default project environment variables. | ✓          | ✗              | ✓             |

## Deployments[​](#deployments "Direct link to Deployments")

Resource leaf: `project:…:deployment:*` (optionally filtered with selectors like `:type=prod`).

Most deployment-modifying actions are gated by whether the deployment is production. Team Developers can perform them on dev, preview, and custom deployments via team membership, but production deployments additionally require Team Admin or Project Admin on the owning project. The same split applies to data-plane actions: on a production deployment, a Team Developer gets a read-only deployment identity unless they're also Project Admin on that project.

### Lifecycle and configuration[​](#lifecycle-and-configuration "Direct link to Lifecycle and configuration")

| Action                                                                                                                                                                                                                         | Description                                                                                    | Team Admin | Team Developer | Project Admin |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ---------- | -------------- | ------------- |
| `deployment:view`                                                                                                                                                                                                              | View deployments.                                                                              | ✓          | ✓              | ✓             |
| `deployment:create`                                                                                                                                                                                                            | Create deployments.                                                                            | ✓          | ✓ *non-prod*   | ✓             |
| `deployment:delete`                                                                                                                                                                                                            | Delete a deployment.                                                                           | ✓          | ✓ *non-prod*   | ✓             |
| `deployment:transfer`, `deployment:receive`                                                                                                                                                                                    | Transfer a deployment between projects.                                                        | ✓          | ✓ *non-prod*   | ✓             |
| `deployment:updateReference`, `deployment:updateDashboardEditConfirmation`, `deployment:updateExpiresAt`, `deployment:updateSendLogsToClient`, `deployment:updateClass`, `deployment:updateIsDefault`, `deployment:updateType` | Update individual deployment settings. Each gates a single field on the deployment update API. | ✓          | ✓ *non-prod*   | ✓             |
| `deployment:customDomain:view`                                                                                                                                                                                                 | View custom domains.                                                                           | ✓          | ✓              | ✓             |
| `deployment:customDomain:create`, `deployment:customDomain:delete`                                                                                                                                                             | Manage custom domains.                                                                         | ✓          | ✓ *non-prod*   | ✓             |
| `deployment:insights:view`                                                                                                                                                                                                     | View deployment insights.                                                                      | ✓          | ✓              | ✓             |
| `deployment:integrations:view`                                                                                                                                                                                                 | View deployment-scoped integrations.                                                           | ✓          | ✓              | ✓             |
| `deployment:integrations:write`                                                                                                                                                                                                | Modify deployment-scoped integrations.                                                         | ✓          | ✓ *non-prod*   | ✓             |

### Data plane and runtime[​](#data-plane-and-runtime "Direct link to Data plane and runtime")

These actions run against the deployment itself. On production deployments, a Team Developer who isn't also Project Admin gets a read-only deployment identity.

| Action                                                                                 | Description                                                  | Team Admin | Team Developer | Project Admin |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------- | -------------- | ------------- |
| `deployment:deploy`                                                                    | Push code to a deployment.                                   | ✓          | ✓ *non-prod*   | ✓             |
| `deployment:pause`, `deployment:unpause`                                               | Pause or resume function execution.                          | ✓          | ✓ *non-prod*   | ✓             |
| `deployment:logs:view`, `deployment:metrics:view`, `deployment:auditLog:view`          | Read deployment logs, metrics, and audit log.                | ✓          | ✓              | ✓             |
| `deployment:env:view`                                                                  | Read the deployment's environment variables.                 | ✓          | ✓              | ✓             |
| `deployment:env:write`                                                                 | Modify the deployment's environment variables.               | ✓          | ✓ *non-prod*   | ✓             |
| `deployment:data:view`                                                                 | Read the deployment's database tables.                       | ✓          | ✓              | ✓             |
| `deployment:data:write`                                                                | Modify the deployment's database tables.                     | ✓          | ✓ *non-prod*   | ✓             |
| `deployment:functions:runInternalQueries`, `deployment:functions:runTestQuery`         | Run internal queries or test queries against the deployment. | ✓          | ✓              | ✓             |
| `deployment:functions:runInternalMutations`, `deployment:functions:runInternalActions` | Run internal mutations or actions against the deployment.    | ✓          | ✓ *non-prod*   | ✓             |
| `deployment:functions:actAsUser`                                                       | Run functions as another authenticated user.                 | ✓          | ✓ *non-prod*   | ✓             |
| `deployment:usage:view`, `deployment:usageLimits:view`                                 | Read the deployment's current usage and its usage limits.    | ✓          | ✓              | ✓             |
| `deployment:usageLimits:write`                                                         | Create, update, or delete the deployment's usage limits.     | ✓          | ✓ *non-prod*   | ✓             |

### Backups[​](#backups "Direct link to Backups")

| Action                                                                                | Description                            | Team Admin | Team Developer | Project Admin |
| ------------------------------------------------------------------------------------- | -------------------------------------- | ---------- | -------------- | ------------- |
| `deployment:backups:view`, `deployment:backups:download`                              | View and download deployment backups.  | ✓          | ✓              | ✓             |
| `deployment:backups:create`, `deployment:backups:import`, `deployment:backups:delete` | Create, restore, or delete backups.    | ✓          | ✓ *non-prod*   | ✓             |
| `deployment:backups:configurePeriodic`, `deployment:backups:disablePeriodic`          | Configure or disable periodic backups. | ✓          | ✓ *non-prod*   | ✓             |

## Access tokens[​](#access-tokens "Direct link to Access tokens")

Access tokens nest under their owning resource. The actions follow the same prefix as the owner; `team:token:*` for team-scoped tokens, `project:token:*` for project-scoped, and `deployment:token:*` for deployment-scoped.

### Team-scoped tokens (resource leaf: `team:*:token:*`)[​](#team-scoped-tokens-resource-leaf-teamtoken "Direct link to team-scoped-tokens-resource-leaf-teamtoken")

| Action                                                                           | Description                                                   | Team Admin | Team Developer |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------- | -------------- |
| `team:token:create`, `team:token:view`, `team:token:update`, `team:token:delete` | Create, view, update, and delete your own team-scoped tokens. | ✓          | ✓              |

All of these actions are scoped to tokens **you personally created**.

A team access token can only perform actions its creator is allowed to perform. If the creator has [custom roles](/team-management/custom-roles.md), the token is limited to the actions those roles allow, so issuing a token never escalates the creator's privileges.

### Project-scoped tokens (resource leaf: `project:…:token:*`)[​](#project-scoped-tokens-resource-leaf-projecttoken "Direct link to project-scoped-tokens-resource-leaf-projecttoken")

| Action                                                                                       | Description                          | Team Admin | Team Developer | Project Admin |
| -------------------------------------------------------------------------------------------- | ------------------------------------ | ---------- | -------------- | ------------- |
| `project:token:create`, `project:token:update`, `project:token:delete`, `project:token:view` | Manage project-scoped access tokens. | ✓          | ✓              | ✓             |

### Deployment-scoped tokens (resource leaf: `project:…:deployment:…:token:*`)[​](#deployment-scoped-tokens-resource-leaf-projectdeploymenttoken "Direct link to deployment-scoped-tokens-resource-leaf-projectdeploymenttoken")

| Action                                                                                                   | Description                             | Team Admin | Team Developer | Project Admin |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---------- | -------------- | ------------- |
| `deployment:token:create`, `deployment:token:update`, `deployment:token:delete`, `deployment:token:view` | Manage deployment-scoped access tokens. | ✓          | ✓ *non-prod*   | ✓             |

Deploy keys and preview deploy keys are service tokens. Once issued, they carry their own permissions independent of the creator's current role: if a team member has already created a deploy key or preview deploy key, that key continues to work with its original permissions even if the member's team role or custom role later changes. To revoke a key's access, delete the key from the deployment or project settings page.
