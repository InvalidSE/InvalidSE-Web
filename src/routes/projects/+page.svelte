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
                <p>For a competition called the Terrible Ideas Hackathon, me and QRL created needy kitchen appliances. Imagine, far in the future, we have optimised appliances for the best user experience ever. We removed the buttons of a microwave, and replaced it with a 'mind' using GPT-4 and speech recognition. We also made a smart toaster, a knife block that runs away, and a pot that actually never boils when it's watched.</p>
                <div class="buttons-box">
                    <a class="projects-link" href="https://terriblehack.nz/" target="_blank" rel="noreferrer">TerribleHack</a>
                    <a class="projects-link" href="https://github.com/questionable-research-labs/needy-appliances" target="_blank" rel="noreferrer">GitHub</a>
                </div>
            </div>
            <div class="reptile-monitor">
                <h3>Reptile Monitor</h3>
                <p>In 2019, I made a enclosure monitor for my friend's bearded dragon for science fair. It alerted you if the temperature got too hot or cold via email.<br><br> For this, we won the Best Overall Technology at the Central Northalnd Science Fair, the technology award and exibit award for year 9, and the NorthTec Innovation and Enterprise Award.</p>
            </div>
            <div class="dirtywatts">
                <h3>DirtyWatts</h3>
                <p>DirtyWatts was a project me and the Questionable Research Labs team. We created a service to display the live data of power consumption and generation via different methods across New Zealand. We also made some physical indicatiors such as a colour changing lamp, and a smart socket which turns off when coal is being used.</p>
                <div class="buttons-box">
                    <a class="projects-link" href="/projects/dirtywatts">More Details</a>
                    <a class="projects-link" href="https://github.com/questionable-research-labs/DirtyWatts" target="_blank" rel="noreferrer">GitHub</a>
                    <a class="projects-link" href="https://dirtywatts.nz/" target="_blank" rel="noreferrer">Website</a>
                </div>
            </div>

            <div class="questionable-quote-app">
                <h3>Questionable Quote App</h3>
                <p>For saving your friend's out of context quotes. Originally we had this in a Google keep note, but I decided to make it better. It features creating different books, adding and deleting quotes, and sharing to other users. You can check it out via the button below.</p>
                <div class="buttons-box">
                    <a class="projects-link" href="https://quotes.laspruca.nz" target="_blank" rel="noreferrer">Website</a>
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
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.726), rgba(123, 44, 187, 0.541)), url("/code.webp") no-repeat top center fixed;
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
        padding: 0;
        margin: 0;
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