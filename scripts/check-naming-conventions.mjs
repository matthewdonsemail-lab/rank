// Pre-push gate: architecture rule — enforces lib/{library}/{domainname}/helpers convention.
// Verifies:
// 1. All directories under lib/ match lib/[library]/[domainname]
// 2. Both [library] and [domainname] use lowercase kebab-case (^[a-z0-9-]+$)
// 3. Every domain has an index.ts file
// 4. Any helpers/ directory contains an index.ts barrel
// 5. No helper files import from the parent domain barrel (../index)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const libDir = join(root, 'lib');

if (!existsSync(libDir)) {
  console.log('check-naming-conventions: No lib/ directory found, skipping.');
  process.exit(0);
}

const KEBAB_REGEX = /^[a-z0-9-]+$/;
const violations = [];

const libraries = readdirSync(libDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

for (const library of libraries) {
  if (!KEBAB_REGEX.test(library)) {
    violations.push(
      `lib/${library}: Library name must be lowercase kebab-case (got "${library}").`
    );
    continue;
  }

  const libraryPath = join(libDir, library);
  const directIndexPath = join(libraryPath, 'index.ts');

  // Case A: Standalone domain package directly under lib/ (e.g. lib/brand)
  if (existsSync(directIndexPath)) {
    const helpersPath = join(libraryPath, 'helpers');
    if (existsSync(helpersPath) && statSync(helpersPath).isDirectory()) {
      const helperIndexPath = join(helpersPath, 'index.ts');
      if (!existsSync(helperIndexPath)) {
        violations.push(
          `lib/${library}/helpers: Missing required barrel "helpers/index.ts".`
        );
      }

      const helperFiles = readdirSync(helpersPath).filter((f) => f.endsWith('.ts'));
      for (const hFile of helperFiles) {
        const fullHelperPath = join(helpersPath, hFile);
        const content = readFileSync(fullHelperPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, lineNum) => {
          if (
            (line.includes("from '../index") || line.includes('from "../index')) &&
            !line.trim().startsWith('//')
          ) {
            violations.push(
              `lib/${library}/helpers/${hFile}:${lineNum + 1}: Prohibited circular import from parent index barrel.`
            );
          }
        });
      }
    }
    continue;
  }

  // Case B: Multi-domain library containing domain subdirectories (e.g. lib/convex/agent)
  const domains = readdirSync(libraryPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  if (domains.length === 0) {
    violations.push(
      `lib/${library}: Library directory must contain at least one domain subdirectory or an entrypoint "index.ts".`
    );
    continue;
  }

  for (const domain of domains) {
    if (!KEBAB_REGEX.test(domain)) {
      violations.push(
        `lib/${library}/${domain}: Domain name must be lowercase kebab-case (got "${domain}").`
      );
      continue;
    }

    const domainPath = join(libraryPath, domain);
    const domainIndexPath = join(domainPath, 'index.ts');

    if (!existsSync(domainIndexPath)) {
      violations.push(
        `lib/${library}/${domain}: Missing required entrypoint "index.ts".`
      );
    }

    // Check helpers directory if present
    const helpersPath = join(domainPath, 'helpers');
    if (existsSync(helpersPath) && statSync(helpersPath).isDirectory()) {
      const helperIndexPath = join(helpersPath, 'index.ts');
      if (!existsSync(helperIndexPath)) {
        violations.push(
          `lib/${library}/${domain}/helpers: Missing required barrel "helpers/index.ts".`
        );
      }

      // Scan helper files for circular import to ../index
      const helperFiles = readdirSync(helpersPath).filter((f) => f.endsWith('.ts'));
      for (const hFile of helperFiles) {
        const fullHelperPath = join(helpersPath, hFile);
        const content = readFileSync(fullHelperPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, lineNum) => {
          if (
            (line.includes("from '../index") || line.includes('from "../index')) &&
            !line.trim().startsWith('//')
          ) {
            violations.push(
              `lib/${library}/${domain}/helpers/${hFile}:${lineNum + 1}: Prohibited circular import from parent index barrel.`
            );
          }
        });
      }
    }
  }
}

if (violations.length > 0) {
  console.error('pre-push: FAIL — Naming convention violations detected:');
  for (const v of violations) {
    console.error(`  - ${v}`);
  }
  console.error(
    '\nPlease see docs/naming-conventions.md for the required lib/{library}/{domainname} structure.'
  );
  process.exit(1);
}

console.log('pre-push: OK — All lib/ modules adhere to lib/{library}/{domainname} conventions.');
