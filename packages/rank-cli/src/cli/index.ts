export { COMMANDS, createContext, runCli } from "./cli.ts";
export { capabilitiesCommand } from "./commands/capabilities.ts";
export { doctorCommand, parseDoctorOptions, renderJson } from "./commands/doctor.ts";
export { envCommand } from "./commands/env.ts";
export {
  evaluateCommand,
  evaluateDeps,
  exitCodeForEvaluateError,
  parseEvaluateArgs,
  renderEvaluateHuman,
  renderEvaluateJson,
  runEvaluate,
} from "./commands/evaluate.ts";
export { installCommand, runProbes, type ProbeResult } from "./commands/install.ts";
export { launchCommand, launchDeps, parseLaunchArgs, runLaunch, shouldPrompt } from "./commands/launch.ts";
export { renderUsage } from "./helpers/usage.ts";
export type { Command, CommandContext, CommandName } from "./types.ts";
