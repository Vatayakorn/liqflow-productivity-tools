<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
    import { Loader2, CheckCircle, Download } from "lucide-svelte";

    let file = null;
    let status = "upload"; // upload, form, processing, success
    let signedUrl = null;
    let signerName = "";
    let note = "Signed via Liqflow";
    let isProcessing = false;

    function handleFilesSelected(event) {
        const list = event.detail;
        if (list && list.length) {
            file = list[0];
            status = "form";
        }
    }

    async function handleSign() {
        if (!file) {
            alert("Please upload a PDF first.");
            return;
        }
        if (!signerName.trim()) {
            alert("Please enter your name for the signature.");
            return;
        }

        isProcessing = true;
        status = "processing";
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const font = await pdf.embedFont(StandardFonts.HelveticaBold);
            const pages = pdf.getPages();
            const firstPage = pages[0];
            const { width } = firstPage.getSize();
            const left = 40;
            const bottom = 50;

            firstPage.drawText(`Signed by ${signerName.trim()}`, {
                x: left,
                y: bottom + 24,
                size: 16,
                font,
                color: rgb(0, 0.2, 0.6),
            });

            if (note.trim()) {
                firstPage.drawText(note.trim(), {
                    x: left,
                    y: bottom + 6,
                    size: 12,
                    font,
                    color: rgb(0.2, 0.2, 0.2),
                });
            }

            firstPage.drawText(new Date().toLocaleString(), {
                x: width - 220,
                y: bottom + 6,
                size: 10,
                font,
                color: rgb(0.3, 0.3, 0.3),
            });

            const signedBytes = await pdf.save();
            const blob = new Blob([signedBytes], { type: "application/pdf" });
            signedUrl = URL.createObjectURL(blob);
            status = "success";
        } catch (error) {
            console.error(error);
            alert("Failed to sign PDF.");
            status = "form";
        } finally {
            isProcessing = false;
        }
    }

    function downloadFile() {
        if (!signedUrl || !file) return;
        const a = document.createElement("a");
        a.href = signedUrl;
        a.download = file.name.replace(".pdf", "-signed.pdf");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function reset() {
        file = null;
        signedUrl = null;
        signerName = "";
        note = "Signed via Liqflow";
        status = "upload";
    }
</script>

<div class="tool-page">
    {#if status === "upload"}
        <div class="container">
            <div class="header">
                <h1>Fill & Sign</h1>
                <p>Apply a typed signature to your PDF.</p>
            </div>
            <FileUploader
                on:filesSelected={handleFilesSelected}
                acceptedFileTypes=".pdf"
            />
        </div>
    {:else if status === "form"}
        <div class="container form">
            <div class="header">
                <h1>Sign your document</h1>
                <p>{file?.name}</p>
            </div>
            <div class="field">
                <label for="signer">Your name (signature)</label>
                <input
                    id="signer"
                    type="text"
                    bind:value={signerName}
                    placeholder="e.g. Jane Doe"
                />
            </div>
            <div class="field">
                <label for="note">Note (optional)</label>
                <input
                    id="note"
                    type="text"
                    bind:value={note}
                    placeholder="Signed via Liqflow"
                />
            </div>

            <button class="primary-btn" on:click={handleSign} disabled={isProcessing}>
                {#if isProcessing}
                    <Loader2 size={18} class="spin" /> Signing...
                {:else}
                    Apply signature
                {/if}
            </button>

            <button class="link-btn" on:click={reset}>Choose another file</button>
        </div>
    {:else if status === "processing"}
        <div class="container centered">
            <Loader2 size={48} class="spin" color="#40E0D0" />
            <h2>Applying signature...</h2>
        </div>
    {:else if status === "success"}
        <div class="container centered">
            <div class="success-icon">
                <CheckCircle size={64} color="#008000" />
            </div>
            <h2>Signed PDF ready</h2>
            <p>{file?.name.replace(".pdf", "-signed.pdf")}</p>

            <div class="actions">
                <button class="download-btn" on:click={downloadFile}>
                    <Download size={20} />
                    Download
                </button>
            </div>

            <button class="link-btn" on:click={reset}>Sign another PDF</button>
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

    .form {
        background: var(--bg-white);
        border-radius: 12px;
        padding: 32px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .centered {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        min-height: 420px;
    }

    .header {
        margin-bottom: 32px;
    }

    h1 {
        font-size: 40px;
        font-weight: 800;
        margin: 0 0 8px;
    }

    p {
        font-size: 18px;
        color: var(--text-secondary);
        margin: 0;
    }

    .field {
        text-align: left;
        margin-bottom: 16px;
    }

    label {
        display: block;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--text-primary);
    }

    input {
        width: 100%;
        padding: 12px 14px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        font-size: 14px;
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

    .primary-btn {
        background: var(--accent-color);
        color: white;
        border: none;
        padding: 14px 32px;
        border-radius: 24px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        margin-top: 8px;
        transition: background 0.2s;
    }

    .primary-btn:hover {
        background: #36C0B3;
    }

    .primary-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
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
        margin-top: 16px;
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
        margin-top: 16px;
        cursor: pointer;
        text-decoration: underline;
    }
</style>
