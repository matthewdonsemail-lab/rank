/**
 * The agent connector registry — the single source of truth for how Hermes,
 * Claude, Codex, and Muse reach Rank.
 *
 * Every entry is verified against reality, not aspiration:
 * - stdio MCP is the working route. `packages/rank-mcp/bin/rank-mcp.ts` speaks
 *   MCP over stdio (`packages/rank-mcp/src/mcp/server.ts`), resolves its own
 *   repo root, and reuses the operator's `.rank/` session from a prior
 *   `rank login` — it never mints identities.
 * - The CLI is the scriptable route (`rank evaluate --json`, `rank doctor`,
 *   `rank whoami`, `rank capabilities`).
 * - There is no MCP-over-HTTP server and no public REST API: `convex/http.ts`
 *   serves three read-only metadata routes plus provider webhooks, and
 *   `prospect.evaluate` over HTTP is explicitly deferred in
 *   `config/capabilities.json`. A connector whose model requires a reachable
 *   HTTPS API is therefore `needs-remote-api`, stated plainly with what would
 *   unblock it.
 */
import type { ConnectorDefinition, ConnectorId, ConnectorRegistry } from "./types.ts";

const STDIO_ARGS = ["<repo>/packages/rank-mcp/bin/rank-mcp.ts"];
const STDIO_ENV = ["CONVEX_URL", "RANK_AUTH_TOKEN"];
const STDIO_AUTH_NOTE =
  "Authenticate once with `rank login`; the server reuses the stored `.rank/` session. CONVEX_URL and RANK_AUTH_TOKEN in the host environment override it.";
const PROSPECT_CAPS = ["env.doctor", "env.describe", "capabilities.list", "prospect.evaluate"];

export const CONNECTORS: ConnectorDefinition[] = [
  {
    id: "claude",
    name: "Claude Code",
    vendor: "Anthropic",
    description:
      "Anthropic's terminal agent. Connects over MCP via `claude mcp add`, `.mcp.json`, or `claude mcp add-json`; stdio for this server.",
    status: "supported",
    surfaces: {
      cli: {
        available: true,
        transport: "cli",
        notes: "Run `bun <repo>/packages/rank-cli/bin/rank.ts <command>`; scriptable commands stay machine-readable with --json.",
      },
      mcp: {
        available: true,
        transport: "stdio",
        notes: "Advertised tools come from the capability registry; rank_evaluate_prospect returns text plus structuredContent.",
      },
      http: {
        available: false,
        reason: "No MCP-over-HTTP server exists; Claude's --transport http has nothing to point at.",
      },
    },
    capabilities: PROSPECT_CAPS,
    stdio: { command: "bun", args: STDIO_ARGS, env: STDIO_ENV, authNote: STDIO_AUTH_NOTE },
    docPath: "docs/agents/claude/README.md",
    limits: [
      "Default MAX_MCP_OUTPUT_TOKENS is 25,000; large evaluations can hit it — raise it or read structuredContent, which stays small.",
      "Scopes are local, project, or user (--scope); prefer project so the team shares the server entry.",
      "On Windows, wrap the spawn in `cmd /c` so the process terminates cleanly.",
    ],
  },
  {
    id: "codex",
    name: "Muse",
    vendor: "OpenAI",
    description:
      "OpenAI's terminal agent. Connects over MCP via the `[mcp_servers]` table in config.toml; stdio for this server.",
    status: "supported",
    surfaces: {
      cli: {
        available: true,
        transport: "cli",
        notes: "Same scriptable CLI as above; --json output is stable for agent parsing.",
      },
      mcp: {
        available: true,
        transport: "stdio",
        notes: "Declared under [mcp_servers.rank] with command/args/env; `codex mcp list` confirms it loaded.",
      },
      http: {
        available: false,
        reason: "No MCP-over-HTTP server exists; the url form has nothing to point at.",
      },
    },
    capabilities: PROSPECT_CAPS,
    stdio: { command: "bun", args: STDIO_ARGS, env: STDIO_ENV, authNote: STDIO_AUTH_NOTE },
    docPath: "docs/agents/codex/README.md",
    limits: [
      "The table is [mcp_servers] — the [mcp.servers.*] spelling is silently ignored (openai/codex#3441).",
      "Every stdio entry must declare command; there is no default binary.",
      "Advanced settings (timeouts, tool allowlists) need direct TOML edits; `codex mcp add` covers transport, env, and bearer tokens only.",
    ],
  },
  {
    id: "hermes",
    name: "Hermes Agent",
    vendor: "NousResearch",
    description:
      "NousResearch's terminal agent runtime. Connects over MCP via the `mcp_servers` block in config.yaml, with stdio and HTTP forms.",
    status: "supported",
    surfaces: {
      cli: {
        available: true,
        transport: "cli",
        notes: "Same scriptable CLI; Hermes can shell out to it or consume MCP tools — MCP is the cleaner route.",
      },
      mcp: {
        available: true,
        transport: "stdio",
        notes: "Declared under mcp_servers.rank; verify with `hermes mcp test rank`, reload with /reload-mcp.",
      },
      http: {
        available: false,
        reason: "No MCP-over-HTTP server exists; the url form has nothing to point at.",
      },
    },
    capabilities: PROSPECT_CAPS,
    stdio: { command: "bun", args: STDIO_ARGS, env: STDIO_ENV, authNote: STDIO_AUTH_NOTE },
    docPath: "docs/agents/hermes/README.md",
    limits: [
      "`hermes import-agent claude-code` migrates an existing Claude MCP block, skills, and instructions automatically.",
      "Start with one server and ask Hermes what tools it sees before adding more.",
    ],
  },
  {
    id: "muse",
    name: "Muse",
    vendor: "Meta",
    description:
      "Meta's consumer agent. Builds remote connectors from OpenAPI plus OAuth or API key — there is no local MCP/CLI consumption model and no SDK to install.",
    status: "needs-remote-api",
    surfaces: {
      cli: {
        available: false,
        reason: "Muse connectors run in Meta's cloud, not on the operator's machine; a local checkout is out of reach.",
      },
      mcp: {
        available: false,
        reason: "Muse has no local MCP client; it needs a reachable HTTPS endpoint, which does not exist yet.",
      },
      http: {
        available: false,
        reason: "Blocked on the planned authenticated HTTP API (prospect.evaluate over HTTP is deferred in the capability catalog).",
      },
    },
    capabilities: [],
    docPath: "docs/agents/muse/README.md",
    limits: [
      "Do not hand Muse the openapi-rank.yaml paths as callable — they are a design draft, labeled as such at the top of every file.",
      "Unblocks when prospect.evaluate gains an authenticated public route with auth, ownership, rate limits, and idempotency.",
    ],
  },
];

export const CONNECTOR_REGISTRY: ConnectorRegistry = { connectors: CONNECTORS };

export function connectorById(id: string): ConnectorDefinition | undefined {
  return CONNECTORS.find((connector) => connector.id === (id as ConnectorId));
}

function renderSurface(label: string, surface: ConnectorDefinition["surfaces"]["cli"]): string {
  if (!surface.available) return `  ${label}: unavailable — ${surface.reason}`;
  return `  ${label}: available (${surface.transport}) — ${surface.notes}`;
}

/**
 * The human-readable rendering every surface shares. CLI prints it,
 * the MCP tool returns it as `text` beside `structuredContent`, and the web
 * app renders the same fields as components — all three read this registry,
 * so no surface can describe a different connector.
 */
export function renderConnector(connector: ConnectorDefinition): string {
  const lines = [
    `${connector.id} — ${connector.name} (${connector.vendor}) [${connector.status}]`,
    `  ${connector.description}`,
    renderSurface("cli", connector.surfaces.cli),
    renderSurface("mcp", connector.surfaces.mcp),
    renderSurface("http", connector.surfaces.http),
    `  capabilities: ${connector.capabilities.length > 0 ? connector.capabilities.join(", ") : "none yet"}`,
    `  guide: ${connector.docPath}`,
  ];
  for (const limit of connector.limits) {
    lines.push(`  limit: ${limit}`);
  }
  return lines.join("\n");
}

/** Every connector, in registry order. */
export function renderConnectors(connectors: ConnectorDefinition[] = CONNECTORS): string {
  return connectors.map(renderConnector).join("\n\n");
}
