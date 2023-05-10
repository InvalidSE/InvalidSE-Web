<svelte:head>
    <title>Taine Reader</title>
</svelte:head>
<script lang="ts">
    import { onMount } from 'svelte'

    let show_title = false
    let show_button_container = false
    let show_buttons = false

    onMount(() => {
        show_title = true

        // start button animation after 1 second 
        setTimeout(() => {
            show_button_container = true

            // second button animation after 2 seconds
            setTimeout(() => {
                show_buttons = true
            }, 750)
        }, 500)

        
    })
</script>

<div class="title-container">
    {#if show_title}
    <h1 id="name">Taine Reader</h1>
    <div id="username-container">
        <div class="name-underline"/>
        <h2 id="username">Invalid<i>SE</i></h2>
        <div class="name-underline"/>
    </div>
    {/if}
    {#if show_button_container}
        <div id="button-container">
            {#if show_buttons}
                <a id="about" class="nav-button" href="/about">ABOUT</a>
                <a id="contact" class="nav-button" href="/contact">CONTACT</a>
                <a id="projects" class="nav-button" href="/projects">PROJECTS</a>
                <a id="blog" class="nav-button" href="/blog">BLOG</a>
            {/if}
        </div>
    {/if}
</div>




<style lang="scss">
    .title-container {
        display: flex;
        margin: 0;
        width: 100vw;
        height: 100vh;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.52), rgba(117, 19, 93, 0.73)), url("/blender-logo.png");
        background-repeat: no-repeat;
        background-position: center;
    }
    #username-container{
        display: flex;
        flex-direction: row;
        align-items: left;
        justify-content: center;
        animation-name: fade_in;
        animation-duration: 4s;
    }
    .name-underline{
        width: 250px;
        height: 12px;
        background-color: #D0D0D0;
        box-shadow: 0 0 10px #d0d0d077;
        margin: 0;
        animation-name: underline_animation;
        animation-duration: 2s;
    }
    #name {
        animation-name: fade_in;
        animation-duration: 4s;
    }
    #button-container{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        animation-name: size_in;
        margin-top: 2rem;
        height: 4rem;
        animation-duration: 1s;
    }
    .nav-button{
        margin: 0 0.5rem;
        padding: 1rem 1rem 0.75rem 1rem;
        border-radius: 0.75rem;
        background-color: rgba(0, 0, 0, 0.205);
        color: #D0D0D0;
        text-decoration: none;
        font-size: 1.5rem;
        font-weight: bold;
        animation-name: fade_in;
        animation-duration: 4s;
        border-bottom: 5px solid #D0D0D0;
        box-shadow: 0 0 10px #d0d0d077;
        transition: transform 0.5s, background-color 0.5s, box-shadow 0.5s, border-bottom 0.5s;
    }
    .nav-button:hover{
        transform: scale(1.1);
        background-color: rgba(0, 0, 0, 0.5);
        box-shadow: 0 0 10px #d0d0d0;
        border-bottom: 5px solid #d0d0d0;
        
    }
    @keyframes underline_animation {
        0%   {width: 0px;}
        100% {width: 250px;}
    }
    @keyframes fade_in {
        0%   {opacity: 0;}
        100% {opacity: 1;}
    }
    @keyframes size_in {
        0%   {width: 0px; height: 0px; margin-top: 0rem;}
        100% {width: 250px; height: 4rem; margin-top: 2rem;}
    }
</style>