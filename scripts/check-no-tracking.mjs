// Pre-push gate: brand rule — no `tracking-*` letter-spacing utility.
// Scans source for Tailwind `tracking-*` classes and inline letter-spacing
// styles. Fails with the offending file:line list.
// Run by lefthook (see lefthook.yml). Bypass for emergencies only:
//   SKIP_TRACKING_CHECK=1 git push
// Scanner test: TRACKING_TEST_DIR=<path> node scripts/check-no-tracking.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const selfPath = fileURLToPath(import.meta.url);

if (process.env.SKIP_TRACKING_CHECK) {
  console.log('pre-push: SKIP_TRACKING_CHECK set, skipping tracking check.');
  process.exit(0);
}

const SCAN_DIRS = [
  'apps/web/src',
  'apps/web/index.html',
  'apps/docs/app',
  'apps/docs/content',
  'packages/ui/src',
  'scripts',
];

const SCAN_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.mdx', '.md']);

// The Tailwind letter-spacing utilities, plus inline letter-spacing.
// Case-insensitive so renamed/capitalized variants still trip.
const PATTERNS = [
  'tracking-tighter',
  'tracking-tight',
  'tracking-normal',
  'tracking-wide',
  'tracking-wider',
  'tracking-widest',
  'tracking-\\[',
  'letter-spacing:',
  'letterspacing',
];
const regex = new RegExp(PATTERNS.join('|'), 'i');

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
    if (!regex.test(line)) return;
    violations.push(`${rel}:${i + 1}: ${line.trim()}`);
  });
}

function walk(dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git', 'dist', 'build', 'coverage'].includes(entry.name)) continue;
      walk(full, out);
      continue;
    }
    if (entry.isFile()) {
      const dot = entry.name.lastIndexOf('.');
      if (dot > 0 && SCAN_EXT.has(entry.name.slice(dot).toLowerCase())) out.push(full);
    }
  }
}

const targets = [];
for (const target of process.env.TRACKING_TEST_DIR !== undefined ? [process.env.TRACKING_TEST_DIR] : SCAN_DIRS.map((p) => join(root, p))) {
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
  console.error('pre-push: FAIL — letter-spacing usage found (brand rule: no tracking-* utilities).');
  for (const v of violations) console.error(`  ${v}`);
  console.error('Remove the tracking-* class / letter-spacing style so the default letter spacing is used instead.');
  process.exit(1);
}

console.log('pre-push: OK — no tracking-* / letter-spacing usage found.');
