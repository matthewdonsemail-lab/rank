> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# `npx convex deploy`

Deploys code to a deployment. This is typically used for deploying to a prod or preview deployment manually or from CI; to deploy to your dev deployment when developing, use `npx convex dev`.

The target deployment is chosen like this:

* If the `CONVEX_DEPLOYMENT` environment variable is set (typical during local development), the target is the project’s default production deployment.

* If the `CONVEX_DEPLOY_KEY` environment variable is set (typical in CI), it is the deployment associated with that key.

  <!-- -->

  * When it’s set to a preview deploy key, it will deploy to a preview deployment:

    <!-- -->

    * with the name of the current Git branch when running in CI (Vercel, Netlify, Cloudflare Pages, GitHub)
    * or with the name specified by the `--preview-name` or `--preview-create` flags

`npx convex deploy` will:

1. Run a command if specified with `--cmd`, with the deployment URL available as an environment variable.
2. Typecheck your Convex functions.
3. Regenerate the generated code in the `convex/_generated` directory.
4. Bundle your Convex functions and their dependencies.
5. Push your functions, indexes, and schema to the deployment.
6. When deploying to a preview deployment, it runs the function specified by `--preview-run`. If any step fails, the next steps do not run.

## Syntax[​](#syntax "Direct link to Syntax")

```
npx convex deploy [options]
```

## Options[​](#options "Direct link to Options")

* `-v, --verbose`

  Show full listing of changes

* `--dry-run`

  Print out the generated configuration without deploying to your Convex deployment

* `--typecheck <mode>`

  Whether to check TypeScript files with `tsc --noEmit` before deploying.

* `--typecheck-components`

  Check TypeScript files within component implementations with `tsc --noEmit`.

* `--codegen <mode>`

  Whether to regenerate code in `convex/_generated/` before pushing.

* `--cmd <command>`

  Command to run as part of deploying your app (e.g. `vite build`). This command can depend on the environment variables specified in `--cmd-url-env-var-name` being set.

* `--cmd-url-env-var-name <name>`

  Environment variable name to set Convex deployment URL (e.g. `VITE_CONVEX_URL`) when using `--cmd`

* `--preview-run <functionName>`

  Function to run if deploying to a preview deployment. This is ignored if deploying to a production deployment.

* `--preview-name <name>`

  The name to associate with this preview deployment. Defaults to the current Git branch name in Vercel, Netlify, Cloudflare Pages and GitHub CI. Reuses the existing deployment if one exists.

* `--preview-create <name>`

  Like --preview-name, but deletes and recreates an existing preview deployment with the same name. This parameter can only be used with a preview deploy key (when used with another type of key, the command will return an error).

* `--env-file <envFile>`

  Path to a custom file of environment variables, for choosing the deployment, e.g. CONVEX\_DEPLOYMENT or CONVEX\_SELF\_HOSTED\_URL. Same format as .env.local or .env files, and overrides them.

* `--message <message>`

  Optional message to attach to this deployment in the audit log.

* `--skip-large-indexes-check`

  Skip the confirmation prompt when this push creates, changes, or deletes an index on a large table. Creating or changing an index blocks the deploy until it is backfilled; consider staging it instead so it backfills in the background.
