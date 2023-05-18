<svelte:head>
    <title>About Me</title>
</svelte:head>

<script lang="ts">

</script>

<div class="grid-container">
    <div class="header-panel">
        <h2 id="heading">About Me</h2>
    </div>
    <div class="left-panel"></div>
    <div class="content">
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tempora magnam earum quaerat repellat soluta perferendis est! Dolorum ea quasi nulla excepturi optio mollitia provident earum. Alias aliquid nihil praesentium ad?</p>
    </div>
    <div class="right-panel"></div>
</div>

<style lang="scss">
    .grid-container {
        display: grid;
        grid-template-columns: 1fr 3fr 1fr;
        grid-template-rows: auto 100%;
        grid-column-gap: 0px;
        grid-row-gap: 0px;
        height: 100%;
    }

    .header-panel {
        grid-area: 1 / 1 / 2 / 4;
        align-items: center;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.726), rgba(123, 44, 187, 0.541)), url("/code.png") no-repeat top center fixed;
    }

    .left-panel {
        grid-area: 2 / 1 / 3 / 2; 
    }

    .content {
        grid-area: 2 / 2 / 3 / 3;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #181818;
        height: 100%;
        text-align: center;
    }

    .right-panel { 
        grid-area: 2 / 3 / 3 / 4; 
    }

    #heading {
        text-align: center;
        margin: 2em 0em;
    }
</style>