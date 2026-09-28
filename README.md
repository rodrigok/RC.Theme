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

The theme follows the mode Rocket.Chat is rendering, not the operating system. It reads the mode from the `main-palette-<mode>` style tag Rocket.Chat fills, and re-applies itself whenever that changes.

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

Changes apply immediately and are saved in the browser's `localStorage`, so they are per user and per browser. **Appearance** is the exception: it's saved to the user's Rocket.Chat account.

| Option | Default | Description |
| --- | --- | --- |
| Appearance | Rocket.Chat's current setting | Auto, Light or Dark. The same setting as **Theme** under **Accessibility & appearance** in the account preferences, saved through `users.setPreferences`. Works with the theme on or off. High contrast isn't offered because the theme has no styles for it. |
| Enable theme | off | Turns the theme on or off. |
| ABAC | `none` | Room classification frame: `top-secret` (orange) or `unclassified` (green). |
| Preset | Midnight + Outlined | Two rows of predefined options: colors and shape. Selecting one resets the matching options in the **Customize** section below. |
| Background Dark | `#0f172a` | Base background color in dark mode. |
| Background Light | `#eef2f7` | Base background color in light mode. |
| Container Border | `1px` | Container border width (0–5px). |
| Border Radius (Default) | `10px` | Radius for containers, messages and inputs (0–40px). |
| Border Radius (Small) | `8px` | Radius for smaller items, like menu options (0–40px). |
| Border Radius (Avatar) | `30%` | Avatar radius (0–100%). |

### Presets

The two rows are independent: picking a color preset keeps the current shape, and vice versa.

**Colors** set the background colors:

| Preset | Background Dark | Background Light |
| --- | --- | --- |
| Midnight (default) | `#0f172a` | `#eef2f7` |
| Mono | `#000000` | `#ffffff` |
| Slate | `#25353c` | `#f0f0f0` |
| Plum | `#231a2e` | `#f4f0f7` |

**Shape** sets the container border and the radii:

| Preset | Container Border | Radius (Default / Small / Avatar) |
| --- | --- | --- |
| Outlined (default) | `1px` | `10px` / `8px` / `30%` |
| Soft | `0px` | `10px` / `8px` / `30%` |
| Round | `0px` | `20px` / `14px` / `50%` |
| Sharp | `0px` | `4px` / `2px` / `10%` |

In each row, the selected preset stays highlighted while its options match. Tweaking any of them turns that row into a custom setup, and selecting a preset again resets them. To add a preset, add an entry to `PRESET_GROUPS` in `rc_custom_theme.js`.

## Publishing changes

Push to `main`. `raw.githubusercontent.com` caches files for up to 5 minutes, and the code is also cached in the page (`window.rc_custom_theme_code`), so users get the new version the next time they reload Rocket.Chat after the cache expires.

Everything on `main` goes live for every user, so test on a branch first. With the theme enabled, run this in the DevTools console on Rocket.Chat and then change any option in the panel to apply the branch's `theme2.js`:

```js
(0, eval)(await (await fetch('https://raw.githubusercontent.com/rodrigok/RC.Theme/my-branch/theme2.js', { cache: 'no-store' })).text());
```

Reloading the page goes back to `main`.

## Notes

- Files come from `raw.githubusercontent.com`, not the GitHub REST API, so the REST API's 60 requests/hour limit for unauthenticated calls doesn't apply. GitHub may still throttle heavy unauthenticated traffic.
- The theme relies on Fuselage CSS classes (`.rcx-*`) and the current DOM structure. Rocket.Chat updates may break parts of the layout.
