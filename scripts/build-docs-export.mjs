import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsDir = join(root, "apps", "docs");
const outDir = join(docsDir, "out");
const webPublicDir = join(root, "apps", "web", "public");
const targetDir = join(webPublicDir, "docs");
const nextBin = join(docsDir, "node_modules", "next", "dist", "bin", "next");

const MOUNT = "/docs";

// Next's export only rewrites bundled assets under assetPrefix, so files served
// from `public/` keep their export-root paths. The web app mounts this export at
// /docs, so every root-absolute reference to a public asset is re-prefixed here.
const EXPORT_ROUTES = new Set(["_next", "docs", "404.html", "docs.html", "docs.txt", "index.html", "index.txt"]);

if (!existsSync(nextBin)) {
  console.error(`docs export: next binary not found at ${nextBin}`);
  process.exit(1);
}

const build = spawnSync(process.execPath, [nextBin, "build"], {
  cwd: docsDir,
  env: { ...process.env, DOCS_EXPORT: "1" },
  stdio: "inherit",
  shell: false,
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

if (!existsSync(outDir)) {
  console.error(`docs export: expected static output at ${outDir}`);
  process.exit(1);
}

const publicAssets = readdirSync(outDir)
  .filter((entry) => !EXPORT_ROUTES.has(entry))
  .filter((entry) => statSync(join(outDir, entry)).isDirectory() || /\.(svg|png|jpe?g|webp|ico|woff2?)$/.test(entry));

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });

const copy = (from, to) => cpSync(join(outDir, from), join(targetDir, to), { recursive: true });

// The docs index is emitted as docs.html next to a docs/ directory. Hosting both
// leaves the router resolving /docs to the directory and 404ing, so the index
// becomes the directory index and /docs redirects to /docs/.
cpSync(join(outDir, "docs.html"), join(targetDir, "index.html"));
for (const entry of readdirSync(join(outDir, "docs"))) copy(`docs/${entry}`, entry);
copy("_next", "_next");
for (const asset of publicAssets) copy(asset, asset);

// llms.txt for the docs site is a route at the export root, so it stays a sibling
// of the mount rather than nested inside it.
cpSync(join(outDir, "docs.txt"), join(webPublicDir, "docs.txt"));

function prefixPublicAssetReferences(dir) {
  const patterns = publicAssets.map((asset) => ({
    pattern: new RegExp(`(?<![\\w/])\\/${asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g"),
    replacement: `${MOUNT}/${asset}`,
  }));

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      prefixPublicAssetReferences(path);
      continue;
    }
    if (!/\.(html|css)$/.test(entry.name)) continue;
    let text = readFileSync(path, "utf8");
    for (const { pattern, replacement } of patterns) {
      text = text.replace(pattern, replacement);
    }
    writeFileSync(path, text);
  }
}

prefixPublicAssetReferences(targetDir);

console.log(
  `docs export: ${publicAssets.length + 4} entries mounted at apps/web/public${MOUNT} (served at ${MOUNT})`,
);
