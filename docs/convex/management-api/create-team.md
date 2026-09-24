> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# Create a team

```
POST 
/teams/create_team
```

This endpoint is not publicly accessible. It is reserved for specific integrations that have been granted permission to create teams on behalf of users. To request access, contact <platforms@convex.dev>.

## Request[​](#request "Direct link to request")

## Responses[​](#responses "Direct link to Responses")

* 201
* 400
* 403

Team created successfully

Invalid team name or deployment region

This application is not authorized to create teams. This endpoint is reserved for specific integrations that are allowed to create users. If you need to create teams for your users, please contact us at <platforms@convex.dev>
