# Data Export

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

## Zip Export[​](#zip-export "Direct link to Zip Export")

You can export your data to a zip file from Convex by [taking a backup](/database/backup-restore.md) and downloading it.

Alternatively, you can export the same data with the [command line](/cli/reference/export.md):

```
npx convex export --path ~/Downloads
```

## Streaming Export[​](#streaming-export "Direct link to Streaming Export")

You can programmatically do a paginated streaming export by using the [Data Sync API](https://docs.convex.dev/deployment-api/data-sync) or with an [integration with a third party provider](https://docs.convex.dev/production/integrations/streaming-import-export).
