/** Command surface types. */

import type { CommandResult } from "../../../rank-core/src/env/types.ts";

export interface CommandContext {
  /** Repository root, resolved once by the caller. */
  root: string;
  /** Process environment, injectable for tests. */
  processEnv: Record<string, string | undefined>;
  /** Writes to stdout. Injected so commands stay testable. */
  out: (line: string) => void;
  /** Writes to stderr. */
  err: (line: string) => void;
}

export interface Command {
  name: string;
  summary: string;
  /** Positional argument names, for usage output. */
  args?: string;
  run(context: CommandContext, argv: string[]): Promise<CommandResult> | CommandResult;
}

export type CommandName = "doctor" | "env" | "help";
