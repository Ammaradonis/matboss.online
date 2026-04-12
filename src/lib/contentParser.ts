// ---------------------------------------------------------------------------
// contentParser.ts — Lightweight block parser for blog content
//
// Transforms a raw string[] (as stored in posts.ts) into a structured Block[]
// that the renderer can map to React components.
//
// Design constraints:
//   - No external markdown libraries
//   - O(n) single pass over the content array
//   - Backward compatible: plain strings → 'p', "## " prefix → 'h2'
//   - Consecutive list items and table rows are grouped into single blocks
// ---------------------------------------------------------------------------

// ---- Block type system ----------------------------------------------------

export type Block =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'hr' };

// ---- Line classification --------------------------------------------------

const enum LineKind {
  H2,
  H3,
  Blockquote,
  UL,
  OL,
  TableRow,
  HR,
  Paragraph,
}

interface ClassifiedLine {
  kind: LineKind;
  raw: string;
  /** Extracted payload (heading text, list item text, etc.) */
  payload: string;
}

/** Detect whether a line is a table separator row like |---|---|---| */
function isTableSeparator(line: string): boolean {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

/** Split a table row "|a|b|c|" into trimmed cell values ["a","b","c"] */
function parseTableCells(line: string): string[] {
  const trimmed = line.trim();
  // Strip leading/trailing pipes then split on inner pipes
  const inner = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
  const stripped = inner.endsWith('|') ? inner.slice(0, -1) : inner;
  return stripped.split('|').map((cell) => cell.trim());
}

function classifyLine(line: string): ClassifiedLine {
  // Headings — order matters: check ### before ##
  if (line.startsWith('### ')) {
    return { kind: LineKind.H3, raw: line, payload: line.slice(4) };
  }
  if (line.startsWith('## ')) {
    return { kind: LineKind.H2, raw: line, payload: line.slice(3) };
  }

  // Horizontal rule — exactly "---" (with optional whitespace)
  if (/^-{3,}\s*$/.test(line)) {
    return { kind: LineKind.HR, raw: line, payload: '' };
  }

  // Blockquote
  if (line.startsWith('> ')) {
    return { kind: LineKind.Blockquote, raw: line, payload: line.slice(2) };
  }

  // Unordered list item
  if (line.startsWith('- ')) {
    return { kind: LineKind.UL, raw: line, payload: line.slice(2) };
  }

  // Ordered list item — "1. ", "2. ", etc.
  const olMatch = line.match(/^\d+\.\s(.+)/);
  if (olMatch) {
    return { kind: LineKind.OL, raw: line, payload: olMatch[1] };
  }

  // Table row — must contain at least one pipe and look like "|...|...|"
  if (line.includes('|') && line.trim().startsWith('|') && line.trim().endsWith('|')) {
    return { kind: LineKind.TableRow, raw: line, payload: line };
  }

  // Default: paragraph
  return { kind: LineKind.Paragraph, raw: line, payload: line };
}

// ---- Main parser ----------------------------------------------------------

/**
 * Parse a content string array into structured blocks.
 *
 * Grouping rules:
 *   - Consecutive UL lines → single { type: 'ul', items: [...] }
 *   - Consecutive OL lines → single { type: 'ol', items: [...] }
 *   - Consecutive table rows → single { type: 'table', headers, rows }
 *   - Everything else → individual block per line
 */
export function parseContent(content: string[]): Block[] {
  const blocks: Block[] = [];

  let i = 0;
  while (i < content.length) {
    const classified = classifyLine(content[i]);

    switch (classified.kind) {
      case LineKind.H2:
        blocks.push({ type: 'h2', text: classified.payload });
        i++;
        break;

      case LineKind.H3:
        blocks.push({ type: 'h3', text: classified.payload });
        i++;
        break;

      case LineKind.HR:
        blocks.push({ type: 'hr' });
        i++;
        break;

      case LineKind.Blockquote:
        blocks.push({ type: 'blockquote', text: classified.payload });
        i++;
        break;

      // Group consecutive unordered list items
      case LineKind.UL: {
        const items: string[] = [];
        while (i < content.length && classifyLine(content[i]).kind === LineKind.UL) {
          items.push(classifyLine(content[i]).payload);
          i++;
        }
        blocks.push({ type: 'ul', items });
        break;
      }

      // Group consecutive ordered list items
      case LineKind.OL: {
        const items: string[] = [];
        while (i < content.length && classifyLine(content[i]).kind === LineKind.OL) {
          items.push(classifyLine(content[i]).payload);
          i++;
        }
        blocks.push({ type: 'ol', items });
        break;
      }

      // Group consecutive table rows: first row = header, skip separator, rest = body
      case LineKind.TableRow: {
        const rawRows: string[] = [];
        while (i < content.length && classifyLine(content[i]).kind === LineKind.TableRow) {
          rawRows.push(content[i]);
          i++;
        }
        // Need at least a header row
        if (rawRows.length > 0) {
          const headers = parseTableCells(rawRows[0]);
          const bodyRows: string[][] = [];
          for (let r = 1; r < rawRows.length; r++) {
            // Skip separator rows (e.g., "| --- | --- |")
            if (isTableSeparator(rawRows[r])) continue;
            bodyRows.push(parseTableCells(rawRows[r]));
          }
          blocks.push({ type: 'table', headers, rows: bodyRows });
        }
        break;
      }

      case LineKind.Paragraph:
      default:
        blocks.push({ type: 'p', text: classified.payload });
        i++;
        break;
    }
  }

  return blocks;
}
