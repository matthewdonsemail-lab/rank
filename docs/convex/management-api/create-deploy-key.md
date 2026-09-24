> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# Create deploy key

```
POST 
/deployments/:deployment_name/create_deploy_key
```

Create a deploy key like "dev<!-- -->:happy-animal-123<!-- -->|ey..." which can be used with the Convex CLI to develop against or deploy code.

When access to the deployment is granted through an OAuth token this deploy key will use the same OAuth-granted token.

When access to the deployment is granted any other way a new token will be created which grants access only to this deployment.

## Request[​](#request "Direct link to request")

## Responses[​](#responses "Direct link to Responses")

* 200
