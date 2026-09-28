window.rc_custom_theme = () => {
  const PANEL_ID = 'custom-theme-config-panel';
  const STYLE_ID = 'custom-theme-config-panel-style';
  // Key name kept from the gist era so users don't lose their saved settings
  const STORAGE_KEY = 'gist_theme2';

  // Avoid duplicating the panel
  const existing = document.getElementById(PANEL_ID);
  if (existing) {
    existing.remove();
  }

  const existingStyle = document.getElementById(STYLE_ID);
  if (existingStyle) {
    existingStyle.remove();
  }

  // Each row of presets overwrites only its own CONFIG fields; colors in lowercase to match <input type="color"> values.
  // The first color and shape presets are the defaults
  const PRESET_GROUPS = {
    color: [
      {
        name: 'Midnight',
        CONFIG: { background: '#0f172a', backgroundLight: '#d4def2' },
      },
      {
        name: 'Mono',
        CONFIG: { background: '#000000', backgroundLight: '#ffffff' },
      },
      {
        name: 'Slate',
        CONFIG: { background: '#25353c', backgroundLight: '#d1e0e6' },
      },
      {
        name: 'Plum',
        CONFIG: { background: '#231a2e', backgroundLight: '#e4d7ef' },
      },
    ],
    shape: [
      {
        name: 'Outlined',
        CONFIG: { containerBorder: 1, borderRadiusDefault: 10, borderRadiusSmall: 8, borderRadiusAvatar: 30 },
      },
      {
        name: 'Soft',
        CONFIG: { containerBorder: 0, borderRadiusDefault: 10, borderRadiusSmall: 8, borderRadiusAvatar: 30 },
      },
      {
        name: 'Round',
        CONFIG: { containerBorder: 0, borderRadiusDefault: 20, borderRadiusSmall: 14, borderRadiusAvatar: 50 },
      },
      {
        name: 'Sharp',
        CONFIG: { containerBorder: 0, borderRadiusDefault: 4, borderRadiusSmall: 2, borderRadiusAvatar: 10 },
      },
    ],
    // Colors match --rcx-room-abac-* in theme2.js
    abac: [
      {
        name: 'None',
        color: null,
        CONFIG: { abac: 'none' },
      },
      {
        name: 'Top Secret',
        color: '#f58c26',
        CONFIG: { abac: 'top-secret' },
      },
      {
        name: 'Unclassified',
        color: '#3fb656',
        CONFIG: { abac: 'unclassified' },
      },
    ],
  };

  const THEME_URL = 'https://raw.githubusercontent.com/rodrigok/RC.Theme/main/theme2.js';

  const DEFAULTS = {
    enabled: false,
    CONFIG: {
      ...PRESET_GROUPS.color[0].CONFIG,
      ...PRESET_GROUPS.shape[0].CONFIG,
      abac: 'none',
    }
  };

  // Numeric CONFIG fields rendered as sliders
  const NUMERIC_FIELDS = [
    { name: 'containerBorder', label: 'Container Border', min: 0, max: 5, step: 1, unit: 'px' },
    { name: 'borderRadiusDefault', label: 'Border Radius (Default)', min: 0, max: 40, step: 1, unit: 'px' },
    { name: 'borderRadiusSmall', label: 'Border Radius (Small)', min: 0, max: 40, step: 1, unit: 'px' },
    { name: 'borderRadiusAvatar', label: 'Border Radius (Avatar)', min: 0, max: 100, step: 1, unit: '%' },
  ];

  // Rocket.Chat's own theme preference; high-contrast is left out since the theme has no styles for it
  const APPEARANCES = [
    { value: 'auto', label: 'Auto' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  function getAppearance() {
    return window.Meteor?.user()?.settings?.preferences?.themeAppearence || 'auto';
  }

  // Same call the Accessibility page makes; Rocket.Chat then switches its palette live
  async function saveAppearance(value) {
    const storage = localStorage.getItem('Meteor.loginToken') ? localStorage : sessionStorage;
    const r = await fetch(`${document.baseURI.replace(/\/$/, '')}/api/v1/users.setPreferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': storage.getItem('Meteor.userId'),
        'X-Auth-Token': storage.getItem('Meteor.loginToken'),
      },
      body: JSON.stringify({ data: { themeAppearence: value } }),
    });
    if (!r.ok) throw new Error(`Failed to save appearance: ${r.status}`);
  }

  // Mode Rocket.Chat is rendering. Fuselage keeps a main-palette-<mode> style tag for every mode used
  // so far and only fills the active one, so pick the tag with content
  function getThemeMode() {
    const tag = [...document.querySelectorAll('style[id^="main-palette-"]')].find((el) => el.hasChildNodes());
    return tag ? tag.id.replace('main-palette-', '') : null;
  }

  function getDefaults() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored) return DEFAULTS;
      return {
        ...DEFAULTS,
        ...stored,
        CONFIG: { ...DEFAULTS.CONFIG, ...stored.CONFIG },
      };
    } catch {
      return DEFAULTS;
    }
  }

  const defaults = getDefaults();

  async function loadTheme() {
    delete window.rc_theme_code;

    const r = await fetch(THEME_URL, { cache: 'no-store' });
    if (!r.ok) throw new Error(`Failed to load ${THEME_URL}: ${r.status}`);

    window.rc_theme_code = await r.text();

    // Run it in the page context
    (0, eval)(window.rc_theme_code);

    if (window.applyCustomTheme2) {
      console.log('Theme executed:', THEME_URL);
    }
  }

  let appliedMode = null;

  async function applyTheme() {
    appliedMode = getThemeMode();

    if (getDefaults().enabled && !window.applyCustomTheme2) {
      await loadTheme();
    }

    // Remove only after the await: applyCustomTheme2 toggles the tag off when it already exists,
    // so overlapping calls would otherwise cancel each other out
    document.getElementById('theme-2')?.remove();

    const payload = getDefaults();
    if (payload.enabled) {
      applyCustomTheme2({ ...payload.CONFIG, mode: getThemeMode() });
    }
  }

  // Re-apply when Rocket.Chat switches modes: from this panel, the Accessibility page, or the OS in auto
  window.rc_custom_theme_observer?.disconnect();
  window.rc_custom_theme_observer = new MutationObserver(() => {
    if (getThemeMode() !== appliedMode) {
      applyTheme();
    }
  });
  window.rc_custom_theme_observer.observe(document.head, { childList: true, subtree: true });

  // Saves the settings and re-applies the theme; define window.onThemeConfigSave beforehand to override
  if (typeof window.onThemeConfigSave !== 'function') {
    window.onThemeConfigSave = function (payload) {
      console.log('Saving theme config:', payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      applyTheme();
    };
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #${PANEL_ID} {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 420px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 32px);
      z-index: 2147483647;
      box-sizing: border-box;
      background: var(--rcx-color-surface-room);
      color: var(--rcx-color-font-default);
      border: 1px solid var(--rcx-color-stroke-light);
      border-radius: 12px;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      display: none;
    }

    #${PANEL_ID} * {
      box-sizing: border-box;
      font-family: inherit;
    }

    #${PANEL_ID} .theme-panel__header {
      padding: 12px;
      border-bottom: 1px solid var(--rcx-color-stroke-light);
      font-size: 14px;
      font-weight: 600;

      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    #${PANEL_ID} .theme-panel__close {
      background: transparent;
      border: none;
      color: var(--rcx-color-font-default);
      font-size: 18px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      line-height: 1;
    }

    #${PANEL_ID} .theme-panel__close:hover {
      background: #00000033;
      color: var(--rcx-color-font-default);
    }

    #${PANEL_ID} .theme-panel__body {
      padding: 12px;
      overflow-y: auto;
      flex: 1;
    }

    #${PANEL_ID} .theme-panel__group {
      margin-bottom: 12px;
    }

    #${PANEL_ID} .theme-panel__label {
      display: block;
      font-size: 12px;
      margin-bottom: 4px;
      color: var(--rcx-color-font-default);
    }

    #${PANEL_ID} .theme-panel__section {
      margin: 16px 0 12px;
      padding-top: 12px;
      border-top: 1px solid var(--rcx-color-stroke-light);
      font-size: 13px;
      font-weight: 600;
    }

    #${PANEL_ID} .theme-panel__row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    #${PANEL_ID} .theme-panel__checkbox,
    #${PANEL_ID} .theme-panel__color {
      width: 100%;
    }

    #${PANEL_ID} input[type="color"] {
      height: 36px;
      max-width: 100px;
      padding: 0;
      border: 1px solid var(--rcx-color-stroke-extra-light);
      background: var(--rcx-color-button-background-secondary-default);
      color: var(--rcx-color-font-default);
      border-radius: 6px;
      outline: none;
    }

    #${PANEL_ID} input[type="color"]:focus {
      border-color: #7aa2ff;
    }

    #${PANEL_ID} .theme-panel__color-row,
    #${PANEL_ID} .theme-panel__range-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    #${PANEL_ID} .theme-panel__color-row input[type="color"] {
      flex: 1;
    }

    #${PANEL_ID} .theme-panel__range-row input[type="range"] {
      flex: 1;
      margin: 0;
      accent-color: #2f81f7;
      cursor: pointer;
    }

    #${PANEL_ID} .theme-panel__range-row .theme-panel__hint {
      min-width: 48px;
      text-align: right;
    }

    #${PANEL_ID} .theme-panel__check-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 13px;
    }

    #${PANEL_ID} .theme-panel__check-row input {
      margin: 0;
      width: auto;
    }

    #${PANEL_ID} .theme-panel__segmented {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      padding: 3px;
      border: 1px solid var(--rcx-color-stroke-extra-light);
      border-radius: 8px;
      background: var(--rcx-color-button-background-secondary-default);
    }

    #${PANEL_ID} .theme-panel__segment {
      padding: 6px 8px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: var(--rcx-color-font-default);
      cursor: pointer;
      font-size: 12px;
      text-align: center; /* Rocket.Chat's global button rule sets text-align: left */
    }

    #${PANEL_ID} .theme-panel__segment:hover {
      background: #00000033;
    }

    #${PANEL_ID} .theme-panel__segment[aria-pressed="true"] {
      background: #2f81f7;
      color: #ffffff;
    }

    #${PANEL_ID} .theme-panel__presets {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    #${PANEL_ID} .theme-panel__preset {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 6px;
      border: 1px solid var(--rcx-color-stroke-extra-light);
      border-radius: 8px;
      background: var(--rcx-color-button-background-secondary-default);
      color: var(--rcx-color-font-default);
      cursor: pointer;
      font-size: 12px;
      text-align: left;
    }

    #${PANEL_ID} .theme-panel__preset:hover {
      border-color: var(--rcx-color-stroke-light);
    }

    #${PANEL_ID} .theme-panel__preset[aria-pressed="true"] {
      border-color: #2f81f7;
      box-shadow: 0 0 0 1px #2f81f7;
    }

    #${PANEL_ID} .theme-panel__preset-swatch {
      display: flex;
      height: 28px;
      border: 1px solid var(--rcx-color-stroke-extra-light);
      border-radius: 4px;
      overflow: hidden;
    }

    #${PANEL_ID} .theme-panel__preset-swatch span {
      flex: 1;
    }

    #${PANEL_ID} .theme-panel__presets + .theme-panel__presets {
      margin-top: 8px;
    }

    #${PANEL_ID} .theme-panel__preset-shape {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 28px;
      padding: 0 5px;
      border: 0 solid var(--rcx-color-font-default);
      background: var(--rcx-color-surface-room);
      overflow: hidden;
    }

    #${PANEL_ID} .theme-panel__preset-avatar,
    #${PANEL_ID} .theme-panel__preset-bar {
      background: var(--rcx-color-font-default);
      opacity: 0.4;
    }

    #${PANEL_ID} .theme-panel__preset-abac {
      display: flex;
      height: 28px;
      padding: 8px 3px 3px;
      border-radius: 4px;
    }

    #${PANEL_ID} .theme-panel__preset-abac span {
      flex: 1;
      border-radius: 2px;
      background: var(--rcx-color-surface-room);
    }

    #${PANEL_ID} .theme-panel__preset-abac--none {
      padding: 0;
      border: 1px solid var(--rcx-color-stroke-extra-light);
    }

    #${PANEL_ID} .theme-panel__preset-avatar {
      flex: none;
      width: 16px;
      height: 16px;
    }

    #${PANEL_ID} .theme-panel__preset-bar {
      flex: 1;
      height: 8px;
    }

    #${PANEL_ID} .theme-panel__hint {
      font-size: 14px;
      font-family: monospace;
      color: var(--rcx-color-font-default);
      line-height: 1.4;
    }
  `;
  document.head.appendChild(style);

  function renderSlider({ name, label, min, max, step, unit }) {
    const value = defaults.CONFIG[name];
    return `
      <div class="theme-panel__group">
        <label class="theme-panel__label" for="${PANEL_ID}-${name}">${label}</label>
        <div class="theme-panel__range-row">
          <input
            id="${PANEL_ID}-${name}"
            name="${name}"
            type="range"
            min="${min}"
            max="${max}"
            step="${step}"
            value="${value}"
          />
          <div class="theme-panel__hint" data-for="${name}">${value}${unit}</div>
        </div>
      </div>
    `;
  }

  function renderPreset(group, index, name, preview) {
    return `
      <button type="button" class="theme-panel__preset" data-group="${group}" data-preset="${index}" aria-pressed="false">
        ${preview}
        <span>${escapeHtml(name)}</span>
      </button>
    `;
  }

  function renderColorPreset({ name, CONFIG }, index) {
    return renderPreset('color', index, name, `
      <span class="theme-panel__preset-swatch">
        <span style="background: ${CONFIG.background}"></span>
        <span style="background: ${CONFIG.backgroundLight}"></span>
      </span>
    `);
  }

  // Mini container with the preset's border and default radius, holding an avatar and a small-radius bar
  function renderShapePreset({ name, CONFIG }, index) {
    return renderPreset('shape', index, name, `
      <span class="theme-panel__preset-shape" style="border-width: ${CONFIG.containerBorder}px; border-radius: ${CONFIG.borderRadiusDefault}px">
        <span class="theme-panel__preset-avatar" style="border-radius: ${CONFIG.borderRadiusAvatar}%"></span>
        <span class="theme-panel__preset-bar" style="border-radius: ${CONFIG.borderRadiusSmall}px"></span>
      </span>
    `);
  }

  // Mini room framed in the ABAC color, with the thicker top edge standing in for the label band; None shows the bare room
  function renderAbacPreset({ name, color }, index) {
    return renderPreset('abac', index, name, color ? `
      <span class="theme-panel__preset-abac" style="background: ${color}">
        <span></span>
      </span>
    ` : `
      <span class="theme-panel__preset-abac theme-panel__preset-abac--none">
        <span></span>
      </span>
    `);
  }

  const panel = document.createElement('aside');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <div class="theme-panel__header">
      <span>Theme Config</span>
      <button type="button" class="theme-panel__close" id="${PANEL_ID}-close">
        ×
      </button>
    </div>

    <form class="theme-panel__body" id="${PANEL_ID}-form">
      <div class="theme-panel__group">
        <span class="theme-panel__label">Appearance</span>
        <div class="theme-panel__segmented">
          ${APPEARANCES.map(({ value, label }) => `
            <button type="button" class="theme-panel__segment" data-appearance="${value}" aria-pressed="false">${label}</button>
          `).join('')}
        </div>
      </div>

      <div class="theme-panel__group">
        <label class="theme-panel__check-row">
          <input type="checkbox" name="enabled" ${defaults.enabled ? 'checked' : ''} />
          <span>Enable theme</span>
        </label>
      </div>

      <div class="theme-panel__group">
        <span class="theme-panel__label">ABAC</span>
        <input type="hidden" name="abac" value="${escapeHtml(defaults.CONFIG.abac)}" />
        <div class="theme-panel__presets">
          ${PRESET_GROUPS.abac.map(renderAbacPreset).join('')}
        </div>
      </div>

      <div class="theme-panel__group">
        <span class="theme-panel__label">Preset</span>
        <div class="theme-panel__presets">
          ${PRESET_GROUPS.color.map(renderColorPreset).join('')}
        </div>
        <div class="theme-panel__presets">
          ${PRESET_GROUPS.shape.map(renderShapePreset).join('')}
        </div>
      </div>

      <div class="theme-panel__section">Customize</div>

      <div class="theme-panel__row">
        <div class="theme-panel__group">
          <label class="theme-panel__label" for="${PANEL_ID}-background">Background Dark</label>
          <div class="theme-panel__color-row">
            <input
              class="theme-panel__color"
              id="${PANEL_ID}-background"
              name="background"
              type="color"
              value="${defaults.CONFIG.background}"
            />
            <div class="theme-panel__hint" data-for="background">${defaults.CONFIG.background}</div>
          </div>
        </div>

        <div class="theme-panel__group">
          <label class="theme-panel__label" for="${PANEL_ID}-backgroundLight">Background Light</label>
          <div class="theme-panel__color-row">
            <input
              class="theme-panel__color"
              id="${PANEL_ID}-backgroundLight"
              name="backgroundLight"
              type="color"
              value="${defaults.CONFIG.backgroundLight}"
            />
            <div class="theme-panel__hint" data-for="backgroundLight">${defaults.CONFIG.backgroundLight}</div>
          </div>
        </div>
      </div>

      ${NUMERIC_FIELDS.map(renderSlider).join('')}
    </form>
  `;

  document.body.appendChild(panel);

  function openThemePanel() {
    // The preference may have changed elsewhere (e.g. the Accessibility page) since the panel was built
    updateAppearanceButtons(getAppearance());
    panel.style.display = 'flex';
  }

  function closeThemePanel() {
    panel.style.display = 'none';
  }

  const form = document.getElementById(`${PANEL_ID}-form`);
  const closeButton = document.getElementById(`${PANEL_ID}-close`);
  const presetButtons = panel.querySelectorAll('.theme-panel__preset');
  const appearanceButtons = panel.querySelectorAll('.theme-panel__segment');

  function updateAppearanceButtons(value) {
    appearanceButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.appearance === value));
    });
  }

  appearanceButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      updateAppearanceButtons(button.dataset.appearance);
      try {
        await saveAppearance(button.dataset.appearance);
      } catch (error) {
        console.error('Error saving appearance:', error);
        updateAppearanceButtons(getAppearance());
      }
    });
  });

  updateAppearanceButtons(getAppearance());

  const colorFields = ['background', 'backgroundLight'];

  function getThemePayload() {
    const CONFIG = {
      background: form.elements.background.value,
      backgroundLight: form.elements.backgroundLight.value,
      abac: form.elements.abac.value,
    };
    NUMERIC_FIELDS.forEach(({ name }) => {
      CONFIG[name] = Number(form.elements[name].value);
    });

    return {
      enabled: form.elements.enabled.checked,
      CONFIG,
    };
  }

  // Highlights, in each row, the preset whose values match the form; none when the user has tweaked any of them
  function updateActivePreset() {
    const { CONFIG } = getThemePayload();
    presetButtons.forEach((button) => {
      const preset = PRESET_GROUPS[button.dataset.group][button.dataset.preset];
      const active = Object.entries(preset.CONFIG).every(
        ([name, value]) => String(CONFIG[name]).toLowerCase() === String(value).toLowerCase()
      );
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function setFieldValue(name, value) {
    form.elements[name].value = value;
    const hint = panel.querySelector(`.theme-panel__hint[data-for="${name}"]`);
    if (hint) {
      const unit = NUMERIC_FIELDS.find((field) => field.name === name)?.unit || '';
      hint.textContent = `${value}${unit}`;
    }
  }

  function saveThemeConfig() {
    try {
      window.onThemeConfigSave(getThemePayload());
    } catch (error) {
      console.error('Error running onThemeConfigSave:', error);
    }
    updateActivePreset();
  }

  form.elements.enabled.addEventListener('change', saveThemeConfig);

  colorFields.forEach((name) => {
    const input = form.elements[name];
    const hint = panel.querySelector(`.theme-panel__hint[data-for="${name}"]`);
    input.addEventListener('input', () => {
      if (hint) hint.textContent = input.value;
      saveThemeConfig();
    });
  });

  NUMERIC_FIELDS.forEach(({ name, unit }) => {
    const input = form.elements[name];
    const hint = panel.querySelector(`.theme-panel__hint[data-for="${name}"]`);
    input.addEventListener('input', () => {
      if (hint) hint.textContent = `${input.value}${unit}`;
      saveThemeConfig();
    });
  });

  presetButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const preset = PRESET_GROUPS[button.dataset.group][button.dataset.preset];
      Object.entries(preset.CONFIG).forEach(([name, value]) => setFieldValue(name, value));
      saveThemeConfig();
    });
  });

  updateActivePreset();

  closeButton.addEventListener('click', () => {
    closeThemePanel();
  });

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  const CONFIG_BUTTON_SELECTOR = '.rcx-navbar .rcx-navbar-group .rcx-button:has(.rcx-avatar), .rcx-sidebar-rail .rcx-navbar-group .rcx-button:has(.rcx-avatar)';

  // Cmd/Ctrl + click on the avatar opens the panel. Rocket.Chat's user menu opens on pointerdown (react-aria's press
  // start), so the whole press sequence is swallowed in the capture phase, before it reaches React
  function handleConfigButtonPress(event) {
    if (!(event.metaKey || event.ctrlKey) || !event.target.closest?.(CONFIG_BUTTON_SELECTOR)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (event.type === 'click') {
      openThemePanel();
    }
  }

  // Replace the listeners from a previous run instead of stacking them
  ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach((type) => {
    document.removeEventListener(type, window.rc_custom_theme_press_handler, true);
    document.addEventListener(type, handleConfigButtonPress, true);
  });
  window.rc_custom_theme_press_handler = handleConfigButtonPress;

  applyTheme();
}