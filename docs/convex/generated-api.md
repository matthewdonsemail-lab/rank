# Generated Code

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Convex uses code generation to create code that is specific to your app's data model and API. Convex generates JavaScript files (`.js`) with TypeScript type definitions (`.d.ts`).

Code generation isn't required to use Convex, but using the generated code will give you more better autocompletion in your editor and more type safety if you're using TypeScript.

To generate the code, run:

```
npx convex dev
```

This creates a `convex/_generated` directory that contains:

* [`api.js` and `api.d.ts`](/generated-api/api.md)
* [`dataModel.d.ts`](/generated-api/data-model.md)
* [`server.js` and `server.d.ts`](/generated-api/server.md)
