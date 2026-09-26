/**
 * `rank env` — describe the variables Rank reads, who consumes each one, and
 * what breaks without it. Answers "why does this variable exist" without
 * printing any value.
 */
import { renderManifest } from "../../../../rank-core/src/env/index.ts";
import { asManifest, loadWorkspace } from "../../../../rank-core/src/workspace/index.ts";
import type { Command } from "../types.ts";

export const envCommand: Command = {
  name: "env",
  summary: "List the variables Rank reads, where each is consumed, and what breaks without it",
  run(context) {
    const workspace = loadWorkspace(context.root);
    context.out(renderManifest(asManifest(workspace)));
    return { code: 0 };
  },
};
