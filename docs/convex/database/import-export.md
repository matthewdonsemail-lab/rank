# Data Import & Export

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

If you're bootstrapping your app from existing data, Convex provides three ways to get the data in:

* Import from csv/json into a single table via the [CLI](/database/import-export/import.md#single-table-import).
* Restore from a backup via the [dashboard](/database/backup-restore.md) or [CLI](/database/import-export/import.md#restore-data-from-a-backup-zip-file).
* [Streaming import](/production/integrations/streaming-import-export.md) from any existing database via Airbyte destination connector.

You can export data from Convex in two ways.

* Download a backup as a zip from the [dashboard](/database/backup-restore.md).
* For advanced use cases, stream data in a continuous export via [Fivetran](/production/integrations/streaming-import-export.md)

Data Import & Export is in beta

Data Import & Export<!-- --> <!-- -->is<!-- --> currently a [beta feature](/production/state/.md#beta-features). If you have feedback or feature requests, [let us know on Discord](https://convex.dev/community)!
