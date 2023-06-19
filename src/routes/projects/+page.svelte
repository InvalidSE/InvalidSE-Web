<svelte:head>
    <title>About Me</title>
</svelte:head>

<script lang="ts">
    import '../../lib/global.scss'
    import Navbar from '../../lib/components/navbar.svelte'
</script>

<div class="grid-container">
    <div class="header-panel">
        <Navbar />
        <h2 id="heading">Projects</h2>
    </div>
    <div class="left-panel"></div>
    <div class="content">
        <!-- <img src="https://ghchart.rshah.org/7b2cbb/InvalidSE" alt="InvalidSE's Github Commit History" />     -->
        <div class="project-boxes">

            <div class="needy-appliances">
                <h3>Needy Appliances</h3>
                <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nobis officiis qui necessitatibus delectus ratione excepturi minus ipsa sint perspiciatis explicabo maxime expedita sed, provident, aperiam nulla eligendi at corporis earum.</p>
            </div>
            <div class="reptile-monitor">
                <h3>Reptile Monitor</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloribus voluptatem, aliquam magnam obcaecati veniam maiores sapiente earum, enim libero eius dolorem id exercitationem quam dolores optio velit amet? Optio, blanditiis.</p>
            </div>
            <div class="dirtywatts">
                <h3>DIRTYWATTS</h3>
                <p>DirtyWatts was a project me and the Questionable Research Labs team. Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex, quidem ab. Recusandae laudantium quibusdam error ex, atque cum, porro voluptate cupiditate sunt nesciunt id! Dolores saepe deserunt suscipit nam voluptatibus?</p>
                <div class="buttons-box">
                    <a class="projects-link" href="/projects/dirtywatts">More Details</a>
                    <a class="projects-link" href="https://github.com/questionable-research-labs/DirtyWatts" target="_blank">GitHub</a>
                    <a class="projects-link" href="https://dirtywatts.nz/" target="_blank">Website</a>
                </div>
            </div>

            <div class="questionable-quote-app">
                <h3>Questionable Quote App</h3>
                <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Excepturi aliquid incidunt est minus atque id sapiente similique omnis adipisci laudantium ab dolorem, cupiditate doloribus itaque aut! Atque nulla doloremque quis?</p>
                <div class="buttons-box">
                    <a class="projects-link" href="/projects/questionable-quote-app">More Details</a>
                    <a class="projects-link" href="https://quotes.laspruca.nz" target="_blank">Website</a>
                </div>
            </div>            

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

    .project-boxes {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: auto;
    }

    .project-boxes > div {
        transition: 0.25s;
        margin: 8px;
        padding: 8px 30px 30px 30px;
        text-align: justify;
        background-color: #181818;
        // border: rgba(123, 44, 187, 0.541) solid 2px;
        border-radius: 5px;
        border: #181818 solid 2px;

        &:hover {
            border: #2d2d2d solid 2px;
            transform: scale(1.05);

            // tilt forward effect
            transform: perspective(500px) rotateX(5deg);
        }
    }

    .needy-appliances{
        grid-area: 1 / 1 / 2 / 2;
    }
    
    .reptile-monitor{
        grid-area: 1 / 2 / 2 / 3;
    }

    .dirtywatts{
        grid-area: 2 / 1 / 3 / 3;
    }

    .questionable-quote-app{
        grid-area: 3 / 1 / 4 / 3;
    }

    .buttons-box {
        display: flex;
        justify-content: left;
        padding: 0 !important;
        margin: 0 !important;
        gap: 10px;

        .projects-link {
            padding: 1em 1.5em;
            border-radius: 5px;
            font-weight: bolder;
            margin: 0;
            background-color: #121212;
            transition: 0.25s;
            cursor: pointer;
            text-decoration: none;

            &:hover {
                background-color: #2d2d2d;
            }
        }
    }

    .content {
        padding-top: 8px;
    }

    // Media Queries
    @media only screen and (max-width: 1200px) {
        .grid-container {
            grid-template-columns: 1fr 4fr 1fr;
        }
    }

    @media only screen and (max-width: 1000px) {
        .grid-container {
            grid-template-columns: 1fr 8fr 1fr;
        }
    }

    @media only screen and (max-width: 800px) {
        .grid-container {
            grid-template-columns: 0fr 1fr 0fr;
        }
    }
    
    @media only screen and (max-width: 600px) {
        h2 {
            font-size: 2em;
        }

        .project-boxes{
            grid-template-columns: repeat(1, 1fr);
        }

        .reptile-monitor{
            grid-area: 1 / 1 / 1 / 2;
        }
        
        .dirtywatts{
            grid-area: 2 / 1 / 2 / 2;
        }

        .questionable-quote-app{
            grid-area: 3 / 1 / 3 / 2;
        }

        .needy-appliances{
            grid-area: 4 / 1 / 4 / 2;
        }
    }
</style>