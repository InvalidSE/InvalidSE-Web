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
        <div class="about-boxes">
            <div class="history">
                <h3>HISTORY</h3>
                <p>I am from Northland, New Zealand, and am currently in my final high school year. I got into actual programming originally in my first year of high school because of science fair, and have been learning ever since.</p>
            </div>
            <div class="interests"><p>A</p></div>
            <div class="projects"><p>A</p></div>
            <div class="technology"><p>A</p></div>

        </div>
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

    .right-panel { 
        grid-area: 2 / 3 / 3 / 4; 
    }

    #heading {
        text-align: center;
        margin: 2em 0em;
    }

    .about-boxes {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: auto;
    }

    .about-boxes div {
        transition: 0.25s;
        margin: 8px;
        padding: 8px 30px;
        text-align: justify;
        background-color: #181818;
        // border: rgba(123, 44, 187, 0.541) solid 2px;
        border-radius: 5px;
    }

    .history{
        grid-area: 1 / 1 / 2 / 2;
    }
    
    .interests{
        grid-area: 1 / 2 / 2 / 3;
    }

    .projects{
        grid-area: 2 / 1 / 3 / 3;
    }

    .technology{
        grid-area: 3 / 1 / 4 / 3;
    }

</style>