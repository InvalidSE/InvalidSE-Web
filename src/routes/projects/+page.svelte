<script lang="ts">
	import ProjectDisplay from '$lib/components/ProjectDisplay.svelte';
	import { projects } from '$lib/projects';
</script>

<svelte:head></svelte:head>

<div class="container mx-auto lg:py-40">
	<section class="title">
		<div class=" flex flex-col">
			<div>
				<span class="text-5xl md:text-7xl lg:text-8xl"> My </span><span
					class="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-primary via-accent to-primary text-transparent bg-clip-text animate-gradient bg-300%"
				>
					Projects
				</span>
			</div>
			<span class="my-5 text-xl md:text-2xl lg:text-3xl">
				Here's some of my favourite projects I've worked on.
			</span>
			<div class="flex flex-col sm:flex-row lg:flex-row gap-2 items-center">
				<div class="flex flex-col sm:flex-row lg:flex-row gap-2 items-center">
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
		</div>
	</section>
	<div class="spacer my-20" />
	<section class="content flex flex-col gap-20">
		<section class="projects">
			<div class="spacer my-4" />
			<div class="flex flex-wrap flex-row gap-2">
				{#each projects as project}
					<ProjectDisplay {project} />
				{/each}
			</div>
		</section>
	</section>
</div>
