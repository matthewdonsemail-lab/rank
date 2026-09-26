/** Usage text, generated from the command registry so it cannot drift. */
import type { Command } from "../types.ts";

const NOTES = [
  "Values resolve from the process environment, then .env.local, then the linked Convex deployment.",
  "Secrets are always masked in output.",
];

export function renderUsage(commands: Command[], binary = "rank"): string {
  const lines: string[] = [`${binary} — drive Rank from the command line`, "", "Usage"];
  for (const command of commands) {
    const args = command.args ? ` ${command.args}` : "";
    lines.push(`  ${binary} ${command.name}${args}`.padEnd(38) + command.summary);
  }
  lines.push("", "Notes");
  for (const note of NOTES) lines.push(`  - ${note}`);
  return lines.join("\n");
}
