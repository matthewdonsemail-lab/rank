> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# Transfer deployment

```
POST 
/deployments/:deployment_name/transfer
```

Transfer a deployment from its current project to another project within the same team. For production deployments, the caller must be a project admin on both the source and destination projects. For other deployment types, any team member can transfer deployments they created, or project admins can transfer any deployment.

## Request[​](#request "Direct link to request")

## Responses[​](#responses "Direct link to Responses")

* 204
