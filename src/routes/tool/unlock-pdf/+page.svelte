<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import { Loader2, CheckCircle, Download, Unlock } from "lucide-svelte";

    let file = null;
    let status = "upload"; // upload, form, processing, success
    let unlockedUrl = null;
    let password = "";
    let isProcessing = false;
    let error = "";

    function handleFilesSelected(event) {
        const list = event.detail;
        if (list && list.length) {
            file = list[0];
            status = "form";
        }
    }

    async function handleUnlock() {
        if (!file) {
            error = "Please upload a PDF first.";
            return;
        }

        error = "";
        isProcessing = true;
        status = "processing";
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("password", password);

            const response = await fetch("/api/tools/unlock", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.error || "Failed to unlock PDF.");
            }

            const blob = await response.blob();
            unlockedUrl = URL.createObjectURL(blob);
            status = "success";
        } catch (err) {
            console.error(err);
            error =
                err?.message ||
                "Failed to unlock PDF. Please check the password or encryption type.";
            status = "form";
        } finally {
            isProcessing = false;
        }
    }

    function downloadFile() {
        if (!unlockedUrl || !file) return;
        const a = document.createElement("a");
        a.href = unlockedUrl;
        a.download = file.name.replace(".pdf", "-unlocked.pdf");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function reset() {
        file = null;
        unlockedUrl = null;
        password = "";
        status = "upload";
        error = "";
    }
</script>

<div class="tool-page">
    {#if status === "upload"}
        <div class="container">
            <div class="header">
                <h1>Unlock PDF</h1>
                <p>Remove password protection from your PDF.</p>
            </div>
            <FileUploader
                on:filesSelected={handleFilesSelected}
                acceptedFileTypes=".pdf"
            />
        </div>
    {:else if status === "form"}
        <div class="container form">
            <div class="header">
                <h1>Enter Password</h1>
                <p>{file?.name}</p>
            </div>
            <div class="field">
                <label for="password">Password</label>
                <input
                    id="password"
                    type="password"
                    bind:value={password}
                    placeholder="Enter the password to unlock"
                />
            </div>
            {#if error}
                <p class="error">{error}</p>
            {/if}

            <button
                class="primary-btn"
                on:click={handleUnlock}
                disabled={isProcessing}
            >
                {#if isProcessing}
                    <Loader2 size={18} class="spin" /> Unlocking...
                {:else}
                    Unlock PDF
                {/if}
            </button>

            <button class="link-btn" on:click={reset}
                >Choose another file</button
            >
        </div>
    {:else if status === "processing"}
        <div class="container centered">
            <Loader2 size={48} class="spin" color="#40E0D0" />
            <h2>Unlocking PDF...</h2>
        </div>
    {:else if status === "success"}
        <div class="container centered">
            <div class="success-icon">
                <Unlock size={64} color="#008000" />
            </div>
            <h2>PDF Unlocked Successfully</h2>
            <p>{file?.name.replace(".pdf", "-unlocked.pdf")}</p>

            <div class="actions">
                <button class="download-btn" on:click={downloadFile}>
                    <Download size={20} />
                    Download
                </button>
            </div>

            <button class="link-btn" on:click={reset}>Unlock another PDF</button
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

    .error {
        color: #b3261e;
        margin-top: 8px;
    }
</style>
