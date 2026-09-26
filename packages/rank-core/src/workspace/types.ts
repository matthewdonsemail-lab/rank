/** Local filesystem types for the workspace domain. */

export interface WorkspacePaths {
  /** Absolute repository root. */
  root: string;
  /** Absolute path to the environment manifest. */
  manifestPath: string;
  /** Absolute path to the capability registry. */
  capabilitiesPath: string;
  /** Absolute path to the dotenv file, which may not exist. */
  envFilePath: string;
  /** Absolute path to the dotenv template. */
  envExamplePath: string;
}

export interface LoadedWorkspace {
  paths: WorkspacePaths;
  /** Parsed environment manifest, as read from disk. */
  manifest: Record<string, unknown>;
  /** Parsed capability registry, as read from disk. */
  capabilities: Record<string, unknown>;
  /** Parsed .env.local contents, empty when the file is absent. */
  envFile: Record<string, string>;
  /** True when .env.local was present. */
  envFileExists: boolean;
}
