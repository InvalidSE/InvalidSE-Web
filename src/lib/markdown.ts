export interface ParsedMarkdown {
  metadata: Record<string, string | string[] | undefined>;
  body: string;
  html: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatInline(text: string): string {
  let output = escapeHtml(text);

  output = output.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="rounded-2xl my-6 shadow-lg w-full max-w-full mx-auto lg:max-w-[70%]" />'
  );
  output = output.replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  output = output.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  output = output.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  return output;
}

function parseScalar(value: string): string {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

export function parseMarkdownDocument(markdown: string): ParsedMarkdown {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const metadata: Record<string, string | string[] | undefined> = {};

  if (lines[0]?.trim() === '---') {
    const closingIndex = lines.slice(1).findIndex((line) => line.trim() === '---');

    if (closingIndex >= 0) {
      const frontmatterLines = lines.slice(1, closingIndex + 1);
      let currentKey: string | null = null;

      for (const line of frontmatterLines) {
        const trimmed = line.trim();

        if (!trimmed) {
          continue;
        }

        const listMatch = trimmed.match(/^-\s+(.+)$/);
        if (listMatch) {
          if (!currentKey) {
            continue;
          }

          const existing = metadata[currentKey];
          const nextItems = Array.isArray(existing) ? [...existing] : [];
          nextItems.push(parseScalar(listMatch[1]));
          metadata[currentKey] = nextItems;
          continue;
        }

        const keyMatch = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
        if (keyMatch) {
          const [, key, value] = keyMatch;
          currentKey = key;

          if (value) {
            metadata[key] = parseScalar(value);
            currentKey = null;
          } else {
            metadata[key] = [];
          }
        }
      }

      const body = lines.slice(closingIndex + 2).join('\n').trim();
      return {
        metadata,
        body,
        html: renderMarkdownBody(body)
      };
    }
  }

  return {
    metadata,
    body: normalized.trim(),
    html: renderMarkdownBody(normalized.trim())
  };
}

function renderMarkdownBody(markdown: string): string {
  const lines = markdown.trim().split(/\n/);
  const htmlParts: string[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      htmlParts.push(`<p>${formatInline(paragraphLines.join(' '))}</p>`);
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      htmlParts.push(`<ul>${listItems.map((item) => `<li>${formatInline(item)}</li>`).join('')}</ul>`);
      listItems = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^#{1,6}\s+/.test(trimmed)) {
      flushParagraph();
      flushList();
      const level = trimmed.match(/^#+/)?.[0].length ?? 1;
      const content = trimmed.replace(/^#{1,6}\s+/, '');
      htmlParts.push(`<h${Math.min(level, 6)}>${formatInline(content)}</h${Math.min(level, 6)}>`);
      continue;
    }

    if (/^-\s+/.test(trimmed)) {
      flushParagraph();
      listItems.push(trimmed.replace(/^-\s+/, ''));
      continue;
    }

    flushList();
    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();

  return htmlParts.join('');
}

export function renderMarkdown(markdown: string): string {
  return parseMarkdownDocument(markdown).html;
}
