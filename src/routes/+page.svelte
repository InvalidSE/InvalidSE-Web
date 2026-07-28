<script lang="ts">
//   import UnderConstruction from '../lib/components/UnderConstruction.svelte';

  import ProjectDisplay from '$lib/components/ProjectDisplay.svelte';
  import { highlightedProjects } from '$lib/projects';
</script>

<svelte:head>
    <title>Taine Reader</title>
</svelte:head>

<div class="container mx-auto lg:py-40">
    <section class="title">
        <div class=" flex flex-col">
            <div>
                <span class="text-5xl md:text-7xl lg:text-8xl">
                    Kia ora, I'm 
                </span><span class="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-primary via-accent to-primary text-transparent bg-clip-text animate-gradient bg-300%">
                    Taine Reader
                </span>
            </div>
            <span class="my-5 text-xl md:text-2xl lg:text-3xl">
                I'm a computer systems engineering student at the University of Auckland
            </span>
        </div>
        <!-- <UnderConstruction /> -->
        <div class="flex flex-col sm:flex-row lg:flex-row gap-2 items-center">
            <!-- <a href="#about" class="btn btn-outline text-xl">About</a> -->
            <a href="/projects" class="btn btn-outline text-xl">Projects</a>
            <a
                href="mailto:taine@reader.nz"
                class="btn btn-outline btn-square"
                aria-label="Email"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75zm2.2-.25 6.8 5.22 6.8-5.22H5.2zm13.3 2.07-5.89 4.53a1 1 0 0 1-1.22 0L5.5 8.57v8.68c0 .14.11.25.25.25h12.5a.25.25 0 0 0 .25-.25V8.57z" />
                </svg>
            </a>
            <a
                href="https://www.linkedin.com/in/taine-reader/"
                class="btn btn-outline btn-square"
                aria-label="LinkedIn"
                target="_blank"
                rel="noreferrer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M6.94 8.5A1.56 1.56 0 1 1 6.94 5.38a1.56 1.56 0 0 1 0 3.12zM5.62 9.75h2.64V18H5.62V9.75zm4.2 0h2.53v1.13h.03c.35-.67 1.2-1.38 2.47-1.38 2.64 0 3.13 1.74 3.13 4V18h-2.64v-3.99c0-.95-.02-2.18-1.33-2.18-1.33 0-1.54 1.04-1.54 2.11V18H9.82V9.75z" />
                </svg>
            </a>
            <a
                href="https://github.com/invalidse"
                class="btn btn-outline btn-square"
                aria-label="GitHub"
                target="_blank"
                rel="noreferrer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.21.68-.48v-1.67c-2.78.6-3.37-1.18-3.37-1.18-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.61.07-.61 1 .07 1.52 1.02 1.52 1.02.88 1.5 2.31 1.07 2.87.82.09-.64.35-1.07.63-1.31-2.22-.25-4.56-1.11-4.56-4.93 0-1.09.39-1.98 1.03-2.68-.11-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.5 9.5 0 0 1 12 6.8c.85 0 1.71.11 2.51.33 1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.21 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.83-2.34 4.67-4.57 4.92.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
                </svg>
            </a>
        </div>
    </section>
    <div class="spacer my-20" />
    <section class="content flex flex-col gap-5">
        <section class="projects">
            <span class="text-5xl font-bold">Highlighted Projects</span>
            <div class="spacer my-4" />
            <div class="flex flex-wrap-reverse flex-row gap-2">
                {#each highlightedProjects as project}
                    <ProjectDisplay {project} />
                {/each}
            </div>
        </section>
        <a href="/projects" class="btn btn-outline text-xl">View All</a>
    </section>

    

    <!-- <label class="swap swap-rotate">
        <input type="checkbox" class="theme-controller" value="dracula" />

        <svg
          class="swap-off h-10 w-10 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24">
          <path
            d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
        </svg>

        <svg
          class="swap-on h-10 w-10 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24">
          <path
            d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
        </svg>
    </label> -->
</div>
