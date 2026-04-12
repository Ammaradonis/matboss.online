// ---------------------------------------------------------------------------
// ContentRenderer.tsx — Renders parsed Block[] as styled React components
//
// Two layers:
//   1. formatInline()  — converts **bold** and *italic* to React elements
//   2. ContentRenderer — maps each Block to the right JSX with Tailwind styles
//
// No dangerouslySetInnerHTML. All output is safe React elements.
// ---------------------------------------------------------------------------

import { memo, useMemo, type ReactNode } from 'react';
import { parseContent, type Block } from '../lib/contentParser';

// ---- Inline formatting engine ---------------------------------------------
//
// Splits text on **bold** and *italic* markers using a single regex pass.
// Returns an array of strings and React elements that can be rendered directly.
//
// The regex uses a non-greedy match and checks for ** before * so that
// **bold** is not misread as *italic* with extra asterisks.

const INLINE_RE = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;

function formatInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex state for each call
  INLINE_RE.lastIndex = 0;

  while ((match = INLINE_RE.exec(text)) !== null) {
    // Push any plain text before this match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2] !== undefined) {
      // **bold** — match[2] is the inner text
      parts.push(<strong key={match.index} className="text-white font-semibold">{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      // *italic* — match[3] is the inner text
      parts.push(<em key={match.index} className="italic text-gray-300">{match[3]}</em>);
    }

    lastIndex = match.index + match[0].length;
  }

  // Push any remaining plain text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // If no formatting was found, return the raw string (avoids unnecessary arrays)
  return parts.length === 0 ? [text] : parts;
}

// ---- Block renderer -------------------------------------------------------

function renderBlock(block: Block, index: number): ReactNode {
  switch (block.type) {
    case 'h2':
      return (
        <h2
          key={index}
          className="font-heading text-2xl sm:text-3xl text-white mt-10 mb-4"
        >
          {formatInline(block.text)}
        </h2>
      );

    case 'h3':
      return (
        <h3
          key={index}
          className="font-heading text-xl sm:text-2xl text-white mt-8 mb-3"
        >
          {formatInline(block.text)}
        </h3>
      );

    case 'p':
      return (
        <p
          key={index}
          className="text-gray-400 text-sm sm:text-base leading-relaxed"
        >
          {formatInline(block.text)}
        </p>
      );

    case 'blockquote':
      return (
        <blockquote
          key={index}
          className="border-l-2 border-dojo-red/40 pl-4 py-1 text-gray-300 italic text-sm sm:text-base leading-relaxed"
        >
          {formatInline(block.text)}
        </blockquote>
      );

    case 'ul':
      return (
        <ul
          key={index}
          className="list-disc list-inside space-y-1 text-gray-400 text-sm sm:text-base leading-relaxed ml-1"
        >
          {block.items.map((item, li) => (
            <li key={li}>{formatInline(item)}</li>
          ))}
        </ul>
      );

    case 'ol':
      return (
        <ol
          key={index}
          className="list-decimal list-inside space-y-1 text-gray-400 text-sm sm:text-base leading-relaxed ml-1"
        >
          {block.items.map((item, li) => (
            <li key={li}>{formatInline(item)}</li>
          ))}
        </ol>
      );

    case 'table':
      return (
        <div key={index} className="overflow-x-auto my-2 rounded border border-white/10">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-[11px] font-mono text-gray-400 uppercase tracking-wider">
              <tr>
                {block.headers.map((header, hi) => (
                  <th key={hi} className="px-4 py-2.5 font-medium">
                    {formatInline(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {block.rows.map((row, ri) => (
                <tr key={ri} className="text-gray-400">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2">
                      {formatInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'hr':
      return (
        <hr key={index} className="border-white/10 my-8" />
      );
  }
}

// ---- Public component -----------------------------------------------------

interface ContentRendererProps {
  content: string[];
}

/**
 * Top-level component: parses raw content strings into blocks, then renders.
 * Memoized so re-renders only happen when content actually changes.
 */
const ContentRenderer = memo(function ContentRenderer({ content }: ContentRendererProps) {
  const blocks = useMemo(() => parseContent(content), [content]);

  return (
    <div className="space-y-5">
      {blocks.map(renderBlock)}
    </div>
  );
});

export default ContentRenderer;
