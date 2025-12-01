<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import { PDFDocument } from "pdf-lib";
    import {
        Image,
        ArrowUp,
        ArrowDown,
        Trash2,
        FileType,
        Download,
        Loader2,
    } from "lucide-svelte";

    let files = [];
    let isProcessing = false;
    let pdfUrl = null;

    function handleFilesSelected(event) {
        // Filter for images only just in case
        const newFiles = Array.from(event.detail).filter((f) =>
            f.type.startsWith("image/"),
        );
        files = [...files, ...newFiles];
    }

    function removeFile(index) {
        files = files.filter((_, i) => i !== index);
    }

    function moveUp(index) {
        if (index === 0) return;
        const newFiles = [...files];
        [newFiles[index - 1], newFiles[index]] = [
            newFiles[index],
            newFiles[index - 1],
        ];
        files = newFiles;
    }

    function moveDown(index) {
        if (index === files.length - 1) return;
        const newFiles = [...files];
        [newFiles[index + 1], newFiles[index]] = [
            newFiles[index],
            newFiles[index + 1],
        ];
        files = newFiles;
    }

    async function handleConvert() {
        if (files.length === 0) return;

        isProcessing = true;
        try {
            const pdfDoc = await PDFDocument.create();

            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                let image;
                if (file.type === "image/jpeg") {
                    image = await pdfDoc.embedJpg(arrayBuffer);
                } else if (file.type === "image/png") {
                    image = await pdfDoc.embedPng(arrayBuffer);
                } else {
                    continue; // Skip unsupported
                }

                const page = pdfDoc.addPage([image.width, image.height]);
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height,
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            pdfUrl = URL.createObjectURL(blob);
        } catch (error) {
            console.error(error);
            alert("Failed to convert images to PDF.");
        } finally {
            isProcessing = false;
        }
    }

    function downloadPdf() {
        const a = document.createElement("a");
        a.href = pdfUrl;
        a.download = "converted-images.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
</script>

<div class="tool-page">
    {#if files.length === 0}
        <div class="container">
            <div class="header">
                <h1>JPG to PDF</h1>
                <p>
                    Turn your images into PDFs. Works with JPG, PNG, and more.
                </p>
            </div>
            <FileUploader on:filesSelected={handleFilesSelected} />
        </div>
    {:else if pdfUrl}
        <div class="container centered">
            <div class="success-icon">
                <FileType size={64} color="#008000" />
            </div>
            <h2>Your PDF is ready!</h2>
            <p>The images have been converted to a PDF document.</p>

            <button class="download-btn" on:click={downloadPdf}>
                <Download size={20} />
                Download PDF
            </button>

            <button
                class="link-btn"
                on:click={() => {
                    files = [];
                    pdfUrl = null;
                }}>Convert more images</button
            >
        </div>
    {:else}
        <div class="workspace-container">
            <div class="toolbar">
                <h2>{files.length} images selected</h2>
                <div class="actions">
                    <button
                        class="add-btn"
                        on:click={() =>
                            document.getElementById("hidden-input").click()}
                        >Add more files</button
                    >
                    <input
                        id="hidden-input"
                        type="file"
                        accept="image/jpeg, image/png"
                        multiple
                        hidden
                        on:change={(e) =>
                            handleFilesSelected({ detail: e.target.files })}
                    />
                    <button
                        class="convert-btn"
                        on:click={handleConvert}
                        disabled={isProcessing}
                    >
                        {#if isProcessing}
                            <Loader2 size={18} class="spin" /> Converting...
                        {:else}
                            Convert to PDF
                        {/if}
                    </button>
                </div>
            </div>

            <div class="file-list">
                {#each files as file, index}
                    <div class="file-item">
                        <div class="file-info">
                            <Image size={24} color="#40E0D0" />
                            <span class="filename">{file.name}</span>
                            <span class="filesize"
                                >{(file.size / 1024 / 1024).toFixed(2)} MB</span
                            >
                        </div>
                        <div class="file-actions">
                            <button
                                on:click={() => moveUp(index)}
                                disabled={index === 0}
                                title="Move Up"><ArrowUp size={18} /></button
                            >
                            <button
                                on:click={() => moveDown(index)}
                                disabled={index === files.length - 1}
                                title="Move Down"
                                ><ArrowDown size={18} /></button
                            >
                            <button
                                on:click={() => removeFile(index)}
                                class="delete"
                                title="Remove"><Trash2 size={18} /></button
                            >
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
        display: flex;
        justify-content: center;
        padding-top: 40px;
    }

    .container {
        max-width: 800px;
        width: 100%;
        padding: 0 24px;
        text-align: center;
    }

    .workspace-container {
        max-width: 800px;
        width: 100%;
        padding: 0 24px;
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

    /* Toolbar */
    .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }

    .toolbar h2 {
        font-size: 20px;
        margin: 0;
    }

    .actions {
        display: flex;
        gap: 16px;
    }

    .add-btn {
        background: white;
        border: 1px solid var(--border-color);
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 600;
        cursor: pointer;
    }

    .convert-btn {
        background: var(--accent-color);
        color: white;
        border: none;
        padding: 8px 24px;
        border-radius: 20px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .convert-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    /* File List */
    .file-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .file-item {
        background: white;
        padding: 16px;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .file-info {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .filename {
        font-weight: 500;
    }

    .filesize {
        color: var(--text-secondary);
        font-size: 12px;
    }

    .file-actions {
        display: flex;
        gap: 8px;
    }

    .file-actions button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        color: var(--text-secondary);
        border-radius: 4px;
    }

    .file-actions button:hover:not(:disabled) {
        background: #f0f0f0;
        color: var(--text-primary);
    }

    .file-actions button.delete:hover {
        color: var(--accent-color);
        background: rgba(64, 224, 208, 0.15);
    }

    .file-actions button:disabled {
        opacity: 0.3;
        cursor: default;
    }

    /* Success State */
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
</style>
