/**
 * Command registry and dispatcher.
 *
 * Commands are declared once here; usage text is generated from the same list,
 * so a new command cannot ship without documentation.
 */
import { resolveRepoRoot } from "../../../rank-core/src/workspace/index.ts";
import { capabilitiesCommand } from "./commands/capabilities.ts";
import { doctorCommand } from "./commands/doctor.ts";
import { envCommand } from "./commands/env.ts";
import { evaluateCommand } from "./commands/evaluate.ts";
import { installCommand } from "./commands/install.ts";
import { launchCommand } from "./commands/launch.ts";
import { loginCommand, logoutCommand, whoamiCommand } from "./commands/login.ts";
import { renderUsage } from "./helpers/usage.ts";
import type { Command, CommandContext } from "./types.ts";

export const COMMANDS: Command[] = [
  launchCommand,
  installCommand,
  loginCommand,
  logoutCommand,
  whoamiCommand,
  doctorCommand,
  envCommand,
  capabilitiesCommand,
  evaluateCommand,
];

const ALIASES: Record<string, string> = {
  "--help": "help",
  "-h": "help",
  help: "help",
};

export function createContext(overrides: Partial<CommandContext> = {}): CommandContext {
  return {
    root: overrides.root ?? resolveRepoRoot(),
    processEnv: overrides.processEnv ?? process.env,
    out: overrides.out ?? ((line) => console.log(line)),
    err: overrides.err ?? ((line) => console.error(line)),
  };
}

/**
 * Run one CLI invocation and return its exit code.
 *
 * Never throws for an unknown command: it reports and returns a non-zero code
 * so the binary can stay a thin wrapper.
 */
export async function runCli(argv: string[], context?: Partial<CommandContext>): Promise<number> {
  const ctx = createContext(context);
  const [first, ...rest] = argv;
  const requested = first === undefined ? "help" : (ALIASES[first] ?? first);
  const command = COMMANDS.find((c) => c.name === requested);

  if (!command) {
    const helpCommand: Command = {
      name: "help",
      summary: "Show this message",
      run: (c) => {
        c.out(renderUsage(COMMANDS));
        return { code: 0 };
      },
    };
    if (requested === "help") return (await helpCommand.run(ctx, rest)).code;
    ctx.err(`Unknown command: ${first}\n`);
    ctx.err(renderUsage(COMMANDS));
    return 2;
  }

  const result = await command.run(ctx, rest);
  if (result.stdout) ctx.out(result.stdout);
  if (result.stderr) ctx.err(result.stderr);
  return result.code;
}
