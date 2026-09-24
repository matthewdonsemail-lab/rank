> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# Get an active data sync

```
GET 
/data/sync/:sync_id
```

Requires a Convex Pro plan

On Convex Cloud, this endpoint requires a Convex Pro plan. [Learn more](https://convex.dev/pricing) about our plans or [upgrade](https://dashboard.convex.dev/team/settings/billing).

Returns the progress of a single data sync (/v1/data/sync), identified by the `syncId` that endpoint returns. The status is the same one `/data/list_active_syncs` reports for each sync it lists.

A data sync is considered active for 3 days after the most recent API call from `/data/sync`. Ids of syncs that are unknown or no longer active return a 404.

The caller must have the `deployment:data:view` permission.

## Request[​](#request "Direct link to request")

## Responses[​](#responses "Direct link to Responses")

* 200
