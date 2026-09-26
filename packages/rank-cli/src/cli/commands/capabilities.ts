/**
 * `rank capabilities` — list every capability and the CLI command, MCP tool,
 * and HTTP route that expose it. Rendered from the shared registry, so this
 * output cannot drift from the other surfaces.
 */
import { renderRegistry } from "../../../../rank-core/src/capabilities/index.ts";
import { asRegistry, loadWorkspace } from "../../../../rank-core/src/workspace/index.ts";
import type { Command } from "../types.ts";

export const capabilitiesCommand: Command = {
  name: "capabilities",
  summary: "List every capability and the CLI, MCP, and HTTP surfaces that expose it",
  run(context) {
    const workspace = loadWorkspace(context.root);
    context.out(renderRegistry(asRegistry(workspace)));
    return { code: 0 };
  },
};
