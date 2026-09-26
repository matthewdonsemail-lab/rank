/**
 * Local workspace access: the only module in the CLI that touches the
 * filesystem. Kept separate from the pure environment domain so resolution
 * stays unit-testable and so a reader can see every disk read in one file.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { CapabilityRegistry } from "../capabilities/types.ts";
import { findRepoRoot, parseEnvFile } from "../env/index.ts";
import type { EnvManifest } from "../env/types.ts";
import type { LoadedWorkspace, WorkspacePaths } from "./types.ts";

const HERE = dirname(fileURLToPath(import.meta.url));

export const MANIFEST_RELATIVE_PATH = "config/env-vars.json";
export const CAPABILITIES_RELATIVE_PATH = "config/capabilities.json";
export const ENV_FILE_NAME = ".env.local";
export const ENV_EXAMPLE_NAME = ".env.example";

/** Resolve the repository root from this module's own location. */
export function resolveRepoRoot(from: string = HERE): string {
  const root = findRepoRoot(from, {
    exists: (path) => existsSync(path),
    join,
    parentOf: (dir) => dirname(dir),
  });
  if (!root) {
    throw new Error(`Could not locate ${MANIFEST_RELATIVE_PATH} above ${from}. Run the tool inside the repository.`);
  }
  return root;
}

export function workspacePaths(root: string): WorkspacePaths {
  return {
    root,
    manifestPath: join(root, ...MANIFEST_RELATIVE_PATH.split("/")),
    capabilitiesPath: join(root, ...CAPABILITIES_RELATIVE_PATH.split("/")),
    envFilePath: join(root, ENV_FILE_NAME),
    envExamplePath: join(root, ENV_EXAMPLE_NAME),
  };
}

function readTextIfPresent(path: string): string | null {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

function readJson(path: string, label: string): Record<string, unknown> {
  const raw = readTextIfPresent(path);
  if (raw === null) throw new Error(`${label} not found at ${path}`);
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch (error) {
    throw new Error(`${label} at ${path} is not valid JSON: ${(error as Error).message}`);
  }
}

/**
 * Load the capability registry, the environment manifest, and the local env
 * file.
 *
 * A missing .env.local is not an error: the Convex deployment may hold every
 * value. A missing or malformed registry or manifest is, because nothing can be
 * verified or exposed consistently without them.
 */
export function loadWorkspace(root: string): LoadedWorkspace {
  const paths = workspacePaths(root);
  const manifest = readJson(paths.manifestPath, "Environment manifest");
  const capabilities = readJson(paths.capabilitiesPath, "Capability registry");
  const envFileRaw = readTextIfPresent(paths.envFilePath);
  return {
    paths,
    manifest,
    capabilities,
    envFile: envFileRaw === null ? {} : parseEnvFile(envFileRaw),
    envFileExists: envFileRaw !== null,
  };
}

/** Typed view of the loaded manifest and registry. */
export function asManifest(workspace: LoadedWorkspace): EnvManifest {
  return workspace.manifest as unknown as EnvManifest;
}

export function asRegistry(workspace: LoadedWorkspace): CapabilityRegistry {
  return workspace.capabilities as unknown as CapabilityRegistry;
}

/** Names present in .env.example but absent from .env.local, for doctor output. */
export function missingFromEnvExample(
  envExample: Record<string, string>,
  envFile: Record<string, string>,
): string[] {
  return Object.keys(envExample).filter((name) => !(name in envFile));
}

export { resolve };
