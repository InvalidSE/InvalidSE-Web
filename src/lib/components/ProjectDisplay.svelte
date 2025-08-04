<script lang="ts">
    import type { Project } from '$lib/projects';
    export let project: Project;
</script>

<div class="card bg-base-100 w-96 shadow-lg image-full hover:shadow-xl transition-shadow duration-300 cursor-pointer hover:scale-105 transition-transform duration-300 hover:translate-y-[-2px] z-0 hover:z-10">
    <figure>
        <img
        src={project.image}
        alt={project.title}
        class="h-48 w-96 object-cover"
        />
    </figure>
    <div class="card-body">
        <h2 class="card-title">{project.title}</h2>
        <p>{project.description}</p>
        {#if project.tags && project.tags.length > 0}
        <div class="card-actions justify-end">
            {#each project.tags as tag}
                <div class="badge badge-outline">{tag}</div>
            {/each}
        </div>
        {/if}
        
        {#if project.github || project.externalLink || project.video || project.link}
            <div class="mt-2 flex flex-row justify-end gap-2">
                {#if project.github}
                    <a href={project.github} target="_blank" class="btn btn-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github-icon lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                    </a>
                {/if}
                {#if project.externalLink}
                    <a href={project.externalLink} target="_blank" class="btn btn-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </a>
                {/if}
                {#if project.video}
                    <a href={project.video} target="_blank" class="btn btn-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-youtube-icon lucide-youtube"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                    </a>
                {/if}
                {#if project.link}
                    <a href={project.link} class="btn btn-xs">Read More</a>
                {/if}
            </div>
        {/if}
    </div>
</div>

