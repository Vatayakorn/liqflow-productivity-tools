<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import {
        FileText,
        Download,
        Loader2,
        CheckCircle,
        Minimize2,
    } from "lucide-svelte";

    let file = null;
    let isProcessing = false;
    let compressedPdfUrl = null;
    let originalSize = 0;
    let compressedSize = 0;

    function handleFilesSelected(event) {
        const files = event.detail;
        if (files.length > 0) {
            file = files[0];
            originalSize = file.size;
        }
    }

    async function handleCompress() {
        if (!file) return;

        isProcessing = true;
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/tools/compress", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Compression failed");

            const blob = await response.blob();
            compressedSize = blob.size;
            compressedPdfUrl = URL.createObjectURL(blob);
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
        a.download = `compressed-${file.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function reset() {
        file = null;
        compressedPdfUrl = null;
        originalSize = 0;
        compressedSize = 0;
    }

    function formatSize(bytes) {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
    {:else}
        <div class="container centered">
            <div class="file-preview">
                <FileText size={48} color="#40E0D0" />
                <p class="filename">{file.name}</p>
                <p class="filesize">{formatSize(file.size)}</p>
            </div>

            <button
                class="compress-btn"
                on:click={handleCompress}
                disabled={isProcessing}
            >
                {#if isProcessing}
                    <Loader2 size={20} class="spin" /> Compressing...
                {:else}
                    <Minimize2 size={20} /> Compress PDF
                {/if}
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
</style>
