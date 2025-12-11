<script>
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import FileUploader from "$lib/components/FileUploader.svelte";
    import {
        FileText,
        Download,
        Loader2,
        CheckCircle,
        Minimize2,
        Settings,
    } from "lucide-svelte";
    import { PDFDocument } from "pdf-lib";

    let pdfjsLib = null;

    let file = null;
    let isProcessing = false;
    let compressedPdfUrl = null;
    let originalSize = 0;
    let compressedSize = 0;
    let progress = 0;
    let progressStatus = "";
    let compressionLevel = "medium"; // low, medium, high

    // Dynamically import pdfjs-dist on client side only
    onMount(async () => {
        if (browser) {
            const pdfjs = await import("pdfjs-dist");
            const pdfWorker = await import(
                "pdfjs-dist/build/pdf.worker.mjs?url"
            );
            pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker.default;
            pdfjsLib = pdfjs;
        }
    });

    // Compression settings based on level
    const compressionSettings = {
        low: {
            scale: 1.5,
            quality: 0.85,
            description: "Light compression, best quality",
        },
        medium: {
            scale: 1.2,
            quality: 0.65,
            description: "Balanced compression",
        },
        high: {
            scale: 1.0,
            quality: 0.45,
            description: "Maximum compression, smaller size",
        },
    };

    function handleFilesSelected(event) {
        const files = event.detail;
        if (files.length > 0) {
            file = files[0];
            originalSize = file.size;
        }
    }

    async function handleCompress() {
        if (!file) return;
        if (!pdfjsLib) {
            alert("PDF library is still loading. Please try again.");
            return;
        }

        isProcessing = true;
        progress = 0;
        progressStatus = "Loading PDF...";

        try {
            const settings = compressionSettings[compressionLevel];
            const arrayBuffer = await file.arrayBuffer();

            // Load PDF with pdfjs-dist for rendering
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer })
                .promise;
            const numPages = pdf.numPages;

            // Create new PDF with pdf-lib
            const newPdf = await PDFDocument.create();

            for (let i = 1; i <= numPages; i++) {
                progressStatus = `Compressing page ${i} of ${numPages}...`;
                progress = Math.round((i / numPages) * 90);

                // Render page to canvas
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: settings.scale });

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                }).promise;

                // Convert canvas to JPEG with compression
                const jpegDataUrl = canvas.toDataURL(
                    "image/jpeg",
                    settings.quality,
                );
                const jpegBytes = await fetch(jpegDataUrl).then((r) =>
                    r.arrayBuffer(),
                );

                // Embed JPEG into new PDF
                const jpegImage = await newPdf.embedJpg(jpegBytes);
                const newPage = newPdf.addPage([
                    jpegImage.width,
                    jpegImage.height,
                ]);
                newPage.drawImage(jpegImage, {
                    x: 0,
                    y: 0,
                    width: jpegImage.width,
                    height: jpegImage.height,
                });
            }

            progressStatus = "Finalizing...";
            progress = 95;

            // Save compressed PDF
            const compressedBytes = await newPdf.save();
            const blob = new Blob([compressedBytes], {
                type: "application/pdf",
            });

            compressedSize = blob.size;
            compressedPdfUrl = URL.createObjectURL(blob);

            progress = 100;
            progressStatus = "Done!";
        } catch (error) {
            console.error(error);
            alert(
                "Failed to compress PDF. Please ensure it is a valid PDF file.",
            );
        } finally {
            isProcessing = false;
        }
    }

    function downloadCompressed() {
        const a = document.createElement("a");
        a.href = compressedPdfUrl;
        // Ensure the filename ends with .pdf
        const baseName = file.name.replace(/\.pdf$/i, "");
        a.download = `compressed-${baseName}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function reset() {
        file = null;
        compressedPdfUrl = null;
        originalSize = 0;
        compressedSize = 0;
        progress = 0;
        progressStatus = "";
    }

    function formatSize(bytes) {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    function getReductionPercent() {
        if (originalSize === 0) return 0;
        return Math.round(
            ((originalSize - compressedSize) / originalSize) * 100,
        );
    }
</script>

<div class="tool-page">
    {#if !file}
        <div class="container">
            <div class="header">
                <h1>Compress PDF</h1>
                <p>
                    Reduce file size while optimizing for maximal PDF quality.
                </p>
            </div>
            <FileUploader on:filesSelected={handleFilesSelected} />
        </div>
    {:else if compressedPdfUrl}
        <div class="container centered">
            <div class="success-icon">
                <CheckCircle size={64} color="#008000" />
            </div>
            <h2>PDF Compressed Successfully!</h2>

            <div class="stats">
                <div class="stat-item">
                    <span class="label">Original Size</span>
                    <span class="value">{formatSize(originalSize)}</span>
                </div>
                <div class="arrow">→</div>
                <div class="stat-item">
                    <span class="label">Compressed Size</span>
                    <span class="value highlight"
                        >{formatSize(compressedSize)}</span
                    >
                </div>
            </div>

            <p class="savings">
                Saved {formatSize(originalSize - compressedSize)}
                ({Math.round(
                    ((originalSize - compressedSize) / originalSize) * 100,
                )}%)
            </p>

            <button class="download-btn" on:click={downloadCompressed}>
                <Download size={20} />
                Download Compressed PDF
            </button>

            <button class="link-btn" on:click={reset}
                >Compress another file</button
            >
        </div>
    {:else if isProcessing}
        <div class="container centered">
            <div class="loader">
                <Loader2 size={48} class="spin" color="#40E0D0" />
            </div>
            <h2>Compressing PDF...</h2>
            <p class="progress-status">{progressStatus}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: {progress}%"></div>
            </div>
            <p class="progress-text">{progress}%</p>
        </div>
    {:else}
        <div class="container centered">
            <div class="file-preview">
                <FileText size={48} color="#40E0D0" />
                <p class="filename">{file.name}</p>
                <p class="filesize">{formatSize(file.size)}</p>
            </div>

            <div class="compression-options">
                <h3><Settings size={18} /> Compression Level</h3>
                <div class="level-buttons">
                    <button
                        class="level-btn"
                        class:active={compressionLevel === "low"}
                        on:click={() => (compressionLevel = "low")}
                    >
                        <span class="level-name">Low</span>
                        <span class="level-desc">Best quality</span>
                    </button>
                    <button
                        class="level-btn"
                        class:active={compressionLevel === "medium"}
                        on:click={() => (compressionLevel = "medium")}
                    >
                        <span class="level-name">Medium</span>
                        <span class="level-desc">Balanced</span>
                    </button>
                    <button
                        class="level-btn"
                        class:active={compressionLevel === "high"}
                        on:click={() => (compressionLevel = "high")}
                    >
                        <span class="level-name">High</span>
                        <span class="level-desc">Smallest size</span>
                    </button>
                </div>
            </div>

            <button
                class="compress-btn"
                on:click={handleCompress}
                disabled={isProcessing}
            >
                <Minimize2 size={20} /> Compress PDF
            </button>

            <button class="link-btn" on:click={() => (file = null)}
                >Change file</button
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

    .file-preview {
        background: white;
        padding: 32px;
        border-radius: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        margin-bottom: 32px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        min-width: 300px;
    }

    .filename {
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
    }

    .filesize {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0;
    }

    .compress-btn {
        background: var(--accent-color);
        color: white;
        border: none;
        padding: 16px 48px;
        border-radius: 30px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        transition:
            transform 0.2s,
            background 0.2s;
    }

    .compress-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        background: #36c0b3;
    }

    .compress-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    /* Success Stats */
    .stats {
        display: flex;
        align-items: center;
        gap: 24px;
        margin: 24px 0;
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .stat-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .label {
        font-size: 12px;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .value {
        font-size: 20px;
        font-weight: 700;
        color: var(--text-primary);
    }

    .value.highlight {
        color: #008000;
    }

    .arrow {
        font-size: 24px;
        color: var(--text-secondary);
    }

    .savings {
        color: #008000;
        font-weight: 600;
        margin-bottom: 32px;
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

    /* Compression Options */
    .compression-options {
        background: white;
        padding: 24px;
        border-radius: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        margin-bottom: 24px;
        width: 100%;
        max-width: 400px;
    }

    .compression-options h3 {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin: 0 0 16px;
        font-size: 16px;
        color: var(--text-primary);
    }

    .level-buttons {
        display: flex;
        gap: 12px;
    }

    .level-btn {
        flex: 1;
        background: #f5f5f5;
        border: 2px solid transparent;
        padding: 16px 12px;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }

    .level-btn:hover {
        background: #eee;
    }

    .level-btn.active {
        background: rgba(64, 224, 208, 0.1);
        border-color: var(--accent-color);
    }

    .level-name {
        font-weight: 700;
        font-size: 14px;
        color: var(--text-primary);
    }

    .level-desc {
        font-size: 11px;
        color: var(--text-secondary);
    }

    /* Progress Bar */
    .progress-bar {
        width: 100%;
        max-width: 400px;
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
        margin: 16px 0;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #40e0d0, #36c0b3);
        border-radius: 4px;
        transition: width 0.3s ease;
    }

    .progress-status {
        margin: 0;
        color: var(--text-secondary);
        font-size: 14px;
    }

    .progress-text {
        margin: 0;
        font-weight: 700;
        color: var(--accent-color);
        font-size: 18px;
    }

    .loader {
        margin-bottom: 16px;
    }
</style>
