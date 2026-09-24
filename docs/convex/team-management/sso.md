# Single Sign-On (SSO)

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

info

Single Sign-On is only available on Convex Business and Enterprise.

Single Sign-On (SSO) allows your team to authenticate with Convex using your organization's identity provider (IdP). Once configured, team members can sign in to Convex through your IdP instead of using individual credentials.

## Finding the settings[​](#finding-the-settings "Direct link to Finding the settings")

SSO is configured on the [Team Authentication page](https://dashboard.convex.dev/team/settings/team-authentication), under **Team Settings → Team Authentication**.

Two of its sections cover SSO:

* **Authentication Domains** — the email domains your team owns. SSO only manages members whose account uses one of these domains.
* **Single sign-on** — your identity provider connection.

![The Authentication Domains and Single sign-on sections before anything is configured](/screenshots/storybook/pages_team_authentication_sso_sections_light.webp)

## Setting up SSO[​](#setting-up-sso "Direct link to Setting up SSO")

### 1. Verify a domain[​](#1-verify-a-domain "Direct link to 1. Verify a domain")

Each connection is attached to a domain you own, so start by verifying yours. Select **Add a domain** in the **Authentication Domains** section. Convex opens a separate configuration page in a new tab, where you enter the domain and complete the DNS verification.

Verification is not instant. A domain shows as **Pending** until your DNS record is picked up, and **Verified** once it is. You can re-open **Add a domain** at any time to check on a pending domain.

![The Authentication Domains section listing a verified and a pending domain](/screenshots/storybook/pages_team_authentication_domains_light.webp)

caution

Your own Convex account needs a [verified email](https://dashboard.convex.dev/profile) on one of these domains, otherwise you won't be able to log in through SSO yourself. When none of your verified emails match, the section shows a warning next to its title.

### 2. Connect your identity provider[​](#2-connect-your-identity-provider "Direct link to 2. Connect your identity provider")

Once a domain is verified, select **Configure** in the **Single sign-on** section. Convex opens a separate configuration page in a new tab, where you pick your identity provider and follow its setup instructions.

![The Single sign-on section before a connection has been configured](/screenshots/storybook/pages_team_authentication_single_sign_on_light.webp)

When you come back, the connection appears in the section with its status:

* **Active** — team members can log in through this identity provider.
* **Inactive** — the connection exists but isn't finished. Re-open it with **⋮ → Manage** to complete the remaining steps with your identity provider.

![The Single sign-on section with an active Okta SAML connection](/screenshots/storybook/pages_team_authentication_single_sign_on_configured_light.webp)

### 3. Test the connection[​](#3-test-the-connection "Direct link to 3. Test the connection")

Log out and log back in through your identity provider to confirm the connection works before requiring SSO for the whole team.

## Managing the connection[​](#managing-the-connection "Direct link to Managing the connection")

Use the **⋮** menu next to the connection to manage it:

![The connection menu with Manage, Renew certificate, and Disable Single sign-on](/screenshots/storybook/pages_team_authentication_single_sign_on_menu_light.webp)

* **⋮ → Manage** re-opens the configuration page for this connection.
* **⋮ → Renew certificate** walks you through replacing a signing certificate before it expires.
* **⋮ → Disable Single sign-on** removes the connection. Team members can no longer log in through your identity provider. Your verified domains are unaffected.

## Require Single Sign-On[​](#require-single-sign-on "Direct link to Require Single Sign-On")

Once a connection is active, you can **require** SSO for the team by checking **Require SSO to access team**. The dashboard asks you to confirm before saving.

![The confirmation dialog for requiring SSO to access the team](/screenshots/storybook/pages_team_authentication_require_sso_light.webp)

When this setting is on:

* All team members must authenticate through your identity provider to access this team. This applies to both the dashboard and the CLI.
* Members cannot use other authentication methods to access the team.

This only applies to the team that has SSO enabled. Members can still use other login methods to access any other Convex teams they belong to.

caution

Test your SSO configuration before turning this on. If the connection doesn't work, nobody can access the team, including you.

## Customizing your domain policy[​](#customizing-your-domain-policy "Direct link to Customizing your domain policy")

By default, all Convex users that sign in with your verified SSO domain will be required to log in with SSO to use Convex if they are signing in with an email address that uses your verified domain.

To configure a custom domain policy, such as allowing users to login with other sign-on methods, contact Convex support.

These settings will be available for self-serve configuration in the future.

## Who can configure SSO[​](#who-can-configure-sso "Direct link to Who can configure SSO")

Team Admins can do everything on this page. Team Developers can see the configuration but not change it. With [custom roles](/team-management/custom-roles.md) you can grant the individual [role actions](/team-management/role-actions.md#sso): `sso:view`, `sso:enable`, `sso:update`, `sso:disable`, and the `team:domain:*` actions that cover the **Authentication Domains** section.
