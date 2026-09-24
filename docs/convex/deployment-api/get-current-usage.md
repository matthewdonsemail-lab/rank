> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# Get current usage

```
GET 
/get_current_usage
```

Beta

This endpoint is in beta. Its behavior and response shape may change.

Get the values for each usage metric for the current day and month (UTC)

The reported usage is only guaranteed to reflect the full window when `seedStatus` is `complete`. A `pending` or `partial` status means the backfill is still in progress and the returned usage may understate actual usage, so retry later for an accurate total.

## Responses[​](#responses "Direct link to Responses")

* 200
