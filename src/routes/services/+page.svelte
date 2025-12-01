<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import {
        Download,
        Loader2,
        CheckCircle,
        Shield,
        FileText,
        FileSpreadsheet,
        Lock,
        Combine,
    } from "lucide-svelte";

    const services = {
        merge: {
            title: "Merge PDF",
            description: "Combine multiple PDFs into a single file.",
            path: "/api/merge",
            method: "POST",
            accepts: ".pdf",
            multiple: true,
            output: "PDF",
            tip: "Attach 2+ PDF files. They will be merged in the order selected.",
        },
        pdf2excel: {
            title: "PDF to Excel",
            description: "Convert PDF pages to structured Excel (one sheet per page).",
            path: "/api/pdf2excel",
            method: "POST",
            accepts: ".pdf",
            multiple: false,
            output: "XLSX",
            tip: "Upload one PDF. Output filename matches the PDF name.",
        },
        pdf2word: {
            title: "PDF to Word",
            description: "Convert PDFs to editable Word documents.",
            path: "/api/pdf2word",
            method: "POST",
            accepts: ".pdf",
            multiple: false,
            output: "DOCX",
            tip: "Upload one PDF. Output filename matches the PDF name.",
        },
        protect: {
            title: "Protect PDF",
            description: "Apply password protection to your PDF.",
            path: "/api/protect",
            method: "POST",
            accepts: ".pdf",
            multiple: false,
            output: "PDF",
            tip: "Set a strong password. Protected file will be prefixed with protected_.",
            needsPassword: true,
        },
    };

    let baseUrl = "http://localhost:8000";

    const initialState = () => ({
        files: [],
        status: "idle", // idle | loading | success | error
        downloadUrl: null,
        filename: "",
        error: "",
        password: "",
    });

    let state = {
        merge: initialState(),
        pdf2excel: initialState(),
        pdf2word: initialState(),
        protect: initialState(),
    };

    function handleFilesSelected(key, event) {
        state = {
            ...state,
            [key]: {
                ...state[key],
                files: event.detail,
                error: "",
                status: "idle",
                downloadUrl: null,
            },
        };
    }

    async function submit(key) {
        const svc = services[key];
        const current = state[key];
        if (!current.files?.length) {
            state = { ...state, [key]: { ...current, error: "Please select a file first." } };
            return;
        }
        if (svc.needsPassword && !current.password) {
            state = { ...state, [key]: { ...current, error: "Password is required." } };
            return;
        }

        const formData = new FormData();
        if (svc.multiple) {
            current.files.forEach((file) => formData.append("files", file));
        } else {
            formData.append("file", current.files[0]);
        }
        if (svc.needsPassword) {
            formData.append("password", current.password);
        }

        state = { ...state, [key]: { ...current, status: "loading", error: "", downloadUrl: null } };

        try {
            const response = await fetch(`${baseUrl}${svc.path}`, {
                method: svc.method,
                body: formData,
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.detail || payload.error || "Request failed");
            }

            const blob = await response.blob();
            const disposition = response.headers.get("content-disposition");
            let filename = `${current.files[0].name}.${svc.output.toLowerCase()}`;
            if (disposition) {
                const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
                if (match?.[1]) filename = decodeURIComponent(match[1]);
            }

            const downloadUrl = URL.createObjectURL(blob);
            state = {
                ...state,
                [key]: {
                    ...state[key],
                    status: "success",
                    downloadUrl,
                    filename,
                },
            };
        } catch (err) {
            state = {
                ...state,
                [key]: {
                    ...state[key],
                    status: "error",
                    error: err?.message || "Request failed",
                },
            };
        }
    }

    function download(key) {
        const current = state[key];
        if (!current.downloadUrl) return;
        const a = document.createElement("a");
        a.href = current.downloadUrl;
        a.download = current.filename || "download";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function reset(key) {
        state = { ...state, [key]: initialState() };
    }
</script>

<div class="page">
    <header class="hero">
        <p class="eyebrow">Service Catalog</p>
        <h1>Legacy Python API (FastAPI)</h1>
        <p>
            Wrapped the services from <code>/Users/iphone/Desktop/Liqflow/liqflow-pdf-master</code>
            into a clean Svelte UI. Point to your running FastAPI base URL, pick a
            service, and run it.
        </p>

        <div class="base-url">
            <label for="base">Base URL</label>
            <input
                id="base"
                type="text"
                bind:value={baseUrl}
                placeholder="http://localhost:8000"
            />
            <p class="hint">Default matches the FastAPI server in api.py (port 8000).</p>
        </div>
    </header>

    <div class="grid">
        {#each Object.entries(services) as [key, svc]}
            <section class="card">
                <div class="card-head">
                    <div class="icon">
                        {#if key === "merge"}
                            <Combine size={24} />
                        {:else if key === "pdf2excel"}
                            <FileSpreadsheet size={24} />
                        {:else if key === "pdf2word"}
                            <FileText size={24} />
                        {:else}
                            <Lock size={24} />
                        {/if}
                    </div>
                    <div>
                        <h2>{svc.title}</h2>
                        <p>{svc.description}</p>
                    </div>
                </div>

                <div class="meta">
                    <span class="pill">{svc.method}</span>
                    <span class="pill">{svc.path}</span>
                    <span class="pill">Output: {svc.output}</span>
                </div>

                <p class="tip">{svc.tip}</p>

                <div class="uploader">
                    <FileUploader
                        on:filesSelected={(e) => handleFilesSelected(key, e)}
                        acceptedFileTypes={svc.accepts}
                        multiple={svc.multiple}
                    />
                    {#if svc.needsPassword}
                        <div class="field">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter password"
                                value={state[key].password}
                                on:input={(e) =>
                                    (state = {
                                        ...state,
                                        [key]: { ...state[key], password: e.target.value },
                                    })}
                            />
                        </div>
                    {/if}
                </div>

                {#if state[key].error}
                    <p class="error">{state[key].error}</p>
                {/if}

                {#if state[key].status === "loading"}
                    <div class="status loading">
                        <Loader2 class="spin" size={20} />
                        <span>Processing...</span>
                    </div>
                {:else if state[key].status === "success"}
                    <div class="status success">
                        <CheckCircle size={20} color="#0b8a42" />
                        <div>
                            <div>Ready: {state[key].filename}</div>
                            <button class="download-btn" on:click={() => download(key)}>
                                <Download size={18} />
                                Download
                            </button>
                        </div>
                    </div>
                {/if}

                <div class="actions">
                    <button class="primary" on:click={() => submit(key)}>Run {svc.title}</button>
                    <button class="ghost" on:click={() => reset(key)}>Reset</button>
                </div>
            </section>
        {/each}
    </div>

    <section class="details">
        <h3>Service endpoints detected</h3>
        <ul>
            <li><code>GET /health</code> — health check</li>
            <li><code>POST /api/merge</code> — merge PDFs (files[])</li>
            <li><code>POST /api/pdf2excel</code> — PDF → Excel (file)</li>
            <li><code>POST /api/pdf2word</code> — PDF → Word (file)</li>
            <li><code>POST /api/protect</code> — password-protect PDF (file + password)</li>
        </ul>
        <p class="hint">
            Services originate from <code>api.py</code> in the referenced directory.
            Ensure that FastAPI server is running (e.g., <code>uvicorn api:app --reload</code>) before using this UI.
        </p>
    </section>
</div>

<style>
    .page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 32px 16px 64px;
    }

    .hero {
        background: var(--bg-white);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
    }

    .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 12px;
        font-weight: 700;
        color: #0265dc;
        margin: 0 0 8px;
    }

    h1 {
        margin: 0 0 8px;
        font-size: 32px;
        font-weight: 800;
    }

    .hero p {
        margin: 0 0 12px;
        color: var(--text-secondary);
    }

    .base-url {
        margin-top: 12px;
        display: grid;
        gap: 6px;
    }

    .base-url label {
        font-weight: 700;
    }

    .base-url input {
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid var(--border-color);
        font-size: 14px;
    }

    .hint {
        color: var(--text-secondary);
        font-size: 13px;
        margin: 0;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 16px;
    }

    .card {
        background: var(--bg-white);
        border: 1px solid var(--border-color);
        border-radius: 14px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .card-head {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    .icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(2, 101, 220, 0.08);
        display: grid;
        place-items: center;
        color: #0265dc;
    }

    .card h2 {
        margin: 0;
        font-size: 18px;
    }

    .card p {
        margin: 0;
        color: var(--text-secondary);
    }

    .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .pill {
        display: inline-flex;
        align-items: center;
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(2, 101, 220, 0.08);
        color: #0265dc;
        font-weight: 700;
        font-size: 12px;
    }

    .tip {
        font-size: 14px;
        margin: 0;
        color: var(--text-secondary);
    }

    .uploader {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .field {
        display: grid;
        gap: 6px;
    }

    .field label {
        font-weight: 700;
        font-size: 14px;
    }

    .field input {
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid var(--border-color);
        font-size: 14px;
    }

    .error {
        color: #b3261e;
        margin: 0;
    }

    .status {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f5f5f5;
        border-radius: 10px;
        padding: 10px;
    }

    .status.success {
        background: rgba(11, 138, 66, 0.08);
    }

    .download-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border-radius: 10px;
        border: 1px solid var(--border-color);
        background: white;
        cursor: pointer;
    }

    .spin {
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

    .actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }

    .primary {
        border: none;
        background: #0265dc;
        color: white;
        padding: 10px 16px;
        border-radius: 10px;
        font-weight: 700;
        cursor: pointer;
    }

    .ghost {
        border: 1px solid var(--border-color);
        background: white;
        color: var(--text-primary);
        padding: 10px 16px;
        border-radius: 10px;
        font-weight: 700;
        cursor: pointer;
    }

    .details {
        margin-top: 32px;
        background: var(--bg-white);
        border: 1px solid var(--border-color);
        border-radius: 14px;
        padding: 16px;
    }

    .details h3 {
        margin: 0 0 8px;
    }

    .details ul {
        padding-left: 18px;
        margin: 8px 0;
    }

    .details li {
        margin: 4px 0;
    }

    code {
        background: #f2f4f7;
        padding: 2px 6px;
        border-radius: 6px;
        font-family: monospace;
    }

    @media (max-width: 640px) {
        .grid {
            grid-template-columns: 1fr;
        }

        .card-head {
            align-items: flex-start;
        }
    }
</style>
