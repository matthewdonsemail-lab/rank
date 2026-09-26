/** Capability registry types. */

export type SurfaceName = "cli" | "mcp" | "http";

export type HttpMethod = "GET" | "POST";

export interface CliSurface {
  command: string;
  /** Set when the surface is declared intent, not an implementation. */
  planned?: boolean;
  /** Why the surface is planned rather than implemented. Required when planned. */
  reason?: string;
}

export interface McpSurface {
  tool: string;
  /** Set when the surface is declared intent, not an implementation. */
  planned?: boolean;
  /** Why the surface is planned rather than implemented. Required when planned. */
  reason?: string;
}

export interface HttpSurface {
  route?: string;
  method?: HttpMethod;
  /** Set when the surface is declared intent, not an implementation. */
  planned?: boolean;
  /** Why the surface is planned rather than implemented. Required when planned. */
  reason?: string;
}

export interface CapabilitySurfaces {
  cli?: CliSurface;
  mcp?: McpSurface;
  http?: HttpSurface;
}

export interface Capability {
  /** Stable dotted identifier, used by docs and by the consistency check. */
  id: string;
  title: string;
  summary: string;
  /** Pipeline stage this capability belongs to. */
  stage: string;
  /** True when the capability changes state and must not be exposed unauthenticated. */
  mutating: boolean;
  /** Environment variables that must be present for the capability to work. */
  requiresEnv: string[];
  surfaces: CapabilitySurfaces;
}

export interface CapabilityRegistry {
  description: string;
  capabilities: Capability[];
}

/** A capability that is missing an expected surface. */
export interface SurfaceGap {
  capabilityId: string;
  surface: SurfaceName;
  reason: string;
}
