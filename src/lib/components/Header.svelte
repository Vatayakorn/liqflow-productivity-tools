<script>
  import { Menu, Search, X } from "lucide-svelte";
  import { page } from "$app/stores";

  let showSearch = false;
  let searchQuery = "";
  let searchResults = [];

  // All available tools for search
  const allTools = [
    { title: "PDF to Word", href: "/tool/pdf-to-word", category: "Convert" },
    { title: "Merge PDFs", href: "/tool/merge-pdf", category: "Organize" },
    { title: "JPG to PDF", href: "/tool/jpg-to-pdf", category: "Convert" },
    { title: "Compress PDF", href: "/tool/compress-pdf", category: "Optimize" },
    { title: "PDF to Excel", href: "/tool/pdf-to-excel", category: "Convert" },
    { title: "PDF to PPT", href: "/tool/pdf-to-ppt", category: "Convert" },
    { title: "PNG to PDF", href: "/tool/png-to-pdf", category: "Convert" },
    { title: "PDF to JPG", href: "/tool/pdf-to-jpg", category: "Convert" },
    { title: "PDF to PNG", href: "/tool/pdf-to-png", category: "Convert" },
    { title: "OCR PDF", href: "/tool/ocr-pdf", category: "Edit" },
    { title: "Split PDF", href: "/tool/split-pdf", category: "Organize" },
    { title: "Rotate PDF", href: "/tool/rotate-pdf", category: "Edit" },
    { title: "Delete Pages", href: "/tool/delete-pages", category: "Edit" },
    { title: "Fill & Sign", href: "/tool/fill-and-sign", category: "Sign" },
    {
      title: "Request e-signatures",
      href: "/tool/request-signature",
      category: "Sign",
    },
    { title: "Protect PDF", href: "/tool/protect-pdf", category: "Protect" },
    { title: "Edit PDF", href: "/tool/edit-pdf", category: "Edit" },
  ];

  function toggleSearch() {
    showSearch = !showSearch;
    if (showSearch) {
      searchQuery = "";
      searchResults = [];
      // Focus on search input after animation
      setTimeout(() => {
        document.getElementById("search-input")?.focus();
      }, 100);
    }
  }

  function handleSearch() {
    if (searchQuery.trim() === "") {
      searchResults = [];
      return;
    }

    const query = searchQuery.toLowerCase();
    searchResults = allTools.filter(
      (tool) =>
        tool.title.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query),
    );
  }

  function closeSearch() {
    showSearch = false;
    searchQuery = "";
    searchResults = [];
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeSearch();
    }
  }

  function handleOverlayKeydown(event) {
    if (event.key === "Escape") {
      closeSearch();
      return;
    }

    if (
      (event.key === "Enter" || event.key === " ") &&
      event.target === event.currentTarget
    ) {
      event.preventDefault();
      closeSearch();
    }
  }
</script>

<header>
  <div class="left">
    <div class="logo">
      <img src="/liqflow-logo.png" alt="Liqflow" />
      <span>Liqflow</span>
    </div>
    <nav>
      <a href="/" class:active={$page.url.pathname === "/"}>Home</a>
      <a
        href="/tools"
        class:active={$page.url.pathname.startsWith("/tools") ||
          $page.url.pathname.startsWith("/tool/")}>Tools</a
      >
    </nav>
  </div>

  <div class="right">
    <button class="icon-btn" on:click={toggleSearch} aria-label="Search tools">
      <Search size={20} />
    </button>
    <button class="sign-in">Sign In</button>
  </div>
</header>

<!-- Search Overlay -->
{#if showSearch}
  <div
    class="search-overlay"
    on:click={handleOverlayClick}
    on:keydown={handleOverlayKeydown}
    role="button"
    aria-label="Close search overlay"
    tabindex="0"
  >
    <div class="search-container" role="document">
      <div class="search-header">
        <Search size={20} />
        <input
          id="search-input"
          type="text"
          placeholder="Search for tools..."
          bind:value={searchQuery}
          on:input={handleSearch}
        />
        <button class="close-btn" on:click={closeSearch}>
          <X size={20} />
        </button>
      </div>

      <div class="search-results">
        {#if searchQuery.trim() === ""}
          <div class="search-hint">
            <p>Try searching for:</p>
            <div class="search-suggestions">
              <button
                on:click={() => {
                  searchQuery = "PDF";
                  handleSearch();
                }}>PDF</button
              >
              <button
                on:click={() => {
                  searchQuery = "Convert";
                  handleSearch();
                }}>Convert</button
              >
              <button
                on:click={() => {
                  searchQuery = "Merge";
                  handleSearch();
                }}>Merge</button
              >
              <button
                on:click={() => {
                  searchQuery = "Compress";
                  handleSearch();
                }}>Compress</button
              >
            </div>
          </div>
        {:else if searchResults.length === 0}
          <div class="no-results">
            <p>No tools found for "{searchQuery}"</p>
          </div>
        {:else}
          <div class="results-list">
            {#each searchResults as tool}
              <a href={tool.href} class="result-item" on:click={closeSearch}>
                <div class="result-title">{tool.title}</div>
                <div class="result-category">{tool.category}</div>
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  header {
    height: var(--header-height);
    background: var(--bg-white);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 18px;
    color: var(--accent-color);
  }

  .logo img {
    height: 24px;
  }

  nav {
    display: flex;
    gap: 24px;
  }

  nav a {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    padding: 8px 0;
    border-bottom: 2px solid transparent;
  }

  nav a:hover,
  nav a.active {
    border-bottom-color: var(--text-primary);
  }

  .right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-primary);
    padding: 8px;
    border-radius: 50%;
  }

  .icon-btn:hover {
    background-color: var(--bg-color);
  }

  .sign-in {
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }

  .sign-in:hover {
    background-color: var(--bg-color);
  }

  /* Search Overlay Styles */
  .search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 100px;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .search-container {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    animation: slideDown 0.3s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .search-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
  }

  .search-header input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 16px;
    color: var(--text-primary);
  }

  .search-header input::placeholder {
    color: var(--text-secondary);
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    background-color: var(--bg-color);
    color: var(--text-primary);
  }

  .search-results {
    max-height: 400px;
    overflow-y: auto;
  }

  .search-hint {
    padding: 30px 20px;
    text-align: center;
  }

  .search-hint p {
    color: var(--text-secondary);
    margin-bottom: 16px;
  }

  .search-suggestions {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .search-suggestions button {
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .search-suggestions button:hover {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
  }

  .no-results {
    padding: 40px 20px;
    text-align: center;
    color: var(--text-secondary);
  }

  .results-list {
    padding: 8px 0;
  }

  .result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    cursor: pointer;
    transition: background-color 0.2s;
    text-decoration: none;
    color: var(--text-primary);
  }

  .result-item:hover {
    background-color: var(--bg-color);
  }

  .result-title {
    font-size: 15px;
    font-weight: 500;
  }

  .result-category {
    font-size: 13px;
    color: var(--text-secondary);
    background: var(--bg-color);
    padding: 4px 12px;
    border-radius: 12px;
  }
</style>
