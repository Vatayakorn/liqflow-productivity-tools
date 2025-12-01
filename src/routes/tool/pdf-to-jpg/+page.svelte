<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import {
        Download,
        CheckCircle,
        Loader2,
        FileImage,
        Layers,
        ShieldCheck,
        ChevronDown,
        ChevronUp,
    } from "lucide-svelte";

    let files = [];
    let status = "upload"; // upload, converting, success
    let downloadUrl = null;
    let downloadName = "pages.zip";
    let error = "";
    let openFaqIndex = null;

    function handleFilesSelected(event) {
        files = event.detail;
        startConversion();
    }

    async function startConversion() {
        status = "converting";
        error = "";
        try {
            const formData = new FormData();
            formData.append("file", files[0]);

            const response = await fetch("/api/tools/pdf-to-jpg", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.error || "Conversion failed");
            }

            const blob = await response.blob();
            downloadUrl = URL.createObjectURL(blob);

            const disposition = response.headers.get("content-disposition");
            if (disposition) {
                const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
                if (match?.[1]) {
                    downloadName = decodeURIComponent(match[1]);
                }
            } else {
                downloadName = files[0].name.replace(/\.pdf$/i, "") + ".zip";
            }

            status = "success";
        } catch (err) {
            console.error(err);
            error = err?.message || "Conversion failed. Please try again.";
            status = "upload";
        }
    }

    function downloadFile() {
        if (!downloadUrl) return;
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    const highlights = [
        {
            title: "One image per page",
            description:
                "Each PDF page is rendered to its own JPG so you can reuse slides, reports, or scans.",
            icon: FileImage,
        },
        {
            title: "Multi-page ready",
            description:
                "If your PDF has many pages, we package all JPGs into a single ZIP for easy download.",
            icon: Layers,
        },
        {
            title: "Secure & instant",
            description:
                "Files are processed on the fly and sent right back—no long-term storage.",
            icon: ShieldCheck,
        },
    ];

    const steps = [
        "Upload the PDF you want to turn into images.",
        "We render each page as a high-quality JPG.",
        "Download the JPG (or ZIP if multiple pages).",
    ];

    const faqs = [
        {
            question: "Do you support multi-page PDFs?",
            answer: "Yes. Each page is converted to a separate JPG. Multi-page PDFs are delivered as a ZIP bundle.",
        },
        {
            question: "What if I only need the first page?",
            answer: "Download the ZIP and use the specific JPG you need. Future update can add page selection if required.",
        },
        {
            question: "Is image quality preserved?",
            answer: "Pages are rendered at 150% scale and exported as high-quality JPGs to balance clarity and file size.",
        },
    ];

    function toggleFaq(index) {
        openFaqIndex = openFaqIndex === index ? null : index;
    }
</script>

<div class="tool-page">
    {#if status === "upload"}
        <div class="container">
            <div class="header">
                <h1>PDF to JPG</h1>
                <p>Render PDF pages into crisp JPG images, ready to share.</p>
                <div class="pill">.pdf only</div>
            </div>

            <FileUploader on:filesSelected={handleFilesSelected} acceptedFileTypes=".pdf" />
            {#if error}
                <p class="error">{error}</p>
            {/if}

            <div class="highlights">
                {#each highlights as item}
                    <div class="highlight-card">
                        <svelte:component this={item.icon} size={28} color="#0265dc" />
                        <div>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {:else if status === "converting"}
        <div class="container centered">
            <div class="loader">
                <Loader2 size={48} class="spin" color="#40E0D0" />
            </div>
            <h2>Converting your pages...</h2>
            <p>{files[0]?.name}</p>
        </div>
    {:else if status === "success"}
        <div class="container centered">
            <div class="success-icon">
                <CheckCircle size={64} color="#008000" />
            </div>
            <h2>Your images are ready</h2>
            <p>{downloadName}</p>

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
                    downloadUrl = null;
                    downloadName = "pages.zip";
                }}>Convert another file</button
            >
        </div>
    {/if}
</div>

<section class="how-to">
    <div class="container">
        <h2>How to convert PDF to JPG</h2>
        <div class="steps">
            {#each steps as step, i}
                <div class="step">
                    <span class="step-number">{i + 1}</span>
                    <p>{step}</p>
                </div>
            {/each}
        </div>
    </div>
</section>

<section class="faq">
    <div class="container">
        <h2>FAQs</h2>
        <div class="faq-list">
            {#each faqs as faq, i}
                <div class="faq-item">
                    <button class="faq-question" on:click={() => toggleFaq(i)}>
                        {faq.question}
                        {#if openFaqIndex === i}
                            <ChevronUp size={20} />
                        {:else}
                            <ChevronDown size={20} />
                        {/if}
                    </button>
                    {#if openFaqIndex === i}
                        <div class="faq-answer">
                            <p>{faq.answer}</p>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </div>
</section>

<style>
    .tool-page {
        min-height: calc(100vh - var(--header-height));
        background: var(--bg-color);
        display: flex;
        justify-content: center;
        padding-top: 60px;
    }

    .container {
        max-width: 900px;
        width: 100%;
        padding: 0 24px;
        text-align: center;
        margin: 0 auto;
    }

    .centered {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 520px;
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
    }

    .pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 6px 14px;
        border-radius: 999px;
        background: rgba(2, 101, 220, 0.08);
        color: #0265dc;
        font-weight: 700;
        font-size: 12px;
        letter-spacing: 0.2px;
        margin-top: 12px;
    }

    .highlights {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
        margin: 28px 0 0;
    }

    .highlight-card {
        background: var(--bg-white);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        gap: 12px;
        text-align: left;
    }

    .highlight-card h3 {
        margin: 0 0 6px;
        font-size: 16px;
    }

    .highlight-card p {
        margin: 0;
        font-size: 14px;
        color: var(--text-secondary);
        line-height: 1.4;
    }

    .loader {
        margin-bottom: 16px;
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

    .download-btn {
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

    .error {
        color: #b3261e;
        margin-top: 12px;
    }

    .how-to {
        background: var(--bg-white);
        padding: 48px 0;
    }

    .steps {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
        margin-top: 20px;
    }

    .step {
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 16px;
        text-align: left;
    }

    .step-number {
        display: inline-flex;
        width: 28px;
        height: 28px;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #0265dc;
        color: white;
        font-weight: 700;
        margin-bottom: 10px;
    }

    .faq {
        padding: 48px 0 64px;
        background: var(--bg-color);
    }

    .faq-list {
        margin-top: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .faq-item {
        background: var(--bg-white);
        border: 1px solid var(--border-color);
        border-radius: 12px;
    }

    .faq-question {
        width: 100%;
        background: none;
        border: none;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
    }

    .faq-answer {
        padding: 0 16px 16px;
        text-align: left;
        color: var(--text-secondary);
    }

    @media (max-width: 640px) {
        h1 {
            font-size: 32px;
        }

        .tool-page {
            padding-top: 32px;
        }
    }
</style>
