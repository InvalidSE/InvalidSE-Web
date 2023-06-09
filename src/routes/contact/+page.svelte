<svelte:head>
    <title>About Me</title>
</svelte:head>

<script lang="ts">
    import Navbar from '../../lib/components/navbar.svelte'
</script>

<div class="header-panel">
    <Navbar/>
    <h2 id="heading">Contact</h2>
</div>

<style lang="scss">

    .header-panel {
        
        align-items: center;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.726), rgba(123, 44, 187, 0.541)), url("/code.png") no-repeat top center fixed;
        height: 100vh;
    }

    #heading {
        text-align: center;
        margin: 0;
    }

    
    @media only screen and (max-width: 600px) {
        h2 {
            font-size: 2em;
        }
    }
</style>