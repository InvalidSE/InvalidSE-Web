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

function getYoutubeEmbedUrl(url: string): string | null {
	if (!url) {
		return null;
	}

	try {
		const parsed = new URL(url);
		const hostname = parsed.hostname.replace(/^www\./, '');
		let videoId = '';

		if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
			videoId = parsed.searchParams.get('v') ?? '';
		} else if (hostname === 'youtu.be') {
			videoId = parsed.pathname.slice(1);
		}

		if (!videoId) {
			return null;
		}

		return `https://www.youtube.com/embed/${videoId}`;
	} catch {
		return null;
	}
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

type GalleryOptions = {
	maxColumns?: number;
	showCaptions: boolean;
};

function parseGalleryOptions(line: string): GalleryOptions | null {
	const match = line.trim().match(/^:::gallery(?:\s+(.+))?$/);

	if (!match) {
		return null;
	}

	const rawOptions = match[1]?.trim();

	if (!rawOptions) {
		return { showCaptions: true };
	}

	const [rawMaxColumns, rawShowCaptions] = rawOptions.split(/\s+/, 2);
	const parsedMaxColumns = Number.parseInt(rawMaxColumns, 10);

	if (!Number.isInteger(parsedMaxColumns) || parsedMaxColumns < 1) {
		return { showCaptions: true };
	}

	const normalizedShowCaptions = rawShowCaptions?.toLowerCase();
	const showCaptions =
		normalizedShowCaptions === undefined
			? true
			: ['true', '1', 'yes', 'on'].includes(normalizedShowCaptions);

	return {
		maxColumns: parsedMaxColumns,
		showCaptions
	};
}

function renderGallery(lines: string[], options: GalleryOptions): string {
	const galleryItems = lines
		.map(parseMarkdownImage)
		.filter((item): item is { alt: string; url: string } => item !== null);

	const items = galleryItems
		.map(({ alt, url }) => {
			const caption =
				options.showCaptions && alt ? `<figcaption>${renderInlineMarkdown(alt)}</figcaption>` : '';
			return `<figure class="markdown-gallery-item"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" />${caption}</figure>`;
		})
		.join('');

	const galleryClass =
		[
			'markdown-gallery',
			galleryItems.length === 1 ? 'markdown-gallery--single' : '',
			options.maxColumns !== undefined ? 'markdown-gallery--capped' : ''
		]
			.filter(Boolean)
			.join(' ');
	const style =
		options.maxColumns !== undefined
			? ` style="--markdown-gallery-max-columns: ${options.maxColumns};"`
			: '';

	return `<div class="${galleryClass}"${style}>${items}</div>`;
}

function renderYoutubeBlock(url: string): string {
	const embedUrl = getYoutubeEmbedUrl(url);

	if (!embedUrl) {
		return `<p><a href="${escapeHtml(sanitizeUrl(url))}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a></p>`;
	}

	return `<div class="markdown-youtube"><div class="markdown-youtube-frame"><iframe src="${escapeHtml(embedUrl)}" title="Embedded YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></div>`;
}

function isSpecialBlock(line: string): boolean {
	return Boolean(
		line.match(/^(#{1,6})\s+/) ||
			line.match(/^:::gallery(?:\s+.+)?$/) ||
			line.match(/^:::youtube\s+/) ||
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

		const galleryOptions = parseGalleryOptions(line);
		if (galleryOptions) {
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

			blocks.push(renderGallery(galleryLines, galleryOptions));
			continue;
		}

		const youtubeMatch = line.trim().match(/^:::youtube\s+(.+)$/);
		if (youtubeMatch) {
			const rawUrl = youtubeMatch[1].trim().replace(/\s+:::\s*$/, '');
			blocks.push(renderYoutubeBlock(rawUrl));
			index += 1;
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
