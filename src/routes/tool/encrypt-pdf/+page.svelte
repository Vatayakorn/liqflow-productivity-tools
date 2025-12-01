<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import { Loader2, CheckCircle, Download, Lock } from "lucide-svelte";

    let file = null;
    let status = "upload"; // upload, form, processing, success
    let protectedUrl = null;
    let password = "";
    let isProcessing = false;

    function handleFilesSelected(event) {
        const list = event.detail;
        if (list && list.length) {
            file = list[0];
            status = "form";
        }
    }

    async function handleProtect() {
        if (!file) {
            alert("Please upload a PDF first.");
            return;
        }

        if (!password) {
            alert("Please enter a password.");
            return;
        }

        isProcessing = true;
        status = "processing";
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("password", password);

            const response = await fetch("/api/tools/encrypt-pdf", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Encryption failed");
            }

            const blob = await response.blob();
            protectedUrl = URL.createObjectURL(blob);
            status = "success";
        } catch (error) {
            console.error(error);
            alert("Failed to apply protection.");
            status = "form";
        } finally {
            isProcessing = false;
        }
    }

    function downloadFile() {
        if (!protectedUrl || !file) return;
        const a = document.createElement("a");
        a.href = protectedUrl;
        a.download = file.name.replace(".pdf", "-encrypted.pdf");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function reset() {
        file = null;
        protectedUrl = null;
        password = "";
        status = "upload";
    }
</script>

<div class="tool-page">
    {#if status === "upload"}
        <div class="container">
            <div class="header">
                <h1>Encrypt PDF</h1>
                <p>Secure your PDF with a password.</p>
            </div>
            <FileUploader
                on:filesSelected={handleFilesSelected}
                acceptedFileTypes=".pdf"
            />
        </div>
    {:else if status === "form"}
        <div class="container form">
            <div class="header">
                <h1>Set Password</h1>
                <p>{file?.name}</p>
            </div>
            <div class="field">
                <label for="password">Password</label>
                <input
                    id="password"
                    type="password"
                    bind:value={password}
                    placeholder="Enter password to encrypt PDF"
                />
            </div>

            <button
                class="primary-btn"
                on:click={handleProtect}
                disabled={isProcessing}
            >
                {#if isProcessing}
                    <Loader2 size={18} class="spin" /> Encrypting...
                {:else}
                    Encrypt PDF
                {/if}
            </button>

            <button class="link-btn" on:click={reset}
                >Choose another file</button
            >
        </div>
    {:else if status === "processing"}
        <div class="container centered">
            <Loader2 size={48} class="spin" color="#40E0D0" />
            <h2>Encrypting PDF...</h2>
        </div>
    {:else if status === "success"}
        <div class="container centered">
            <div class="success-icon">
                <Lock size={64} color="#008000" />
            </div>
            <h2>PDF Encrypted Successfully</h2>
            <p>{file?.name.replace(".pdf", "-encrypted.pdf")}</p>

            <div class="actions">
                <button class="download-btn" on:click={downloadFile}>
                    <Download size={20} />
                    Download
                </button>
            </div>

            <button class="link-btn" on:click={reset}
                >Encrypt another PDF</button
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
