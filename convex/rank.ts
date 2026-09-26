import { v } from "convex/values";
import envVars from "../config/env-vars.json" with { type: "json" };
import { internalQuery } from "./_generated/server.js";

/**
 * Configuration read model for the HTTP surface.
 *
 * Convex HTTP actions cannot read `process.env`, so reporting on configuration
 * has to run as a query that the route calls. Only variable names and presence
 * are returned, never values.
 */

type EnvVarSpec = {
  name: string;
  required: boolean;
  scope: string;
};

const manifest = envVars as unknown as { vars: EnvVarSpec[] };

function isPresent(name: string): boolean {
  const value = process.env[name];
  return value !== undefined && value.trim() !== "";
}

/**
 * Which non-local variables are present on this deployment.
 *
 * `local` scope variables are skipped because the deployment never provides
 * them; they exist for scripts running on a developer machine.
 */
export const envStatus = internalQuery({
  args: {},
  returns: v.object({
    total: v.number(),
    present: v.array(v.string()),
    missing: v.array(v.string()),
    missingRequired: v.array(v.string()),
  }),
  handler: () => {
    const present: string[] = [];
    const missing: string[] = [];
    const missingRequired: string[] = [];

    for (const spec of manifest.vars) {
      if (spec.scope === "local") continue;
      if (isPresent(spec.name)) present.push(spec.name);
      else {
        missing.push(spec.name);
        if (spec.required) missingRequired.push(spec.name);
      }
    }

    return { total: manifest.vars.length, present, missing, missingRequired };
  },
});
