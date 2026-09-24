# Regions

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

You may select a hosting region for your Convex deployment to change the location of your data.

All infrastructure powering your deployment will be hosted in the selected region.

## Available regions[​](#available-regions "Direct link to Available regions")

The current available regions are in US East (N. Virginia) and EU West (Ireland). More regions will be added in the future.

## Selecting a region[​](#selecting-a-region "Direct link to Selecting a region")

When creating a deployment on the Convex dashboard, you will be prompted to select a region. You may also choose to set the default region for all of your team's deployments at this time.

[Visit the team settings page](https://dashboard.convex.dev/team/settings) to change your team's default region.

CLI support for selecting a region for new deployments is coming soon.

## Migrating between regions[​](#migrating-between-regions "Direct link to Migrating between regions")

An existing deployment's region cannot be changed. If you need to move your deployment to a different region, you will need to create a new project or deployment in the desired region and migrate your data by [exporting](https://docs.convex.dev/database/import-export/import) and [importing](https://docs.convex.dev/database/import-export/export) your data with the Convex CLI.
