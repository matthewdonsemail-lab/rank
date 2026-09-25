// Pre-push gate: brand rule - no emojis may be used anywhere in the codebase.
// Scans source files, scripts, docs, and configs for pictographic emoji characters.
// Fails with the offending file:line list.
// Run by lefthook (see lefthook.yml). Bypass for emergencies only:
//   SKIP_EMOJI_CHECK=1 git push
// Scanner test: EMOJI_TEST_DIR=<path> node scripts/check-no-emojis.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const selfPath = fileURLToPath(import.meta.url);

if (process.env.SKIP_EMOJI_CHECK) {
  console.log('pre-push: SKIP_EMOJI_CHECK set, skipping emoji check.');
  process.exit(0);
}

const SCAN_DIRS = [
  'lib',
  'src',
  'docs',
  'scripts',
  'README.md',
  'hackathon.md',
  'package.json',
  'tsconfig.json',
  'lefthook.yml',
];

const SCAN_EXT = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.html',
  '.mdx',
  '.md',
  '.json',
  '.yml',
  '.yaml',
]);

const IGNORED_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage',
  'typesafe',
  'convex',
  'treg',
  'nebius',
  'agentmail',
  'hono',
  'fumadocs',
  'upstream',
]);

// Excludes standard copyright (U+00A9), registered (U+00AE), and trademark (U+2122) symbols
const EMOJI_REGEX = /(?!\u00A9|\u00AE|\u2122)\p{Extended_Pictographic}/u;

function scanFile(absPath, violations) {
  if (resolve(absPath) === selfPath) return;
  let text;
  try {
    text = readFileSync(absPath, 'utf8');
  } catch {
    return;
  }
  const rel = relative(root, absPath).replace(/\\/g, '/');
  text.split('\n').forEach((line, i) => {
    const checkedLine = line.replace(/[↘↙]/g, '');
    if (EMOJI_REGEX.test(checkedLine)) {
      violations.push(`${rel}:${i + 1}: ${line.trim()}`);
    }
  });
}

function walk(dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      walk(full, out);
      continue;
    }
    if (entry.isFile()) {
      const dot = entry.name.lastIndexOf('.');
      if (dot > 0 && SCAN_EXT.has(entry.name.slice(dot).toLowerCase())) {
        out.push(full);
      }
    }
  }
}

const targets = [];
const scanRoots = process.env.EMOJI_TEST_DIR !== undefined
  ? [process.env.EMOJI_TEST_DIR]
  : SCAN_DIRS.map((p) => join(root, p));

for (const target of scanRoots) {
  let stat;
  try {
    stat = statSync(target);
  } catch {
    continue;
  }
  if (stat.isDirectory()) walk(target, targets);
  else if (stat.isFile()) targets.push(target);
}

const violations = [];
for (const file of targets) scanFile(file, violations);

if (violations.length > 0) {
  console.error('pre-push: FAIL - Emoji usage found (strict rule: no emojis allowed anywhere).');
  for (const v of violations) console.error(`  ${v}`);
  console.error('Remove all emojis and replace with plain descriptive text.');
  process.exit(1);
}

console.log('pre-push: OK - no emoji usage found.');
