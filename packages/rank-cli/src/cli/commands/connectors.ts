/**
 * `rank connectors` — list every agent connector and how it reaches Rank.
 *
 * Rendered from the shared connectors registry in rank-core, so this output
 * cannot drift from the MCP server or the web app: all three read the same
 * `CONNECTORS` data. `rank connectors <id>` shows one connector's full setup;
 * `--json` emits the registry for agent parsing.
 */
import {
  CONNECTOR_REGISTRY,
  connectorById,
  renderConnector,
  renderConnectors,
} from "../../../../rank-core/src/connectors/index.ts";
import type { Command } from "../types.ts";

export const CONNECTORS_USAGE = "Usage: rank connectors [id] [--json]";

export const connectorsCommand: Command = {
  name: "connectors",
  summary: "List agent connectors (Hermes, Claude, Codex, Muse) and how each reaches Rank",
  args: "[id]",
  run(context, argv) {
    const json = argv.includes("--json");
    const [id] = argv.filter((arg) => !arg.startsWith("--"));
    if (id !== undefined) {
      const connector = connectorById(id);
      if (!connector) {
        const known = CONNECTOR_REGISTRY.connectors.map((c) => c.id).join(", ");
        return { code: 1, stderr: `rank connectors: unknown connector "${id}". Known: ${known}\n${CONNECTORS_USAGE}` };
      }
      if (json) {
        context.out(JSON.stringify(connector, null, 2));
      } else {
        context.out(renderConnector(connector));
      }
      return { code: 0 };
    }
    if (json) {
      context.out(JSON.stringify(CONNECTOR_REGISTRY, null, 2));
      return { code: 0 };
    }
    context.out(renderConnectors());
    return { code: 0 };
  },
};
