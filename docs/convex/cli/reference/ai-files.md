> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# `npx convex ai-files`

Convex AI files help AI coding assistants (Cursor, Claude Code, etc.) understand Convex patterns and APIs. They are set up during your first `npx convex dev` and can be managed at any time with the commands below.

## Syntax[​](#syntax "Direct link to Syntax")

```
npx convex ai-files [options] [command]
```

## Subcommands[​](#subcommands "Direct link to Subcommands")

* [`npx convex ai-files status`](#status) — Show the current status of Convex AI files
* [`npx convex ai-files install`](#install) — Install or refresh Convex AI files
* [`npx convex ai-files enable`](#enable) — Enable Convex AI files
* [`npx convex ai-files update`](#update) — Update Convex AI files to the latest version
* [`npx convex ai-files disable`](#disable) — Disable Convex AI files without removing them
* [`npx convex ai-files remove`](#remove) — Remove all Convex AI files from the project

## `npx convex ai-files status`[​](#status "Direct link to status")

Prints whether Convex AI files are enabled, and for each component:

* convex/\_generated/ai/guidelines.md
* AGENTS.md (Convex section)
* CLAUDE.md (if installed by Convex)
* Agent skills

Fetches the latest hashes from version.convex.dev to report whether each file is up to date. If the network is unavailable the staleness check is skipped silently.

### Syntax[​](#syntax-1 "Direct link to Syntax")

```
npx convex ai-files status [options]
```

## `npx convex ai-files install`[​](#install "Direct link to install")

Installs the following (or refreshes them if already present):

* convex/\_generated/ai/guidelines.md
* AGENTS.md (Convex section only)
* CLAUDE.md (Convex section only)
* Agent skills (installed to each coding agent's native path, configured via convex.json)

### Syntax[​](#syntax-2 "Direct link to Syntax")

```
npx convex ai-files install [options]
```

## `npx convex ai-files enable`[​](#enable "Direct link to enable")

Re-enables Convex AI files by writing `aiFiles.enabled: true` to `convex.json`, then installs or refreshes the managed AI files.

### Syntax[​](#syntax-3 "Direct link to Syntax")

```
npx convex ai-files enable [options]
```

## `npx convex ai-files update`[​](#update "Direct link to update")

Updates the following to their latest versions:

* convex/\_generated/ai/guidelines.md
* AGENTS.md (Convex section only)
* CLAUDE.md (Convex section only)
* Agent skills (installed to each coding agent's native path, configured via convex.json)

### Syntax[​](#syntax-4 "Direct link to Syntax")

```
npx convex ai-files update [options]
```

## `npx convex ai-files disable`[​](#disable "Direct link to disable")

Writes `aiFiles.enabled: false` to `convex.json` so `npx convex dev` stops prompting to install AI files and suppresses staleness messages.

Files already installed are left untouched - use `npx convex ai-files remove` if you also want to delete them.

Run `npx convex ai-files enable` to re-enable at any time.

### Syntax[​](#syntax-5 "Direct link to Syntax")

```
npx convex ai-files disable [options]
```

## `npx convex ai-files remove`[​](#remove "Direct link to remove")

Removes the following:

* convex/\_generated/ai/ directory (guidelines.md, ai-files.state.json)
* Convex sections from AGENTS.md and CLAUDE.md
* Agent skills installed by `npx convex ai-files install`

If removing the managed section leaves AGENTS.md or CLAUDE.md empty, the empty file is deleted. Otherwise the rest of the file is kept.

Skills installed from other sources are not affected.

Note: after `remove`, `npx convex dev` will suggest reinstalling AI files. Use `npx convex ai-files disable` to opt out entirely without deleting files.

### Syntax[​](#syntax-6 "Direct link to Syntax")

```
npx convex ai-files remove [options]
```
