<script lang="ts">
	import { onMount } from 'svelte';
	import { renderMarkdown } from '$lib/markdown';

	export let source = '';

	let host: HTMLDivElement;
	let lightboxImage = '';
	let lightboxAlt = '';

	$: html = renderMarkdown(source);

	function openLightbox(event: MouseEvent) {
		const target = event.target;
		if (!(target instanceof HTMLElement)) {
			return;
		}

		const image = target.closest('.markdown-gallery-item img');
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

		return () => {
			host.removeEventListener('click', handleClick);
		};
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
