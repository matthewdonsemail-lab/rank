/**
 * `.env.local` line transforms for `rank login` / `rank logout`.
 *
 * Pure line surgery: everything the tool does not own (other variables,
 * comments, ordering, line endings) is preserved.
 */

/** A line claims `name` when it is exactly `name=` or `export name=`. */
function claimsLine(line: string, name: string): boolean {
  const trimmed = line.trim();
  const noExport = trimmed.startsWith("export ") ? trimmed.slice("export ".length).trim() : trimmed;
  const eq = noExport.indexOf("=");
  return eq > 0 && noExport.slice(0, eq).trim() === name;
}

interface SplitEnvFile {
  lines: string[];
  lineEnding: string;
  endedInNewline: boolean;
}

function splitEnvFile(contents: string): SplitEnvFile {
  const crlf = contents.includes("\r\n");
  const endedInNewline = contents.length > 0 && contents.endsWith("\n");
  let lines = contents === "" ? [] : contents.split(/\r?\n/);
  if (lines.length > 0 && lines[lines.length - 1] === "" && endedInNewline) {
    lines = lines.slice(0, -1);
  }
  return { lines, lineEnding: crlf ? "\r\n" : "\n", endedInNewline };
}

function joinEnvFile(lines: string[], meta: Pick<SplitEnvFile, "lineEnding" | "endedInNewline">): string {
  if (lines.length === 0) return "";
  let out = lines.join(meta.lineEnding);
  if (meta.endedInNewline) out += meta.lineEnding;
  return out;
}

/**
 * Replace the existing `name` line, or append one when absent.
 *
 * CRLF input comes back CRLF. Appended lines use the same terminator as the
 * rest of the file; a file with no lines gains no trailing terminator.
 */
export function upsertEnvLine(contents: string, name: string, value: string): string {
  const meta = splitEnvFile(contents);
  const idx = meta.lines.findIndex((line) => claimsLine(line, name));
  if (idx >= 0) {
    const lines = [...meta.lines];
    lines[idx] = `${name}=${value}`;
    return joinEnvFile(lines, meta);
  }
  return joinEnvFile([...meta.lines, `${name}=${value}`], meta);
}

/**
 * Remove the `name` line(s).
 *
 * Returns the rewritten contents, `null` when the file becomes empty (the CLI
 * then deletes the file), or the original contents when `name` was absent.
 */
export function removeEnvLine(contents: string, name: string): string | null {
  const meta = splitEnvFile(contents);
  const kept = meta.lines.filter((line) => !claimsLine(line, name));
  if (kept.length === meta.lines.length) return contents;
  if (kept.length === 0) return null;
  return joinEnvFile(kept, meta);
}