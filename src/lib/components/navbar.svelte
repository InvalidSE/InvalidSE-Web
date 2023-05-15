<script lang="ts">

</script>

<div id="navbar">
    <a class="nav-item" href="/" id="home">HOME</a>
    <a class="nav-item" href="/about" id="about">ABOUT</a>
    <a class="nav-item" href="/contact" id="contact">CONTACT</a>
    <a class="nav-item" href="/projects" id="projects">PROJECTS</a>

    <div class="spacer"/> <!-- Spacer -->

    <a class="nav-item" href="https://github.com/InvalidSE/" id="github">GITHUB</a>
    <a class="nav-item" href="https://discord.gg/8QXQZ2Z" id="discord">DISCORD</a>
</div>

<style lang="scss">

    #navbar{
        background-color: #121212;
        width: 100%;
        display: flex;
        flex-direction: row;
    }
    
    .nav-item{
        color: white;
        font-size: 1.5rem;
        font-family: Roboto;
        font-weight: bold;
        text-decoration: none;
        padding: 1rem;
        cursor: pointer;
        transition: 0.25s;
        &:hover{
            color: #D0D0D0;
            background-color: #212121;
        }
    }

    .spacer{
        margin-left: auto; 
        width: 0;
    }

</style>