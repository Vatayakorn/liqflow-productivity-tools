<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import { Loader2, CheckCircle, Download } from "lucide-svelte";

    export let title;
    export let description;
    export let acceptedFileTypes = ".pdf"; // Default to PDF
    export let targetExtension = ".docx"; // Default to Word

    let files = [];
    let status = "upload"; // upload, converting, success

    function handleFilesSelected(event) {
        files = event.detail;
        startConversion();
    }

    function startConversion() {
        status = "converting";
        // Mock conversion delay
        setTimeout(() => {
            status = "success";
        }, 2500);
    }

    function downloadFile() {
        alert("Download started (Mock)");
    }

    function reset() {
        files = [];
        status = "upload";
    }
</script>

<div class="tool-page">
    {#if status === "upload"}
        <div class="container">
            <div class="header">
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
            <!-- Pass accepted types if FileUploader supports it, otherwise it defaults to PDF/Images -->
            <FileUploader
                on:filesSelected={handleFilesSelected}
                {acceptedFileTypes}
            />
        </div>
    {:else if status === "converting"}
        <div class="container centered">
            <div class="loader">
                <Loader2 size={48} class="spin" color="#40E0D0" />
            </div>
            <h2>Converting your file...</h2>
            <p>{files[0]?.name}</p>
        </div>
    {:else if status === "success"}
        <div class="container centered">
            <div class="success-icon">
                <CheckCircle size={64} color="#008000" />
            </div>
            <h2>Your file is ready</h2>
            <p>{files[0]?.name.replace(/\.[^/.]+$/, "") + targetExtension}</p>

            <div class="actions">
                <button class="download-btn" on:click={downloadFile}>
                    <Download size={20} />
                    Download
                </button>
            </div>

            <button class="link-btn" on:click={reset}
                >Convert another file</button
            >
        </div>
    {/if}
</div>

<style>
    .tool-page {
        min-height: calc(100vh - var(--header-height));
        background: var(--bg-color);
        display: flex;
        justify-content: center;
        padding-top: 60px;
    }

    .container {
        max-width: 800px;
        width: 100%;
        padding: 0 24px;
        text-align: center;
    }

    .centered {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 500px;
    }

    .header {
        margin-bottom: 40px;
    }

    h1 {
        font-size: 40px;
        font-weight: 800;
        margin: 0 0 16px;
    }

    p {
        font-size: 18px;
        color: var(--text-secondary);
    }

    :global(.spin) {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .download-btn {
        background: var(--accent-color);
        color: white;
        border: none;
        padding: 14px 32px;
        border-radius: 24px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 24px;
        transition: background 0.2s;
    }

    .download-btn:hover {
        background: #36c0b3;
    }

    .link-btn {
        background: none;
        border: none;
        color: #0265dc;
        font-weight: 600;
        margin-top: 24px;
        cursor: pointer;
        text-decoration: underline;
    }
</style>
