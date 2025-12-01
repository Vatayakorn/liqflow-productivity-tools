<script>
    import FileUploader from "$lib/components/FileUploader.svelte";
    import { Download, CheckCircle, Loader2 } from "lucide-svelte";
    import { ChevronDown, ChevronUp } from "lucide-svelte";

    let files = [];
    let status = "upload"; // upload, converting, success

    let downloadUrl = null;
    let openFaqIndex = null;

    function handleFilesSelected(event) {
        files = event.detail;
        startConversion();
    }

    async function startConversion() {
        status = "converting";
        try {
            const formData = new FormData();
            formData.append("file", files[0]);

            const response = await fetch("/api/tools/pdf-to-excel", {
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
        a.download = files[0].name.replace(".pdf", ".xlsx");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    const steps = [
        "Select the PDF you want to preserve.",
        "We keep text in cells and align columns/rows based on the PDF layout.",
        "Download the workbook with pages kept in order.",
    ];

    const faqs = [
        {
            question: "Will the layout match the PDF exactly?",
            answer: "We map text into cells using the original positions to keep columns and rows aligned as closely as possible.",
        },
        {
            question: "Can I copy and edit the text?",
            answer: "Yes. Text stays selectable/editable in cells (no images). Complex formatting may vary, but structure is preserved.",
        },
        {
            question: "How are multiple pages handled?",
            answer: "Every PDF page becomes its own worksheet in the same order as the source file.",
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
                <h1>PDF to Excel</h1>
                <p>
                    Preserve the exact PDF layout inside Excel—each page becomes
                    a high-quality image on its own worksheet.
                </p>
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
            <p>{files[0]?.name.replace(".pdf", ".xlsx")}</p>

            <div class="actions">
                <a
                    href={downloadUrl}
                    download={files[0]?.name.replace(".pdf", ".xlsx")}
                    class="download-btn"
                >
                    <Download size={20} />
                    Download Excel
                </a>
            </div>

            <button class="link-btn" on:click={reset}
                >Convert another file</button
            >
        </div>
    {/if}
</div>

<section class="how-to">
    <div class="container">
        <h2>How to convert PDF to Excel</h2>
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

<section class="faq-section">
    <div class="container">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-list">
            {#each faqs as faq, index}
                <div class="faq-item">
                    <button
                        class="faq-question"
                        on:click={() => toggleFaq(index)}
                    >
                        {faq.question}
                        <span class="icon"
                            >{openFaqIndex === index ? "-" : "+"}</span
                        >
                    </button>
                    {#if openFaqIndex === index}
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
        max-width: 800px;
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
        background: #36c0b3;
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

    /* How To Section */
    .how-to {
        padding: 60px 0;
        background: white;
    }

    .how-to h2 {
        font-size: 32px;
        font-weight: 700;
        text-align: center;
        margin-bottom: 40px;
    }

    .steps {
        display: flex;
        justify-content: space-between;
        gap: 24px;
    }

    .step {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .step-number {
        width: 40px;
        height: 40px;
        background: var(--accent-color);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 18px;
        margin-bottom: 16px;
    }

    .step p {
        font-size: 16px;
        line-height: 1.5;
    }

    /* FAQ Section */
    .faq {
        padding: 60px 0;
        background: #f5f5f5;
    }

    .faq h2 {
        font-size: 28px;
        font-weight: 700;
        text-align: center;
        margin-bottom: 40px;
    }

    .faq-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .faq-item {
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .faq-question {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        background: none;
        border: none;
        font-size: 18px;
        font-weight: 600;
        text-align: left;
        cursor: pointer;
        color: var(--text-primary);
    }

    .faq-answer {
        padding: 0 24px 24px;
        color: var(--text-secondary);
        line-height: 1.6;
    }
</style>
