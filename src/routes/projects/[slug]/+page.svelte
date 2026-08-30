<script lang="ts">
	import Markdown from '$lib/components/Markdown.svelte';

	import type { PageData } from './$types';

	export let data: PageData;

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

	$: ({ project } = data);
	$: youtubeEmbedUrl = project.embedVideo ? getYoutubeEmbedUrl(project.video ?? '') : null;
</script>

<svelte:head>
	<title>{project.title} | Taine Reader</title>
</svelte:head>

<div class="container mx-auto lg:py-24">
	<div class="flex flex-col gap-8">
		<div class="relative overflow-hidden rounded-2xl shadow-xl">
			<img
				src={project.image}
				alt={project.title}
				class="absolute inset-0 h-full w-full object-cover"
			/>
			<div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
			<div class="relative z-10 flex min-h-[28rem] items-end p-5 sm:min-h-[30rem] sm:p-6 md:min-h-[32rem] md:p-10">
				<div class="flex flex-col gap-3 text-white">
					<h1 class="text-3xl font-bold sm:text-4xl md:text-6xl">{project.title}</h1>
					<p class="text-base text-white/85 sm:text-lg md:text-2xl">{project.description}</p>
					<div class="flex flex-wrap gap-2">
						{#each project.tags as tag}
							<div class="badge badge-outline border-white/60 text-white">{tag}</div>
						{/each}
					</div>
						{#if project.collaborators.length > 0}
							<div class="mt-2 flex flex-col gap-2">
							<p class="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
								Collaborators
							</p>
							<div class="flex flex-wrap gap-2">
								{#each project.collaborators as collaborator}
									{#if collaborator.link}
										<a
											href={collaborator.link}
											target="_blank"
											rel="noreferrer"
											class="btn btn-sm btn-outline border-white/50 text-white hover:border-white hover:bg-white hover:text-base-content"
										>
											{collaborator.name}
										</a>
									{:else}
										<div class="badge badge-outline border-white/60 px-4 py-3 text-white">
											{collaborator.name}
										</div>
									{/if}
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<div class="flex flex-wrap gap-2">
			<a href="/projects" class="btn btn-outline gap-2">
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
				Back to Projects
			</a>
			{#if project.github}
				<a href={project.github} target="_blank" rel="noreferrer" class="btn btn-outline gap-2">
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
						<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.1-1.3-.3-2.5-1-3.5.3-1.2.3-2.4 0-3.5 0 0-1 0-3 1.5a10 10 0 0 0-8 0C6 2 5 2 5 2c-.3 1.1-.3 2.3 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.4.5-.7 1.1-.8 1.7-.2.6-.2 1.2-.2 1.8v4" />
						<path d="M9 18c-4.5 2-5-2-7-2" />
					</svg>
					GitHub
				</a>
			{/if}
			{#if project.photoAlbum}
				<a href={project.photoAlbum} target="_blank" rel="noreferrer" class="btn btn-outline gap-2">
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
						<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
						<circle cx="9" cy="9" r="2" />
						<path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
					</svg>
					Photo Album
				</a>
			{/if}
			{#if project.externalLink}
				<a href={project.externalLink} target="_blank" rel="noreferrer" class="btn btn-outline gap-2">
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
						<path d="M15 3h6v6" />
						<path d="M10 14 21 3" />
						<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
					</svg>
					Visit Project
				</a>
			{/if}
			{#if project.video}
				<a href={project.video} target="_blank" rel="noreferrer" class="btn btn-outline gap-2">
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
						<path d="M2.5 17a24.1 24.1 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.1 24.1 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
						<path d="m10 15 5-3-5-3z" />
					</svg>
					Watch Video
				</a>
			{/if}
		</div>

		{#if youtubeEmbedUrl}
			<div class="w-full overflow-hidden rounded-2xl shadow-xl bg-base-200">
				<div class="relative w-full pt-[56.25%]">
					<iframe
						class="absolute inset-0 h-full w-full"
						src={youtubeEmbedUrl}
						title={`${project.title} video`}
						loading="lazy"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowfullscreen
					/>
				</div>
			</div>
		{/if}

		<article class="prose prose-lg max-w-none">
			<Markdown source={project.content} />
		</article>
	</div>
</div>
