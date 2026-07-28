function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function isExternalUrl(url: string): boolean {
	return /^https?:\/\//.test(url);
}

function sanitizeUrl(url: string): string {
	const trimmed = url.trim();

	if (trimmed.startsWith('./')) {
		return trimmed.slice(1);
	}

	if (/^(https?:\/\/|mailto:|\/|\.\/|\.\.\/|#)/.test(trimmed)) {
		return trimmed;
	}

	return '#';
}

function parseMarkdownImage(line: string): { alt: string; url: string } | null {
	const match = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

	if (!match) {
		return null;
	}

	const [, alt, rawUrl] = match;
	return {
		alt,
		url: sanitizeUrl(rawUrl)
	};
}

function renderInlineMarkdown(source: string): string {
	const codeSpans: string[] = [];
	let html = escapeHtml(source);

	html = html.replace(/`([^`]+)`/g, (_, code: string) => {
		const token = `__CODE_SPAN_${codeSpans.length}__`;
		codeSpans.push(`<code>${escapeHtml(code)}</code>`);
		return token;
	});

	html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt: string, rawUrl: string) => {
		const url = sanitizeUrl(rawUrl);
		return `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" />`;
	});

	html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, rawUrl: string) => {
		const url = sanitizeUrl(rawUrl);
		const external = isExternalUrl(url);
		const attrs = external ? ' target="_blank" rel="noreferrer"' : '';
		return `<a href="${escapeHtml(url)}"${attrs}>${label}</a>`;
	});

	html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
	html = html.replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>');
	html = html.replace(/(^|[\s(])_([^_]+)_(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>');

	return codeSpans.reduce(
		(output, replacement, index) => output.replace(`__CODE_SPAN_${index}__`, replacement),
		html
	);
}

function renderList(lines: string[], ordered: boolean): string {
	const tag = ordered ? 'ol' : 'ul';
	const pattern = ordered ? /^\d+\.\s+(.*)$/ : /^[-*]\s+(.*)$/;
	const items = lines
		.map((line) => line.match(pattern)?.[1] ?? '')
		.map((item) => `<li>${renderInlineMarkdown(item)}</li>`)
		.join('');

	return `<${tag}>${items}</${tag}>`;
}

function renderGallery(lines: string[]): string {
	const items = lines
		.map(parseMarkdownImage)
		.filter((item): item is { alt: string; url: string } => item !== null)
		.map(({ alt, url }) => {
			const caption = alt ? `<figcaption>${renderInlineMarkdown(alt)}</figcaption>` : '';
			return `<figure class="markdown-gallery-item"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" />${caption}</figure>`;
		})
		.join('');

	return `<div class="markdown-gallery">${items}</div>`;
}

function isSpecialBlock(line: string): boolean {
	return Boolean(
		line.match(/^(#{1,6})\s+/) ||
			line.match(/^:::gallery\s*$/) ||
			line.match(/^```/) ||
			line.match(/^[-*]\s+/) ||
			line.match(/^\d+\.\s+/) ||
			line.match(/^>\s?/) ||
			line.match(/^(-{3,}|\*{3,}|_{3,})$/)
	);
}

export function renderMarkdown(source: string): string {
	const normalized = source.replace(/\r\n/g, '\n').trim();

	if (!normalized) {
		return '';
	}

	const lines = normalized.split('\n');
	const blocks: string[] = [];
	let index = 0;

	while (index < lines.length) {
		const line = lines[index];

		if (!line.trim()) {
			index += 1;
			continue;
		}

		const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
		if (headingMatch) {
			const [, hashes, text] = headingMatch;
			blocks.push(`<h${hashes.length}>${renderInlineMarkdown(text.trim())}</h${hashes.length}>`);
			index += 1;
			continue;
		}

		if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
			blocks.push('<hr />');
			index += 1;
			continue;
		}

		if (/^:::gallery\s*$/.test(line.trim())) {
			const galleryLines: string[] = [];
			index += 1;

			while (index < lines.length && !/^:::\s*$/.test(lines[index].trim())) {
				if (lines[index].trim()) {
					galleryLines.push(lines[index].trim());
				}
				index += 1;
			}

			if (index < lines.length) {
				index += 1;
			}

			blocks.push(renderGallery(galleryLines));
			continue;
		}

		if (line.startsWith('```')) {
			const language = line.slice(3).trim();
			const codeLines: string[] = [];
			index += 1;

			while (index < lines.length && !lines[index].startsWith('```')) {
				codeLines.push(lines[index]);
				index += 1;
			}

			if (index < lines.length) {
				index += 1;
			}

			const languageClass = language ? ` class="language-${escapeHtml(language)}"` : '';
			blocks.push(
				`<pre><code${languageClass}>${escapeHtml(codeLines.join('\n'))}</code></pre>`
			);
			continue;
		}

		if (/^>\s?/.test(line)) {
			const quoteLines: string[] = [];

			while (index < lines.length && /^>\s?/.test(lines[index])) {
				quoteLines.push(lines[index].replace(/^>\s?/, ''));
				index += 1;
			}

			blocks.push(`<blockquote><p>${renderInlineMarkdown(quoteLines.join(' '))}</p></blockquote>`);
			continue;
		}

		if (/^[-*]\s+/.test(line)) {
			const listLines: string[] = [];

			while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
				listLines.push(lines[index].trim());
				index += 1;
			}

			blocks.push(renderList(listLines, false));
			continue;
		}

		if (/^\d+\.\s+/.test(line)) {
			const listLines: string[] = [];

			while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
				listLines.push(lines[index].trim());
				index += 1;
			}

			blocks.push(renderList(listLines, true));
			continue;
		}

		const paragraphLines: string[] = [];

		while (index < lines.length && lines[index].trim() && !isSpecialBlock(lines[index])) {
			paragraphLines.push(lines[index].trim());
			index += 1;
		}

		blocks.push(`<p>${renderInlineMarkdown(paragraphLines.join(' '))}</p>`);
	}

	return blocks.join('\n');
}
