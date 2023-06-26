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
        <h2 id="heading">About Me</h2>
    </div>
    <div class="left-panel"></div>
    <div class="content">
        <!-- <img src="https://ghchart.rshah.org/7b2cbb/InvalidSE" alt="InvalidSE's Github Commit History" />     -->
        <div class="about-boxes">
            <div class="history">
                <h3>HISTORY</h3>
                <p>I am from Northland, New Zealand, and am currently in my final high school year. I got into actual programming originally in my first year of high school because of science fair, and have been learning ever since.</p>
            </div>
            <div class="interests">
                <h3>INTERESTS</h3>
                <p>I like to do everything from 3d printing, writing software, creating electronics with microcontrollers, to playing chess, hosting minecraft servers.</p>
            </div>
            <div class="projects">
                <h3>PROJECTS</h3>
                <p>Some projects I have done in the past include DirtyWatts with the Questionable Research Labs team, the Questionable Quote App, Needy Appliances, this website and more. Check out the more extensive list here: </p>
                <div class="buttons-box">
                    <div class="projects-link"><a href="/projects">Projects</a></div>
                    <div class="projects-link"><a href="https://github.com/InvalidSE" target="_blank" rel="noreferrer">GitHub</a></div>
                </div>
            </div>
            <div class="technology">
                <div>
                <h3>TECHNOLOGY</h3>
                <p>These are the technologies I have experience in, and or like using: </p>
                <ul>
                    <li>Svelte & SvelteKit</li>
                    <li>HTML5</li>
                    <li>CSS & Sass</li>
                    <li>Python</li>
                    <li>(Learning) Rust</li>
                    <li>Typescript and Javascript</li>
                    <li>NodeJS</li>
                    <li>Arduino</li>
                </ul>
                </div>
                <img src="/logos.png" alt="software">
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

    .about-boxes {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: auto;
    }

    .about-boxes > div {
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
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        img {
            width: 100%;
            max-width: 300px;
        }
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
            
            a {
                text-decoration: none;
            }

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

        .about-boxes{
            grid-template-columns: repeat(1, 1fr);
        }

        .history{
            grid-area: 1 / 1 / 1 / 2;
        }
        
        .interests{
            grid-area: 2 / 1 / 2 / 2;
        }

        .projects{
            grid-area: 3 / 1 / 3 / 2;
        }

        .technology{
            grid-area: 4 / 1 / 4 / 2;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            div {
                width: 100%;
            }
            img {
                display: none;
            }
        }
    }
</style>