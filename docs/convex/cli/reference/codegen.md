> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# `npx convex codegen`

Generate code in `convex/_generated/` based on the current contents of `convex/`.

This code is generated automatically while running `npx convex dev` and should be committed to the repo (your code won't typecheck without it!). Regenerating it explicitly is rarely needed (e.g. in CI to ensure the correct code was checked in).

This doesn't modify the code running on the deployment.

## Syntax[​](#syntax "Direct link to Syntax")

```
npx convex codegen [options]
```

## Options[​](#options "Direct link to Options")

* `--dry-run`

  Print out the generated configuration to stdout instead of writing to convex directory

* `--typecheck <mode>`

  Whether to check TypeScript files with `tsc --noEmit`.

* `--init`

  Also (over-)write the default convex/README.md and convex/tsconfig.json files, otherwise only written when creating a new Convex project.

* `--component-dir <path>`

  Generate code for a specific component directory instead of the current application.
