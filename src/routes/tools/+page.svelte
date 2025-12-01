<script>
    import ToolsGrid from "$lib/components/ToolsGrid.svelte";
    import FeatureSection from "$lib/components/FeatureSection.svelte";
</script>

<div class="page-container">
    <div class="hero">
        <h1>Empowering Liqflow Team Productivity</h1>
        <p>Internal tools to streamline your daily document workflows.</p>
    </div>

    <ToolsGrid />

    <FeatureSection />
</div>

<style>
    .page-container {
        background: var(--bg-white);
    }

    .hero {
        text-align: center;
        padding: 80px 24px 40px;
        background: var(--bg-white);
        max-width: 800px;
        margin: 0 auto;
    }

    h1 {
        font-size: 48px;
        font-weight: 800;
        margin: 0 0 16px;
        letter-spacing: -0.5px;
        line-height: 1.1;
    }

    p {
        font-size: 20px;
        color: var(--text-secondary);
        margin: 0;
    }
</style>
