<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import { splitPdf } from "$lib/utils/pdf";
    import { Loader2, FileText, Download } from "lucide-svelte";

    let files = [];
    let splitFiles = [];
    let isProcessing = false;
    let status = "upload"; // upload, processing, success

    function handleFilesSelected(event) {
        files = event.detail;
        if (files.length > 0) {
            processSplit();
        }
    }

    async function processSplit() {
        status = "processing";
        isProcessing = true;
        try {
            // Split the first file
            const blobs = await splitPdf(files[0]);
            splitFiles = blobs.map((blob, index) => ({
                name: `${files[0].name.replace(".pdf", "")}-page-${index + 1}.pdf`,
                url: URL.createObjectURL(blob),
            }));
            status = "success";
        } catch (error) {
            console.error(error);
            alert("Failed to split PDF");
            status = "upload";
        } finally {
            isProcessing = false;
        }
    }

    function downloadFile(file) {
        const a = document.createElement("a");
        a.href = file.url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function reset() {
        files = [];
        splitFiles = [];
        status = "upload";
    }
</script>

<div class="tool-page">
    {#if status === "upload"}
        <div class="container">
            <div class="header">
                <h1>Split PDF</h1>
                <p>Separate one PDF into multiple files.</p>
            </div>
            <FileUploader
                on:filesSelected={handleFilesSelected}
                acceptedFileTypes=".pdf"
            />
        </div>
    {:else if status === "processing"}
        <div class="container centered">
            <Loader2 size={48} class="spin" color="#40E0D0" />
            <h2>Splitting PDF...</h2>
        </div>
    {:else if status === "success"}
        <div class="container">
            <div class="header">
                <h1>Your PDF has been split!</h1>
                <p>Download individual pages below.</p>
            </div>

            <div class="grid">
                {#each splitFiles as file}
                    <div class="file-card">
                        <FileText size={32} color="#40E0D0" />
                        <span class="filename">{file.name}</span>
                        <button
                            class="download-btn"
                            on:click={() => downloadFile(file)}
                        >
                            <Download size={16} />
                        </button>
                    </div>
                {/each}
            </div>

            <button class="link-btn" on:click={reset}>Split another PDF</button>
        </div>
    {/if}
</div>

<style>
    .tool-page {
        min-height: calc(100vh - var(--header-height));
        background: var(--bg-color);
        padding: 60px 24px;
        display: flex;
        justify-content: center;
    }

    .container {
        max-width: 800px;
        width: 100%;
        text-align: center;
    }

    .centered {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 400px;
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

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 32px;
    }

    .file-card {
        background: white;
        padding: 16px;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .filename {
        font-size: 14px;
        word-break: break-all;
    }

    .download-btn {
        background: var(--accent-color);
        color: white;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .link-btn {
        background: none;
        border: none;
        color: #0265dc;
        font-weight: 600;
        cursor: pointer;
        text-decoration: underline;
    }
</style>
