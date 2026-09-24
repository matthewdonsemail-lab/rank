> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# Invite a team member

```
POST 
/teams/:team_id/invite_team_member
```

Invite a member to the given team by email. `role` is required and must be one of `admin`, `developer`, or `custom`. Pass `custom` together with a non-empty `customRoles` list to invite a member into a custom role; for `admin` and `developer`, `customRoles` must be omitted.

## Request[​](#request "Direct link to request")

## Responses[​](#responses "Direct link to Responses")

* 200
