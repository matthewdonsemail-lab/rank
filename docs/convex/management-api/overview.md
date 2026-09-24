# Management API

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

info

Building a managed platform? Contact <platforms@convex.dev> with any questions.

You can provision and manage Convex projects and deployments with the Management API.

A client wrapping the Management API is available in the [`@convex-dev/platform` package](https://www.npmjs.com/package/@convex-dev/platform).

## Authorization[​](#authorization "Direct link to Authorization")

The Management API uses a Bearer token Authorization header.

```
const token = "ey...0=";

const response = await fetch("https://api.convex.dev/v1/teams/41/projects", {

  headers: {

    Authorization: `Bearer ${token}`,

  },

});

console.log(await response.json());
```

[Team Access Tokens](/platform-apis/overview.md#managing-your-own-projects) and [OAuth Application Tokens](/platform-apis/oauth-applications.md) can be used in Bearer tokens depending on whether you are using the Management API on behalf of your own team or on behalf of the team of a user of a Convex integration you've built.

## Required Parameters[​](#required-parameters "Direct link to Required Parameters")

Most Management APIs require a team ID or project ID.

When creating a Team Access Token the team ID will be available in the Convex dashboard.

OAuth applications may request the team (or project, if using project-scoped tokens) ID by calling the [Token Details](/management-api/get-token-details.md) endpoint.

When using a team token, projects will be assigned IDs upon creation. The [List Projects](/management-api/list-projects.md) endpoint may also be used to retrieve the ID for a project.

## Responses[​](#responses "Direct link to Responses")

All API responses are in JSON format.

## Endpoints[​](#endpoints "Direct link to Endpoints")

An OpenAPI spec for the Management API is available at <https://api.convex.dev/v1/openapi.json>.
