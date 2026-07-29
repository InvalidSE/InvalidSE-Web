<script lang="ts">
  export let data: {
    photos: {
      name: string;
      src: string;
      alt: string;
      width: number | null;
      height: number | null;
    }[];
  };

	let selectedPhoto: { name: string; src: string; alt: string } | null = null;

	const openPhoto = (photo: { name: string; src: string; alt: string }) => {
		selectedPhoto = photo;
	};

	const registerPhotoImage = (node: HTMLImageElement) => {
		const markLoaded = () => {
			requestAnimationFrame(() => {
				node.classList.add('photo-loaded');
			});
		};

		if (node.complete) {
			markLoaded();
		} else {
			node.addEventListener('load', markLoaded, { once: true });
		}

		return {
			destroy() {
				node.removeEventListener('load', markLoaded);
			}
		};
	};

	const closePhoto = () => {
		selectedPhoto = null;
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			closePhoto();
		}
	};
</script>

<svelte:head>
	<title>Photography</title>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="container mx-auto lg:py-40">
	<section class="title">
		<div class="flex flex-col">
			<div>
				<span class="text-5xl md:text-7xl lg:text-8xl"> My </span><span
					class="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-primary via-accent to-primary text-transparent bg-clip-text animate-gradient bg-300%"
				>
					Photography
				</span>
			</div>
			<span class="my-5 max-w-3xl text-xl md:text-2xl lg:text-3xl">
                Here's some of my favourite photos I've taken.
			</span>
			<div class="flex flex-col items-center gap-2 sm:flex-row lg:flex-row">
				<a href="/" class="btn btn-outline gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="m12 19-7-7 7-7" />
					<path d="M19 12H5" />
				</svg>
				Back Home
			</a>
			</div>
		</div>
	</section>
	<div class="spacer my-20" />
	<section class="content flex flex-col gap-10">
		{#if data.photos.length > 0}
			<div class="photo-grid">
				{#each data.photos as photo}
					<button
						type="button"
						class="photo-card"
						on:click={() => openPhoto(photo)}
						aria-label={`Open ${photo.alt}`}
						style:aspect-ratio={photo.width && photo.height
							? `${photo.width} / ${photo.height}`
							: undefined}
					>
						<img
							src={photo.src}
							alt={photo.alt}
							loading="lazy"
							width={photo.width ?? undefined}
							height={photo.height ?? undefined}
							use:registerPhotoImage
						/>
					</button>
				{/each}
			</div>
		{:else}
			<div class="rounded-[2rem] border border-base-300 bg-base-200/60 px-8 py-16 text-center shadow-sm">
				<p class="text-2xl font-semibold">No photos yet</p>
				<p class="mt-3 text-base-content/70">
                    My bad everyone! I'll upload them soon I promise. I've forgot to update this for: {Math.floor((Date.now() - new Date('2026-07-29').getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
			</div>
		{/if}
	</section>
</div>

{#if selectedPhoto}
	<div class="photo-lightbox" aria-modal="true" role="dialog" aria-label={selectedPhoto.alt}>
		<button type="button" class="photo-lightbox-backdrop" on:click={closePhoto} aria-label="Close photo viewer"></button>
		<div class="photo-lightbox-content">
			<button type="button" class="photo-lightbox-close" on:click={closePhoto} aria-label="Close photo viewer">
				×
			</button>
			<img src={selectedPhoto.src} alt={selectedPhoto.alt} class="photo-lightbox-image" />
			<a href={selectedPhoto.src} target="_blank" rel="noreferrer" class="photo-lightbox-link">
				Open original
			</a>
		</div>
	</div>
{/if}

<style>
	.photo-grid {
		columns: 1;
		column-gap: 0.65rem;
	}

	.photo-card {
		display: block;
		width: 100%;
		padding: 0;
		border: 0;
		overflow: hidden;
		margin-bottom: 0.65rem;
		break-inside: avoid;
		border-radius: 0.75rem;
		cursor: zoom-in;
		background: color-mix(in srgb, oklch(var(--b2)) 88%, black 12%);
		transition: opacity 180ms ease;
	}

	.photo-card:hover {
		opacity: 0.9;
	}

	.photo-card img {
		display: block;
		width: 100%;
		height: auto;
		opacity: 0;
		transition: opacity 400ms ease-out;
	}

	.photo-card img:global(.photo-loaded) {
		opacity: 1;
	}

	.photo-lightbox {
		position: fixed;
		inset: 0;
		z-index: 60;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.photo-lightbox-backdrop {
		position: absolute;
		inset: 0;
		border: 0;
		background: rgb(15 23 42 / 0.84);
		backdrop-filter: blur(6px);
	}

	.photo-lightbox-content {
		position: relative;
		z-index: 1;
		display: flex;
		max-width: min(96vw, 1200px);
		max-height: 92vh;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.photo-lightbox-close {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		width: 2.5rem;
		height: 2.5rem;
		border: 0;
		border-radius: 999px;
		font-size: 1.75rem;
		line-height: 1;
		color: white;
		background: rgb(15 23 42 / 0.55);
		cursor: pointer;
	}

	.photo-lightbox-image {
		display: block;
		max-width: 100%;
		max-height: calc(92vh - 3.5rem);
		border-radius: 0.75rem;
	}

	.photo-lightbox-link {
		color: white;
		text-decoration: underline;
		text-underline-offset: 0.18em;
	}

	@media (min-width: 640px) {
		.photo-grid {
			columns: 2;
			column-gap: 0.75rem;
		}
	}

	@media (min-width: 1024px) {
		.photo-grid {
			columns: 3;
		}
	}
</style>
