<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import { FileText, Download, CheckCircle, Loader2 } from "lucide-svelte";

    let files = [];
    let status = "upload"; // upload, converting, success

    let downloadUrl = null;

    function handleFilesSelected(event) {
        files = event.detail;
        startConversion();
    }

    async function startConversion() {
        status = "converting";
        try {
            const formData = new FormData();
            formData.append("file", files[0]);

            const response = await fetch("/api/tools/pdf-to-word", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Conversion failed");

            const blob = await response.blob();
            downloadUrl = URL.createObjectURL(blob);
            status = "success";
        } catch (error) {
            console.error(error);
            alert("Conversion failed.");
            status = "upload";
        }
    }

    function downloadFile() {
        if (!downloadUrl) return;
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = files[0].name.replace(".pdf", ".docx");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
</script>

<div class="tool-page">
    {#if status === "upload"}
        <div class="container">
            <div class="header">
                <h1>PDF to Word</h1>
                <p>Convert PDFs to Microsoft Word files in seconds.</p>
            </div>
            <FileUploader on:filesSelected={handleFilesSelected} />
        </div>
    {:else if status === "converting"}
        <div class="container centered">
            <div class="loader">
                <Loader2 size={48} class="spin" color="#40E0D0" />
            </div>
            <h2>Converting your file...</h2>
            <p>{files[0]?.name}</p>
        </div>
    {:else if status === "success"}
        <div class="container centered">
            <div class="success-icon">
                <CheckCircle size={64} color="#008000" />
            </div>
            <h2>Your file is ready</h2>
            <p>{files[0]?.name.replace(".pdf", ".docx")}</p>

            <div class="actions">
                <button class="download-btn" on:click={downloadFile}>
                    <Download size={20} />
                    Download
                </button>
            </div>

            <button
                class="link-btn"
                on:click={() => {
                    files = [];
                    status = "upload";
                }}>Convert another file</button
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
        height: 500px; /* Approximate height for centering */
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

    /* Animation */
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
        transition: background 0.2s;
    }

    .download-btn:hover {
        background: #36C0B3;
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
</style>
