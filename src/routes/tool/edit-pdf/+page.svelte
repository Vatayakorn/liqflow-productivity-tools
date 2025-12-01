<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import { FileText, Type, Image, Link, Download } from "lucide-svelte";

    let files = [];
    let status = "upload"; // upload, editor

    function handleFilesSelected(event) {
        files = event.detail;
        status = "editor";
    }

    function downloadFile() {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(files[0]);
        a.download = files[0].name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
</script>

<div class="tool-page">
    {#if status === "upload"}
        <div class="container">
            <div class="header">
                <h1>Edit PDF</h1>
                <p>Add text, comments, and highlights to your PDF.</p>
            </div>
            <FileUploader
                on:filesSelected={handleFilesSelected}
                acceptedFileTypes=".pdf"
            />
        </div>
    {:else}
        <div class="editor">
            <div class="toolbar">
                <div class="tool-group">
                    <button class="tool-btn active"
                        ><Type size={20} /> Add text</button
                    >
                    <button class="tool-btn"
                        ><Image size={20} /> Add image</button
                    >
                    <button class="tool-btn"><Link size={20} /> Link</button>
                </div>
                <button class="download-btn" on:click={downloadFile}>
                    <Download size={18} /> Download
                </button>
            </div>

            <div class="canvas">
                <div class="pdf-viewer">
                    <FileText size={64} color="#999" />
                    <p>{files[0].name}</p>
                    <p class="note">
                        (Editor UI is a mockup. Real editing requires complex
                        canvas rendering)
                    </p>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .tool-page {
        min-height: calc(100vh - var(--header-height));
        background: var(--bg-color);
        display: flex;
        flex-direction: column;
    }

    .container {
        max-width: 800px;
        width: 100%;
        margin: 60px auto;
        text-align: center;
        padding: 0 24px;
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

    .editor {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .toolbar {
        height: 60px;
        background: white;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
    }

    .tool-group {
        display: flex;
        gap: 8px;
    }

    .tool-btn {
        background: none;
        border: none;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 600;
        color: var(--text-secondary);
        cursor: pointer;
    }

    .tool-btn.active {
        background: #ebf4ff;
        color: #0265dc;
    }

    .download-btn {
        background: var(--accent-color);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
    }

    .canvas {
        flex: 1;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
    }

    .pdf-viewer {
        width: 600px;
        height: 800px;
        background: white;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        color: var(--text-secondary);
    }

    .note {
        font-size: 14px;
        font-style: italic;
    }
</style>
