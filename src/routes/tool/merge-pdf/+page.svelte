<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import { mergePdfs } from "$lib/utils/pdf";
    import {
        FileText,
        ArrowUp,
        ArrowDown,
        Trash2,
        Combine,
        Download,
        Loader2,
    } from "lucide-svelte";

    let files = [];
    let isProcessing = false;
    let mergedPdfUrl = null;

    function handleFilesSelected(event) {
        // Append new files to existing list
        files = [...files, ...event.detail];
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

    async function handleMerge() {
        if (files.length < 2) {
            alert("Please select at least 2 PDF files to merge.");
            return;
        }

        isProcessing = true;
        try {
            const formData = new FormData();
            files.forEach((file) => formData.append("files", file));

            const response = await fetch("/api/tools/merge", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Merge failed");

            const blob = await response.blob();
            mergedPdfUrl = URL.createObjectURL(blob);
        } catch (error) {
            console.error(error);
            alert(
                "Failed to merge PDFs. Please ensure they are valid PDF files.",
            );
        } finally {
            isProcessing = false;
        }
    }

    function downloadMerged() {
        const a = document.createElement("a");
        a.href = mergedPdfUrl;
        a.download = "merged-document.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
</script>

<div class="tool-page">
    {#if files.length === 0}
        <div class="container">
            <div class="header">
                <h1>Merge PDFs</h1>
                <p>
                    Combine PDFs in the order you want with the easiest PDF
                    merger available.
                </p>
            </div>
            <FileUploader on:filesSelected={handleFilesSelected} />
        </div>
    {:else if mergedPdfUrl}
        <div class="container centered">
            <div class="success-icon">
                <Combine size={64} color="#008000" />
            </div>
            <h2>Your PDFs have been merged!</h2>
            <p>The new file is ready to download.</p>

            <button class="download-btn" on:click={downloadMerged}>
                <Download size={20} />
                Download Merged PDF
            </button>

            <button
                class="link-btn"
                on:click={() => {
                    files = [];
                    mergedPdfUrl = null;
                }}>Merge more files</button
            >
        </div>
    {:else}
        <div class="workspace-container">
            <div class="toolbar">
                <h2>{files.length} files selected</h2>
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
                        accept=".pdf"
                        multiple
                        hidden
                        on:change={(e) =>
                            handleFilesSelected({ detail: e.target.files })}
                    />
                    <button
                        class="merge-btn"
                        on:click={handleMerge}
                        disabled={isProcessing}
                    >
                        {#if isProcessing}
                            <Loader2 size={18} class="spin" /> Merging...
                        {:else}
                            Merge
                        {/if}
                    </button>
                </div>
            </div>

            <div class="file-list">
                {#each files as file, index}
                    <div class="file-item">
                        <div class="file-info">
                            <FileText size={24} color="#40E0D0" />
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

    .merge-btn {
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

    .merge-btn:disabled {
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
