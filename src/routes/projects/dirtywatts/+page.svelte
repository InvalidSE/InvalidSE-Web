<svelte:head>
    <title>About Me</title>
</svelte:head>

<script lang="ts">
    import '../../../lib/global.scss'
    import Navbar from '../../../lib/components/navbar.svelte'
</script>

<div class="grid-container">
    <div class="header-panel">
        <Navbar />
        <h2 id="heading">DirtyWatts - GovHack 2022</h2>
    </div>
    <div class="left-panel"></div>
    <div class="content">
        <div class="project-boxes">
            <div>
                <h3>The Event:</h3>
                <p>GovHack is an international Hackathon event where you make the best use of open government data in 48h. To submit your projects, you have to create a short video showing them off or explaining your concept. My team have competed multiple times in this competition over the last few years, and made some cool stuff.</p>
                <div class="buttons-box">
                    <a class="projects-link" href="https://www.govhack.org/" target="_blank" rel="noreferrer">The GovHack Website</a>
                </div>
            </div>
            <div>
                <h3>The Submission:</h3>
                <iframe class="dw-video" src="https://www.youtube.com/embed/wvJlPGGfMgM" title="DirtyWatts Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                <div class="buttons-box">
                    <a class="projects-link" href="https://dirtywatts.nz/" target="_blank" rel="noreferrer">The Project Website</a>
                    <a class="projects-link" href="https://github.com/questionable-research-labs/needy-appliances" target="_blank" rel="noreferrer">The GitHub Repo</a>
                </div>
            </div>
            <div>
                <h3>The Awards:</h3>
                <p>Our team won the 'Best Creative Use of Data in Response to ESG', as well as 'Technology Literacy in a Digital First World'. We were also shortlisted for the people's choice award.</p>
                <div class="buttons-box">
                    <a class="projects-link" href="https://govhack.org/2022-winners/" target="_blank" rel="noreferrer">The 2022 Winners</a>
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

    .dw-video {
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: 10px;
        margin: 0.5em 0em;
    }

    #heading {
        text-align: center;
        margin: 2em 0em;
    }

    .project-boxes {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(1, 1fr);
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
        }
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
    }
</style>