export {
  ALL_SURFACES,
  byCliCommand,
  byMcpTool,
  bySurface,
  findCapability,
  findGaps,
  renderRegistry,
  requiredEnv,
} from "./capabilities.ts";
export { validateRegistry, type EnvManifestLike } from "./helpers/index.ts";
export type {
  Capability,
  CapabilityRegistry,
  CapabilitySurfaces,
  CliSurface,
  HttpMethod,
  HttpSurface,
  McpSurface,
  RegistryViolation,
  SurfaceGap,
  SurfaceName,
} from "./types.ts";
