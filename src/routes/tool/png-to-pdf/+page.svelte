<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import { Download, CheckCircle, Loader2, Image as ImageIcon, Layers, ShieldCheck, ChevronDown, ChevronUp } from "lucide-svelte";

    let files = [];
    let status = "upload"; // upload, converting, success
    let downloadUrl = null;
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
            files.forEach((file) => formData.append("files", file));

            const response = await fetch("/api/tools/png-to-pdf", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.error || "Conversion failed");
            }

            const blob = await response.blob();
            downloadUrl = URL.createObjectURL(blob);
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
        const name =
            files.length === 1
                ? files[0].name.replace(/\.png$/i, "") + ".pdf"
                : "png-images.pdf";
        a.href = downloadUrl;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    const highlights = [
        {
            title: "True-to-size pages",
            description: "Each PNG is placed on its own PDF page using the image’s exact dimensions.",
            icon: ImageIcon,
        },
        {
            title: "Multi-image support",
            description: "Upload several PNG files and we’ll stack them into one PDF.",
            icon: Layers,
        },
        {
            title: "On-device processing",
            description: "Files are converted and returned immediately—no long-term storage.",
            icon: ShieldCheck,
        },
    ];

    const steps = [
        "Select one or more PNG files.",
        "We generate a PDF with a page per image.",
        "Download your PDF and share.",
    ];

    const faqs = [
        {
            question: "Can I upload multiple PNGs?",
            answer: "Yes. Each PNG becomes a separate page in the resulting PDF, in the order you select them.",
        },
        {
            question: "Will image quality change?",
            answer: "No scaling is applied—images keep their original resolution and dimensions on the PDF page.",
        },
        {
            question: "Do you support JPG or other formats?",
            answer: "This tool is PNG-only. Use the JPG to PDF tool for JPGs or convert images first.",
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
                <h1>PNG to PDF</h1>
                <p>Combine one or many PNGs into a clean, ready-to-share PDF.</p>
                <div class="pill">.png only</div>
            </div>

            <FileUploader on:filesSelected={handleFilesSelected} acceptedFileTypes=".png" />
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
            <h2>Creating your PDF...</h2>
            <p>
                {#if files.length === 1}
                    {files[0]?.name}
                {:else}
                    {files.length} images selected
                {/if}
            </p>
        </div>
    {:else if status === "success"}
        <div class="container centered">
            <div class="success-icon">
                <CheckCircle size={64} color="#008000" />
            </div>
            <h2>Your PDF is ready</h2>
            <p>
                {#if files.length === 1}
                    {files[0]?.name.replace(/\.png$/i, "") + ".pdf"}
                {:else}
                    png-images.pdf
                {/if}
            </p>

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
                }}>Convert another file</button
            >
        </div>
    {/if}
</div>

<section class="how-to">
    <div class="container">
        <h2>How to turn PNG into PDF</h2>
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
