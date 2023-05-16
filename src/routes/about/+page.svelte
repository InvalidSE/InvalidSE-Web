<svelte:head>
    <title>About Me</title>
</svelte:head>

<script lang="ts">

</script>

<div class="grid-container">
    <div class="left-panel"></div>
    <div class="content">
        <h2>About Me</h2>
    </div>
    <div class="right-panel"></div>
</div>

<style lang="scss">
    .grid-container {
        display: grid;
        grid-template-columns: 0.5fr 1.4256fr 0.5fr;
        grid-template-rows: 1fr;
        grid-column-gap: 0px;
        grid-row-gap: 0px;
        height: 100%;
    }

    .left-panel {
        grid-area: 1 / 1 / 6 / 2; 
    }

    .content {
        grid-area: 1 / 2 / 6 / 3;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 3rem;
    }

    .right-panel { 
        grid-area: 1 / 3 / 6 / 4; 
    }
</style>