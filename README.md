# RC.Theme

Custom theme for Rocket.Chat, applied through the workspace's **Custom Script** setting. No server changes or builds are needed: the script injects the CSS at runtime, and each user adjusts colors, borders and radii from a config panel.

## How it works

```
Custom Script (admin)
  └─ fetches rc_custom_theme.js from this repo and runs rc_custom_theme()
       ├─ creates the "Theme Config" panel (Cmd/Ctrl + click on the avatar)
       ├─ reads the user's settings from localStorage (key gist_theme2)
       └─ if the theme is enabled:
            └─ fetches theme2.js from this repo and runs applyCustomTheme2(CONFIG)
                 └─ injects <style id="theme-2"> into the page
```

Files are served straight from the `main` branch through `raw.githubusercontent.com`.

## Files

| File | Purpose |
| --- | --- |
| `rc_custom_theme.js` | Defines `window.rc_custom_theme()`. Builds the config panel, saves settings to `localStorage`, and loads/applies the theme. |
| `theme2.js` | Defines `window.applyCustomTheme2(options)`. Generates the theme CSS from the options and injects it into the page. |
| `inject.js` | Snippet to paste into the DevTools console to test `theme2.js` directly, bypassing the panel. Fill in `CONFIG` before running it. |

## Installation

1. Go to **Administration → Workspace → Settings → Layout → Custom scripts**.
2. Paste the code below into **Custom script for logged in users** and save.

```js
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
```

This works with Rocket.Chat's default Content-Security-Policy, which allows `connect-src *` and `'unsafe-eval'`.

## Usage

The theme starts **disabled**. To turn it on:

1. Hold **Cmd** (macOS) or **Ctrl** (Windows/Linux) and click your avatar in the navigation bar.
2. In the **Theme Config** panel, check **Enable theme**.

Changes apply immediately and are saved in the browser's `localStorage`, so they are per user and per browser.

| Option | Default | Description |
| --- | --- | --- |
| Enable theme | off | Turns the theme on or off. |
| THEME_URL | `https://raw.githubusercontent.com/rodrigok/RC.Theme/main/theme2.js` | Where the theme file is loaded from. |
| Background Dark | `#0F0F0F` | Base background color in dark mode. |
| Background Light | `#F0F0F0` | Base background color in light mode. |
| Container Border | `0px` | Container border width (0–5px). |
| Border Radius (Default) | `10px` | Radius for containers, messages and inputs (0–40px). |
| Border Radius (Small) | `8px` | Radius for smaller items, like menu options (0–40px). |
| Border Radius (Avatar) | `30%` | Avatar radius (0–100%). |
| ABAC | `none` | Room classification frame: `top-secret` (orange) or `unclassified` (green). |

**Reset to Defaults** restores every value except **Enable theme**.

`THEME_URL` is editable, so you can try a new version of the theme without touching the workspace's Custom Script. Point it at another branch (`.../RC.Theme/my-branch/theme2.js`) or at a local server while developing.

## Publishing changes

Push to `main`. `raw.githubusercontent.com` caches files for up to 5 minutes, and the code is also cached in the page (`window.rc_custom_theme_code`), so users get the new version the next time they reload Rocket.Chat after the cache expires.

Everything on `main` goes live for every user, so test on a branch first via `THEME_URL`.

## Notes

- Files come from `raw.githubusercontent.com`, not the GitHub REST API, so the REST API's 60 requests/hour limit for unauthenticated calls doesn't apply. GitHub may still throttle heavy unauthenticated traffic.
- The theme relies on Fuselage CSS classes (`.rcx-*`) and the current DOM structure. Rocket.Chat updates may break parts of the layout.
