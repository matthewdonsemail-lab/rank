> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# Update default environment variables

```
POST 
/projects/:project_id/update_default_environment_variables
```

Creates, updates, or deletes default environment variables for the specified project. When `value` is a string, the variable is upserted. When `value` is null, the variable is deleted.

## Request[​](#request "Direct link to request")

## Responses[​](#responses "Direct link to Responses")

* 200
