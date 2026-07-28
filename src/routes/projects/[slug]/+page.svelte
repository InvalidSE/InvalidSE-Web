<script lang="ts">
  import type { Project } from '$lib/projects';
  import { parseMarkdownDocument } from '$lib/markdown';

  export let data: {
    project: Project;
    content: string | null;
  };

  const project = data.project;
  const content = data.content;
  const parsedContent = content ? parseMarkdownDocument(content) : { metadata: {}, body: '', html: '' };
  const metadata = parsedContent.metadata as Record<string, string | string[] | undefined>;
  const articleTitle = typeof metadata.title === 'string' && metadata.title.trim() ? metadata.title : project.title;
  const articleSummary = typeof metadata.summary === 'string' && metadata.summary.trim() ? metadata.summary : project.description;
  const articleTags = Array.isArray(metadata.tags) ? metadata.tags : project.tags;
  const heroImage = typeof metadata.heroImage === 'string' && metadata.heroImage.trim() ? metadata.heroImage : null;
  const heroTitlePosition = typeof metadata.heroTitlePosition === 'string' ? metadata.heroTitlePosition : 'below';
  const renderedContent = parsedContent.html;
</script>

<svelte:head>
  <title>{project.title} | InvalidSE</title>
  <meta name="description" content={project.description} />
</svelte:head>

<div class="container mx-auto px-4 py-12 lg:py-20">
  {#if heroImage}
    <div class="mb-8 overflow-hidden rounded-3xl border border-base-300 shadow-sm">
      {#if heroTitlePosition === 'overlay'}
        <div class="relative min-h-[24rem]">
          <img src={heroImage} alt={articleTitle} class="h-[24rem] w-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div class="absolute inset-x-0 bottom-0 p-8 text-white">
            <p class="text-sm uppercase tracking-[0.2em] text-primary-content/80">Project write-up</p>
            <h1 class="text-4xl font-bold mb-3">{articleTitle}</h1>
            <p class="text-xl text-primary-content/90">{articleSummary}</p>
          </div>
        </div>
      {:else}
        <img src={heroImage} alt={articleTitle} class="h-[22rem] w-full object-cover" />
        <div class="p-8">
          <p class="text-sm uppercase tracking-[0.2em] text-primary">Project write-up</p>
          <h1 class="text-4xl font-bold mb-3">{articleTitle}</h1>
          <p class="text-xl text-base-content/70">{articleSummary}</p>
          {#if articleTags.length > 0}
            <div class="mt-4 flex flex-wrap gap-2">
              {#each articleTags as tag}
                <span class="badge badge-outline">{tag}</span>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  <a href="/projects" class="btn btn-outline btn-sm mb-8">← Back to projects</a>

  <article class="prose prose-lg max-w-none">
    {#if !heroImage}
      <header class="mb-8">
        <p class="text-sm uppercase tracking-[0.2em] text-primary">Project write-up</p>
        <h1 class="text-4xl font-bold mb-3">{articleTitle}</h1>
        <p class="text-xl text-base-content/70">{articleSummary}</p>
        {#if articleTags.length > 0}
          <div class="mt-4 flex flex-wrap gap-2">
            {#each articleTags as tag}
              <span class="badge badge-outline">{tag}</span>
            {/each}
          </div>
        {/if}
      </header>
    {/if}

    {#if content}
      <div class="space-y-4">
        {@html renderedContent}
      </div>
    {:else}
      <div class="alert alert-info">
        <span>No article has been written for this project yet.</span>
      </div>
    {/if}
  </article>
</div>
