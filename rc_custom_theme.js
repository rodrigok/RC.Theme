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

  const DEFAULTS = {
    enabled: false,
    THEME_URL: 'https://raw.githubusercontent.com/rodrigok/RC.Theme/main/theme2.js',
    CONFIG: {
      background: '#0F0F0F',
      backgroundLight: '#F0F0F0',
      containerBorder: 0,
      borderRadiusDefault: 10,
      borderRadiusSmall: 8,
      borderRadiusAvatar: 30,
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

  // CONFIG fields rendered as selects
  const SELECT_FIELDS = [
    { name: 'abac', label: 'ABAC', options: ['none', 'top-secret', 'unclassified'] },
  ];

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

  async function loadTheme(THEME_URL) {
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

  async function applyTheme() {
    let styleTag = document.getElementById("theme-2");
    if (styleTag) {
      document.head.removeChild(styleTag)
    }

    const payload = getDefaults();
    if (payload.enabled) {
      if (!window.applyCustomTheme2) {
        await loadTheme(payload.THEME_URL || DEFAULTS.THEME_URL);
      }
      applyCustomTheme2(payload.CONFIG);
    }
  }

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

    #${PANEL_ID} .theme-panel__input,
    #${PANEL_ID} .theme-panel__checkbox,
    #${PANEL_ID} .theme-panel__color,
    #${PANEL_ID} .theme-panel__select {
      width: 100%;
    }

    #${PANEL_ID} input[type="text"],
    #${PANEL_ID} select {
      padding: 8px;
      border: 1px solid var(--rcx-color-stroke-extra-light);
      background: var(--rcx-color-button-background-secondary-default);
      color: var(--rcx-color-font-default);
      border-radius: 6px;
      outline: none;
    }

    #${PANEL_ID} select {
      cursor: pointer;
    }

    #${PANEL_ID} select option {
      background: var(--rcx-color-surface-room);
      color: var(--rcx-color-font-default);
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

    #${PANEL_ID} input[type="text"]:focus,
    #${PANEL_ID} input[type="color"]:focus,
    #${PANEL_ID} select:focus {
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

    #${PANEL_ID} .theme-panel__button {
      width: 100%;
      border: 0;
      border-radius: 6px;
      padding: 10px 12px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
    }

    #${PANEL_ID} .theme-panel__button--primary {
      background: #2f81f7;
      color: var(--rcx-color-font-default);
    }

    #${PANEL_ID} .theme-panel__button--secondary {
      background: var(--rcx-color-button-background-secondary-default);
      color: var(--rcx-color-font-default);
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

  function renderSelect({ name, label, options }) {
    const value = defaults.CONFIG[name];
    return `
      <div class="theme-panel__group">
        <label class="theme-panel__label" for="${PANEL_ID}-${name}">${label}</label>
        <select class="theme-panel__select" id="${PANEL_ID}-${name}" name="${name}">
          ${options.map((option) => `
            <option value="${escapeHtml(option)}" ${option === value ? 'selected' : ''}>${escapeHtml(option)}</option>
          `).join('')}
        </select>
      </div>
    `;
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
        <label class="theme-panel__check-row">
          <input type="checkbox" name="enabled" ${defaults.enabled ? 'checked' : ''} />
          <span>Enable theme</span>
        </label>
      </div>

      <div class="theme-panel__group">
        <label class="theme-panel__label" for="${PANEL_ID}-theme-url">THEME_URL</label>
        <input
          class="theme-panel__input"
          id="${PANEL_ID}-theme-url"
          name="themeUrl"
          type="text"
          value="${escapeHtml(defaults.THEME_URL)}"
        />
      </div>

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

      ${NUMERIC_FIELDS.map(renderSlider).join('')}

      ${SELECT_FIELDS.map(renderSelect).join('')}

      <div class="theme-panel__group" style="display: flex; gap: 8px;">
        <button type="button" class="theme-panel__button theme-panel__button--secondary" id="${PANEL_ID}-reset">
          Reset to Defaults
        </button>
      </div>
    </form>
  `;

  document.body.appendChild(panel);

  function openThemePanel() {
    panel.style.display = 'flex';
  }

  function closeThemePanel() {
    panel.style.display = 'none';
  }

  const form = document.getElementById(`${PANEL_ID}-form`);
  const closeButton = document.getElementById(`${PANEL_ID}-close`);
  const resetButton = document.getElementById(`${PANEL_ID}-reset`);

  const colorFields = ['background', 'backgroundLight'];

  function getThemePayload() {
    const CONFIG = {
      background: form.elements.background.value,
      backgroundLight: form.elements.backgroundLight.value,
    };
    NUMERIC_FIELDS.forEach(({ name }) => {
      CONFIG[name] = Number(form.elements[name].value);
    });
    SELECT_FIELDS.forEach(({ name }) => {
      CONFIG[name] = form.elements[name].value;
    });

    return {
      enabled: form.elements.enabled.checked,
      THEME_URL: form.elements.themeUrl.value.trim(),
      CONFIG,
    };
  }

  function saveThemeConfig() {
    try {
      window.onThemeConfigSave(getThemePayload());
    } catch (error) {
      console.error('Error running onThemeConfigSave:', error);
    }
  }

  form.elements.themeUrl.addEventListener('blur', () => {
    delete window.applyCustomTheme2;
    saveThemeConfig()
  });

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

  SELECT_FIELDS.forEach(({ name }) => {
    form.elements[name].addEventListener('change', saveThemeConfig);
  });

  resetButton.addEventListener('click', () => {
    // form.elements.enabled.checked = DEFAULTS.enabled;
    form.elements.themeUrl.value = DEFAULTS.THEME_URL;

    colorFields.forEach((name) => {
      form.elements[name].value = DEFAULTS.CONFIG[name];
      const hint = panel.querySelector(`.theme-panel__hint[data-for="${name}"]`);
      if (hint) hint.textContent = DEFAULTS.CONFIG[name];
    });

    NUMERIC_FIELDS.forEach(({ name, unit }) => {
      form.elements[name].value = DEFAULTS.CONFIG[name];
      const hint = panel.querySelector(`.theme-panel__hint[data-for="${name}"]`);
      if (hint) hint.textContent = `${DEFAULTS.CONFIG[name]}${unit}`;
    });

    SELECT_FIELDS.forEach(({ name }) => {
      form.elements[name].value = DEFAULTS.CONFIG[name];
    });

    delete window.applyCustomTheme2;
    saveThemeConfig();
  });

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

  document.addEventListener('click', (event) => {
    const configButton = event.target.closest(CONFIG_BUTTON_SELECTOR);

    if (!configButton) {
      return;
    }

    if (event.metaKey || event.ctrlKey) {
      event.preventDefault();
      event.stopPropagation();
      openThemePanel();
    }
  }, true);

  applyTheme();
}