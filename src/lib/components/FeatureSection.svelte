<script>
    import { Zap, Shield, Share2, MonitorSmartphone } from "lucide-svelte";

    const features = [
        {
            icon: Zap,
            title: "Convert",
            description:
                "Convert files to and from PDF. Use our PDF converter to turn Microsoft Word, Excel, and PowerPoint documents into PDFs or vice versa.",
        },
        {
            icon: Shield,
            title: "Sign & Protect",
            description:
                "Fill and sign PDF forms. Request e-signatures. Protect PDF files with passwords.",
        },
        {
            icon: Share2,
            title: "Share",
            description:
                "Share files with others for review or comment. Collect feedback in one place.",
        },
        {
            icon: MonitorSmartphone,
            title: "Edit",
            description:
                "Edit text and images in your PDF. Add comments, highlights, and sticky notes.",
        },
    ];
</script>

<section class="features">
    <div class="container">
        <h2>Why use Liqflow Online?</h2>
        <div class="grid">
            {#each features as feature}
                <div class="feature-card">
                    <div class="icon-wrapper">
                        <svelte:component this={feature.icon} size={32} />
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                </div>
            {/each}
        </div>
    </div>
</section>

<style>
    .features {
        background: #f5f5f5;
        padding: 80px 0;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
    }

    h2 {
        font-size: 32px;
        font-weight: 700;
        text-align: center;
        margin-bottom: 48px;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 32px;
    }

    .feature-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 16px;
    }

    .icon-wrapper {
        width: 64px;
        height: 64px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--accent-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    h3 {
        font-size: 20px;
        font-weight: 700;
        margin: 0;
    }

    p {
        font-size: 16px;
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0;
    }
</style>
