/** Agent connector types.
 *
 * A connector is an agent client (Hermes, Claude, Codex, Muse) and the exact
 * way it reaches Rank. This is the client axis; `config/capabilities.json` is
 * the capability axis (what Rank can do). The two meet in
 * `ConnectorDefinition.capabilities`, which names capability ids the connector
 * can exercise — never the reverse.
 *
 * The registry in `./connectors.ts` is the single source of truth. The CLI
 * (`rank connectors`), the MCP server (`rank_list_connectors`), and the web
 * app (`/connectors`) all render this same data, so the three surfaces cannot
 * describe different connectors. `connectors.test.ts` enforces that every
 * referenced capability id exists in the catalog and every doc path exists on
 * disk.
 */

/** Agent clients Rank documents a connector for. */
export type ConnectorId = "hermes" | "claude" | "codex" | "muse";

/** How a connector reaches a Rank surface. */
export type ConnectorTransport = "stdio" | "http" | "cli" | "none";

/** One Rank surface as seen from a connector. */
export type ConnectorSurface =
  | { available: true; transport: ConnectorTransport; notes: string }
  | { available: false; reason: string };

/** The exact stdio invocation every MCP-capable connector shares. */
export interface ConnectorStdioSetup {
  /** Binary the host spawns. */
  command: string;
  /**
   * Arguments, with `<repo>` standing for the absolute path of this
   * repository checkout. The server resolves its own root, so the working
   * directory does not matter — but the path must be absolute because agent
   * hosts do not share our cwd.
   */
  args: string[];
  /**
   * Environment the host must provide. Values never live here; they come from
   * the process environment or from a prior `rank login`, which stores a
   * session in `.rank/`.
   */
  env: string[];
  /** Where the connector looks for prior auth. */
  authNote: string;
}

/** One agent client and its working route into Rank. */
export interface ConnectorDefinition {
  id: ConnectorId;
  name: string;
  vendor: string;
  description: string;
  /** `supported` means an agent can use Rank today; `needs-remote-api` means
   * it is blocked on the planned authenticated HTTP API. */
  status: "supported" | "needs-remote-api";
  surfaces: {
    cli: ConnectorSurface;
    mcp: ConnectorSurface;
    http: ConnectorSurface;
  };
  /** Capability ids from `config/capabilities.json` this connector can exercise. */
  capabilities: string[];
  /** How to launch the shared stdio server, when the connector supports MCP. */
  stdio?: ConnectorStdioSetup;
  /** Repo-relative path to the full setup guide. */
  docPath: string;
  /** Client-specific gotchas with sources, so agents stop rediscovering them. */
  limits: string[];
}

/** The registry. Order is display order. */
export interface ConnectorRegistry {
  connectors: ConnectorDefinition[];
}
