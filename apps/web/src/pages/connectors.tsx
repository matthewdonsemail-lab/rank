/**
 * /connectors — the agent connector catalog as a page.
 *
 * Rendered from the shared connectors registry in rank-core
 * (`@rank/connectors`), the same `CONNECTORS` data the CLI
 * (`rank connectors`) and the MCP server (`rank_list_connectors`) serve. The
 * prose setup guides live in `docs/agents/<id>/`; this page renders the
 * registry fields (transports, stdio invocation, limits) so the three
 * surfaces cannot describe different connectors.
 */
import { CONNECTOR_REGISTRY } from "@rank/connectors";
import type { ConnectorDefinition, ConnectorSurface } from "@rank/connectors";
import { Link } from "react-router-dom";

function SurfaceRow({ label, surface }: { label: string; surface: ConnectorSurface }) {
  if (!surface.available) {
    return (
      <p className="text-sm leading-relaxed text-slate-500">
        <span className="font-semibold text-slate-700">{label}:</span> unavailable — {surface.reason}
      </p>
    );
  }
  return (
    <p className="text-sm leading-relaxed text-slate-500">
      <span className="font-semibold text-slate-700">{label}:</span> available ({surface.transport}) —{" "}
      {surface.notes}
    </p>
  );
}

function ConnectorCard({ connector }: { connector: ConnectorDefinition }) {
  return (
    <section aria-label={connector.name} className="rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-xl font-bold text-slate-900">{connector.name}</h2>
        <span className="text-sm text-slate-500">{connector.vendor}</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            connector.status === "supported" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
          }`}
        >
          {connector.status === "supported" ? "supported" : "needs remote API"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{connector.description}</p>
      <div className="mt-4 space-y-2">
        <SurfaceRow label="CLI" surface={connector.surfaces.cli} />
        <SurfaceRow label="MCP" surface={connector.surfaces.mcp} />
        <SurfaceRow label="HTTP" surface={connector.surfaces.http} />
      </div>
      {connector.stdio && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Stdio launch</p>
          <code className="mt-1 block break-all text-sm font-semibold text-slate-700">
            {connector.stdio.command} {connector.stdio.args.join(" ")}
          </code>
          <p className="mt-2 text-sm text-slate-500">
            Env: {connector.stdio.env.join(", ")}. {connector.stdio.authNote}
          </p>
        </div>
      )}
      {connector.capabilities.length > 0 && (
        <p className="mt-4 text-sm text-slate-500">
          <span className="font-semibold text-slate-700">Capabilities:</span> {connector.capabilities.join(", ")}
        </p>
      )}
      {connector.limits.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-500">
          {connector.limits.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-sm text-slate-500">
        Full guide: <code className="font-semibold text-slate-700">{connector.docPath}</code>
      </p>
    </section>
  );
}

export function ConnectorsPage() {
  return (
    <main className="min-h-screen bg-paper px-4 py-12 text-ink">
      <div className="mx-auto w-full max-w-3xl">
        <Link to="/" aria-label="Rank home" className="mb-6 inline-block">
          <img src="/logo.svg" alt="Rank" className="size-12 rounded-xl object-contain" />
        </Link>
        <h1 className="text-2xl font-black text-[#1a1a19]">Agent connectors</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
          How Hermes, Claude, Codex, and Muse reach Rank. The CLI, the MCP server, and this page all read the same
          registry, so they cannot disagree. Authenticate once with <code className="font-semibold">rank login</code>{" "}
          — connectors reuse that session and never mint identities.
        </p>
        <div className="mt-8 space-y-6">
          {CONNECTOR_REGISTRY.connectors.map((connector) => (
            <ConnectorCard key={connector.id} connector={connector} />
          ))}
        </div>
        <Link
          to="/"
          className="mt-8 inline-block text-sm font-semibold text-slate-500 underline decoration-dashed underline-offset-4 hover:text-slate-800"
        >
          Back to Rank
        </Link>
      </div>
    </main>
  );
}

export default ConnectorsPage;
