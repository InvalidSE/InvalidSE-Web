<script lang="ts">

</script>

<div id="navbar">   

    <a class="nav-item mobile-show" href="/" id="home">BACK</a>

    <a class="nav-item mobile-hide" href="/" id="home">HOME</a>
    <a class="nav-item mobile-hide" href="/about" id="about">ABOUT</a>
    <a class="nav-item mobile-hide" href="/contact" id="contact">CONTACT</a>
    <a class="nav-item mobile-hide" href="/projects" id="projects">PROJECTS</a>

    <div class="spacer"/> <!-- SPACER (IT HAS AUTO MARGINS!) -->

    <a class="nav-item" href="https://github.com/InvalidSE/" id="github" rel="noreferrer" target="_blank"><img class='nav-image' src='/github.svg' alt="github" /></a>
    <!-- <a class="nav-item" href="https://discord.gg/ashdkaskjdhaskjdh" id="discord">DISCORD</a> -->
</div>

<style lang="scss">

    #navbar{
        width: 100%;
        display: flex;
        flex-direction: row;
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
        &:hover{
            background-color: #000000d2;
        }
    }

    .nav-image{
        padding: 0;
        height: 29px;
    }

    .spacer{
        margin-left: auto; 
        width: 0;
    }

    .mobile-show {
        display: none;
    }   

    // Media queries
    @media screen and (max-width: 600px){
        .mobile-hide{
            display: none;
        }
        .mobile-show{
            display: block;
        }
    }
</style>