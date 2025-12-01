<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import { PDFDocument } from "pdf-lib";
    import { Loader2, Trash2, Download, FileText } from "lucide-svelte";

    let files = [];
    let pdfDoc = null;
    let pageCount = 0;
    let pages = []; // Array of page indices
    let status = "upload"; // upload, selecting, processing, success
    let downloadUrl = null;

    async function handleFilesSelected(event) {
        files = event.detail;
        if (files.length > 0) {
            await loadPdf(files[0]);
        }
    }

    async function loadPdf(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            pdfDoc = await PDFDocument.load(arrayBuffer);
            pageCount = pdfDoc.getPageCount();
            pages = Array.from({ length: pageCount }, (_, i) => ({
                index: i,
                deleted: false,
            }));
            status = "selecting";
        } catch (error) {
            console.error(error);
            alert("Failed to load PDF");
        }
    }

    function togglePageDeletion(index) {
        pages[index].deleted = !pages[index].deleted;
    }

    async function processDeletion() {
        status = "processing";
        try {
            // Create a new PDF
            const newPdf = await PDFDocument.create();
            const pagesToKeep = pages
                .filter((p) => !p.deleted)
                .map((p) => p.index);

            if (pagesToKeep.length === 0) {
                alert("You must keep at least one page.");
                status = "selecting";
                return;
            }

            const copiedPages = await newPdf.copyPages(pdfDoc, pagesToKeep);
            copiedPages.forEach((page) => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            downloadUrl = URL.createObjectURL(blob);
            status = "success";
        } catch (error) {
            console.error(error);
            alert("Failed to delete pages");
            status = "selecting";
        }
    }

    function downloadFile() {
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `processed-${files[0].name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function reset() {
        files = [];
        pdfDoc = null;
        pages = [];
        status = "upload";
        downloadUrl = null;
    }
</script>

<div class="tool-page">
    {#if status === "upload"}
        <div class="container">
            <div class="header">
                <h1>Delete PDF Pages</h1>
                <p>Remove pages from your PDF document.</p>
            </div>
            <FileUploader
                on:filesSelected={handleFilesSelected}
                acceptedFileTypes=".pdf"
            />
        </div>
    {:else if status === "selecting"}
        <div class="container">
            <div class="header">
                <h1>Select pages to delete</h1>
                <p>Click on pages to mark them for deletion.</p>
            </div>

            <div class="grid">
                {#each pages as page}
                    <button
                        class="page-card {page.deleted ? 'deleted' : ''}"
                        on:click={() => togglePageDeletion(page.index)}
                    >
                        <FileText size={40} />
                        <span class="page-num">Page {page.index + 1}</span>
                        {#if page.deleted}
                            <div class="overlay">
                                <Trash2 color="white" size={32} />
                            </div>
                        {/if}
                    </button>
                {/each}
            </div>

            <div class="actions">
                <button class="primary-btn" on:click={processDeletion}>
                    Apply Changes
                </button>
            </div>
        </div>
    {:else if status === "processing"}
        <div class="container centered">
            <Loader2 size={48} class="spin" color="#40E0D0" />
            <h2>Processing...</h2>
        </div>
    {:else if status === "success"}
        <div class="container centered">
            <h1>Your PDF is ready!</h1>
            <button class="primary-btn" on:click={downloadFile}>
                <Download size={20} /> Download PDF
            </button>
            <button class="link-btn" on:click={reset}>Start over</button>
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
        gap: 24px;
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

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 16px;
        margin-bottom: 32px;
    }

    .page-card {
        background: white;
        border: 2px solid transparent;
        border-radius: 8px;
        height: 160px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .page-card:hover {
        border-color: #ccc;
    }

    .page-card.deleted {
        border-color: var(--accent-color);
    }

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(64, 224, 208, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .primary-btn {
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
        margin: 0 auto;
    }

    .link-btn {
        background: none;
        border: none;
        color: #0265dc;
        font-weight: 600;
        cursor: pointer;
        text-decoration: underline;
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
</style>
