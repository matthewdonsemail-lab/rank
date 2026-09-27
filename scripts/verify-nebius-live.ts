/**
 * One-command live verification of the Nebius reranker.
 *
 * Usage (key comes from the environment only — never a file, never printed):
 *
 *   NEBIUS_API_KEY=<key> bun scripts/verify-nebius-live.ts
 *
 * Ranks three tiny static candidates with the REAL NebiusRerankClient from
 * lib/nebius/rerank (no mocks, no fixtures) and prints exactly what the
 * ranking slice needs recorded: the model that answered, per-candidate
 * scores in ranked order, wall-clock latency, and token usage. Exits non-zero
 * with the client's plain-language error when Nebius refuses or is
 * unreachable. Nothing is persisted and no other service is touched: three
 * short strings in, one rerank call out, so the cost is a single minimal
 * request.
 */
import { NebiusRerankClient } from "../lib/nebius/rerank/index.ts";

const QUERY = "Websites that would genuinely link to ListeningKit. It offers: social listening.";
const CANDIDATES = [
  "Social Media Examiner (socialmediaexaminer.com). Social media marketing guides and industry reports.",
  "Example plumbing supplies (example-plumbing.com). Pipes, fittings and local delivery.",
  "ListeningKit changelog (listeningkit.com). Social listening platform release notes.",
];

async function main(): Promise<void> {
  if (!process.env["NEBIUS_API_KEY"]) {
    console.error("verify-nebius-live: NEBIUS_API_KEY is not set in the environment. Nothing was called.");
    process.exit(2);
  }
  const startedAt = Date.now();
  const client = new NebiusRerankClient({ timeoutMs: 60_000, maxRetries: 0 });
  const outcome = await client.rerankDetailed({ query: QUERY, candidates: CANDIDATES.map((text) => ({ text })) });
  const latencyMs = Date.now() - startedAt;
  console.log(
    JSON.stringify(
      {
        ok: true,
        model: outcome.model,
        latencyMs,
        usage: outcome.usage,
        ranked: outcome.results.map((r) => ({ index: r.index, score: r.score, normalizedScore: r.normalizedScore })),
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const status = typeof (error as { status?: unknown }).status === "number" ? (error as { status: number }).status : 0;
  console.error(JSON.stringify({ ok: false, status, message }));
  process.exit(1);
});
