import { describe, expect, test } from "bun:test";
import { buildReport, resolveEnv } from "./env.ts";
import { renderManifest, renderReport } from "./helpers/report.ts";
import type { EnvManifest } from "./types.ts";

const manifest: EnvManifest = {
  description: "test manifest",
  vars: [
    {
      name: "REQUIRED_TOKEN",
      secret: true,
      required: true,
      scope: "app",
      stage: "judgment",
      consumedBy: ["lib/typesafe/evaluator/evaluator.ts"],
      fallback: null,
      purpose: "needed to reach the judgment stage",
    },
    {
      name: "OPTIONAL_WITH_FALLBACK",
      secret: false,
      required: false,
      scope: "app",
      stage: "judgment",
      consumedBy: ["lib/typesafe/evaluator/evaluator.ts"],
      fallback: "https://api.typesafe.ai",
      purpose: "has a documented fallback",
    },
    {
      name: "OPTIONAL_NO_FALLBACK",
      secret: true,
      required: false,
      scope: "app",
      stage: "rerank",
      consumedBy: ["lib/nebius/rerank/client.ts"],
      forwardedTo: "some-component",
      fallback: null,
      purpose: "the stage fails closed without it",
    },
    {
      name: "LOCAL_ONLY",
      secret: false,
      required: false,
      scope: "local",
      stage: "local tooling",
      consumedBy: ["mock/server.ts"],
      fallback: "mock default",
      purpose: "never read from the deployment",
    },
  ],
};

describe("resolveEnv", () => {
  test("ranks process above the env file above the deployment", () => {
    const [first] = resolveEnv(manifest, {
      process: { REQUIRED_TOKEN: "from-process" },
      file: { REQUIRED_TOKEN: "from-file" },
      deployment: { REQUIRED_TOKEN: "from-deployment" },
    });
    expect(first.value).toBe("from-process");
    expect(first.origins).toEqual(["process", "env-file", "deployment"]);
  });

  test("counts a value set only on the deployment as present", () => {
    const [first] = resolveEnv(manifest, { deployment: { REQUIRED_TOKEN: "on-deployment" } });
    expect(first.value).toBe("on-deployment");
    expect(first.origin).toBe("deployment");
  });

  test("ignores the deployment for local-scope variables", () => {
    const resolved = resolveEnv(manifest, { deployment: { LOCAL_ONLY: "9999" } });
    const local = resolved.find((v) => v.spec.name === "LOCAL_ONLY");
    expect(local?.origin).toBe("unset");
  });

  test("treats whitespace-only values as unset", () => {
    const [first] = resolveEnv(manifest, { process: { REQUIRED_TOKEN: "   " } });
    expect(first.origin).toBe("unset");
    expect(first.origins).toEqual(["unset"]);
  });
});

describe("buildReport", () => {
  test("fails when a required variable is missing everywhere", () => {
    const report = buildReport(resolveEnv(manifest));
    expect(report.ok).toBe(false);
    expect(report.missingRequired.map((v) => v.spec.name)).toEqual(["REQUIRED_TOKEN"]);
  });

  test("passes when a required variable is only on the deployment", () => {
    const report = buildReport(resolveEnv(manifest, { deployment: { REQUIRED_TOKEN: "on-deployment" } }));
    expect(report.ok).toBe(true);
  });

  test("surfaces an unreachable deployment without failing the run", () => {
    const report = buildReport(resolveEnv(manifest, { process: { REQUIRED_TOKEN: "x" } }), true);
    expect(report.ok).toBe(true);
    expect(report.deploymentUnavailable).toBe(true);
  });

  test("separates optional-with-fallback from optional-without", () => {
    const report = buildReport(resolveEnv(manifest, { process: { REQUIRED_TOKEN: "x" } }));
    expect(report.satisfiedByFallback.map((v) => v.spec.name)).toEqual(["OPTIONAL_WITH_FALLBACK", "LOCAL_ONLY"]);
    expect(report.unsetOptional.filter((v) => v.spec.fallback === null).map((v) => v.spec.name)).toEqual([
      "OPTIONAL_NO_FALLBACK",
    ]);
  });
});

describe("renderReport", () => {
  test("marks a missing required variable as FAIL and explains it", () => {
    const output = renderReport(manifest, buildReport(resolveEnv(manifest)));
    expect(output).toContain("[FAIL]");
    expect(output).toContain("Required variables are missing:");
    expect(output).toContain("Preflight failed");
  });

  test("shows a fallback verbatim instead of masking the unset marker", () => {
    const output = renderReport(manifest, buildReport(resolveEnv(manifest, { process: { REQUIRED_TOKEN: "x" } })));
    expect(output).toContain("https://api.typesafe.ai");
    expect(output).not.toContain("*******");
    expect(output).toContain("forwarded to the some-component component");
  });

  test("never prints a secret value", () => {
    const secret = "supersecretvalue";
    const output = renderReport(manifest, buildReport(resolveEnv(manifest, { process: { REQUIRED_TOKEN: secret } })));
    expect(output).not.toContain(secret);
  });

  test("notes when the deployment could not be read", () => {
    const output = renderReport(manifest, buildReport(resolveEnv(manifest, { process: { REQUIRED_TOKEN: "x" } }), true));
    expect(output).toContain("deployment variables could not be read");
  });

  test("passes when nothing required is missing", () => {
    const output = renderReport(manifest, buildReport(resolveEnv(manifest, { process: { REQUIRED_TOKEN: "x" } })));
    expect(output).toContain("Preflight passed");
  });
});

describe("renderManifest", () => {
  test("documents each variable without printing values", () => {
    const output = renderManifest(manifest);
    expect(output).toContain("REQUIRED_TOKEN (required) — judgment");
    expect(output).toContain("read by: lib/typesafe/evaluator/evaluator.ts");
    expect(output).toContain("fallback: none, the stage fails closed");
    expect(output).toContain("forwarded to the some-component component");
  });
});
