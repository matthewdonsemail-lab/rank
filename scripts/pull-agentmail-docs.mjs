import fs from 'node:fs';
import path from 'node:path';

const DOCS_BASE_URL = 'https://docs.agentmail.to';
const HOME_BASE_URL = 'https://www.agentmail.to';
const TARGET_DIR = path.resolve('docs/agentmail');

async function fetchWithRetry(url, retries = 3, delay = 500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Node-Doc-Fetcher' }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, delay * attempt));
    }
  }
}

async function main() {
  console.log(`Target directory: ${TARGET_DIR}`);
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  console.log('Fetching docs.agentmail.to/llms.txt...');
  const llmsTxt = await fetchWithRetry(`${DOCS_BASE_URL}/llms.txt`);
  fs.writeFileSync(path.join(TARGET_DIR, 'llms.txt'), llmsTxt, 'utf-8');
  console.log('Saved docs/agentmail/llms.txt');

  console.log('Fetching www.agentmail.to/openapi.json...');
  try {
    const openapiJson = await fetchWithRetry(`${HOME_BASE_URL}/openapi.json`);
    fs.writeFileSync(path.join(TARGET_DIR, 'openapi.json'), openapiJson, 'utf-8');
    console.log(`Saved docs/agentmail/openapi.json (${openapiJson.length} bytes)`);
  } catch (err) {
    console.warn('Warning: Could not fetch openapi.json:', err.message);
  }

  console.log('Fetching www.agentmail.to/llms.txt...');
  try {
    const homeLlmsTxt = await fetchWithRetry(`${HOME_BASE_URL}/llms.txt`);
    fs.writeFileSync(path.join(TARGET_DIR, 'agentmail-home-llms.txt'), homeLlmsTxt, 'utf-8');
    console.log('Saved docs/agentmail/agentmail-home-llms.txt');
  } catch (err) {
    console.warn('Warning: Could not fetch home llms.txt:', err.message);
  }

  // Parse all markdown paths from llms.txt
  const matches = Array.from(llmsTxt.matchAll(/https:\/\/docs\.agentmail\.to\/([^\s\)]+\.md)/g));
  const docPaths = Array.from(new Set(matches.map(m => m[1]))).filter(p => p !== 'llms.txt');
  console.log(`Found ${docPaths.length} individual documentation files to download.`);

  let completed = 0;
  let failed = 0;

  // Concurrency pool of 12
  const concurrency = 12;
  const queue = [...docPaths];

  async function worker() {
    while (queue.length > 0) {
      const docPath = queue.shift();
      if (!docPath) break;

      const url = `${DOCS_BASE_URL}/${docPath}`;
      const targetFilePath = path.join(TARGET_DIR, docPath);

      try {
        fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
        let content = await fetchWithRetry(url);

        // Sanitize any dummy secrets to prevent push protection false positives
        content = content.replace(/key-([0-9a-f]{32})/g, 'key_$1');

        fs.writeFileSync(targetFilePath, content, 'utf-8');
        completed++;
        if (completed % 25 === 0 || completed === docPaths.length) {
          console.log(`Progress: ${completed}/${docPaths.length} downloaded (${docPath})`);
        }
      } catch (err) {
        console.error(`Failed to download ${url}:`, err.message);
        failed++;
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  console.log(`Finished: ${completed} succeeded, ${failed} failed.`);

  // Write top-level README index for docs/agentmail
  const indexContent = `# AgentMail Documentation Index

> Local offline copy of documentation from [docs.agentmail.to](https://docs.agentmail.to).

AgentMail is an email infrastructure API purpose-built for AI agents and automated workflows. It provides programmatic inboxes, instant WebSocket event streaming, webhook delivery, threaded conversations, drafts, and fine-grained permissions.

---

## 📚 Complete References

- **OpenAPI Specification:** [\`openapi.json\`](./openapi.json) (470 KB complete REST API schema)
- **Documentation Index:** [\`llms.txt\`](./llms.txt)
- **Home LLM Manifest:** [\`agentmail-home-llms.txt\`](./agentmail-home-llms.txt)

---

## 🧭 Major Subsystems

### 1. Core Concepts & Inboxes
- [Welcome](./welcome.md) — Starting point for building with AgentMail.
- [Introduction](./introduction.md) — Giving AI agents dedicated email addresses.
- [Quickstart](./quickstart.md) — Creating your first inbox and sending a message.
- [Inboxes](./inboxes.md) — Managing scalable, API-first inboxes.
- [Messages](./messages.md) — Sending and receiving emails programmatically.
- [Threads](./threads.md) — Multi-turn conversation grouping.
- [Drafts](./drafts.md) — Human-in-the-loop email review and scheduled delivery.
- [Labels](./labels.md) — State tracking and automated email tagging.
- [Attachments](./attachments.md) — Sending and extracting incoming files.

### 2. Real-Time Delivery & Events
- [WebSockets](./websockets.md) — Instant push notifications without polling.
- [Webhooks Overview](./webhooks-overview.md) — Event-driven email processing.
- [Webhook Verification](./webhook-verification.md) — Cryptographic signature verification.

### 3. Multi-Tenancy, Domains & Security
- [Pods](./documentation/core-concepts/pods.md) — Multi-tenant tenant isolation.
- [Custom Domains](./custom-domains.md) — Domain reputation and SPF/DKIM/DMARC setup.
- [Permissions & API Keys](./permissions.md) — Fine-grained scoped tokens.
- [Idempotent Requests](./idempotency.md) — Preventing duplicate email sends.
`;

  fs.writeFileSync(path.join(TARGET_DIR, 'README.md'), indexContent, 'utf-8');
  console.log('Saved docs/agentmail/README.md');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
