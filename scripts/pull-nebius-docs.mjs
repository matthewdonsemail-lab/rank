import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'https://docs.nebius.com';
const TARGET_DIR = path.resolve('docs/nebius');

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
  console.log('Saved docs/nebius/llms.txt');

  console.log('Fetching llms-full.txt...');
  try {
    const llmsFullTxt = await fetchWithRetry(`${BASE_URL}/llms-full.txt`);
    fs.writeFileSync(path.join(TARGET_DIR, 'llms-full.txt'), llmsFullTxt, 'utf-8');
    console.log(`Saved docs/nebius/llms-full.txt (${llmsFullTxt.length} bytes)`);
  } catch (err) {
    console.warn('Warning: Could not fetch llms-full.txt:', err.message);
  }

  // Parse all markdown paths from llms.txt
  const matches = Array.from(llmsTxt.matchAll(/\((https:\/\/docs\.nebius\.com\/([^\)]+\.md))\)/g));
  const docPaths = Array.from(new Set(matches.map(m => m[2]))).filter(p => p !== 'llms.txt' && p !== 'llms-full.txt');
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

      const url = `${BASE_URL}/${docPath}`;
      const targetFilePath = path.join(TARGET_DIR, docPath);

      try {
        fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
        const content = await fetchWithRetry(url);
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

  // Write top-level README index for docs/nebius
  const indexContent = `# Nebius AI Cloud & Studio Documentation Index

> Local offline copy of documentation from [docs.nebius.com](https://docs.nebius.com).

Nebius AI Cloud is an AI infrastructure platform offering GPU compute clusters (NVIDIA H100, H200, L40S), InfiniBand networking, managed Kubernetes/Slurm, and Nebius AI Studio inference APIs.

---

## Complete References

- **Full Documentation (Single File):** [\`llms-full.txt\`](./llms-full.txt)
- **Upstream Index:** [\`llms.txt\`](./llms.txt)

---

## Major Subsystems

### 1. Compute & GPU Infrastructure
- Managed GPU clusters with InfiniBand interconnect
- Virtual machines, preemptible instances, and container runtimes
- Bare-metal and Kubernetes configurations

### 2. Nebius AI Studio & Model Inference
- OpenAI-compatible inference endpoints
- High-throughput open-weights models (DeepSeek, Llama-3.1/3.3, Mistral, Qwen)
- Cross-encoder rerankers and embedding models (\`BAAI/bge-reranker-v2-m3\`)
- Token optimization and streaming responses

### 3. Storage, Networking & Orchestration
- High-performance shared file storage and S3-compatible Object Storage
- VPC, private interconnects, security groups, and public IPs
- Slurm cluster management and Slurm Operator
`;

  fs.writeFileSync(path.join(TARGET_DIR, 'README.md'), indexContent, 'utf-8');
  console.log('Saved docs/nebius/README.md');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
