<script>
    import ToolCard from "./ToolCard.svelte";
    import {
        FileText,
        Image,
        FileSpreadsheet,
        FileType,
        Scissors,
        Combine,
        RotateCw,
        Trash2,
        PenTool,
        Lock,
    } from "lucide-svelte";

    const tools = [
        {
            category: "Popular",
            items: [
                {
                    title: "PDF to Word",
                    description: "Convert PDFs to Microsoft Word files.",
                    icon: FileText,
                    href: "/tool/pdf-to-word",
                },
                {
                    title: "Merge PDFs",
                    description:
                        "Combine multiple PDFs into one unified document.",
                    icon: Combine,
                    href: "/tool/merge-pdf",
                },

                {
                    title: "JPG to PDF",
                    description: "Turn your images into PDFs.",
                    icon: Image,
                    href: "/tool/jpg-to-pdf",
                },
            ],
        },
        {
            category: "Convert & Compress",
            items: [
                {
                    title: "Compress PDF",
                    description:
                        "Reduce the size of your PDF without losing quality.",
                    icon: FileType,
                    href: "/tool/compress-pdf",
                },
                {
                    title: "PDF to Excel",
                    description:
                        "Convert PDFs to Microsoft Excel spreadsheets.",
                    icon: FileSpreadsheet,
                    href: "/tool/pdf-to-excel",
                },
                {
                    title: "PDF to PPT",
                    description:
                        "Convert PDFs to Microsoft PowerPoint presentations.",
                    icon: FileText,
                    href: "/tool/pdf-to-ppt",
                }, // Using FileText as placeholder for PPT
                {
                    title: "PNG to PDF",
                    description: "Convert PNG images to PDF.",
                    icon: Image,
                    href: "/tool/png-to-pdf",
                },
                {
                    title: "PDF to JPG",
                    description: "Convert PDF pages to JPG images.",
                    icon: Image,
                    href: "/tool/pdf-to-jpg",
                },
                {
                    title: "PDF to PNG",
                    description: "Convert PDF pages to PNG images.",
                    icon: Image,
                    href: "/tool/pdf-to-png",
                },
                {
                    title: "OCR PDF",
                    description: "Recognize text in PDF files.",
                    icon: FileText,
                    href: "/tool/ocr-pdf",
                },
            ],
        },
        {
            category: "Edit & Organize",
            items: [
                {
                    title: "Split PDF",
                    description: "Separate one PDF into multiple files.",
                    icon: Scissors,
                    href: "/tool/split-pdf",
                },
                {
                    title: "Rotate PDF",
                    description: "Rotate your PDF pages.",
                    icon: RotateCw,
                    href: "/tool/rotate-pdf",
                },
                {
                    title: "Delete Pages",
                    description: "Remove pages from your PDF.",
                    icon: Trash2,
                    href: "/tool/delete-pages",
                },
            ],
        },
        {
            category: "Sign & Protect",
            items: [
                {
                    title: "Fill & Sign",
                    description: "Fill and sign PDF forms.",
                    icon: PenTool,
                    href: "/tool/fill-and-sign",
                },
                {
                    title: "Request e-signatures",
                    description: "Send documents for signature.",
                    icon: PenTool,
                    href: "/tool/request-signature",
                },
                {
                    title: "Protect PDF",
                    description: "Add a protection watermark to your PDF.",
                    icon: Lock,
                    href: "/tool/protect-pdf",
                },
            ],
        },
    ];
</script>

<div class="tools-container">
    {#each tools as section}
        <section>
            <h2>{section.category}</h2>
            <div class="grid">
                {#each section.items as tool}
                    <ToolCard {...tool} />
                {/each}
            </div>
        </section>
    {/each}
</div>

<style>
    .tools-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 24px;
    }

    section {
        margin-bottom: 48px;
    }

    h2 {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 24px;
        color: var(--text-primary);
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
    }
</style>
