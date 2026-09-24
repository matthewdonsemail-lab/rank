> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# List active data syncs

```
GET 
/data/list_active_syncs
```

Requires a Convex Pro plan

On Convex Cloud, this endpoint requires a Convex Pro plan. [Learn more](https://convex.dev/pricing) about our plans or [upgrade](https://dashboard.convex.dev/team/settings/billing).

Returns the progress of active data sync (/v1/data/sync).

A data sync is considered active for 3 days after the most recent API call. from `/data/sync` within the past 3 days.

## Request[​](#request "Direct link to request")

## Responses[​](#responses "Direct link to Responses")

* 200
