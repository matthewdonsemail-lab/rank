> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# Update a team member's role

```
POST 
/teams/:team_id/update_team_member_role
```

Sets either the member's built-in `role` (admin/developer) or their `customRoles`. The two fields are mutually exclusive: setting `role` clears `customRoles`, and setting `customRoles` (must be non-empty) puts the member in the `custom` role.

## Request[​](#request "Direct link to request")

## Responses[​](#responses "Direct link to Responses")

* 200
