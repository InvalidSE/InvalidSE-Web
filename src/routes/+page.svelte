<svelte:head>
    <title>InvalidSE</title>
</svelte:head>

<script lang="ts">
    import MainHeader from '../lib/components/main-header.svelte'
	import MainNav from '../lib/components/main-nav.svelte';
</script>

<div class="title-container">

    <MainHeader/>
    <MainNav/>

</div>

<style lang="scss">

    .title-container {
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.726), rgba(123, 44, 187, 0.541)), url("/logo-render.webp") no-repeat center center fixed;
        background-size: cover;

        margin: 0;
        width: 100vw;
        height: 100vh;

        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
    }

    // Media Queries
    @media screen and (max-width: 700px) {
        .title-container{
            justify-content: left;
            padding-top: 15vh;
        }
    }

</style>