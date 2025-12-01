<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import {
        Loader2,
        CheckCircle,
        Download,
        Image as ImageIcon,
    } from "lucide-svelte";
    import JSZip from "jszip";
    import * as pdfjsLib from "pdfjs-dist";
    import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

    let files = [];
    let status = "upload"; // upload, converting, success
    let convertedImages = []; // { url: string, name: string, blob: Blob }
    let isProcessing = false;
    let progress = 0;
    let currentFile = null;

    async function handleFilesSelected(event) {
        const selectedFiles = event.detail;
        if (selectedFiles.length > 0) {
            files = selectedFiles;
            currentFile = files[0];
            await convertPdfToPng(currentFile);
        }
    }

    async function convertPdfToPng(file) {
        status = "converting";
        isProcessing = true;
        progress = 0;
        convertedImages = [];

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer })
                .promise;
            const totalPages = pdf.numPages;

            for (let i = 1; i <= totalPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // Scale 2.0 for better quality

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                }).promise;

                // Convert to PNG
                const blob = await new Promise((resolve) =>
                    canvas.toBlob(resolve, "image/png"),
                );
                const url = URL.createObjectURL(blob);
                const imageName = `${file.name.replace(".pdf", "")}-page-${i}.png`;

                convertedImages = [
                    ...convertedImages,
                    { url, name: imageName, blob },
                ];
                progress = Math.round((i / totalPages) * 100);
            }

            status = "success";
        } catch (error) {
            console.error("Conversion error:", error);
            alert("Failed to convert PDF. Please try again.");
            status = "upload";
        } finally {
            isProcessing = false;
        }
    }

    async function downloadAll() {
        if (convertedImages.length === 1) {
            downloadImage(convertedImages[0]);
            return;
        }

        const zip = new JSZip();
        convertedImages.forEach((img) => {
            zip.file(img.name, img.blob);
        });

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${currentFile.name.replace(".pdf", "")}-png-images.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function downloadImage(img) {
        const a = document.createElement("a");
        a.href = img.url;
        a.download = img.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function reset() {
        files = [];
        convertedImages = [];
        status = "upload";
        progress = 0;
        currentFile = null;
    }
</script>

<div class="tool-page">
    {#if status === "upload"}
        <div class="container">
            <div class="header">
                <h1>PDF to PNG</h1>
                <p>Convert PDF pages to high-quality PNG images.</p>
            </div>
            <FileUploader
                on:filesSelected={handleFilesSelected}
                acceptedFileTypes=".pdf"
            />
        </div>
    {:else if status === "converting"}
        <div class="container centered">
            <div class="loader">
                <Loader2 size={48} class="spin" color="#40E0D0" />
            </div>
            <h2>Converting your file...</h2>
            <p>{currentFile?.name}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: {progress}%"></div>
            </div>
            <p class="progress-text">{progress}%</p>
        </div>
    {:else if status === "success"}
        <div class="container results">
            <div class="header">
                <div class="success-icon">
                    <CheckCircle size={48} color="#008000" />
                </div>
                <h2>Conversion Complete</h2>
                <p>{convertedImages.length} images created</p>
            </div>

            <div class="actions">
                <button class="download-all-btn" on:click={downloadAll}>
                    <Download size={20} />
                    Download All {convertedImages.length > 1 ? "(ZIP)" : ""}
                </button>
                <button class="reset-btn" on:click={reset}
                    >Convert Another</button
                >
            </div>

            <div class="image-grid">
                {#each convertedImages as img}
                    <div class="image-card">
                        <img src={img.url} alt={img.name} />
                        <div class="image-info">
                            <span>{img.name}</span>
                            <button
                                class="icon-btn"
                                on:click={() => downloadImage(img)}
                                title="Download"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
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
        max-width: 1000px;
        width: 100%;
        text-align: center;
    }

    .centered {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
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

    .progress-bar {
        width: 300px;
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        margin-top: 24px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: var(--accent-color);
        transition: width 0.3s ease;
    }

    .progress-text {
        margin-top: 8px;
        font-size: 14px;
        font-weight: 600;
    }

    .results .header {
        margin-bottom: 32px;
    }

    .actions {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-bottom: 40px;
    }

    .download-all-btn {
        background: var(--accent-color);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 24px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.2s;
    }

    .download-all-btn:hover {
        background: #36c0b3;
    }

    .reset-btn {
        background: white;
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        padding: 12px 24px;
        border-radius: 24px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
    }

    .reset-btn:hover {
        background: #f5f5f5;
    }

    .image-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 24px;
    }

    .image-card {
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
    }

    .image-card:hover {
        transform: translateY(-4px);
    }

    .image-card img {
        width: 100%;
        height: auto;
        display: block;
        border-bottom: 1px solid #eee;
    }

    .image-info {
        padding: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: var(--text-secondary);
    }

    .icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        color: var(--text-primary);
    }

    .icon-btn:hover {
        background: #f0f0f0;
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
