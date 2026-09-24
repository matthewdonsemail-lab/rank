import fs from 'node:fs';
import path from 'node:path';

const CLERK_BASE = 'https://clerk.com/docs';
const TARGET_DIR = path.resolve('docs/clerk');

const CORE_DOC_PAGES = [
  { url: `${CLERK_BASE}/llms.txt`, path: 'llms.txt' },
  { url: `${CLERK_BASE}/llms-full.txt`, path: 'llms-full.txt' },
  { url: `${CLERK_BASE}/getting-started/core-concepts.md`, path: 'getting-started/core-concepts.md' },
  { url: `${CLERK_BASE}/getting-started/quickstart/setup-clerk.md`, path: 'getting-started/quickstart/setup-clerk.md' },
  { url: `${CLERK_BASE}/nextjs/getting-started/quickstart.md`, path: 'nextjs/quickstart.md' },
  { url: `${CLERK_BASE}/guides/development/integrations/databases/convex.md`, path: 'integrations/convex.md' },
  { url: `${CLERK_BASE}/reference/backend/overview.md`, path: 'reference/backend/overview.md' },
  { url: `${CLERK_BASE}/reference/backend/authenticate-request.md`, path: 'reference/backend/authenticate-request.md' },
  { url: `${CLERK_BASE}/reference/backend/verify-token.md`, path: 'reference/backend/verify-token.md' },
  { url: `${CLERK_BASE}/reference/backend/verify-webhook.md`, path: 'reference/backend/verify-webhook.md' },
  { url: `${CLERK_BASE}/reference/nextjs/overview.md`, path: 'reference/nextjs/overview.md' },
  { url: `${CLERK_BASE}/nextjs/reference/components/clerk-provider.md`, path: 'reference/nextjs/clerk-provider.md' },
  { url: `${CLERK_BASE}/reference/nextjs/auth.md`, path: 'reference/nextjs/auth.md' },
  { url: `${CLERK_BASE}/reference/nextjs/current-user.md`, path: 'reference/nextjs/current-user.md' },
  { url: `${CLERK_BASE}/organizations/overview.md`, path: 'organizations/overview.md' },
  { url: `${CLERK_BASE}/webhooks/overview.md`, path: 'webhooks/overview.md' },
  { url: `${CLERK_BASE}/webhooks/sync-data.md`, path: 'webhooks/sync-data.md' },
];

async function fetchWithRetry(url, retries = 3, delay = 500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Node-Doc-Fetcher' },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delay * attempt));
    }
  }
}

async function main() {
  console.log(`Target directory: ${TARGET_DIR}`);
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  let completed = 0;
  let failed = 0;

  for (const item of CORE_DOC_PAGES) {
    try {
      console.log(`Fetching ${item.url}...`);
      const text = await fetchWithRetry(item.url);
      const outPath = path.join(TARGET_DIR, item.path);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, text, 'utf-8');
      completed++;
      console.log(`Saved ${item.path} (${text.length} bytes)`);
    } catch (err) {
      console.warn(`Failed to fetch ${item.url}:`, err.message);
      failed++;
    }
  }

  const indexContent = `# Clerk Documentation Index

Local offline mirror of Clerk authentication and identity platform documentation.

## Primary References

- [Full LLM Index (llms.txt)](./llms.txt): Curated comprehensive index of 2,400+ documentation topics.
- [Full Documentation Stream (llms-full.txt)](./llms-full.txt): Complete topic reference.

## Core Architecture & Guides

- [Core Concepts](./getting-started/core-concepts.md): Sessions, users, organizations, client tokens.
- [Setup Clerk](./getting-started/quickstart/setup-clerk.md): Account, application, and API keys.
- [Next.js Quickstart](./getting-started/quickstart/nextjs.md): App Router authentication setup.
- [Convex Integration](./integrations/convex.md): Official Clerk and Convex database auth flow.

## Backend SDK & Verification

- [Backend Overview](./reference/backend/overview.md): \`@clerk/backend\` client usage.
- [Authenticate Request](./reference/backend/authenticate-request.md): Token verification on API routes.
- [Verify Token](./reference/backend/verify-token.md): JWT signature verification with Clerk keys.
- [Verify Webhook](./reference/backend/verify-webhook.md): Svix signature verification for Clerk webhooks.

## Next.js Reference

- [Next.js SDK Overview](./reference/nextjs/overview.md): Middleware, server components, and client components.
- [ClerkProvider](./reference/nextjs/clerk-provider.md): Root context provider for session state.
- [auth() Helper](./reference/nextjs/auth.md): Server-side authentication inspection.
- [currentUser() Helper](./reference/nextjs/current-user.md): Server-side user object retrieval.

## Organizations & Webhooks

- [Organizations Overview](./organizations/overview.md): Multi-tenant workspaces and RBAC roles.
- [Webhooks Overview](./webhooks/overview.md): Event delivery and webhook handling.
- [Sync Data via Webhooks](./webhooks/sync-data.md): Keeping Convex database in sync with Clerk events.
`;

  fs.writeFileSync(path.join(TARGET_DIR, 'README.md'), indexContent, 'utf-8');
  console.log(`Generated docs/clerk/README.md`);
  console.log(`Completed: ${completed} succeeded, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
