<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
    import { Loader2, CheckCircle, Download } from "lucide-svelte";

    let file = null;
    let status = "upload"; // upload, form, processing, success
    let bundleUrl = null;
    let requesterName = "";
    let recipientEmail = "";
    let message = "Please sign and return this document.";
    let isProcessing = false;

    function handleFilesSelected(event) {
        const list = event.detail;
        if (list && list.length) {
            file = list[0];
            status = "form";
        }
    }

    async function handleBundle() {
        if (!file) {
            alert("Please upload a PDF first.");
            return;
        }
        if (!requesterName.trim() || !recipientEmail.trim()) {
            alert("Please enter your name and recipient email.");
            return;
        }

        isProcessing = true;
        status = "processing";
        try {
            const originalBuffer = await file.arrayBuffer();
            const originalPdf = await PDFDocument.load(originalBuffer);
            const bundle = await PDFDocument.create();
            const font = await bundle.embedFont(StandardFonts.HelveticaBold);
            const regular = await bundle.embedFont(StandardFonts.Helvetica);

            const cover = bundle.addPage();
            const { width, height } = cover.getSize();
            const left = 50;
            cover.drawText("Signature Request", {
                x: left,
                y: height - 80,
                size: 26,
                font,
                color: rgb(0, 0.2, 0.6),
            });
            cover.drawText(`From: ${requesterName.trim()}`, {
                x: left,
                y: height - 120,
                size: 14,
                font: regular,
                color: rgb(0.1, 0.1, 0.1),
            });
            cover.drawText(`To: ${recipientEmail.trim()}`, {
                x: left,
                y: height - 144,
                size: 14,
                font: regular,
                color: rgb(0.1, 0.1, 0.1),
            });
            cover.drawText(`Message: ${message.trim() || "Please sign"}`, {
                x: left,
                y: height - 176,
                size: 12,
                font: regular,
                color: rgb(0.15, 0.15, 0.15),
            });
            cover.drawText(`Created: ${new Date().toLocaleString()}`, {
                x: left,
                y: height - 204,
                size: 10,
                font: regular,
                color: rgb(0.3, 0.3, 0.3),
            });

            const pages = await bundle.copyPages(
                originalPdf,
                originalPdf.getPageIndices(),
            );
            pages.forEach((p) => bundle.addPage(p));

            const bytes = await bundle.save();
            const blob = new Blob([bytes], { type: "application/pdf" });
            bundleUrl = URL.createObjectURL(blob);
            status = "success";
        } catch (error) {
            console.error(error);
            alert("Failed to build signature bundle.");
            status = "form";
        } finally {
            isProcessing = false;
        }
    }

    function downloadBundle() {
        if (!bundleUrl || !file) return;
        const a = document.createElement("a");
        a.href = bundleUrl;
        a.download = file.name.replace(".pdf", "-signature-request.pdf");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function reset() {
        file = null;
        bundleUrl = null;
        requesterName = "";
        recipientEmail = "";
        message = "Please sign and return this document.";
        status = "upload";
    }
</script>

<div class="tool-page">
    {#if status === "upload"}
        <div class="container">
            <div class="header">
                <h1>Request e-signatures</h1>
                <p>Create a cover page and bundle your PDF for signing.</p>
            </div>
            <FileUploader
                on:filesSelected={handleFilesSelected}
                acceptedFileTypes=".pdf"
            />
        </div>
    {:else if status === "form"}
        <div class="container form">
            <div class="header">
                <h1>Prepare your request</h1>
                <p>{file?.name}</p>
            </div>
            <div class="grid">
                <div class="field">
                    <label for="requester">Your name</label>
                    <input
                        id="requester"
                        type="text"
                        bind:value={requesterName}
                        placeholder="Sender name"
                    />
                </div>
                <div class="field">
                    <label for="recipient">Recipient email</label>
                    <input
                        id="recipient"
                        type="email"
                        bind:value={recipientEmail}
                        placeholder="recipient@example.com"
                    />
                </div>
            </div>
            <div class="field">
                <label for="message">Message</label>
                <textarea
                    id="message"
                    rows="3"
                    bind:value={message}
                    placeholder="Please sign and return this document."
                ></textarea>
            </div>

            <button
                class="primary-btn"
                on:click={handleBundle}
                disabled={isProcessing}
            >
                {#if isProcessing}
                    <Loader2 size={18} class="spin" /> Preparing...
                {:else}
                    Create request bundle
                {/if}
            </button>

            <button class="link-btn" on:click={reset}
                >Choose another file</button
            >
        </div>
    {:else if status === "processing"}
        <div class="container centered">
            <Loader2 size={48} class="spin" color="#40E0D0" />
            <h2>Building request packet...</h2>
        </div>
    {:else if status === "success"}
        <div class="container centered">
            <div class="success-icon">
                <CheckCircle size={64} color="#008000" />
            </div>
            <h2>Bundle ready</h2>
            <p>{file?.name.replace(".pdf", "-signature-request.pdf")}</p>

            <div class="actions">
                <button class="download-btn" on:click={downloadBundle}>
                    <Download size={20} />
                    Download
                </button>
            </div>

            <button class="link-btn" on:click={reset}
                >Prepare another request</button
            >
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
        margin-bottom: 24px;
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

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 16px;
        margin-bottom: 16px;
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

    input,
    textarea {
        width: 100%;
        padding: 12px 14px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        font-size: 14px;
        resize: vertical;
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
        background: #36c0b3;
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
        background: #36c0b3;
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
