> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# Delete deployment

```
POST 
/deployments/:deployment_name/delete
```

Delete a deployment. This will delete all data and files in the deployment, so we recommend creating and downloading a backup before calling this endpoint. This does not delete the project itself.

## Request[​](#request "Direct link to request")

## Responses[​](#responses "Direct link to Responses")

* 200
