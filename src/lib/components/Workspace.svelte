<script>
    import { FileText, Download, RotateCw, Trash2 } from "lucide-svelte";
    import { rotatePdf } from "$lib/utils/pdf";

    export let files = [];
    export let toolName = "Edit PDF";

    let isProcessing = false;
    let processedFile = null;

    async function handleRotate() {
        if (!files[0]) return;
        isProcessing = true;
        try {
            // Rotate the first file by 90 degrees
            const blob = await rotatePdf(files[0], 90);
            // Create a new File object from the blob to update the state
            const newFile = new File([blob], files[0].name, {
                type: "application/pdf",
            });
            files = [newFile];
            processedFile = blob; // Store for download
            alert("Rotated successfully! (Preview not updated in this MVP)");
        } catch (e) {
            console.error(e);
            alert("Error rotating PDF");
        } finally {
            isProcessing = false;
        }
    }

    function handleDownload() {
        if (!processedFile && !files[0]) return;

        const blob = processedFile || files[0];
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `processed-${files[0].name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
</script>

<div class="workspace">
    <div class="toolbar">
        <div class="tool-info">
            <FileText size={20} />
            <span>{files[0]?.name || "Document.pdf"}</span>
        </div>
        <div class="actions">
            <button
                class="action-btn"
                title="Rotate"
                on:click={handleRotate}
                disabled={isProcessing}
            >
                <RotateCw size={20} />
            </button>
            <button class="action-btn" title="Delete"
                ><Trash2 size={20} /></button
            >
            <button
                class="process-btn"
                on:click={handleDownload}
                disabled={isProcessing}
            >
                {isProcessing ? "Processing..." : "Download"}
                {#if !isProcessing}<Download size={18} />{/if}
            </button>
        </div>
    </div>

    <div class="preview-area">
        <!-- In a real app, we would render the PDF pages here using pdf.js -->
        <div class="pdf-placeholder">
            <FileText size={64} color="#40E0D0" />
            <p>PDF Preview Area</p>
            <p class="sub-text">{files.length} file(s) loaded</p>
            <p class="sub-text" style="font-size: 12px; color: #999;">
                (Visual preview requires pdf.js rendering)
            </p>
        </div>
    </div>
</div>

<style>
    .workspace {
        height: calc(100vh - var(--header-height));
        display: flex;
        flex-direction: column;
        background: #f5f5f5;
    }

    .toolbar {
        height: 56px;
        background: #333;
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
    }

    .tool-info {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
    }

    .actions {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .action-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
    }

    .action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .action-btn:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
    }

    .process-btn {
        background: var(--accent-color);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 16px;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
    }

    .process-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .preview-area {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
    }

    .pdf-placeholder {
        width: 400px;
        height: 560px;
        background: white;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
    }

    .sub-text {
        color: var(--text-secondary);
        font-size: 14px;
    }
</style>
