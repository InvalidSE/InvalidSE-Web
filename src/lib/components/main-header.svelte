<h1 id="name">Taine Reader</h1>
<div id="username-container">
    <div class="name-underline"/>
    <h2 id="username">Invalid<i>SE</i></h2>
    <div class="name-underline"/>
</div>

<style lang="scss">
    #username-container{
        display: flex;
        flex-direction: row;
        align-items: left;
        justify-content: center;
        animation-name: fade_in;
        animation-duration: 2s;
    }
    #username {
        text-shadow: 0 0 10px #18181877;
    }   

    // Underline animation
    .name-underline{
        width: 250px;
        height: 12px;
        background-color: #D0D0D0;
        box-shadow: 0 0 10px #18181877;
        margin: 0;
        animation-name: underline_animation;
        animation-duration: 1s;
    }
    #name {
        animation: fade_in 2s;
        white-space: nowrap;
        text-shadow: 0 0 10px #18181877;
    }

    // Animation definitions
    @keyframes underline_animation {
        0%   {width: 0px;}
        100% {width: 250px;}
    }
    @keyframes fade_in {
        0%   {opacity: 0;}
        100% {opacity: 1;}
    }

    @media screen and (max-width: 1000px) {
        #name {
            font-size: 6rem;
            // display: none;
        }
        #username {
            font-size: 8rem;
        }
        .name-underline {
            display: none;
        }
    }

    // Media queries
    @media screen and (max-width: 700px) {
        #name {
            font-size: 3rem;
            // display: none;
        }
        #username {
            font-size: 4rem ;
        }
        #username-container{
            flex-direction: column;
            align-items: center;
        }
        .name-underline{
            display: none;
        }
    }

    
    
</style>