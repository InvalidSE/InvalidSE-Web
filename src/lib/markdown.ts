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

function isImageUrl(url: string): boolean {
	return /\.(avif|gif|jpe?g|png|svg|webp)(?:[#?].*)?$/i.test(url);
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

type ParsedMarkdownLink = {
	label: string;
	url: string;
	isImage: boolean;
	endIndex: number;
};

function unescapeMarkdownText(value: string): string {
	return value.replace(/\\(.)/g, '$1');
}

function parseMarkdownLinkAt(source: string, startIndex: number): ParsedMarkdownLink | null {
	const isImage = source[startIndex] === '!';
	const openBracketIndex = isImage ? startIndex + 1 : startIndex;

	if (source[openBracketIndex] !== '[') {
		return null;
	}

	let labelEndIndex = -1;

	for (let index = openBracketIndex + 1; index < source.length; index += 1) {
		const character = source[index];

		if (character === '\\') {
			index += 1;
			continue;
		}

		if (character === ']') {
			labelEndIndex = index;
			break;
		}
	}

	if (labelEndIndex === -1 || source[labelEndIndex + 1] !== '(') {
		return null;
	}

	let depth = 1;
	let urlEndIndex = -1;

	for (let index = labelEndIndex + 2; index < source.length; index += 1) {
		const character = source[index];

		if (character === '\\') {
			index += 1;
			continue;
		}

		if (character === '(') {
			depth += 1;
			continue;
		}

		if (character === ')') {
			depth -= 1;

			if (depth === 0) {
				urlEndIndex = index;
				break;
			}
		}
	}

	if (urlEndIndex === -1) {
		return null;
	}

	return {
		label: unescapeMarkdownText(source.slice(openBracketIndex + 1, labelEndIndex)),
		url: sanitizeUrl(unescapeMarkdownText(source.slice(labelEndIndex + 2, urlEndIndex))),
		isImage,
		endIndex: urlEndIndex + 1
	};
}

function parseMarkdownImage(line: string): { alt: string; url: string } | null {
	const trimmed = line.trim();
	const parsed = parseMarkdownLinkAt(trimmed, 0);

	if (!parsed || !parsed.isImage || parsed.endIndex !== trimmed.length) {
		return null;
	}

	return {
		alt: parsed.label,
		url: parsed.url
	};
}

function isPdfUrl(url: string): boolean {
	return /\.pdf(?:[#?].*)?$/i.test(url);
}

function getFileName(url: string): string {
	const [path] = url.split(/[?#]/, 1);
	return decodeURIComponent(path.split('/').pop() ?? 'document.pdf');
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
	const replacements: string[] = [];
	let text = source;

	text = text.replace(/`([^`]+)`/g, (_, code: string) => {
		const token = `@@INLINE_${replacements.length}@@`;
		replacements.push(`<code>${escapeHtml(code)}</code>`);
		return token;
	});

	let withInlineElements = '';

	for (let index = 0; index < text.length; ) {
		const parsed = parseMarkdownLinkAt(text, index);

		if (!parsed) {
			withInlineElements += text[index];
			index += 1;
			continue;
		}

		const token = `@@INLINE_${replacements.length}@@`;

		if (parsed.isImage) {
			replacements.push(
				`<img src="${escapeHtml(parsed.url)}" alt="${escapeHtml(parsed.label)}" />`
			);
		} else {
			const attrs = isImageUrl(parsed.url)
				? ' class="markdown-lightbox-link"'
				: isExternalUrl(parsed.url)
					? ' target="_blank" rel="noreferrer"'
					: '';
			replacements.push(
				`<a href="${escapeHtml(parsed.url)}"${attrs}>${escapeHtml(parsed.label)}</a>`
			);
		}

		withInlineElements += token;
		index = parsed.endIndex;
	}

	let html = escapeHtml(withInlineElements);

	html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
	html = html.replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>');
	html = html.replace(/(^|[\s(])_([^_]+)_(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>');

	return replacements.reduce(
		(output, replacement, index) => output.replace(`@@INLINE_${index}@@`, replacement),
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
	transparent: boolean;
};

function parseGalleryOptions(line: string): GalleryOptions | null {
	const match = line.trim().match(/^:::gallery(?:\s+(.+))?$/);

	if (!match) {
		return null;
	}

	const rawOptions = match[1]?.trim();

	if (!rawOptions) {
		return { showCaptions: false, transparent: false };
	}

	const tokens = rawOptions.split(/\s+/).filter(Boolean);
	const normalizedTokens = tokens.map((token) => token.toLowerCase());
	const maxColumnsToken = tokens.find((token) => /^\d+$/.test(token));
	const parsedMaxColumns =
		maxColumnsToken === undefined ? undefined : Number.parseInt(maxColumnsToken, 10);
	const showCaptions = normalizedTokens.includes('showtext');
	const transparent = normalizedTokens.includes('transparent');

	return {
		maxColumns:
			parsedMaxColumns !== undefined && parsedMaxColumns > 0 ? parsedMaxColumns : undefined,
		showCaptions,
		transparent
	};
}

function renderGallery(lines: string[], options: GalleryOptions): string {
	const galleryItems = lines
		.map(parseMarkdownImage)
		.filter((item): item is { alt: string; url: string } => item !== null && !isPdfUrl(item.url));

	const items = galleryItems
		.map(({ alt, url }) => {
			const caption =
				options.showCaptions && alt ? `<figcaption>${renderInlineMarkdown(alt)}</figcaption>` : '';
			return `<figure class="markdown-gallery-item"><div class="markdown-gallery-media"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" /></div>${caption}</figure>`;
		})
		.join('');

	const galleryClass =
		[
			'markdown-gallery',
			galleryItems.length === 1 ? 'markdown-gallery--single' : '',
			options.maxColumns !== undefined ? 'markdown-gallery--capped' : '',
			options.maxColumns === 1 ? 'markdown-gallery--full-width' : '',
			options.transparent ? 'markdown-gallery--transparent' : ''
		]
			.filter(Boolean)
			.join(' ');
	const style =
		options.maxColumns !== undefined
			? ` style="--markdown-gallery-max-columns: ${options.maxColumns};"`
			: '';
	const dataMaxColumns =
		options.maxColumns !== undefined
			? ` data-max-columns="${options.maxColumns}"`
			: '';

	return `<div class="${galleryClass}"${style}${dataMaxColumns}>${items}</div>`;
}

function renderImageBlock(url: string, alt: string): string {
	return `<div class="markdown-gallery markdown-gallery--single markdown-gallery--transparent"><figure class="markdown-gallery-item"><div class="markdown-gallery-media"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" /></div></figure></div>`;
}

function renderPdfBlock(url: string, alt: string): string {
	const label = alt.trim() || getFileName(url);

	return `<figure class="markdown-pdf"><div class="markdown-pdf-header"><span class="markdown-pdf-title">${escapeHtml(label)}</span><a class="btn btn-sm btn-outline markdown-pdf-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Open PDF</a></div><div class="markdown-pdf-frame"><iframe src="${escapeHtml(url)}#view=FitH" title="${escapeHtml(label)}" loading="lazy"></iframe></div></figure>`;
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

		const media = parseMarkdownImage(line);
		if (media && isPdfUrl(media.url)) {
			blocks.push(renderPdfBlock(media.url, media.alt));
			index += 1;
			continue;
		}

		if (media) {
			blocks.push(renderImageBlock(media.url, media.alt));
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
