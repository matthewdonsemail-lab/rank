/**
 * /docs/connectors and /docs/connectors/:connectorId — the connector guides
 * as real pages.
 *
 * Content comes from the `getConnectorPages()` loader over
 * `apps/web/content/connectors/`, the same files agents read directly from
 * the repo: one source per guide, frontmatter plus body. The registry
 * (`@rank/connectors`) supplies status, vendor, and capabilities beside the
 * prose. Unknown slugs redirect to the index.
 */
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { Link, Navigate, useParams } from "react-router-dom";
import { connectorById } from "@rank/connectors";
import { getConnectorPage, getConnectorPages } from "../lib/connector-docs";

const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="text-2xl font-black text-[#1a1a19]">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-8 text-xl font-bold text-slate-900">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-6 text-base font-bold text-slate-900">{children}</h3>,
  p: ({ children }) => <p className="mt-3 text-sm leading-relaxed text-slate-500">{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href ?? "#"}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noreferrer" : undefined}
      className="font-semibold text-[#2A8CFF] hover:text-[#1F6FE6]"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-500">{children}</ul>,
  ol: ({ children }) => <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-500">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  pre: ({ children }) => (
    <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-50 p-4 text-[13px] leading-relaxed">{children}</pre>
  ),
  // Brand rule: no monospace anywhere. Code renders in the inherited Satoshi
  // stack, semibold, on a slate wash — readable without a mono face.
  code: ({ children }) => <code className="font-semibold text-slate-700">{children}</code>,
  blockquote: ({ children }) => (
    <div className="mt-4 w-full rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
      {children}
    </div>
  ),
  hr: () => <hr className="my-6 border-slate-200" />,
  strong: ({ children }) => <strong className="font-semibold text-slate-700">{children}</strong>,
};

function DocsShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-paper px-4 py-12 text-ink">
      <div className="mx-auto w-full max-w-3xl">
        <Link to="/" aria-label="Rank home" className="mb-6 inline-block">
          <img src="/logo.svg" alt="Rank" className="size-12 rounded-xl object-contain" />
        </Link>
        <h1 className="text-2xl font-black text-[#1a1a19]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{subtitle}</p>
        {children}
        <Link
          to="/docs/connectors"
          className="mt-8 inline-block text-sm font-semibold text-slate-500 underline decoration-dashed underline-offset-4 hover:text-slate-800"
        >
          All connectors
        </Link>
      </div>
    </main>
  );
}

export function DocsConnectorsIndex() {
  return (
    <DocsShell
      title="Agent connectors"
      subtitle="How Hermes, Claude, Codex, and Muse reach Rank. Each guide below is the exact file agents read from the content collection — open one to see it rendered."
    >
      <div className="mt-8 space-y-4">
        {getConnectorPages().map((page) => {
          const connector = connectorById(page.id);
          return (
            <Link
              key={page.id}
              to={`/docs/connectors/${page.id}`}
              className="block rounded-2xl border border-black/5 bg-white p-6 transition hover:border-[#2A8CFF] sm:p-8"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-xl font-bold text-slate-900">{page.title}</span>
                {connector && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      connector.status === "supported" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {connector.status === "supported" ? "supported" : "needs remote API"}
                  </span>
                )}
              </div>
              <span className="mt-2 block text-sm leading-relaxed text-slate-500">{page.description}</span>
            </Link>
          );
        })}
      </div>
    </DocsShell>
  );
}

export function DocsConnectorPage() {
  const { connectorId } = useParams();
  const page = connectorId ? getConnectorPage(connectorId) : undefined;
  const connector = connectorId ? connectorById(connectorId) : undefined;
  if (!page || !connector) return <Navigate to="/docs/connectors" replace />;
  return (
    <DocsShell title={`${page.title} connector`} subtitle={`${connector.vendor} — ${page.description}`}>
      <article className="mt-6">
        <ReactMarkdown components={markdownComponents}>{page.body}</ReactMarkdown>
      </article>
    </DocsShell>
  );
}
