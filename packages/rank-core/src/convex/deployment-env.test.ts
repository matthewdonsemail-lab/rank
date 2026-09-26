import { describe, expect, test } from "bun:test";
import { readDeploymentEnv } from "./deployment-env.ts";
import type { DeploymentEnvOptions } from "./deployment-env.ts";

/** Fake spawnSync returning a fixed result. */
function runner(result: Partial<{ stdout: string; stderr: string; status: number; error: Error }>) {
  return (() => result) as unknown as DeploymentEnvOptions["runner"];
}

const base: Omit<DeploymentEnvOptions, "runner"> = { cwd: "/repo", include: true };

describe("readDeploymentEnv", () => {
  test("parses NAME=value lines from the CLI output", () => {
    const result = readDeploymentEnv({
      ...base,
      runner: runner({ status: 0, stdout: "CLERK_JWT_AUDIENCE=convex\nNEBIUS_API_KEY=abc\nPORT=3000\n" }),
    });
    expect(result.attempted).toBe(true);
    expect(result.env).toEqual({ CLERK_JWT_AUDIENCE: "convex", NEBIUS_API_KEY: "abc", PORT: "3000" });
  });

  test("skips the lookup when include is false", () => {
    const result = readDeploymentEnv({ ...base, include: false });
    expect(result.attempted).toBe(false);
    expect(result.env).toEqual({});
  });

  test("returns a null env and an error when the CLI is missing", () => {
    const result = readDeploymentEnv({ ...base, runner: runner({ error: new Error("spawn convex ENOENT") }) });
    expect(result.env).toBeNull();
    expect(result.error).toContain("ENOENT");
  });

  test("returns a null env and the first stderr line on a non-zero exit", () => {
    const result = readDeploymentEnv({
      ...base,
      runner: runner({ status: 1, stdout: "", stderr: "Not logged in\nmore detail\n" }),
    });
    expect(result.env).toBeNull();
    expect(result.error).toContain("exited 1");
    expect(result.error).toContain("Not logged in");
    expect(result.error).not.toContain("more detail");
  });

  test("treats an empty successful listing as an empty environment", () => {
    const result = readDeploymentEnv({ ...base, runner: runner({ status: 0, stdout: "" }) });
    expect(result.env).toEqual({});
  });
});
