<svelte:head>
    <title>About Me</title>
</svelte:head>

<script lang="ts">
    import Navbar from '../../lib/components/navbar.svelte'
</script>

<div class="header-panel">
    <Navbar/>
    <h2 id="heading">Contact</h2>

    <div class="contact-boxes">
        <div class="contact-box">
            <p>EMAIL</p>
            <h3>taine.reader@gmail.com</h3>
        </div>
        <div class="contact-box">
            <p>DISCORD</p>
            <h3>InvalidSE</h3>
        </div>
        <div class="contact-box">
            <p>GITHUB</p>
            <h3>InvalidSE</h3>
        </div>
    </div>
</div>

<style lang="scss">

    .contact-boxes {
        display: flex;
        flex-direction: row;
        justify-content: center;
        // align-items: center;
        flex-wrap: wrap;
        gap: 3em;
        margin: 0 auto;
        text-align: left;
    }

    h3 {
        font-size: 1.5em;
        margin: 0;
    }

    p {
        font-size: 1.1em;
        font-weight: bolder;
        margin: 0;
    }

    .contact-box {
        border: 1px solid white;
        border-radius: 10px;
        padding: 1em;
        background-color: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
    }

    .header-panel { 
        align-items: center;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.726), rgba(123, 44, 187, 0.541)), url("/code.png") no-repeat top center fixed;
        height: 100vh;
    }

    #heading {
        text-align: center;
        margin: 1em 0em;
    }

    
    @media only screen and (max-width: 600px) {
        h2 {
            font-size: 2em;
        }
    }
</style>