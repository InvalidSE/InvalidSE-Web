<script lang="ts">

    import { onMount } from 'svelte'
    
    let show_buttons = false

    // When the component mounts, this runs (on load)
    onMount(() => {

        // if screen width is less than 700px, instantly show button container
        if (window.innerWidth < 700) {
            show_buttons = true
        } else {
            // button appear timeout
            setTimeout(() => {
                show_buttons = true
            }, 250)
        }

    })     

</script>

<div id="button-container">
    <!-- SVELTE HAS IF STATEMENTS! (They're amazing) -->
    {#if show_buttons}
        <a id="about" class="nav-button" href="/about">ABOUT</a>
        <a id="contact" class="nav-button" href="/contact">CONTACT</a>
        <a id="projects" class="nav-button" href="/projects">PROJECTS</a>
        <a id="blog" class="nav-button" rel="noreferrer" target="_blank" href="https://github.com/invalidse">GITHUB</a>
    {/if}
</div>

<style lang="scss">
    // Button animation delay variables. Code source: https://github.com/jacobtread
    $nav-delay-inc: 0.2s;
    $nav-button-count: 4;
    $nav-total-delay: $nav-delay-inc * $nav-button-count;

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
        border: 1px solid #D0D0D0;
        transition: 0.4s;

        &:hover{
            background-color: #D0D0D0;
            color:rgba(0, 0, 0, 1)
        }
    }

    // Delayed animations for each of the buttons. Code source: https://github.com/jacobtread
    $delay: $nav-total-delay;
    @for $i from ($nav-button-count + 1) to 1 {
        .nav-button:nth-child(#{$i}) {
            animation-delay: $delay;
        }
        $delay: $delay - $nav-delay-inc;
    }

    // Animation definitions
    @keyframes fly_up {
        0%   {opacity: 0; transform: translateY(0) scale(1.1);}
        100% {opacity: 1; transform: translateY(0) scale(1);}
    }
    @keyframes size_in {
        0%   {width: 0px; height: 0px; margin-top: 0rem;}
        100% {width: 250px; height: 4rem; margin-top: 2rem;}
    }

    // Media queries
    @media screen and (max-width: 700px) {
        #button-container{
            flex-direction: column;
            align-items: center;
            justify-content: left;
            margin-top: 2rem;
            height: 10rem;
            animation: none;
            width: 50%;
        }
        .nav-button{
            margin: 0.5rem 0;
            animation: fly_up $nav-total-delay forwards;
            width: 100%;
            text-align: center;
        }
    }
</style>
