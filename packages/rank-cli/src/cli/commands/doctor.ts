/**
 * `rank doctor` — resolve every variable Rank reads and fail if a required one
 * is missing, so a pipeline run never dies halfway with a provider error.
 */
import { readDeploymentEnv } from "../../../../rank-core/src/convex/index.ts";
import { buildReport, exitCodeFor, renderReport, resolveEnv } from "../../../../rank-core/src/env/index.ts";
import type { EnvManifest } from "../../../../rank-core/src/env/types.ts";
import { asManifest, loadWorkspace } from "../../../../rank-core/src/workspace/index.ts";
import type { Command } from "../types.ts";

interface DoctorOptions {
  json: boolean;
  local: boolean;
}

export function parseDoctorOptions(argv: string[]): DoctorOptions {
  return { json: argv.includes("--json"), local: argv.includes("--local") };
}

/** Machine-readable form, for CI and for other commands to consume. */
export function renderJson(manifest: EnvManifest, report: ReturnType<typeof buildReport>, deploymentRead: boolean, envFile: string | null): string {
  return JSON.stringify(
    {
      ok: report.ok,
      envFile,
      deploymentEnvRead: deploymentRead,
      missingRequired: report.missingRequired.map((v) => v.spec.name),
      unsetOptionalWithoutFallback: report.unsetOptional
        .filter((v) => v.spec.fallback === null)
        .map((v) => v.spec.name),
      vars: report.vars.map((v) => ({
        name: v.spec.name,
        stage: v.spec.stage,
        required: v.spec.required,
        origin: v.origin,
        origins: v.origins,
        fallback: v.spec.fallback,
      })),
    },
    null,
    2,
  );
}

export const doctorCommand: Command = {
  name: "doctor",
  summary: "Check every environment variable Rank reads and fail if a required one is missing",
  run(context, argv) {
    const options = parseDoctorOptions(argv);
    const workspace = loadWorkspace(context.root);
    const manifest = asManifest(workspace);
    const deployment = readDeploymentEnv({ cwd: context.root, include: !options.local });

    const report = buildReport(
      resolveEnv(manifest, {
        process: context.processEnv,
        file: workspace.envFile,
        deployment: deployment.env ?? {},
      }),
      deployment.attempted && deployment.env === null,
    );

    if (options.json) {
      context.out(renderJson(manifest, report, deployment.env !== null, workspace.envFileExists ? workspace.paths.envFilePath : null));
      return { code: exitCodeFor(report) };
    }

    context.out(renderReport(manifest, report));
    const sources = [
      workspace.envFileExists ? workspace.paths.envFilePath : null,
      "the process environment",
      deployment.env !== null ? "the linked deployment" : null,
    ].filter((s): s is string => s !== null);
    if (sources.length > 0) context.out(`\nSources: ${sources.join(", ")}.`);
    return { code: exitCodeFor(report) };
  },
};
