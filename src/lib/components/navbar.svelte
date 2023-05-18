<script lang="ts">

</script>

<div id="navbar">
    <a class="nav-item" href="/" id="home">HOME</a>
    <a class="nav-item" href="/about" id="about">ABOUT</a>
    <a class="nav-item" href="/contact" id="contact">CONTACT</a>
    <a class="nav-item" href="/projects" id="projects">PROJECTS</a>

    <div class="spacer"/> <!-- Spacer -->

    <a class="nav-item" href="https://github.com/InvalidSE/" id="github"><img class='nav-image' src='/github.svg' alt="github" /></a>
    <!-- <a class="nav-item" href="https://discord.gg/8QXQZ2Z" id="discord">DISCORD</a> -->
</div>

<style lang="scss">

    #navbar{
        // background-color: #6388d85d;
        width: 100%;
        display: flex;
        flex-direction: row;
        box-shadow: 0 0 20px #000000d2;
        // transform: translateY(-5px);
    }
    
    .nav-item{
        font-size: 1.5rem;
        font-family: Roboto;
        font-weight: bold;
        text-decoration: none;
        padding: 1rem;
        cursor: pointer;
        transition: background-color 0s;
        transition: 0.5s;
        // border-top: 5px solid transparent;
        &:hover{
            // border-top: 5px solid #6388d8;
            transform: translateY(-3px);
            text-shadow: 0 0 10px #181818b4;
        }
        
    }

    .nav-image{
        padding: 0;
        height: 29px;
        
        // center vertically
        // position: relative;
        // top: 50%;
        // transform: translateY(-50%);
    }

    .spacer{
        margin-left: auto; 
        width: 0;
    }

</style>