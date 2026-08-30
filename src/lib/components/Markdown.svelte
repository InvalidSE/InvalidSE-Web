<script lang="ts">
	import { afterUpdate, onMount, tick } from 'svelte';
	import { renderMarkdown } from '$lib/markdown';

	export let source = '';

	let host: HTMLDivElement;
	let lightboxImage = '';
	let lightboxAlt = '';
	let destroyGalleryLayout = () => {};

	function isImageUrl(url: string): boolean {
		return /\.(avif|gif|jpe?g|png|svg|webp)(?:[#?].*)?$/i.test(url);
	}

	$: html = renderMarkdown(source);

	function getImageAspectRatio(image: HTMLImageElement): number {
		const width = image.naturalWidth || image.width;
		const height = image.naturalHeight || image.height;

		if (!width || !height) {
			return 1;
		}

		return width / height;
	}

	function getGalleryColumnCount(gallery: HTMLElement): number {
		const rawMaxColumns = Number.parseInt(gallery.dataset.maxColumns ?? '', 10);
		if (Number.isFinite(rawMaxColumns) && rawMaxColumns > 0) {
			return rawMaxColumns;
		}

		const templateColumns = getComputedStyle(gallery).gridTemplateColumns;
		const columnCount = templateColumns
			.split(' ')
			.map((value) => value.trim())
			.filter(Boolean).length;

		return Math.max(1, columnCount);
	}

	function isSmallScreen(): boolean {
		return window.matchMedia('(max-width: 639px)').matches;
	}

	function clearGalleryLayout(gallery: HTMLElement) {
		gallery.style.removeProperty('width');
		gallery.style.removeProperty('margin-inline');
		gallery.style.removeProperty('grid-template-columns');
	}

	function clearGalleryItemLayout(item: HTMLElement) {
		item.style.removeProperty('--markdown-gallery-row-aspect-ratio');
	}

	function applyGalleryLayout() {
		if (!host) {
			return;
		}

		const galleries = host.querySelectorAll<HTMLElement>('.markdown-gallery:not(.markdown-gallery--single)');

		for (const gallery of galleries) {
			const items = [...gallery.querySelectorAll<HTMLElement>('.markdown-gallery-item')];
			const baseColumns = getGalleryColumnCount(gallery);
			const columns = isSmallScreen() ? Math.min(baseColumns, 2) : baseColumns;
			const gap = Number.parseFloat(getComputedStyle(gallery).gap || '16') || 16;
			const fullWidth = gallery.parentElement?.clientWidth ?? gallery.clientWidth;

			clearGalleryLayout(gallery);
			for (const item of items) {
				clearGalleryItemLayout(item);
			}

			if (isSmallScreen()) {
				const effectiveColumns = Math.max(1, Math.min(columns, items.length || 1));
				gallery.style.gridTemplateColumns = `repeat(${effectiveColumns}, minmax(0, 1fr))`;
			} else if (items.length > 0 && items.length < columns) {
				const cellWidth = (fullWidth - gap * Math.max(0, columns - 1)) / columns;
				const centeredWidth = cellWidth * items.length + gap * Math.max(0, items.length - 1);

				gallery.style.width = `${centeredWidth}px`;
				gallery.style.marginInline = 'auto';
				gallery.style.gridTemplateColumns = `repeat(${items.length}, minmax(0, 1fr))`;
			}

			for (let start = 0; start < items.length; start += columns) {
				const rowItems = items.slice(start, start + columns);
				const rowImages = rowItems
					.map((item) => item.querySelector('img'))
					.filter((image): image is HTMLImageElement => image instanceof HTMLImageElement);

				if (!rowImages.length) {
					continue;
				}

				const averageAspectRatio =
					rowImages.reduce((total, image) => total + getImageAspectRatio(image), 0) /
					rowImages.length;
				const clampedAspectRatio =
					rowImages.length === 1
						? Math.max(0.65, averageAspectRatio)
						: Math.min(2.4, Math.max(0.65, averageAspectRatio));

				for (const [index, item] of rowItems.entries()) {
					const image = rowImages[index];

					if (!(image instanceof HTMLImageElement)) {
						continue;
					}

					item.style.setProperty('--markdown-gallery-row-aspect-ratio', `${clampedAspectRatio}`);
				}
			}
		}
	}

	async function setupGalleryLayout() {
		destroyGalleryLayout();
		await tick();

		if (!host) {
			return;
		}

		const images = [...host.querySelectorAll<HTMLImageElement>('.markdown-gallery-item img')];
		const handleImageStateChange = () => applyGalleryLayout();
		const resizeObserver = new ResizeObserver(() => applyGalleryLayout());

		for (const image of images) {
			image.addEventListener('load', handleImageStateChange);
			image.addEventListener('error', handleImageStateChange);
		}

		resizeObserver.observe(host);
		requestAnimationFrame(() => applyGalleryLayout());

		destroyGalleryLayout = () => {
			for (const image of images) {
				image.removeEventListener('load', handleImageStateChange);
				image.removeEventListener('error', handleImageStateChange);
			}

			resizeObserver.disconnect();
		};
	}

	function openLightbox(event: MouseEvent) {
		const target = event.target;
		if (!(target instanceof HTMLElement)) {
			return;
		}

		const link = target.closest('a[href]');
		if (link instanceof HTMLAnchorElement && isImageUrl(link.getAttribute('href') ?? '')) {
			event.preventDefault();
			lightboxImage = link.href;
			lightboxAlt = link.textContent?.trim() ?? '';
			return;
		}

		const image = target.closest('.markdown-gallery-item img, .markdown-image img');
		if (!(image instanceof HTMLImageElement)) {
			return;
		}

		lightboxImage = image.currentSrc || image.src;
		lightboxAlt = image.alt;
	}

	function closeLightbox() {
		lightboxImage = '';
		lightboxAlt = '';
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && lightboxImage) {
			closeLightbox();
		}
	}

	onMount(() => {
		const handleClick = (event: MouseEvent) => openLightbox(event);
		host.addEventListener('click', handleClick);
		void setupGalleryLayout();

		return () => {
			host.removeEventListener('click', handleClick);
			destroyGalleryLayout();
		};
	});

	afterUpdate(() => {
		void setupGalleryLayout();
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<div bind:this={host}>
	{@html html}
</div>

{#if lightboxImage}
	<div class="markdown-lightbox" role="dialog" aria-modal="true" aria-label={lightboxAlt || 'Fullscreen image'}>
		<button
			type="button"
			class="markdown-lightbox-backdrop"
			aria-label="Close fullscreen image"
			on:click={closeLightbox}
		/>
		<button
			type="button"
			class="markdown-lightbox-close btn btn-circle btn-sm"
			aria-label="Close fullscreen image"
			on:click={closeLightbox}
		>
			✕
		</button>
		<figure class="markdown-lightbox-figure">
			<img class="markdown-lightbox-image" src={lightboxImage} alt={lightboxAlt} />
			{#if lightboxAlt}
				<figcaption class="markdown-lightbox-caption">{lightboxAlt}</figcaption>
			{/if}
		</figure>
	</div>
{/if}
