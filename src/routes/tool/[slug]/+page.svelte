<script>
    import { page } from "$app/stores";
    import FileUploader from "$lib/components/FileUploader.svelte";
    import Workspace from "$lib/components/Workspace.svelte";

    $: slug = $page.params.slug;
    $: toolName = slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    let files = [];

    function handleFilesSelected(event) {
        files = event.detail;
    }
</script>

<div class="tool-page">
    {#if files.length === 0}
        <div class="upload-container">
            <div class="header">
                <h1>{toolName}</h1>
                <p>Upload your file to get started.</p>
            </div>
            <FileUploader on:filesSelected={handleFilesSelected} />
        </div>
    {:else}
        <Workspace {files} {toolName} />
    {/if}
</div>

<style>
    .tool-page {
        min-height: calc(100vh - var(--header-height));
        background: var(--bg-color);
    }

    .upload-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 60px 24px;
        text-align: center;
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
</style>
