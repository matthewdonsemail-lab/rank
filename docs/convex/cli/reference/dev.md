> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# `npx convex dev`

Develop against a dev deployment, watching for changes

1. Configures a new or existing project (if needed)
2. Updates generated types and pushes code to the configured dev deployment
3. Runs the provided command (if `--start` or `--run` is used)
4. Watches for file changes, and repeats step 2

## Syntax[​](#syntax "Direct link to Syntax")

```
npx convex dev [options]
```

## Options[​](#options "Direct link to Options")

* `-v, --verbose`

  Show full listing of changes

* `--typecheck <mode>`

  Check TypeScript files with `tsc --noEmit`.

* `--typecheck-components`

  Check TypeScript files within component implementations with `tsc --noEmit`.

* `--codegen <mode>`

  Regenerate code in `convex/_generated/`

* `--once`

  Execute only the first 3 steps, stop on any failure

* `--until-success`

  Execute only the first 3 steps, on failure watch for local and remote changes and retry steps 2 and 3

* `--start <command>`

  Start a long-running command alongside `npx convex dev`, like a frontend dev server. The command inherits stdin/stdout so you can interact with it directly. Example: npx convex dev --start 'vite --open'

* `--run <functionName>`

  The identifier of the function to run in step 3, like `api.init.createData` or `myDir/myFile:myFunction`

* `--run-component <functionName>`

  If --run is used and the function is in a component, the path to the component (e.g. "workflow" or "workflow/workpool"). Components are a beta feature. This flag is unstable and may change in subsequent releases.

* `--tail-logs [mode]`

  Choose whether to tail Convex function logs in this terminal:

  * `always` shows logs continuously
  * `pause-on-deploy` (the default) pauses logs during deploys so you can spot sync issues
  * `disable` hides logs while developing.

* `--configure [choice]`

  Ignore existing configuration and configure new or existing project, interactively or set by --team \<team\_slug>, --project \<project\_slug>, and --dev-deployment local|cloud

* `--env-file <envFile>`

  Path to a custom file of environment variables, for choosing the deployment, e.g. CONVEX\_DEPLOYMENT or CONVEX\_SELF\_HOSTED\_URL. Same format as .env.local or .env files, and overrides them.
