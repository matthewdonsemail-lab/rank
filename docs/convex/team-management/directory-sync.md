# Directory Sync (SCIM)

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Directory Sync is in beta

Directory Sync is a [beta feature](/production/state/.md#beta-features) available on the Convex Business and Enterprise plans. To have it turned on for your team, contact Convex support.

Directory Sync connects your identity provider's user directory to your Convex team, so that your directory controls who belongs to the team and what team role they have.

Directory Sync is configured on the [Team Authentication page](https://dashboard.convex.dev/team/settings/team-authentication), under **Team Settings → Team Authentication**.

info

Directory Sync and [SSO](/team-management/sso.md) are separate features, and you can use either one without the other. Both use the **Authentication Domains** section of the page.

## Setting up Directory Sync[​](#setting-up-directory-sync "Direct link to Setting up Directory Sync")

### 1. Verify a domain[​](#1-verify-a-domain "Direct link to 1. Verify a domain")

Directory Sync only manages members whose Convex account uses an email on a domain your team has verified, so verify a domain first if you have not already. See [verifying a domain](/team-management/sso.md#1-verify-a-domain).

### 2. Connect your directory[​](#2-connect-your-directory "Direct link to 2. Connect your directory")

Select **Configure** in the **Directory sync** section.

![The Directory Sync section before a directory has been configured](/screenshots/storybook/pages_team_authentication_directory_sync_light.webp)

The dashboard describes what connecting a directory does, then opens a separate configuration page in a new tab. That page is where the connection is set up: you pick your identity provider, follow its instructions to point the directory at Convex, and select which directory groups to sync. Complete every step there before coming back to the Convex dashboard, because the directory is not connected until they are all done.

![The dialog that explains the identity provider step before configuring a directory](/screenshots/storybook/pages_team_authentication_directory_sync_configure_light.webp)

Back in the Convex dashboard, the dialog shows the connection's progress while you work through that page, and updates once the directory is linked. You can close it and come back later without losing your progress.

### 3. Wait for the initial sync[​](#3-wait-for-the-initial-sync "Direct link to 3. Wait for the initial sync")

After the connection is made, your identity provider sends over its users and the groups you selected to sync. Syncing those groups usually takes a few minutes, and can take up to an hour, as directory updates are processed on a schedule. Groups appear in **Directory group roles** as they arrive.

![The Directory Sync section during the initial sync, with no groups yet](/screenshots/storybook/pages_team_authentication_directory_sync_initial_sync_light.webp)

### 4. Map directory groups to roles[​](#4-map-directory-groups-to-roles "Direct link to 4. Map directory groups to roles")

Each group in your directory maps to a Convex team role. Use the edit button next to a group to change the role its members get.

![Directory group roles, mapping each directory group to a Convex role](/screenshots/storybook/pages_team_authentication_directory_group_roles_light.webp)

A group can map to:

* **Admin**, which grants full access to the team.
* **Developer**.
* One or more [custom roles](/team-management/custom-roles.md).
* **No access**, which is the default for any group you have not mapped. A directory user who is in no group, or only in groups you have not mapped, has no access to the Convex team.

![The dialog for choosing the Convex role a directory group gives](/screenshots/storybook/pages_team_authentication_edit_group_role_light.webp)

Users often belong to more than one group. When they do, Convex picks their role in this order:

1. **Admin**, if any of their groups maps to Admin.
2. Otherwise, all of the custom roles granted by their groups, if any group grants one.
3. Otherwise, **Developer**, if any of their groups maps to Developer.
4. Otherwise, **no access**.

The group name `convex-team-admins` is reserved. It always maps to Admin, and you cannot edit its mapping. See [Emergency lockout recovery](#emergency-lockout-recovery).

### 5. Review the changes and enable[​](#5-review-the-changes-and-enable "Direct link to 5. Review the changes and enable")

Directory Sync does not manage anyone until you turn it on. Select **Review** on the Directory Sync section to see what enabling it would change.

![The Directory Sync section asking you to review role mappings before enabling](/screenshots/storybook/pages_team_authentication_directory_sync_synced_light.webp)

This dialog lists every current team member and every user in the directory, with the role each one has today and the role the directory would give them:

![The review dialog listing each member's current role and the role the directory would give them](/screenshots/storybook/pages_team_authentication_review_directory_changes_light.webp)

* Members who are in the directory take the role their groups grant, which may differ from the role they have today.
* Members who are not in the directory are marked **Not in directory**. They keep their access and their role until you remove them from the team or add them to the directory.
* Directory users who are not on the team yet are marked **Not in team**. Once Directory Sync is enabled, they may choose to join the team by selecting the team invitation from the team switcher in the Convex dashboard.
* Users who are not active in your directory are marked **Suspended in directory**. If such a user is a team member, they are removed from the team. If they are not a member, they are not offered the team.
* Users who are in no mapped group are marked **Directory does not grant access**, and are treated the same way.

Check the acknowledgement and select **Enable directory sync**. The prompt to review goes away, and the directory starts managing the members it covers.

![The Directory Sync section with directory management enabled](/screenshots/storybook/pages_team_authentication_directory_sync_enabled_light.webp)

## How members join[​](#how-members-join "Direct link to How members join")

Directory Sync offers the team to people instead of adding them to it. A directory user is offered your team once they have a Convex account with a **verified email** that matches their directory entry, on one of your verified domains.

The team shows up as an invitation in their team switcher, which they select to accept it:

![A directory-synced team offered as an invitation in the team switcher](/screenshots/storybook/pages_projects_team_switcher_with_invitation_light.webp)

The team is also listed under **Available Teams** on their [profile page](https://dashboard.convex.dev/profile), even if they dismiss the invitation in the switcher:

![The Available Teams section of the profile page, listing a team to join](/screenshots/storybook/pages_profile_available_teams_light.webp)

To see who has been offered the team but has not joined, use **⋮ → View pending members**.

![The pending members dialog listing directory users who have not joined yet](/screenshots/storybook/pages_team_authentication_pending_members_light.webp)

## Keeping the team in sync[​](#keeping-the-team-in-sync "Direct link to Keeping the team in sync")

Once Directory Sync is enabled, changes in your identity provider are applied to Convex automatically:

* Adding a user to the directory offers them the team, once one of their groups is mapped to a role.
* Moving a user between groups changes their Convex role, and removes them from the team once they are in no mapped group.
* Changing a group's mapping updates the role of everyone in that group.
* Suspending a user in the directory, or removing them from it, removes them from the Convex team. See [Deprovisioning removes members](#deprovisioning-removes-members) for what that means for them.

Directory updates are processed on a schedule, so changes can take up to an hour to arrive and your Convex team can lag behind your identity provider.

Your directory also takes over the parts of the members page it covers:

* The team stops accepting manual invitations. Add the person to your directory instead. Invitations sent before the directory was connected can no longer be accepted either.
* You cannot change the role of a member the directory manages, or remove them from the team, from the Convex dashboard. Move them between groups, or take them out of the directory, in your identity provider instead.
* Members the directory does not cover are unaffected, and anyone can still remove themselves from the team.

To manage the directory connection, view the current status of the directory, or request a manual sync, use the **⋮ → Manage** button.

## Disabling Directory Sync[​](#disabling-directory-sync "Direct link to Disabling Directory Sync")

Select **⋮ → Disable Directory Sync** to disconnect the directory. Members your identity provider provisioned keep their team membership and the role they have at that moment.

The team stops being managed by the directory right away, but the directory itself can take up to an hour to disappear from this page while Convex finishes tearing the connection down.

Deleting a verified domain has the same effect for the members on that domain: the directory can no longer manage them.

## Emergency lockout recovery[​](#emergency-lockout-recovery "Direct link to Emergency lockout recovery")

If every directory group maps to a non-admin role, if your admins end up in groups that do not grant Admin or in no mapped group at all, or if the directory has no users left, the team can be left without an admin and without anyone who can map one back. The reserved group name `convex-team-admins` exists for this case:

1. In your identity provider, create a directory group named `convex-team-admins` (the match is case-insensitive).
2. Add the people who should be team admins to it.
3. Wait for the group to sync. It appears under **Directory group roles** with the role **Admin**, and the edit button next to it is disabled, because this mapping cannot be changed from Convex.

## Things to know[​](#things-to-know "Direct link to Things to know")

### Project roles are managed separately[​](#project-roles-are-managed-separately "Direct link to Project roles are managed separately")

Your directory sets a member's team role. [Project Admin](/dashboard/teams/teams.md#project-admins) is granted per project on the members page.

### Deprovisioning removes members[​](#deprovisioning-removes-members "Direct link to Deprovisioning removes members")

Suspending a user in your directory, or removing them from it, removes them from the Convex team. They lose access immediately, along with their membership. Making them active in the directory again offers them the team, but their project roles have to be set up again.

### Deleting a group deletes its role mapping[​](#deleting-a-group-deletes-its-role-mapping "Direct link to Deleting a group deletes its role mapping")

This includes any custom roles mapped to the group. If you add the group back later it arrives unmapped, which grants no access, so its role and custom roles have to be set again. The same is true for a group you rename, which your identity provider may send as a delete and an add.

A custom role cannot be deleted while a directory group maps to it. Remap those groups first, then delete the role.

### Members are matched by verified email[​](#members-are-matched-by-verified-email "Direct link to Members are matched by verified email")

A directory user only links to a Convex account that has verified the email your directory carries for them. If that email stops being verified on the account, that member is removed from your Convex team.

## Who can configure Directory Sync[​](#who-can-configure-directory-sync "Direct link to Who can configure Directory Sync")

Team Admins can do everything on this page. Team Developers can see the configuration but not change it. With [custom roles](/team-management/custom-roles.md) you can grant the individual [role actions](/team-management/role-actions.md#directory-sync): `directorySync:view`, `directorySync:enable`, `directorySync:disable`, `directorySync:updateGroupMapping`, and `directorySync:deleteGroupMapping`. Reviewing the roster also requires `member:view`, because it lists each team member and their role.

Enabling and disabling Directory Sync, and every change to a group's role mapping, is recorded in the [team audit log](/dashboard/teams/teams.md#audit-log).
