<script>
  import ToolsGrid from "$lib/components/ToolsGrid.svelte";
</script>

<div class="hero">
  <h1>Liqflow Online tools</h1>
  <p>Do your best work online with the best PDF tools.</p>
</div>

<ToolsGrid />

<style>
  .hero {
    text-align: center;
    padding: 80px 24px 40px;
    background: var(--bg-white);
  }

  h1 {
    font-size: 48px;
    font-weight: 800;
    margin: 0 0 16px;
    letter-spacing: -0.5px;
  }

  p {
    font-size: 20px;
    color: var(--text-secondary);
    margin: 0 0 32px;
  }
</style>
