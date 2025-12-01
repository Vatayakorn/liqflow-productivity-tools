import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// Vercel adapter options
			runtime: 'nodejs20.x',
			regions: ['sin1'], // Singapore region for better performance in Asia
			maxDuration: 60, // Max function duration in seconds
			memory: 2048 // Set memory limit to 2048MB (max for personal accounts)
		})
	}
};

export default config;
