<script lang="ts">
    export let title: string = "Project Title";
    export let description: string = "This is a brief description of the project.";
    export let tags: string[] = ["HTML", "CSS", "JavaScript"];
    export let image: string = "./1.JPG";
    export let link: string = "#";
    export let readMore: boolean = true;
</script>

<div class="card bg-base-100 w-96 shadow-lg">
    <figure>
        <img
        src={image}
        alt={title}
        class="h-48 w-96 object-cover"
        />
    </figure>
    <div class="card-body">
        <h2 class="card-title">{title}</h2>
        <p>{description}</p>
        <div class="card-actions justify-end">
            {#each tags as tag}
                <div class="badge badge-outline">{tag}</div>
            {/each}
        </div>
        {#if readMore}
            <div class="card-actions justify-end mt-2">
                <a href={link} class="btn btn-xs btn-outline">Read More</a>
            </div>
        {/if}
    </div>
</div>

