> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# Delete a custom role

```
POST 
/teams/:team_id/delete_custom_role
```

Deletes a custom role from the team. Fails with `CustomRoleInUse` if the role is still attached to any team members; reassign those members (e.g. via `update_team_member_role`) before retrying.

## Request[​](#request "Direct link to request")

## Responses[​](#responses "Direct link to Responses")

* 200
