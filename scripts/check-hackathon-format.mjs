// Pre-push gate: hackathon.md entry structure.
//
// Every `###` entry under `## Log` must carry the same five lines, so the log
// stays a replayable record instead of drifting into free prose:
//
//   ### YYYY-MM-DD - Title — Author
//   - Beads: rank-xxx, rank-yyy (or `n/a` for pre-tbd work)
//   - Commit: <40-hex> (<parseable date>)  — or `Commit: uncommitted` for the
//     slice currently being written, which gains its hash before it is committed
//   - Files: non-empty file list for the slice
//
// The author is part of the title itself, taken from whoever authored the
// commit — no brackets, no separate attribution line to drift out of sync.
//
// This checks structure only. Whether the listed files match the commit is left
// to `git show`; the gate guarantees the outline exists, not its accuracy.
//
// Entries dated before STRUCTURE_SINCE are historical prose and exempt. The
// structured format was adopted on that date; backfilling hashes and file lists
// onto older entries would be guesswork presented as record. Clean going
// forward, honest about the past.
const STRUCTURE_SINCE = "2026-09-26";
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const violations = [];

let text;
try {
  text = readFileSync(join(root, 'hackathon.md'), 'utf8');
} catch (error) {
  violations.push(`hackathon.md: unreadable (${error.message})`);
}

if (text) {
  const lines = text.split('\n');
  const logStart = lines.findIndex((line) => line.trim() === '## Log');
  if (logStart === -1) {
    violations.push('hackathon.md: missing `## Log` section');
  } else {
    let current = null;
    const entries = [];
    for (const line of lines.slice(logStart + 1)) {
      const heading = line.match(/^### (\d{4}-\d{2}-\d{2}) - (.+) — (.+)$/);
      if (heading) {
        if (current) entries.push(current);
        current = { title: heading[2].trim(), author: heading[3].trim(), date: heading[1], beads: null, commit: null, files: null };
        continue;
      }
      // A heading without the author suffix is malformed, not a different kind
      // of entry — record it so it fails with a useful message below. The date
      // is still extracted so pre-cutoff historical entries stay exempt.
      const bareHeading = line.match(/^### /);
      if (bareHeading) {
        if (current) entries.push(current);
        const dated = line.match(/^### (\d{4}-\d{2}-\d{2})/);
        current = { title: line.replace(/^### /, '').trim(), author: null, date: dated ? dated[1] : null, beads: null, commit: null, files: null };
        continue;
      }
      if (!current) continue;
      const beads = line.match(/^- Beads:\s*(.+)$/);
      if (beads) current.beads = beads[1].trim();
      const commit = line.match(/^- Commit:\s*(.+)$/);
      if (commit) current.commit = commit[1].trim();
      const files = line.match(/^- Files:\s*(.+)$/);
      if (files) current.files = files[1].trim();
    }
    if (current) entries.push(current);

    if (entries.length === 0) {
      violations.push('hackathon.md: no entries under `## Log`');
    }
    for (const entry of entries) {
      const label = entry.title || '(untitled)';
      if (entry.date === null || entry.author === null) {
        if (entry.date === null || entry.date >= STRUCTURE_SINCE) {
          violations.push(`"${label}": heading must be \`### YYYY-MM-DD - Title — Author\``);
        }
        continue;
      }
      if (entry.date < STRUCTURE_SINCE) continue;
      if (!entry.beads) violations.push(`"${label}": missing \`- Beads:\` line`);
      if (!entry.files) {
        violations.push(`"${label}": missing \`- Files:\` line`);
      }
      if (!entry.commit) {
        violations.push(`"${label}": missing \`- Commit:\` line`);
      } else if (entry.commit !== 'uncommitted') {
        const shaped = entry.commit.match(/^([0-9a-f]{40})\s+\((.+)\)$/);
        if (!shaped) {
          violations.push(`"${label}": Commit line must be \`<40-hex> (<date>)\` or \`uncommitted\``);
        } else if (Number.isNaN(Date.parse(shaped[2]))) {
          violations.push(`"${label}": commit date is not parseable: ${shaped[2]}`);
        }
      }
    }
  }
}

if (violations.length > 0) {
  console.error('pre-push: FAIL — hackathon log format violations detected:');
  for (const violation of violations) console.error(`  - ${violation}`);
  process.exit(1);
}

console.log('pre-push: OK — hackathon.md entries carry titles, beads, commits, and file lists.');
