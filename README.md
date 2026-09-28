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
| `custom_script.js` | Loader that goes into the workspace's Custom Script setting. Fetches `rc_custom_theme.js` from this repo and runs it. |
| `rc_custom_theme.js` | Defines `window.rc_custom_theme()`. Builds the config panel, saves settings to `localStorage`, and loads/applies the theme. |
| `theme2.js` | Defines `window.applyCustomTheme2(options)`. Generates the theme CSS from the options and injects it into the page. |

## Installation

1. Go to **Administration → Workspace → Settings → Layout → Custom scripts**.
2. Paste the contents of [`custom_script.js`](custom_script.js) into **Custom script for logged in users** and save.

The loader works with Rocket.Chat's default Content-Security-Policy, which allows `connect-src *` and `'unsafe-eval'`.

## Usage

The theme starts **disabled**. To turn it on:

1. Hold **Cmd** (macOS) or **Ctrl** (Windows/Linux) and click your avatar in the navigation bar.
2. In the **Theme Config** panel, check **Enable theme**.

Changes apply immediately and are saved in the browser's `localStorage`, so they are per user and per browser.

| Option | Default | Description |
| --- | --- | --- |
| Enable theme | off | Turns the theme on or off. |
| THEME_URL | `https://raw.githubusercontent.com/rodrigok/RC.Theme/main/theme2.js` | Where the theme file is loaded from. Clear it to go back to the default. |
| ABAC | `none` | Room classification frame: `top-secret` (orange) or `unclassified` (green). |
| Preset | Black & White | Predefined themes. Selecting one resets every option below it. |
| Background Dark | `#000000` | Base background color in dark mode. |
| Background Light | `#ffffff` | Base background color in light mode. |
| Container Border | `0px` | Container border width (0–5px). |
| Border Radius (Default) | `10px` | Radius for containers, messages and inputs (0–40px). |
| Border Radius (Small) | `8px` | Radius for smaller items, like menu options (0–40px). |
| Border Radius (Avatar) | `30%` | Avatar radius (0–100%). |

### Presets

| Preset | Background Dark | Background Light | Border | Radius (Default / Small / Avatar) |
| --- | --- | --- | --- | --- |
| Black & White | `#000000` | `#ffffff` | `0px` | `10px` / `8px` / `30%` |
| Slate | `#25353c` | `#f0f0f0` | `0px` | `10px` / `8px` / `30%` |

The selected preset stays highlighted while the options match it. Tweaking any of them turns it into a custom setup, and selecting a preset again resets them. To add a preset, add an entry to `PRESETS` in `rc_custom_theme.js`.

`THEME_URL` is editable, so you can try a new version of the theme without touching the workspace's Custom Script. Point it at another branch (`.../RC.Theme/my-branch/theme2.js`) or at a local server while developing.

## Publishing changes

Push to `main`. `raw.githubusercontent.com` caches files for up to 5 minutes, and the code is also cached in the page (`window.rc_custom_theme_code`), so users get the new version the next time they reload Rocket.Chat after the cache expires.

Everything on `main` goes live for every user, so test on a branch first via `THEME_URL`.

## Notes

- Files come from `raw.githubusercontent.com`, not the GitHub REST API, so the REST API's 60 requests/hour limit for unauthenticated calls doesn't apply. GitHub may still throttle heavy unauthenticated traffic.
- The theme relies on Fuselage CSS classes (`.rcx-*`) and the current DOM structure. Rocket.Chat updates may break parts of the layout.
