// Pre-push gate: hackathon.md must have been updated within the last 30 minutes.
// Run by lefthook (see lefthook.yml). Bypass for emergencies only:
//   SKIP_HACKATHON_LOG_CHECK=1 git push
// Test hook: HACKATHON_LOG_FILE=<path> node scripts/check-hackathon-log.mjs
import { statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIMIT_MS = 30 * 60 * 1000;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const logFile = process.env.HACKATHON_LOG_FILE || join(root, 'hackathon.md');

if (process.env.SKIP_HACKATHON_LOG_CHECK) {
  console.log('pre-push: SKIP_HACKATHON_LOG_CHECK set, skipping hackathon log check.');
  process.exit(0);
}

let mtime;
try {
  mtime = statSync(logFile).mtimeMs;
} catch {
  console.error(`pre-push: FAIL — ${logFile} not found. Update the hackathon log, then push.`);
  process.exit(1);
}

const ageMs = Date.now() - mtime;
if (ageMs > LIMIT_MS) {
  const mins = Math.floor(ageMs / 60000);
  console.error(`pre-push: FAIL — hackathon.md was last updated ${mins} min ago (>30 min).`);
  console.error('pre-push: update the hackathon log and try again.');
  process.exit(1);
}

console.log(`pre-push: OK — hackathon.md updated ${Math.floor(ageMs / 1000)}s ago.`);
