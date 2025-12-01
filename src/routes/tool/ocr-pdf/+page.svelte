<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import {
        Loader2,
        CheckCircle,
        Download,
        FileText,
        Copy,
    } from "lucide-svelte";
    import Tesseract from "tesseract.js";
    import * as pdfjsLib from "pdfjs-dist";
    import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

    let files = [];
    let status = "upload"; // upload, processing, success
    let extractedText = "";
    let isProcessing = false;
    let progress = 0;
    let progressStatus = "";
    let currentFile = null;

    async function handleFilesSelected(event) {
        const selectedFiles = event.detail;
        if (selectedFiles.length > 0) {
            files = selectedFiles;
            currentFile = files[0];
            await processPdf(currentFile);
        }
    }

    async function processPdf(file) {
        status = "processing";
        isProcessing = true;
        progress = 0;
        extractedText = "";
        progressStatus = "Initializing...";

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer })
                .promise;
            const totalPages = pdf.numPages;

            const worker = await Tesseract.createWorker("eng");

            for (let i = 1; i <= totalPages; i++) {
                progressStatus = `Processing page ${i} of ${totalPages}...`;

                // Render page to canvas
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                }).promise;

                // OCR the canvas
                const {
                    data: { text },
                } = await worker.recognize(canvas);
                extractedText += `--- Page ${i} ---\n\n${text}\n\n`;

                progress = Math.round((i / totalPages) * 100);
            }

            await worker.terminate();
            status = "success";
        } catch (error) {
            console.error("OCR error:", error);
            alert("Failed to process PDF. Please try again.");
            status = "upload";
        } finally {
            isProcessing = false;
        }
    }

    function downloadText() {
        const blob = new Blob([extractedText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${currentFile.name.replace(".pdf", "")}-ocr.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(extractedText);
        alert("Text copied to clipboard!");
    }

    function reset() {
        files = [];
        extractedText = "";
        status = "upload";
        progress = 0;
        currentFile = null;
    }
</script>

<div class="tool-page">
    {#if status === "upload"}
        <div class="container">
            <div class="header">
                <h1>OCR PDF</h1>
                <p>Recognize and extract text from PDF files.</p>
            </div>
            <FileUploader
                on:filesSelected={handleFilesSelected}
                acceptedFileTypes=".pdf"
            />
        </div>
    {:else if status === "processing"}
        <div class="container centered">
            <div class="loader">
                <Loader2 size={48} class="spin" color="#40E0D0" />
            </div>
            <h2>Recognizing text...</h2>
            <p>{progressStatus}</p>
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
                <h2>Text Extracted</h2>
                <p>Your text is ready to copy or download.</p>
            </div>

            <div class="actions">
                <button class="primary-btn" on:click={downloadText}>
                    <Download size={20} />
                    Download Text
                </button>
                <button class="secondary-btn" on:click={copyToClipboard}>
                    <Copy size={20} />
                    Copy to Clipboard
                </button>
                <button class="link-btn" on:click={reset}
                    >Convert Another</button
                >
            </div>

            <div class="text-preview">
                <textarea readonly>{extractedText}</textarea>
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
        max-width: 900px;
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
        margin-bottom: 32px;
        flex-wrap: wrap;
    }

    .primary-btn {
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

    .primary-btn:hover {
        background: #36c0b3;
    }

    .secondary-btn {
        background: white;
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        padding: 12px 24px;
        border-radius: 24px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.2s;
    }

    .secondary-btn:hover {
        background: #f5f5f5;
    }

    .link-btn {
        background: none;
        border: none;
        color: #0265dc;
        font-weight: 600;
        cursor: pointer;
        text-decoration: underline;
        font-size: 16px;
    }

    .text-preview {
        background: white;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        text-align: left;
    }

    textarea {
        width: 100%;
        height: 400px;
        border: none;
        resize: vertical;
        font-family: monospace;
        font-size: 14px;
        line-height: 1.5;
        color: var(--text-primary);
        outline: none;
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
