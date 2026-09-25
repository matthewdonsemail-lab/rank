import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FORBIDDEN = [
  /hono/i,
  /bm25/i,
  /reciprocal rank fusion|\bRRF\b/i,
  /\bLRU\b|in-memory cache/i,
  /live deployment|rank\.listeningkit\.com/i,
  /model context protocol|\bMCP\b/i,
  /autonomous outreach|first-reply|agentmail\.com|@agentmail/i,
  /llama-3\.3|deepseek/i,
  /nebius-hosted|on nebius ai studio|BAAI\/bge-reranker-v2-m3/i,
];
const REQUIRED_FILES = [
  "README.md",
  "docs/architecture.md",
  "docs/features.md",
  "docs/backend-reference.md",
  "docs/diagrams/README.md",
  "docs/naming-conventions.md",
  "docs/self-hosting.md",
  "docs/xstate/README.md",
  "docs/xstate/machines.md",
];
const REQUIRED_TERMS = [
  ["README.md", ["XState v6", "TypeSafeEvaluator", "brandEnrichmentMachine", "prospectEvaluationMachine"]],
  ["docs/architecture.md", ["brandEnrichmentMachine", "competitorDiscoveryMachine", "prospectEvaluationMachine", "TypeSafe"]],
  ["docs/xstate/README.md", ["xstate@6.0.0-alpha.59", "docs/xstate/upstream/"]],
  ["docs/diagrams/README.md", ["machine-pipeline.mmd", "brandEnrichmentMachine", "prospectEvaluationMachine"]],
];

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(entryPath));
    else files.push(entryPath);
  }
  return files;
}

function activeFiles() {
  const files = REQUIRED_FILES.map((file) => path.join(ROOT_DIR, file));
  files.push(...walk(path.join(ROOT_DIR, "docs", "diagrams")).filter((file) => file.endsWith(".mmd")));
  files.push(...walk(path.join(ROOT_DIR, "docs", "xstate")).filter((file) => file.endsWith(".md") && !file.includes(`${path.sep}upstream${path.sep}`)));
  files.push(...walk(path.join(ROOT_DIR, "docs", "brand")).filter((file) => file.endsWith(".md")));
  return [...new Set(files)];
}

const failures = [];
for (const filePath of activeFiles()) {
  const relativePath = path.relative(ROOT_DIR, filePath).replaceAll("\\", "/");
  if (!fs.existsSync(filePath)) {
    failures.push(`${relativePath}: missing`);
    continue;
  }
  const content = fs.readFileSync(filePath, "utf-8");
  for (const pattern of FORBIDDEN) {
    if (pattern.test(content)) failures.push(`${relativePath}: contains stale documentation pattern ${pattern}`);
  }
}
for (const [relativePath, terms] of REQUIRED_TERMS) {
  const content = fs.readFileSync(path.join(ROOT_DIR, relativePath), "utf-8");
  for (const term of terms) {
    if (!content.includes(term)) failures.push(`${relativePath}: missing required current term ${term}`);
  }
}

if (failures.length > 0) {
  console.error("Documentation check failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Documentation check passed for ${activeFiles().length} active files.`);
}
