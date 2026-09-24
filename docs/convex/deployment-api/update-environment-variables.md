> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# Update environment variables

```
POST 
/update_environment_variables
```

Update one or many environment variables in a deployment. This will invalidate all subscriptions, since environment variables are accessible in queries but are not part of the cache key of a query result.

## Request[​](#request "Direct link to request")

## Responses[​](#responses "Direct link to Responses")

* 200
