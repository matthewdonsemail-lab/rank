> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# `npx convex project`

Manage projects in your team.

## Syntax[​](#syntax "Direct link to Syntax")

```
npx convex project [options] [command]
```

## Subcommands[​](#subcommands "Direct link to Subcommands")

* [`npx convex project create`](#create) — Create a new project

## `npx convex project create`[​](#create "Direct link to create")

Create a new project.

Provisioning a deployment is a separate step — after creating the project, run `npx convex deployment create` to add one.

* Create a project in your only team: `npx convex project create my-app`
* Pick the team: `npx convex project create my-app --team my-team`

### Syntax[​](#syntax-1 "Direct link to Syntax")

```
npx convex project create [options] [name]
```

### Arguments[​](#arguments "Direct link to Arguments")

* `[name]`

  The name of the new project. Prompted for when omitted in an interactive terminal; required otherwise.

### Options[​](#options "Direct link to Options")

* `--team <team_slug>`

  The team to create the project in. Defaults to your only team, or prompts when you belong to several.
