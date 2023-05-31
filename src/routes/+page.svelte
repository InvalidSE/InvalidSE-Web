<svelte:head>
    <title>Taine Reader</title>
</svelte:head>

<script lang="ts">
    import { onMount } from 'svelte'
    import MainHeader from '../lib/components/main-header.svelte'
	import MainNav from '../lib/components/main-nav.svelte';
</script>

<div class="title-container">

    <MainHeader/>
    <MainNav/>

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
        // background: linear-gradient(to bottom, rgba(0, 0, 0, 0.52), rgba(117, 19, 93, 0.73)), url("/blender-logo.png") no-repeat center center fixed;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.726), rgba(123, 44, 187, 0.541)), url("/blender-logo.png") no-repeat center center fixed;
    }

</style>