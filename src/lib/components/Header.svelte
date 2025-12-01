<script>
  import { Menu, Search, Grid } from "lucide-svelte";
</script>

<header>
  <div class="left">
    <div class="logo">
      <img src="/liqflow-logo.png" alt="Liqflow" />
      <span>Liqflow</span>
    </div>
    <nav>
      <a href="/" class="active">Home</a>
      <a href="/tools">Tools</a>
    </nav>
  </div>

  <div class="right">
    <button class="icon-btn"><Search size={20} /></button>
    <button class="icon-btn"><Grid size={20} /></button>
    <button class="sign-in">Sign In</button>
  </div>
</header>

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
</style>
