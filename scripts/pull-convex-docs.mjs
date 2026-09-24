import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'https://docs.convex.dev';
const TARGET_DIR = path.resolve('docs/convex');

async function fetchWithRetry(url, retries = 3, delay = 500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
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
  console.log('Saved docs/convex/llms.txt');

  console.log('Fetching llms-full.txt...');
  try {
    const llmsFullTxt = await fetchWithRetry(`${BASE_URL}/llms-full.txt`);
    fs.writeFileSync(path.join(TARGET_DIR, 'llms-full.txt'), llmsFullTxt, 'utf-8');
    console.log(`Saved docs/convex/llms-full.txt (${llmsFullTxt.length} bytes)`);
  } catch (err) {
    console.warn('Warning: Could not fetch llms-full.txt:', err.message);
  }

  // Parse all markdown paths from llms.txt
  const lines = llmsTxt.split('\n');
  const docPaths = [];
  for (const line of lines) {
    const match = line.match(/\(((\/[^)]+\.md)|(https?:\/\/docs\.convex\.dev\/[^)]+\.md))\)/);
    if (match) {
      let docPath = match[1];
      if (docPath.startsWith('http')) {
        docPath = new URL(docPath).pathname;
      }
      if (docPath.startsWith('/')) {
        docPath = docPath.slice(1);
      }
      docPaths.push(docPath);
    }
  }

  const uniquePaths = Array.from(new Set(docPaths)).filter(p => p !== 'llms.txt' && p !== 'llms-full.txt');
  console.log(`Found ${uniquePaths.length} individual documentation files to download.`);

  let completed = 0;
  let failed = 0;

  // Concurrency pool of 12
  const concurrency = 12;
  const queue = [...uniquePaths];

  async function worker(workerId) {
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
        if (completed % 25 === 0 || completed === uniquePaths.length) {
          console.log(`Progress: ${completed}/${uniquePaths.length} downloaded (${docPath})`);
        }
      } catch (err) {
        console.error(`Failed to download ${url}:`, err.message);
        failed++;
      }
    }
  }

  const workers = Array.from({ length: concurrency }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  console.log(`Finished: ${completed} succeeded, ${failed} failed.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
