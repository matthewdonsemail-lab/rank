// Pre-push gate: brand rule — no monospace font may render anywhere.
// Scans source for `font-mono` (Tailwind) and mono font stacks (ui-monospace,
// Menlo, Monaco, …) in inline styles. Fails with the offending file:line list.
// Run by lefthook (see lefthook.yml). Bypass for emergencies only:
//   SKIP_FONT_MONO_CHECK=1 git push
// Scanner test: FONT_MONO_TEST_DIR=<path> node scripts/check-no-font-mono.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const selfPath = fileURLToPath(import.meta.url);

if (process.env.SKIP_FONT_MONO_CHECK) {
  console.log('pre-push: SKIP_FONT_MONO_CHECK set, skipping font-mono check.');
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

// The docs re-point --font-mono at the sans stack so no monospace CAN render
// there; that definition line is the sanctioned exception (see the comment
// above it in the file).
const EXEMPTIONS = [{ file: 'apps/docs/app/globals.css', line: /--font-mono\s*:/ }];

// The Tailwind class that resolves to a mono stack, plus concrete mono faces
// in inline styles. Case-insensitive so renamed/capitalized stacks still trip.
const PATTERNS = [
  'font-mono',
  'fontmodule',
  'fontmono',
  'ui-monospace',
  'sfmono',
  'menlo',
  'monaco',
  'consolas',
  'courier',
  'jetbrains mono',
  'fira code',
  'source code',
  'roboto mono',
  'ibm plex mono',
  'cascadia',
  'liberation mono',
  'dejavu sans mono',
  'noto sans mono',
  'lucida console',
  'andale mono',
  'pt mono',
  'mononoki',
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
  const exemption = EXEMPTIONS.find((e) => e.file === rel);
  text.split('\n').forEach((line, i) => {
    if (!regex.test(line)) return;
    if (exemption && exemption.line.test(line)) return;
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
for (const target of process.env.FONT_MONO_TEST_DIR !== undefined ? [process.env.FONT_MONO_TEST_DIR] : SCAN_DIRS.map((p) => join(root, p))) {
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
  console.error('pre-push: FAIL — monospace font usage (brand rule: Satoshi/Inter only, no mono).');
  for (const v of violations) console.error(`  ${v}`);
  console.error('Remove the mono class/stack so the app sans stack (Satoshi/Inter) is used instead.');
  process.exit(1);
}

console.log('pre-push: OK — no monospace font usage found.');