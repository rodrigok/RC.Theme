// ---- Paste in DevTools Console ----
// Fill in your data:
const GIST_ID = 'd8123818f79ad0bd4a651e48a5ccb73a';
const FILENAME = 'theme2.js';
const CONFIG = {
};

(async () => {
	if (!window.rc_theme_code) {
		const r = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
			headers: { 'Accept': 'application/vnd.github+json' },
			cache: 'no-store'
		});
		if (!r.ok) throw new Error('Failed to load gist meta: ' + r.status);
		const data = await r.json();
		const file = data.files?.[FILENAME];
		if (!file) throw new Error(`File ${FILENAME} not found in gist`);
		const code = file.truncated
			? await (await fetch(file.raw_url, { cache: 'no-store' })).text()
			: file.content;
			
		window.rc_theme_code = code;
	}
	
	// Run it in the page context
	(0, eval)(window.rc_theme_code);

    applyCustomTheme2(CONFIG);

	console.log('Gist executed:', FILENAME);
})();