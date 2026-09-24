import fs from 'node:fs';
import path from 'node:path';

const HONO_BASE = 'https://hono.dev';
const GITHUB_REPO = 'honojs/website';
const TARGET_DIR = path.resolve('docs/hono');

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

  // 1. Fetch live hono.dev endpoints
  const liveFiles = [
    { url: `${HONO_BASE}/llms.txt`, path: 'llms.txt' },
    { url: `${HONO_BASE}/llms-full.txt`, path: 'llms-full.txt' },
    { url: `${HONO_BASE}/llms-small.txt`, path: 'llms-small.txt' },
  ];

  console.log('Fetching live hono.dev endpoints...');
  for (const item of liveFiles) {
    try {
      const text = await fetchWithRetry(item.url);
      const outPath = path.join(TARGET_DIR, item.path);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, text, 'utf-8');
      console.log(`Saved ${item.path} (${text.length} bytes)`);
    } catch (err) {
      console.warn(`Failed to fetch ${item.url}:`, err.message);
    }
  }

  // 2. Fetch git tree from GitHub repository honojs/website
  console.log(`Fetching git tree from ${GITHUB_REPO}...`);
  const treeRes = await fetchWithRetry(`https://api.github.com/repos/${GITHUB_REPO}/git/trees/main?recursive=1`);
  const treeData = JSON.parse(treeRes);

  const docBlobs = treeData.tree.filter(item => {
    return item.type === 'blob' && item.path.startsWith('docs/') && item.path.endsWith('.md');
  });

  console.log(`Found ${docBlobs.length} documentation markdown files from ${GITHUB_REPO}.`);

  const concurrency = 10;
  const queue = [...docBlobs];
  let completed = 0;
  let failed = 0;

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${item.path}`;
      // Strip 'docs/' prefix so paths match hono concepts directly
      const relPath = item.path.replace(/^docs\//, '');
      const targetFilePath = path.join(TARGET_DIR, relPath);

      try {
        fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
        let content = await fetchWithRetry(rawUrl);

        // Sanitize any dummy secrets matching key-[0-9a-f]{32}
        content = content.replace(/key-([0-9a-f]{32})/g, 'key_$1');

        fs.writeFileSync(targetFilePath, content, 'utf-8');
        completed++;
        if (completed % 20 === 0 || completed === docBlobs.length) {
          console.log(`Progress: ${completed}/${docBlobs.length} downloaded (${relPath})`);
        }
      } catch (err) {
        console.error(`Failed to download ${item.path}:`, err.message);
        failed++;
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  console.log(`Finished: ${completed} succeeded, ${failed} failed.`);

  // Write top-level README index for docs/hono
  const indexContent = `# Hono Documentation Index

> Local offline copy of documentation from [hono.dev](https://hono.dev).

Hono is an ultrafast, lightweight web framework built on Web Standards that runs on any JavaScript runtime: Node.js, Bun, Deno, Cloudflare Workers, Fastly Compute, and Vercel.

---

## Complete References

- **Full Documentation (Single File):** [\`llms-full.txt\`](./llms-full.txt)
- **Compact Summary:** [\`llms-small.txt\`](./llms-small.txt)
- **Upstream Index:** [\`llms.txt\`](./llms.txt)

---

## Major Subsystems

### 1. Core API
- Context (\`c.req\`, \`c.res\`, \`c.json\`, \`c.text\`, \`c.html\`)
- Routing (RegExpRouter, SmartRouter, TrieRouter)
- Middleware execution and composition
- Validation with Zod / Valibot

### 2. Built-in Middleware
- Bearer Auth, Basic Auth, JWT, JWK
- CORS, CSRF, Secure Headers
- Cache, Compression, ETag
- Request ID, Logger, Timeout, Timing

### 3. Helpers & Streaming
- Server-Sent Events (SSE) & WebSockets
- HTML templates & JSX renderer
- Cookie parsing and signing
- Adapter utilities for Node.js, Bun, and serverless runtimes
`;

  fs.writeFileSync(path.join(TARGET_DIR, 'README.md'), indexContent, 'utf-8');
  console.log('Saved docs/hono/README.md');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
