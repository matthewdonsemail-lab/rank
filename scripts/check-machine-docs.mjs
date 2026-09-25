import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MACHINE_ROOT = path.join(ROOT_DIR, "lib", "xstate");
const MANIFEST_PATH = path.join(ROOT_DIR, "docs", "xstate", "machine-manifest.json");
const MACHINES_DOC_PATH = path.join(ROOT_DIR, "docs", "xstate", "machines.md");
const DIAGRAM_PATH = path.join(ROOT_DIR, "docs", "diagrams", "machine-pipeline.mmd");
const INVENTORY_START = "<!-- machine-inventory:start -->";
const INVENTORY_END = "<!-- machine-inventory:end -->";
const MACHINE_ORDER = ["enrichment", "competitor-discovery", "prospect-evaluation"];

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(entryPath));
    else files.push(entryPath);
  }
  return files;
}

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
  return undefined;
}

function objectProperty(objectLiteral, name) {
  return objectLiteral.properties.find((property) =>
    ts.isPropertyAssignment(property) && propertyName(property.name) === name
  );
}

function objectKeys(objectLiteral) {
  return objectLiteral.properties
    .filter(ts.isPropertyAssignment)
    .map((property) => propertyName(property.name))
    .filter((name) => name !== undefined);
}

function stringProperty(objectLiteral, name) {
  const property = objectLiteral && objectProperty(objectLiteral, name);
  return property && ts.isPropertyAssignment(property) && ts.isStringLiteral(property.initializer)
    ? property.initializer.text
    : undefined;
}

function machineConfig(initializer) {
  if (!ts.isCallExpression(initializer)) return undefined;
  if (!ts.isPropertyAccessExpression(initializer.expression)) return undefined;
  if (initializer.expression.name.text !== "createMachine") return undefined;
  const argument = initializer.arguments[0];
  return argument && ts.isObjectLiteralExpression(argument) ? argument : undefined;
}

function extractEvents(sourceFile) {
  const events = new Set();
  function visit(node) {
    if (ts.isPropertyAssignment(node) && propertyName(node.name) === "events" && ts.isObjectLiteralExpression(node.initializer)) {
      for (const key of objectKeys(node.initializer)) if (key) events.add(key);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return [...events].sort();
}

function extractMachines() {
  return walk(MACHINE_ROOT)
    .filter((filePath) => path.basename(filePath) === "machine.ts")
    .map((filePath) => {
      const source = fs.readFileSync(filePath, "utf-8");
      const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
      const machines = [];
      function visit(node) {
        if (ts.isVariableDeclaration(node) && node.initializer) {
          const statement = node.parent?.parent;
          const exported = ts.isVariableStatement(statement) && statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
          const config = machineConfig(node.initializer);
          if (exported && config && ts.isIdentifier(node.name)) {
            const statesProperty = objectProperty(config, "states");
            const states = statesProperty && ts.isPropertyAssignment(statesProperty) && ts.isObjectLiteralExpression(statesProperty.initializer)
              ? objectKeys(statesProperty.initializer)
              : [];
            const id = stringProperty(config, "id");
            const version = stringProperty(config, "version");
            if (id && version) {
              const relativeSource = path.relative(ROOT_DIR, filePath).replaceAll("\\", "/");
              const domain = path.basename(path.dirname(filePath));
              const testPath = path.join(path.dirname(filePath), "machine.test.ts");
              machines.push({
                source: relativeSource,
                test: fs.existsSync(testPath) ? path.relative(ROOT_DIR, testPath).replaceAll("\\", "/") : null,
                name: node.name.text,
                id,
                version,
                states,
                events: extractEvents(sourceFile),
                order: MACHINE_ORDER.indexOf(domain) >= 0 ? MACHINE_ORDER.indexOf(domain) : MACHINE_ORDER.length,
              });
            }
          }
        }
        ts.forEachChild(node, visit);
      }
      visit(sourceFile);
      return machines;
    })
    .flat()
    .sort((left, right) => left.order - right.order || left.source.localeCompare(right.source));
}

function renderManifest(machines) {
  return `${JSON.stringify({ version: 1, machines }, null, 2)}\n`;
}

function renderInventory(machines) {
  const rows = machines.map((machine) => {
    const states = machine.states.join(" → ");
    const events = machine.events.join(", ");
    return `| [\`${machine.source}\`](../../${machine.source}) | \`${machine.name}\` | \`${machine.id}\` | \`${machine.version}\` | ${states} | ${events} | ${machine.test ? `[\`${machine.test}\`](../../${machine.test})` : "missing"} |`;
  });
  return [
    "| Source | Machine | ID | Version | States | Events | Test |",
    "|---|---|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

function renderDiagram(machines) {
  const lines = [
    "flowchart LR",
    `  NOTE["Generated from lib/xstate/*/machine.ts<br/>XState v6 runtime<br/>machine contract version ${machines[0]?.version ?? "1"}"]`,
  ];
  machines.forEach((machine, index) => {
    const id = `M${index + 1}`;
    lines.push(`  ${id}["${machine.name}<br/>${machine.id}<br/>${machine.states.join(" → ")}"]`);
    if (index > 0) lines.push(`  M${index} --> ${id}`);
  });
  if (machines.length > 0) lines.push(`  NOTE -.-> M1`);
  return `${lines.join("\n")}\n`;
}

function replaceInventory(document, machines) {
  const start = document.indexOf(INVENTORY_START);
  const end = document.indexOf(INVENTORY_END);
  if (start < 0 || end < 0 || end < start) throw new Error("docs/xstate/machines.md is missing machine inventory markers");
  return `${document.slice(0, start + INVENTORY_START.length)}\n${renderInventory(machines)}\n${document.slice(end)}`;
}

function discoverMachines() {
  return extractMachines();
}

function writeGenerated(machines) {
  fs.writeFileSync(MANIFEST_PATH, renderManifest(machines), "utf-8");
  const document = fs.readFileSync(MACHINES_DOC_PATH, "utf-8");
  fs.writeFileSync(MACHINES_DOC_PATH, replaceInventory(document, machines), "utf-8");
  fs.writeFileSync(DIAGRAM_PATH, renderDiagram(machines), "utf-8");
}

function check(machines) {
  const expectedManifest = renderManifest(machines);
  const actualManifest = fs.existsSync(MANIFEST_PATH) ? fs.readFileSync(MANIFEST_PATH, "utf-8") : "";
  if (actualManifest !== expectedManifest) throw new Error("Machine manifest is stale; run node scripts/check-machine-docs.mjs --write");

  const document = fs.readFileSync(MACHINES_DOC_PATH, "utf-8");
  const start = document.indexOf(INVENTORY_START);
  const end = document.indexOf(INVENTORY_END);
  if (start < 0 || end < 0) throw new Error("Machine inventory markers are missing");
  const inventory = document.slice(start + INVENTORY_START.length, end).trim();
  if (inventory !== renderInventory(machines)) throw new Error("Machine inventory is stale; run node scripts/check-machine-docs.mjs --write");

  const diagram = fs.readFileSync(DIAGRAM_PATH, "utf-8");
  if (diagram !== renderDiagram(machines)) throw new Error("Machine diagram is stale; run node scripts/check-machine-docs.mjs --write");

  for (const machine of machines) {
    if (!machine.test || !fs.existsSync(path.join(ROOT_DIR, machine.test))) throw new Error(`${machine.name} has no machine.test.ts`);
    const readmePath = path.join(ROOT_DIR, path.dirname(machine.source), "README.md");
    if (!fs.existsSync(readmePath)) throw new Error(`${machine.name} has no domain README.md`);
    const readme = fs.readFileSync(readmePath, "utf-8");
    if (!readme.includes(machine.name) || !readme.includes("XState v6")) {
      throw new Error(`${path.relative(ROOT_DIR, readmePath)} does not document the v6 machine contract`);
    }
    if (machine.states.length === 0) throw new Error(`${machine.name} has no states`);
    if (machine.events.length === 0) throw new Error(`${machine.name} has no events`);
    const source = fs.readFileSync(path.join(ROOT_DIR, machine.source), "utf-8");
    if (source.includes("assign(")) throw new Error(`${machine.source} still uses removed XState v5 assign()`);
    if (/types\s*:\s*\{\s*\}\s+as/.test(source)) throw new Error(`${machine.source} still uses the XState v5 types shim`);
  }

  const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf-8"));
  if (!String(packageJson.dependencies?.xstate ?? "").startsWith("6.")) throw new Error("package.json must depend on XState v6");
}

const machines = discoverMachines();
if (machines.length === 0) throw new Error("No XState machines found under lib/xstate");
if (process.argv.includes("--write")) {
  writeGenerated(machines);
  console.log(`Wrote machine manifest, inventory, and diagram for ${machines.length} machines.`);
} else {
  check(machines);
  console.log(`Machine documentation is synchronized for ${machines.length} machines.`);
}
