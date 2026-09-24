> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# Create preview deploy key

```
POST 
/projects/:project_id/create_preview_deploy_key
```

Create a preview deploy key like "preview:team-slug<!-- -->:project-slug<!-- -->|ey..." which can be used with the Convex CLI to create and manage preview deployments within the project.

When access to the project is granted through an OAuth token this preview deploy key will use the same OAuth-granted token.

When access to the project is granted any other way a new token scoped to preview deployments in this project will be created.

## Request[​](#request "Direct link to request")

## Responses[​](#responses "Direct link to Responses")

* 200
