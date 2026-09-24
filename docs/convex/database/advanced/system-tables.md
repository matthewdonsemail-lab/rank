# System Tables

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

System tables enable read-only access to metadata for built-in Convex features. Currently there are two system tables exposed:

* `"_scheduled_functions"` table contains metadata for [scheduled functions](/scheduling/scheduled-functions.md#retrieving-scheduled-function-status)
* `"_storage"` table contains metadata for [stored files](/file-storage/file-metadata.md)

You can read data from system tables using the `db.system.get` and `db.system.query` methods, which work the same as the standard `db.get` and `db.query` methods. Queries reading from system tables are reactive and realtime just like queries reading from all other tables, and pagination can be used to enumerate all documents even when there are too many to read in a single query.
