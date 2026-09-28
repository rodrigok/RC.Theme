// Code added by Rodrigo Nascimento on March 20th 2026
// Loads the custom theme from https://github.com/rodrigok/RC.Theme

if (!window.rc_custom_theme_code) {
	(async () => {
		const SCRIPT_URL = 'https://raw.githubusercontent.com/rodrigok/RC.Theme/main/rc_custom_theme.js';

		const r = await fetch(SCRIPT_URL, { cache: 'no-store' });
		if (!r.ok) throw new Error(`Failed to load ${SCRIPT_URL}: ${r.status}`);

		window.rc_custom_theme_code = await r.text();

		// Run it in the page context
		(0, eval)(window.rc_custom_theme_code);

		rc_custom_theme();

		console.log('Theme loaded:', SCRIPT_URL);
	})();
}
