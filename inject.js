// ---- Paste in DevTools Console ----
// Fill in your data:
const THEME_URL = 'https://raw.githubusercontent.com/rodrigok/RC.Theme/main/theme2.js';
const CONFIG = {
};

(async () => {
	if (!window.rc_theme_code) {
		const r = await fetch(THEME_URL, { cache: 'no-store' });
		if (!r.ok) throw new Error(`Failed to load ${THEME_URL}: ${r.status}`);

		window.rc_theme_code = await r.text();
	}

	// Run it in the page context
	(0, eval)(window.rc_theme_code);

    applyCustomTheme2(CONFIG);

	console.log('Theme executed:', THEME_URL);
})();
