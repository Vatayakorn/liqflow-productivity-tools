<script>
	import "../app.css";
	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import { MessageCircle } from "lucide-svelte";
</script>

<div class="app">
	<Header />
	<main>
		<slot />
	</main>
	<Footer />
	<a
		href="https://t.me/Liqflow_PDF_Master_Bot"
		target="_blank"
		rel="noopener noreferrer"
		class="telegram-btn"
		aria-label="Chat with Telegram Bot"
	>
		<MessageCircle size={28} />
	</a>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		position: relative;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.telegram-btn {
		position: fixed;
		bottom: 24px;
		right: 24px;
		width: 60px;
		height: 60px;
		background-color: #0088cc; /* Telegram blue */
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		z-index: 1000;
	}

	.telegram-btn:hover {
		transform: scale(1.05);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
	}
</style>
