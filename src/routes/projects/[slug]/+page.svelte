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
				class="w-full max-h-[32rem] object-cover"
			/>
			<div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
			<div class="absolute inset-x-0 bottom-0 p-6 md:p-10">
				<div class="flex flex-col gap-3 text-white">
					<h1 class="text-4xl md:text-6xl font-bold">{project.title}</h1>
					<p class="text-lg md:text-2xl text-white/85">{project.description}</p>
					<div class="flex flex-wrap gap-2">
						{#each project.tags as tag}
							<div class="badge badge-outline border-white/60 text-white">{tag}</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<div class="flex flex-wrap gap-2">
			<a href="/projects" class="btn btn-outline">Back to Projects</a>
			{#if project.github}
				<a href={project.github} target="_blank" rel="noreferrer" class="btn btn-outline">
					GitHub
				</a>
			{/if}
			{#if project.externalLink}
				<a href={project.externalLink} target="_blank" rel="noreferrer" class="btn btn-outline">
					Visit Project
				</a>
			{/if}
			{#if project.video}
				<a href={project.video} target="_blank" rel="noreferrer" class="btn btn-outline">
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
