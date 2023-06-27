<div class="content">
    <div class="text">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <a href="/">Go Home</a>
    </div>
</div>

<style lang="scss">
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.726), rgba(123, 44, 187, 0.541)), url("/logo-render.webp") no-repeat center center fixed;
        background-size: cover;
    }

    .text {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    a {
        color: white;
        text-decoration: none;
        font-size: 1.5em;
        margin-top: 1em;
        border: 1px solid white;
        padding: 0.5em 1em;
        border-radius: 5px;
        transition: 0.4s;

        // Hover Effect
        &:hover {
            background-color: white;
            color: black;
        }
    }
</style>