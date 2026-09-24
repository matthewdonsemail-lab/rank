# Deployment API

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

The public interface of a Convex deployment is defined by the functions defined in files in a convex folder.

The public HTTP endpoints of every Convex deployment consist of custom HTTP endpoints defined by [HTTP Actions](/functions/http-actions.md) and a static [public HTTP API](/http-api/.md).

Deployments also provide private endpoints only for the administrators of that deployment (see [Platform APIs](/deployment-platform-api.md)).

A client wrapping the Platform APIs for deployments is available in the [`@convex-dev/platform` package](https://www.npmjs.com/package/@convex-dev/platform).
