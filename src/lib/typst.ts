import { parseMarkdownDocument } from './markdown';

function transformTypstToMarkdown(input: string): string {
  return input
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        return '';
      }

      const headingMatch = trimmed.match(/^(=+)\s+(.+)$/);
      if (headingMatch) {
        const level = Math.min(headingMatch[1].length, 6);
        return `${'#'.repeat(level)} ${headingMatch[2]}`;
      }

      const imageMatch = trimmed.match(/#image\(\s*["']([^"']+)["'](?:\s*,\s*width:\s*[^)]+)?\s*\)/);
      if (imageMatch) {
        return `![image](${imageMatch[1]})`;
      }

      const linkMatch = trimmed.match(/#link\(\s*["']([^"']+)["']\s*\)\s*\[(.*?)\]/);
      if (linkMatch) {
        return `[${linkMatch[2]}](${linkMatch[1]})`;
      }

      return trimmed
        .replace(/\*([^*\n]+)\*/g, '**$1**')
        .replace(/_([^_\n]+)_/g, '*$1*');
    })
    .join('\n');
}

export function renderTypstDocument(typst: string) {
  return parseMarkdownDocument(transformTypstToMarkdown(typst));
}

export function renderContent(content: string, format: 'markdown' | 'typst') {
  if (format === 'typst') {
    return renderTypstDocument(content);
  }

  return parseMarkdownDocument(content);
}
