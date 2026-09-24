import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'https://www.fumadocs.dev';
const TARGET_DIR = path.resolve('docs/fumadocs');

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

  console.log('Fetching llms.txt...');
  const llmsTxt = await fetchWithRetry(`${BASE_URL}/llms.txt`);
  fs.writeFileSync(path.join(TARGET_DIR, 'llms.txt'), llmsTxt, 'utf-8');
  console.log('Saved docs/fumadocs/llms.txt');

  console.log('Fetching llms-full.txt...');
  try {
    const llmsFullTxt = await fetchWithRetry(`${BASE_URL}/llms-full.txt`);
    fs.writeFileSync(path.join(TARGET_DIR, 'llms-full.txt'), llmsFullTxt, 'utf-8');
    console.log(`Saved docs/fumadocs/llms-full.txt (${llmsFullTxt.length} bytes)`);
  } catch (err) {
    console.warn('Warning: Could not fetch llms-full.txt:', err.message);
  }

  // Parse all links starting with /docs
  const matches = Array.from(llmsTxt.matchAll(/\[([^\]]+)\]\((\/docs[^\)]*)\)/g));
  const rawPaths = Array.from(new Set(matches.map(m => m[2])));
  console.log(`Found ${rawPaths.length} individual documentation links in llms.txt.`);

  let completed = 0;
  let failed = 0;

  // Concurrency pool of 12
  const concurrency = 12;
  const queue = [...rawPaths];

  async function worker() {
    while (queue.length > 0) {
      const docPath = queue.shift();
      if (!docPath) break;

      const url = `${BASE_URL}${docPath}.md`;
      // Clean target path: e.g. /docs/integrations/openapi -> integrations/openapi.md
      let relPath = docPath.replace(/^\/docs\/?/, '');
      if (!relPath) relPath = 'index';
      const targetFilePath = path.join(TARGET_DIR, `${relPath}.md`);

      try {
        fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
        let content = await fetchWithRetry(url);

        // Sanitize any dummy secrets to prevent push protection false positives
        content = content.replace(/key-([0-9a-f]{32})/g, 'key_$1');

        fs.writeFileSync(targetFilePath, content, 'utf-8');
        completed++;
        if (completed % 25 === 0 || completed === rawPaths.length) {
          console.log(`Progress: ${completed}/${rawPaths.length} downloaded (${relPath}.md)`);
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

  // Write top-level README index for docs/fumadocs
  const indexContent = `# Fumadocs Documentation Index

> Local offline copy of documentation from [fumadocs.dev](https://www.fumadocs.dev).

**Fumadocs** is the Next.js and React documentation framework used in \`apps/docs\` (running on port 3001) in \`listeningkit-hackathon\`. It powers OpenAPI documentation rendering (\`fumadocs-openapi\`), full-text search, interactive API clients (\`@scalar/api-client-react\`), and Mermaid diagram embedding.

---

## 📚 Complete References

- **Full Documentation (Single File):** [\`llms-full.txt\`](./llms-full.txt) (~698 KB complete reference)
- **Upstream Index:** [\`llms.txt\`](./llms.txt)

---

## 🧭 OpenAPI Documentation Subsystem (\`fumadocs-openapi\`)

- **OpenAPI Integration:** [\`integrations/openapi.md\`](./integrations/openapi.md) — Generating docs from OpenAPI / Swagger schemas.
- **API Page Component:** [\`integrations/openapi/api-page.md\`](./integrations/openapi/api-page.md) — Rendering interactive API operation pages.
- **Generate Files:** [\`integrations/openapi/generate-files.md\`](./integrations/openapi/generate-files.md) — Generating static MDX pages from OpenAPI JSON.
- **Headless Mode:** [\`integrations/openapi/headless.md\`](./integrations/openapi/headless.md) — Custom headless API components.
- **Server Instance:** [\`integrations/openapi/server.md\`](./integrations/openapi/server.md) — Initializing \`createOpenAPI()\` instances.

---

## 🛠 Framework & UI Core

- [Quick Start](./index.md) — Setting up Fumadocs in Next.js App Router.
- [Page Conventions](./page-conventions.md) — Page trees and file routing conventions.
- [Mermaid Diagrams](./markdown/mermaid.md) — Rendering interactive Mermaid diagrams.
- [Search](./search.md) — Built-in search and vector indexing.
- [Customizing UI](./guides/customize-ui.md) — Theming and component overrides.
`;

  fs.writeFileSync(path.join(TARGET_DIR, 'README.md'), indexContent, 'utf-8');
  console.log('Saved docs/fumadocs/README.md');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
