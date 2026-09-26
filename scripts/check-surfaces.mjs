// Pre-push gate: surface catalog consistency plus registry schema validation.
//
// config/capabilities.json catalogs every Rank capability. The CLI, the MCP
// server, and the Convex HTTP routes are implemented separately and checked
// against that catalog here, so this check fails when a surface drifts from it.
//
// This is a catalog check, not a parity proof. It verifies by source inspection
// that advertised names, routes, and environment references exist — it does not
// execute the surfaces or establish that they behave identically. Rule 8 below
// extends the same static inspection to registry shape (unique ids, required
// fields, requiresEnv membership, planned-surface reasons, unknown keys),
// mirroring validateRegistry in
// packages/rank-core/src/capabilities/helpers/validate.ts — still source
// inspection, not runtime proof.
//
// A surface marked `{ "planned": true, "reason": "..." }` declares intent
// without an implementation. Planned surfaces satisfy the must-declare rule and
// are skipped by the implementation-existence rules below, so deferring a
// surface is a recorded decision rather than a gate failure.
//
// Verifies:
// 1. Every capability declares a cli, mcp, and http surface (planned counts)
// 2. No two implemented surfaces share a CLI command, MCP tool, or HTTP route+method
// 3. Every advertised, implemented MCP tool has an implementation in packages/rank-mcp
// 4. Every advertised, implemented CLI command has an implementation in packages/rank-cli
// 5. Every advertised, implemented HTTP route exists in convex/http.ts
// 6. Every requiresEnv name exists in config/env-vars.json
// 7. Every variable in config/env-vars.json is declared in convex/convex.config.ts
//    or read by convex/auth.config.ts
// 8. Registry schema: unique capability ids; every entry has a non-empty
//    id/title/summary/stage and a requiresEnv array; every requiresEnv name is
//    in config/env-vars.json; every planned surface carries a non-empty reason;
//    no unknown top-level keys on the registry or on a capability entry
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const violations = [];

function readJson(relativePath) {
  const path = join(root, relativePath);
  if (!existsSync(path)) {
    violations.push(`${relativePath}: missing`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    violations.push(`${relativePath}: invalid JSON (${error.message})`);
    return null;
  }
}

const capabilities = readJson('config/capabilities.json');
const envVars = readJson('config/env-vars.json');

if (capabilities && envVars) {
  const list = capabilities.capabilities ?? [];
  const surfaces = ['cli', 'mcp', 'http'];

  // 1. Every capability declares every surface. A planned marker counts as a
  // declaration; it records deferred intent rather than a missing surface.
  for (const capability of list) {
    for (const surface of surfaces) {
      if (!capability.surfaces?.[surface]) {
        violations.push(`${capability.id}: declares no ${surface} surface`);
      }
    }
  }

  const isPlanned = (entry) => entry !== undefined && entry.planned === true;

  // 2. No duplicate keys within a surface. Planned surfaces have no command,
  // tool, or route yet, so there is nothing to collide.
  const seen = new Map();
  for (const capability of list) {
    const keys = {
      cli: isPlanned(capability.surfaces?.cli) ? undefined : capability.surfaces?.cli?.command,
      mcp: isPlanned(capability.surfaces?.mcp) ? undefined : capability.surfaces?.mcp?.tool,
      http: isPlanned(capability.surfaces?.http)
        ? undefined
        : capability.surfaces?.http?.method !== undefined && capability.surfaces?.http?.route !== undefined
          ? `${capability.surfaces.http.method} ${capability.surfaces.http.route}`
          : undefined,
    };
    for (const [surface, key] of Object.entries(keys)) {
      if (key === undefined) continue;
      const id = `${surface}:${key}`;
      if (seen.has(id)) {
        violations.push(`${capability.id}: ${surface} key "${key}" already used by ${seen.get(id)}`);
      } else {
        seen.set(id, capability.id);
      }
    }
  }

  // 3. Every advertised, implemented MCP tool is implemented.
  const mcpTools = readFileSync(join(root, 'packages/rank-mcp/src/mcp/tools.ts'), 'utf8');
  for (const capability of list) {
    const entry = capability.surfaces?.mcp;
    const tool = entry?.tool;
    if (tool && !isPlanned(entry) && !mcpTools.includes(`"${tool}"`)) {
      violations.push(`${capability.id}: MCP tool "${tool}" has no implementation in packages/rank-mcp/src/mcp/tools.ts`);
    }
  }

  // 4. Every advertised, implemented CLI command is implemented.
  const cliDir = join(root, 'packages/rank-cli/src/cli/commands');
  const cliSources = existsSync(cliDir)
    ? readFileSync(join(cliDir, 'doctor.ts'), 'utf8') +
      readFileSync(join(cliDir, 'env.ts'), 'utf8') +
      (existsSync(join(cliDir, 'capabilities.ts')) ? readFileSync(join(cliDir, 'capabilities.ts'), 'utf8') : '') +
      (existsSync(join(cliDir, 'evaluate.ts')) ? readFileSync(join(cliDir, 'evaluate.ts'), 'utf8') : '')
    : '';
  for (const capability of list) {
    const entry = capability.surfaces?.cli;
    const command = entry?.command;
    if (command && !isPlanned(entry) && !cliSources.includes(`name: "${command}"`)) {
      violations.push(`${capability.id}: CLI command "${command}" has no implementation in packages/rank-cli`);
    }
  }

  // 5. Every advertised, implemented HTTP route exists in convex/http.ts.
  const http = readFileSync(join(root, 'convex/http.ts'), 'utf8');
  for (const capability of list) {
    const entry = capability.surfaces?.http;
    const route = entry?.route;
    if (route && !isPlanned(entry) && !http.includes(route)) {
      violations.push(`${capability.id}: HTTP route "${route}" is not registered in convex/http.ts`);
    }
  }

  // 6. requiresEnv names must exist in the environment manifest.
  const envNames = new Set(envVars.vars.map((v) => v.name));
  for (const capability of list) {
    for (const name of capability.requiresEnv ?? []) {
      if (!envNames.has(name)) {
        violations.push(`${capability.id}: requiresEnv "${name}" is not in config/env-vars.json`);
      }
    }
  }

  // 7. Every manifest variable must be declared in the Convex app config or the
  //    auth config, otherwise it cannot be set on a deployment.
  const convexConfig = readFileSync(join(root, 'convex/convex.config.ts'), 'utf8');
  const authConfig = existsSync(join(root, 'convex/auth.config.ts'))
    ? readFileSync(join(root, 'convex/auth.config.ts'), 'utf8')
    : '';
  for (const spec of envVars.vars) {
    const declared = convexConfig.includes(`${spec.name}:`);
    const inAuth = authConfig.includes(spec.name);
    const localOnly = spec.scope === 'local';
    if (!declared && !inAuth && !localOnly) {
      violations.push(
        `config/env-vars.json: ${spec.name} (scope ${spec.scope}) is not declared in convex/convex.config.ts or read by convex/auth.config.ts`
      );
    }
  }

  // 8. Registry schema. Mirrors validateRegistry in
  //    packages/rank-core/src/capabilities/helpers/validate.ts: unique ids,
  //    required fields, requiresEnv membership, planned-surface reasons, and
  //    unknown top-level keys. requiresEnv membership overlaps rule 6 by
  //    design (rule 6 predates the validator); the pushIfNew guard keeps one
  //    report per violation. Still static validation, not runtime proof.
  const pushIfNew = (message) => {
    if (!violations.includes(message)) violations.push(message);
  };
  const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';
  for (const key of Object.keys(capabilities)) {
    if (key !== 'description' && key !== 'capabilities') {
      pushIfNew(`config/capabilities.json: unknown top-level key "${key}"`);
    }
  }
  if (!Array.isArray(list)) {
    pushIfNew('config/capabilities.json: capabilities must be an array');
  } else {
    const allowedCapabilityKeys = new Set([
      'id',
      'title',
      'summary',
      'stage',
      'mutating',
      'requiresEnv',
      'surfaces',
    ]);
    const seenIds = new Map();
    list.forEach((capability, index) => {
      const label =
        typeof capability === 'object' && capability !== null && isNonEmptyString(capability.id)
          ? capability.id
          : `#${index}`;
      if (typeof capability !== 'object' || capability === null || Array.isArray(capability)) {
        pushIfNew(`${label}: capability must be an object`);
        return;
      }
      for (const key of Object.keys(capability)) {
        if (!allowedCapabilityKeys.has(key)) {
          pushIfNew(`${label}: unknown top-level key "${key}"`);
        }
      }
      if (!isNonEmptyString(capability.id)) {
        pushIfNew(`${label}: missing or empty id`);
      } else {
        const id = capability.id.trim();
        if (seenIds.has(id)) {
          pushIfNew(`${label}: duplicate capability id "${id}"`);
        } else {
          seenIds.set(id, label);
        }
      }
      for (const field of ['title', 'summary', 'stage']) {
        if (!isNonEmptyString(capability[field])) {
          pushIfNew(`${label}: missing or empty ${field}`);
        }
      }
      if (!Array.isArray(capability.requiresEnv)) {
        pushIfNew(`${label}: missing or invalid requiresEnv array`);
      } else {
        for (const name of capability.requiresEnv) {
          if (typeof name !== 'string' || name.trim() === '') {
            pushIfNew(`${label}: requiresEnv entries must be non-empty strings`);
          } else if (!envNames.has(name)) {
            pushIfNew(`${label}: requiresEnv "${name}" is not in config/env-vars.json`);
          }
        }
      }
      const surfacesRecord =
        typeof capability.surfaces === 'object' && capability.surfaces !== null
          ? capability.surfaces
          : null;
      if (surfacesRecord) {
        for (const surface of surfaces) {
          const entry = surfacesRecord[surface];
          if (
            typeof entry === 'object' &&
            entry !== null &&
            entry.planned === true &&
            !isNonEmptyString(entry.reason)
          ) {
            pushIfNew(`${label}: ${surface} surface is planned without a non-empty reason`);
          }
        }
      }
    });
  }
}

if (violations.length > 0) {
  console.error('pre-push: FAIL — Surface consistency violations detected:');
  for (const violation of violations) console.error(`  - ${violation}`);
  console.error('\nconfig/capabilities.json is the source of truth. See docs/naming-conventions.md.');
  process.exit(1);
}

const count = capabilities?.capabilities?.length ?? 0;
console.log(`pre-push: OK — ${count} catalog entries match declared CLI, MCP, and HTTP names/routes.`);
