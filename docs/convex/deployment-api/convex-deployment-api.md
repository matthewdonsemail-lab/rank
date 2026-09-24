> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Version: 1.0.0

# Convex Deployment API

Admin API for interacting with deployments.

## Authentication[​](#authentication "Direct link to Authentication")

* API Key: Deploy Key
* API Key: OAuth Project Token
* API Key: OAuth Team Token
* API Key: Team Token

Deploy keys are used for deployment operations. See [deploy key types](https://docs.convex.dev/cli/deploy-key-types) for more information. Use the `Convex `prefix (e.g., `Convex <deploy_key>`).

| Security Scheme Type:  | apiKey        |
| ---------------------- | ------------- |
| Header parameter name: | Authorization |

Obtained through a [Convex OAuth application](https://docs.convex.dev/management-api) with project scope. Use the `Convex `prefix (e.g., `Convex <oauth_project_token>`).

| Security Scheme Type:  | apiKey        |
| ---------------------- | ------------- |
| Header parameter name: | Authorization |

Obtained through a [Convex OAuth application](https://docs.convex.dev/management-api). Use the `Convex `prefix (e.g., `Convex <oauth_token>`).

| Security Scheme Type:  | apiKey        |
| ---------------------- | ------------- |
| Header parameter name: | Authorization |

Created in the dashboard under team settings for any team you can manage. Use the `Convex `prefix (e.g., `Convex <team_token>`).

| Security Scheme Type:  | apiKey        |
| ---------------------- | ------------- |
| Header parameter name: | Authorization |

### License

[LicenseRef-FSL-1.1-Apache-2.0](https://spdx.org/licenses/LicenseRef-FSL-1.1-Apache-2.0.html)
