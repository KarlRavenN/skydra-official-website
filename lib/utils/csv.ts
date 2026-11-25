/**
 * Safe CSV building.
 * - Escapes quotes (" -> ""), and wraps every cell in quotes so commas and
 *   newlines inside a cell are preserved.
 * - Neutralizes spreadsheet formula injection: a cell starting with = + - @
 *   (or a tab / carriage return) is prefixed with a single quote.
 */
export function csvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '""';
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv(
  headers: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>
): string {
  const lines = [headers.map(csvCell).join(","), ...rows.map((r) => r.map(csvCell).join(","))];
  // BOM so Excel opens UTF-8 names correctly.
  return "\uFEFF" + lines.join("\r\n");
}

/** Escapes a user search term for use inside a PostgREST .or() filter / ilike pattern. */
export function sanitizeSearchTerm(term: string): string {
  return term.replace(/[%,()\\*_:]/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}
