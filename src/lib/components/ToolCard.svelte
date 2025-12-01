<script>
    export let title;
    export let description;
    export let icon;
    export let href;
</script>

<a {href} class="tool-card">
    <div class="icon-wrapper">
        <svelte:component this={icon} size={40} strokeWidth={1.5} />
    </div>
    <h3>{title}</h3>
    <p>{description}</p>
</a>

<style>
    .tool-card {
        background: var(--bg-white);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        transition: all 0.2s ease;
        height: 100%;
    }

    .tool-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
        border-color: transparent;
    }

    .icon-wrapper {
        color: var(--accent-color);
    }

    h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
    }

    p {
        margin: 0;
        font-size: 14px;
        color: var(--text-secondary);
        line-height: 1.5;
    }
</style>
