/**
 * Parse a dotenv-style file.
 *
 * Pure: takes contents, returns a record. Tolerates comments, blank lines, an
 * `export ` prefix, single or double quoted values, a trailing comment after an
 * unquoted value, CRLF line endings, and a leading byte order mark.
 */

export function parseEnvFile(contents: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    const withoutExport = line.startsWith("export ") ? line.slice("export ".length).trim() : line;
    const eq = withoutExport.indexOf("=");
    if (eq <= 0) continue;
    const name = withoutExport.slice(0, eq).trim();
    if (name === "") continue;
    let value = withoutExport.slice(eq + 1).trim();
    const quote = value[0];
    if ((quote === '"' || quote === "'") && value.length > 1 && value.endsWith(quote)) {
      value = value.slice(1, -1);
    } else {
      const comment = value.indexOf(" #");
      if (comment >= 0) value = value.slice(0, comment).trim();
    }
    result[name] = value;
  }
  return result;
}

/** A value counts as absent when undefined or only whitespace. */
export function isBlank(value: string | undefined): boolean {
  return value === undefined || value.trim() === "";
}
