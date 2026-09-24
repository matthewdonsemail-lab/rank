> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Version: 1.0.0

# Convex Management API

Management API for provisioning and managing Convex projects and deployments.

## Authentication[​](#authentication "Direct link to Authentication")

* HTTP: Bearer Auth
* HTTP: Bearer Auth
* HTTP: Bearer Auth
* HTTP: Bearer Auth
* HTTP: Bearer Auth

Obtained through a [Convex OAuth application](https://docs.convex.dev/management-api).

| Security Scheme Type:      | http   |
| -------------------------- | ------ |
| HTTP Authorization Scheme: | bearer |

Obtained through a [Convex OAuth application](https://docs.convex.dev/management-api).

| Security Scheme Type:      | http   |
| -------------------------- | ------ |
| HTTP Authorization Scheme: | bearer |

Personal access token created in the Convex dashboard under user settings.

| Security Scheme Type:      | http   |
| -------------------------- | ------ |
| HTTP Authorization Scheme: | bearer |
| Bearer format:             | PAT    |

Preview deploy key scoped to a project. Allowed only when operating on preview deployments in the key's project.

| Security Scheme Type:      | http   |
| -------------------------- | ------ |
| HTTP Authorization Scheme: | bearer |

Created in the dashboard under team settings for any team you can manage.

| Security Scheme Type:      | http   |
| -------------------------- | ------ |
| HTTP Authorization Scheme: | bearer |

### License

[LicenseRef-Convex](https://spdx.org/licenses/LicenseRef-Convex.html)
