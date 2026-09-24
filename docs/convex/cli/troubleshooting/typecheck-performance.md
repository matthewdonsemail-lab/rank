# Typecheck Performance

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

When you are experiencing slow typechecking performance when pushing code to your Convex deployment (e.g. when running `npx convex dev`), there are a few different strategies you can try to improve performance or debug typechecking bottlenecks.

## Use the TypeScript 7 compiler[​](#use-the-typescript-7-compiler "Direct link to Use the TypeScript 7 compiler")

TypeScript 7's native compiler is generally much faster than earlier versions of TypeScript. To use it, install it as your project's TypeScript version. Convex will use it automatically.

```
npm install --save-dev typescript@^7
```

TypeScript 7.0 does not include a JavaScript API, so if other tools in your project need it, follow TypeScript's [side-by-side installation](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0) instructions. Convex picks up TypeScript 7 in that setup too.

## Debug slow typechecking[​](#debug-slow-typechecking "Direct link to Debug slow typechecking")

Sometimes the TypeScript compiler can get stuck in a complex type inference loop. Often, adding a single manual type can help break the loop. You can [use the `generateTrace` flag](https://github.com/microsoft/TypeScript-wiki/blob/main/Performance-Tracing.md) to determine where the compiler is spending the most time:

```
npx tsc -p path/to/convex --generateTrace output_directory --incremental false
```

## Use static codegen[​](#use-static-codegen "Direct link to Use static codegen")

Static codegen is in beta

Static codegen<!-- --> <!-- -->is<!-- --> currently a [beta feature](/production/state/.md#beta-features). If you have feedback or feature requests, [let us know on Discord](https://convex.dev/community)!

[Using static codegen](/production/project-configuration.md#using-static-code-generation-beta) can improve typechecking performance, but currently comes with [some caveats](/production/project-configuration.md#using-static-code-generation-beta).

## Disable typechecking[​](#disable-typechecking "Direct link to Disable typechecking")

You can disable typechecking using the `--typecheck=disable` option with `npx convex dev` and `npx convex deploy`. In general, we do not recommend disabling typechecking. However, this can be used as a last resort workaround.
