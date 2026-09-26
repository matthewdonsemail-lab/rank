// Pre-push gate: architecture rule — enforces the {library}/{domainname}/helpers convention.
// Applies to lib/ and to each packages/<package>/src/ root.
//
// Verifies, for every checked root:
// 1. Library and domain directory names are lowercase kebab-case (^[a-z0-9-]+$)
// 2. Every domain has an index.ts entrypoint
// 3. Any helpers/ directory contains an index.ts barrel
// 4. No helper file imports the parent domain barrel (../index), which would
//    make the barrel depend on its own helpers
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const KEBAB_REGEX = /^[a-z0-9-]+$/;

const violations = [];

/** Roots that follow the convention, as { path, kind } pairs. */
function collectRoots() {
  const roots = [];
  const libDir = join(root, 'lib');
  if (existsSync(libDir)) roots.push({ path: libDir, kind: 'lib' });

  const packagesDir = join(root, 'packages');
  if (existsSync(packagesDir)) {
    for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || !KEBAB_REGEX.test(entry.name)) continue;
      const srcDir = join(packagesDir, entry.name, 'src');
      if (existsSync(srcDir) && statSync(srcDir).isDirectory()) {
        roots.push({ path: srcDir, kind: `packages/${entry.name}/src` });
      }
    }
  }
  return roots;
}

/** A helpers/ directory needs a barrel and must not import the domain barrel. */
function checkHelpers(domainPath, label) {
  const helpersPath = join(domainPath, 'helpers');
  if (!existsSync(helpersPath) || !statSync(helpersPath).isDirectory()) return;

  if (!existsSync(join(helpersPath, 'index.ts'))) {
    violations.push(`${label}/helpers: Missing required barrel "helpers/index.ts".`);
  }

  for (const file of readdirSync(helpersPath).filter((f) => f.endsWith('.ts'))) {
    const lines = readFileSync(join(helpersPath, file), 'utf8').split('\n');
    lines.forEach((line, index) => {
      const importsParentBarrel =
        (line.includes("from '../index") || line.includes('from "../index')) &&
        !line.trim().startsWith('//');
      if (importsParentBarrel) {
        violations.push(
          `${label}/helpers/${file}:${index + 1}: Prohibited circular import from the parent domain barrel.`
        );
      }
    });
  }
}

/** A domain directory needs an index.ts and a helpers barrel when present. */
function checkDomain(domainPath, name, label) {
  if (!KEBAB_REGEX.test(name)) {
    violations.push(`${label}: Domain name must be lowercase kebab-case (got "${name}").`);
    return;
  }
  if (!existsSync(join(domainPath, 'index.ts'))) {
    violations.push(`${label}: Missing required entrypoint "index.ts".`);
  }
  checkHelpers(domainPath, label);
}

/**
 * A root holds either standalone domains (each with its own index.ts) or
 * libraries that contain domain subdirectories.
 */
function checkRoot(rootPath, kind) {
  const entries = readdirSync(rootPath, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  if (entries.length === 0) {
    violations.push(`${kind}: Must contain at least one domain directory.`);
    return;
  }

  const libraries = entries.filter((entry) => !existsSync(join(rootPath, entry.name, 'index.ts')));
  const standalone = entries.filter((entry) => existsSync(join(rootPath, entry.name, 'index.ts')));

  for (const entry of standalone) {
    checkDomain(join(rootPath, entry.name), entry.name, `${kind}/${entry.name}`);
  }

  for (const library of libraries) {
    if (!KEBAB_REGEX.test(library.name)) {
      violations.push(`${kind}/${library.name}: Library name must be lowercase kebab-case (got "${library.name}").`);
      continue;
    }
    const libraryPath = join(rootPath, library.name);
    const domains = readdirSync(libraryPath, { withFileTypes: true }).filter((d) => d.isDirectory());
    if (domains.length === 0) {
      violations.push(`${kind}/${library.name}: Library directory must contain at least one domain subdirectory.`);
      continue;
    }
    for (const domain of domains) {
      checkDomain(join(libraryPath, domain.name), domain.name, `${kind}/${library.name}/${domain.name}`);
    }
  }
}

const checked = collectRoots();
if (checked.length === 0) {
  console.log('check-naming-conventions: No lib/ or packages/*/src found, skipping.');
  process.exit(0);
}

for (const entry of checked) checkRoot(entry.path, entry.kind);

if (violations.length > 0) {
  console.error('pre-push: FAIL — Naming convention violations detected:');
  for (const violation of violations) console.error(`  - ${violation}`);
  console.error(
    '\nPlease see docs/naming-conventions.md for the required {library}/{domainname} structure.'
  );
  process.exit(1);
}

console.log(
  `pre-push: OK — ${checked.map((c) => c.kind).join(', ')} adhere to the {library}/{domainname} convention.`
);
