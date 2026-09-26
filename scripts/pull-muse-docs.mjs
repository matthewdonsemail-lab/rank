import fs from 'node:fs';
import path from 'node:path';

const TARGET_DIR = path.resolve('docs/agents/muse');

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

  // Muse Connector Platform
  console.log('Fetching Muse Connector Platform page...');
  try {
    const connectorPlatform = await fetchWithRetry('https://muse.ai/platform');
    fs.writeFileSync(path.join(TARGET_DIR, 'connector-platform.html'), connectorPlatform, 'utf-8');
    console.log('Saved docs/agents/muse/connector-platform.html');
  } catch (err) {
    console.warn('Warning: Could not fetch connector platform:', err.message);
  }

  // Muse Help Center - Connectors
  console.log('Fetching Muse Help Center - Connectors...');
  try {
    const helpCenter = await fetchWithRetry('https://www.meta.com/help/artificial-intelligence/1687253048996149/');
    fs.writeFileSync(path.join(TARGET_DIR, 'help-center-connectors.html'), helpCenter, 'utf-8');
    console.log('Saved docs/agents/muse/help-center-connectors.html');
  } catch (err) {
    console.warn('Warning: Could not fetch help center:', err.message);
  }

  // Muse Code documentation
  console.log('Fetching Muse Code documentation...');
  try {
    const museCode = await fetchWithRetry('https://dev.meta.ai/docs/muse-code');
    fs.writeFileSync(path.join(TARGET_DIR, 'muse-code.html'), museCode, 'utf-8');
    console.log('Saved docs/agents/muse/muse-code.html');
  } catch (err) {
    console.warn('Warning: Could not fetch muse code docs:', err.message);
  }

  // Muse Code extending documentation
  console.log('Fetching Muse Code extending documentation...');
  try {
    const museCodeExtending = await fetchWithRetry('https://dev.meta.ai/docs/muse-code/extending');
    fs.writeFileSync(path.join(TARGET_DIR, 'muse-code-extending.html'), museCodeExtending, 'utf-8');
    console.log('Saved docs/agents/muse/muse-code-extending.html');
  } catch (err) {
    console.warn('Warning: Could not fetch muse code extending docs:', err.message);
  }

  console.log('Muse documentation fetch completed.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});