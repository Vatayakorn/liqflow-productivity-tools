<script>
    import { UploadCloud } from "lucide-svelte";
    import { createEventDispatcher } from "svelte";

    export let acceptedFileTypes = ".pdf,.jpg,.png";

    const dispatch = createEventDispatcher();
    let isDragging = false;
    let fileInput;

    function handleDragOver(e) {
        e.preventDefault();
        isDragging = true;
    }

    function handleDragLeave() {
        isDragging = false;
    }

    function handleDrop(e) {
        e.preventDefault();
        isDragging = false;
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    }

    function isAllowed(file) {
        const allowed = acceptedFileTypes
            .split(",")
            .map((ext) => ext.trim().toLowerCase())
            .filter(Boolean);

        if (allowed.includes("*")) return true;

        const name = file.name.toLowerCase();
        return allowed.some((ext) => name.endsWith(ext));
    }

    function handleFiles(files) {
        const validFiles = Array.from(files).filter((file) => isAllowed(file));
        if (validFiles.length > 0) {
            dispatch("filesSelected", validFiles);
        } else {
            alert("Please upload a file with an accepted file type.");
        }
    }
</script>

<div
    class="dropzone {isDragging ? 'dragging' : ''}"
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    role="button"
    tabindex="0"
>
    <div class="content">
        <UploadCloud size={64} color={isDragging ? "#40E0D0" : "#707070"} />
        <h2>Select a file to get started</h2>
        <p>or drop file here</p>
        <button class="select-btn" on:click={() => fileInput.click()}
            >Select a file</button
        >
        <input
            type="file"
            accept={acceptedFileTypes}
            multiple
            bind:this={fileInput}
            on:change={handleFileSelect}
            hidden
        />
    </div>
</div>

<style>
    .dropzone {
        width: 100%;
        height: 400px;
        background: var(--bg-white);
        border: 2px dashed var(--border-color);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }

    .dropzone.dragging {
        border-color: var(--accent-color);
        background-color: rgba(64, 224, 208, 0.1);
    }

    .content {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
    }

    h2 {
        font-size: 24px;
        margin: 0;
    }

    p {
        color: var(--text-secondary);
        margin: 0;
    }

    .select-btn {
        background: var(--accent-color);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 24px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 16px;
    }

    .select-btn:hover {
        background: #36C0B3;
    }
</style>
