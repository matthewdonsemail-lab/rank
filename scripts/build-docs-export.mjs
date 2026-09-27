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
const targetDir = join(root, "apps", "web", "public", "docs");
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

copy("docs.html", "docs.html");
for (const entry of readdirSync(join(outDir, "docs"))) copy(`docs/${entry}`, entry);
copy("docs.txt", "docs.txt");
copy("_next", "_next");
for (const asset of publicAssets) copy(asset, asset);

// A request for /docs/ (trailing slash) resolves to the directory index.
cpSync(join(outDir, "index.html"), join(targetDir, "docs", "index.html"));

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
