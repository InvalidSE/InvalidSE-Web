<svelte:head>
    <title>Taine Reader</title>
</svelte:head>
<script lang="ts">
    import { onMount } from 'svelte'

    let animate = false

    onMount(() => {
        animate = true
    })
</script>

<div class="title-container">
    {#if animate}
    <h1 id="name">Taine Reader</h1>
    <div id="username-container">
        <div class="name-underline"/>
        <h2 id="username">Invalid<i>SE</i></h2>
        <div class="name-underline"/>
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
    @keyframes underline_animation {
        0%   {width: 0px;}
        100% {width: 250px;}
    }
    @keyframes fade_in {
        0%   {opacity: 0;}
        100% {opacity: 1;}
    }
</style>