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

        // start button box animation
        setTimeout(() => {
            show_button_container = true

            // button appear animation
            setTimeout(() => {
                show_buttons = true
            }, 500)

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
    
    // Button animation delay variables
    $nav-delay-inc: 0.2s;
    $nav-button-count: 4;
    $nav-total-delay: $nav-delay-inc * $nav-button-count;

    .title-container {
        display: flex;
        margin: 0;
        width: 100vw;
        height: 100vh;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        // background: linear-gradient(to bottom, rgba(0, 0, 0, 0.52), rgba(117, 19, 93, 0.73)), url("/blender-logo.png") no-repeat center center fixed;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.726), rgba(123, 44, 187, 0.541)), url("/blender-logo.png") no-repeat center center fixed;
    }

    
    #username-container{
        display: flex;
        flex-direction: row;
        align-items: left;
        justify-content: center;
        animation-name: fade_in;
        animation-duration: 2s;
    }
    #username {
        text-shadow: 0 0 10px #18181877;
    }   
    .name-underline{
        width: 250px;
        height: 12px;
        background-color: #D0D0D0;
        box-shadow: 0 0 10px #18181877;
        margin: 0;
        animation-name: underline_animation;
        animation-duration: 1s;
    }
    #name {
        animation: fade_in 2s;
        text-shadow: 0 0 10px #18181877;
    }
    #button-container{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        animation: size_in 1s;
        margin-top: 2rem;
        height: 4rem;
    }
    .nav-button{
        margin: 0 1rem;
        padding: 1rem;
        border-radius: 0.5rem;
        background-color: rgba(0, 0, 0, 0.205);
        text-decoration: none;
        font-size: 1.5rem;
        font-weight: bold;
        opacity: 0;
        animation: fly_up $nav-total-delay forwards;
        border: 3px solid #D0D0D0;
        box-shadow: 0 0 10px #18181877;
        transition: transform 0.5s, background-color 0.5s, box-shadow 0.5s, border-bottom 0.5s;

        &:hover{
            background-color: rgba(0, 0, 0, 0.5);
            box-shadow: 0 0 10px rgb(88, 88, 88);
        }
    }

    // Delayed animations for each of the buttons
    $delay: $nav-total-delay;
    @for $i from ($nav-button-count + 1) to 1 {
        .nav-button:nth-child(#{$i}) {
            animation-delay: $delay;
        }
        $delay: $delay - $nav-delay-inc;
    }
    
    // Animation definitions
    @keyframes underline_animation {
        0%   {width: 0px;}
        100% {width: 250px;}
    }
    @keyframes fade_in {
        0%   {opacity: 0;}
        100% {opacity: 1;}
    }
    @keyframes fly_up {
        0%   {opacity: 0; transform: translateY(0) scale(1.1);}
        100% {opacity: 1; transform: translateY(0) scale(1);}
    }
    @keyframes size_in {
        0%   {width: 0px; height: 0px; margin-top: 0rem;}
        100% {width: 250px; height: 4rem; margin-top: 2rem;}
    }
</style>