window.applyCustomTheme2 = function(options = {}) {
    // options.mode is the mode Rocket.Chat is rendering; fall back to the user preference when it isn't known
    const pref = Meteor?.user()?.settings?.preferences?.themeAppearence || 'auto';
    const dark = options.mode
        ? options.mode === 'dark'
        : pref == 'dark' || (pref == 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    console.log('Theme', dark ? 'dark' : 'light');

    var ABAC_Labels = {
        'top-secret': 'TOP SECRET',
        'unclassified': 'UNCLASSIFIED'
    }

    const css = `
:root, .rcx-content--main, .rcx-sidebar--main, .rcx-sidepanel, .rcx-navbar, .rcx-tile, .rcx-sidebar-rail {
    /* Local vars */
    --rcx-container-border: ${options.containerBorder}px solid var(--rcx-color-stroke-extra-light);
    --rcx-border-radius-default: ${options.borderRadiusDefault}px;
    --rcx-border-radius-small: ${options.borderRadiusSmall}px;
    --rcx-border-radius-avatar: ${options.borderRadiusAvatar}%;
    --rcx-color-ascent-color: #FFFFFF;
    --rcx-color-descent-color: #000000;
    // --rcx-color-font-titles-labels: #DDD;
    --rcx-color-font-default: color-mix(var(--rcx-color-ascent-color), transparent 30%) !important;
    --rcx-room-abac-top-secret: #f58c26;
    --rcx-room-abac-unclassified: #3fb656;


    /* Theme */
    --rcx-color-surface-root: ${options.background} !important; /*#191919*/
    --rcx-color-surface-room: color-mix(var(--rcx-color-surface-root), var(--rcx-color-ascent-color) 4.58%) !important; /*#1A1A1A*/
    --rcx-color-surface-light: color-mix(var(--rcx-color-surface-root), var(--rcx-color-ascent-color) 9.17%) !important; /*#252525*/
    --rcx-color-surface-sidebar: var(--rcx-color-surface-room) !important;
    --flex-nav-background: var(--rcx-color-surface-room) !important;

    --rcx-color-surface-room-tint: color-mix(color-mix(var(--rcx-color-surface-room), var(--rcx-color-descent-color) 20%), transparent 10%);

    --rcx-button-primary-background-color: color-mix(var(--rcx-color-button-background-primary-default), transparent 10%) !important;
    --rcx-button-primary-border-color: color-mix(var(--rcx-color-ascent-color), transparent 90%) !important;
    --rcx-color-button-background-secondary-default: color-mix(var(--rcx-color-ascent-color), transparent 80%) !important;
    --rcx-color-button-background-secondary-disabled: color-mix(var(--rcx-color-ascent-color), transparent 90%) !important;
    --rcx-color-button-background-secondary-press: color-mix(var(--rcx-color-ascent-color), transparent 80%) !important;
    --rcx-color-button-background-secondary-hover: color-mix(var(--rcx-color-ascent-color), transparent 70%) !important;
    --rcx-color-surface-tint: color-mix(var(--rcx-color-descent-color), transparent 80%) !important;
    --rcx-color-surface-hover: color-mix(var(--rcx-color-descent-color), transparent 60%) !important;
    --rcx-color-surface-selected: color-mix(var(--rcx-color-ascent-color), transparent 80%) !important;
    --rcx-color-stroke-light: color-mix(var(--rcx-color-ascent-color), transparent 80%) !important;
    --rcx-color-stroke-extra-light: color-mix(var(--rcx-color-ascent-color), transparent 90%) !important;

    --rcx-color-shadow-elevation-border: var(--rcx-color-stroke-extra-light) !important;
}

${dark ? `` : `
/* 2. Override values for light mode */
:root, .rcx-content--main, .rcx-sidebar--main, .rcx-sidepanel, .rcx-navbar, .rcx-tile, .rcx-sidebar-rail {
    --rcx-color-ascent-color: #000000;
    --rcx-color-descent-color: #FFFFFF;

    --rcx-color-surface-root: ${options.backgroundLight} !important;
}
`}

${options.abac && options.abac !== 'none' ? `
#main-content {
    padding: 4px;
    border-radius: var(--rcx-border-radius-default);
    overflow: hidden;
    background: var(--rcx-room-abac-${options.abac});
    // color: contrast-color(var(--rcx-room-abac-${options.abac}));
    color: color-mix(var(--rcx-room-abac-${options.abac}), black 80%);
    // flex-direction: row !important;
    display: flex !important;

    &:before {
        content: '${ABAC_Labels[options.abac]}';
        text-align: center;
        font-weight: 800;
        padding-block: 4px;
        // rotate: 180deg;
        // writing-mode: vertical-lr;
    }

    // &:after {
    //     content: 'TOP SECRET';
    //     text-align: center;
    //     font-weight: 800;
    //     padding-block: 4px;
    //     writing-mode: vertical-lr;
    // }

    // [data-qa-rc-room] {
    //     box-shadow: 0 0 4px 4px #00000033;
    // }
}
` : ``}

/* sidebar audio player */
.rcx-sidebar--main {
    > div:nth-child(2) {
        position: absolute;
        bottom: 0;
        backdrop-filter: blur(4px);
        width: calc(100% - 16px);
        background: var(--rcx-color-surface-room-tint) !important;
    }

    > div:first-child:has(~ div:nth-child(2)) [data-testid="virtuoso-item-list"] > div:last-child .rcx-sidebar-item__list-item {
        margin-bottom: 110px;
    }
}

.rcx-bubble__item--secondary {
    background: var(--rcx-color-button-background-secondary-disabled) !important;
    border: 1px solid var(--rcx-color-button-background-secondary-disabled) !important;
    backdrop-filter: blur(4px);
}

.rcx-vertical-bar {
    // --rcx-color-surface-room: color-mix(color-mix(var(--rcx-color-surface-sidebar), white 2%), transparent 10%) !important;
    --rcx-color-surface-room: color-mix(var(--rcx-color-surface-sidebar), white 2%) !important;
}

.rcx-sidebar-collapse-group__title + .rcx-badge--secondary {
    display: none;
}

.rcx-sidebar-collapse-group__bar {
    margin-top: .5rem;
    // margin-inline: .5rem;
}

.rcx-sidebar-item {
    padding-inline: .5rem;
    // margin-inline: .5rem;
}

.rcx-sidebar-item--level-2 {
    padding-block: .5rem;
}

.rcx-sidebar-item__subtitle {
    color: inherit;
}

.rcx-sidebar-item__timestamp--highlighted {
    color: var(--rcx-color-badge-background-level-2);
    color: #f3e4ae;
}

.rcx-sidebar-item__timestamp:not(.rcx-sidebar-item__timestamp--highlighted) {
    font-weight: 400;
}


.rcx-tile {
    background: color-mix(var(--rcx-color-surface-light), transparent 15%) !important;
    backdrop-filter: blur(4px);
    border-radius: var(--rcx-border-radius-default);

    > div {
        padding: 2px 2px !important;
    }

    .rcx-option__title {
        padding-block: .25rem !important;
        padding-inline: .5rem;

        > div:has(.rcx-avatar) {
            margin-block: .25rem !important;
        }
    }

    .rcx-option {
        padding-inline: .5rem 1.5rem;
    }

    .rcx-divider {
        margin-block: .25rem;
    }
}

.rcx-option--focus, .rcx-option:hover {
    border-radius: var(--rcx-border-radius-small);
}

.rcx-message-header__roles {
    &:hover {
        .rcx-tag__inner {
            max-width: 100ch;
        }
    }
}

.rcx-message-header__role {
    &.rcx-tag {
        background: var(--rcx-color-button-background-secondary-disabled) !important;
        border: 1px solid var(--rcx-color-button-background-secondary-disabled) !important;
        backdrop-filter: blur(4px);
    }

    .rcx-tag__inner {
        max-width: 1ch;
        transition: max-width 0.5s ease-in-out;
        font-weight: 600;
    }
}

#react-root {
    gap: 2px;
    padding: 2px;
    background-color: var(--rcx-color-surface-root);
}

.rcx-navbar {
    padding: .2rem .5rem !important;
}

#rocket-chat {
    gap: 4px;
    background: transparent !important;
}

.rcx-sidebar-rail {
    background: transparent !important;
    border: none !important;

    & button[aria-label="Display"] {
        position: fixed;
        top: 48px !important;
        left: 120px;
    }
    & button[aria-label="Create new"] {
        position: fixed;
        top: 48px !important;
        left: 150px;
    }
}

#sidebar-region .rcx-sidebar--main [data-overlayscrollbars="host"] {
    & [data-testid="virtuoso-item-list"] {
        margin-top: 44px;
    }

    &:before {
        content: 'Chats';
        position: absolute;
        min-height: 44px;
        width: 100%;
        z-index: 10;
        box-shadow: 0 0 2px 2px #00000022;
        display: flex;
        align-items: center;
        padding-inline: 12px;
        font-size: 1rem;
        color: var(--rcx-color-font-default);
        background-color: color-mix(var(--rcx-color-surface-sidebar), transparent 10%);
        backdrop-filter: blur(4px);
    }

    &:after {
        content: '';
        position: absolute;
        bottom: 0;
        min-height: 1px;
        width: 100%;
        z-index: 10;
        // background: linear-gradient(to top, var(--rcx-color-stroke-extra-light) -200%, transparent 100%) !important;
        box-shadow: 0px 0px 4px 0px #00000022;
        pointer-events: none;
    }
}

.rcx-sidebar-footer {
    display: none;
}

#sidebar-region, #main-content [data-qa-rc-room], .rcx-banner, .rcx-vertical-bar:not(:has(.rcx-thread-view)), .rcx-sidepanel {
    border-radius: var(--rcx-border-radius-default);
    overflow: hidden;
    border: var(--rcx-container-border) !important;
}

.rcx-vertical-bar.rcx-vertical-bar[aria-labelledby="contextualbarTitle"], :not(.rcx-vertical-bar) > * > * > .rcx-vertical-bar.rcx-thread-view {
    margin-top: 44px;
    height: calc(100% - 46px) !important;
    // border-width: 1px !important;
    border-color: #ffffff11 !important; 
    box-shadow: 0 0 4px 0 #00000044;
    backdrop-filter: blur(4px);
}

.rcx-banner {
    order: 1;
    padding-block: 4px;
    padding-inline: 4px;
    display: flex;
    justify-content: center;
    background: transparent;
}

.rcx-banner__content {
    display: flex;
    flex-direction: row;
    flex-grow: 0;
    gap: 6px;
}

.rcx-banner__icon {
    padding-block: 0px;
    padding-inline-end: 6px;
}

.rcx-navbar {
    background: transparent;
    border: none !important;
}

#main-content [data-qa-rc-room] {
    // background: var(--rcx-sidebar-color-surface-default,var(--rcx-color-surface-sidebar,#e4e7ea)) !important;
    // background: #262931 !important;
}

div[data-qa-rc-room] div:has(>.rcx-vertical-bar) {
    padding: 4px;
}

.messages-container-main:after {
    content: '';
    position: absolute;
    height: 100px;
    width: 100%;
    bottom: 0;
    background: blue;
    background: linear-gradient(to top, var(--rcx-color-surface-room) 20%, transparent 100%);
    z-index: 0;
}

.rcx-message:hover {
    border-radius: var(--rcx-border-radius-default);
}

.rcx-message-generic-preview {
    // background-color: color-mix(in oklab, var(--custom-background) 80%, var(--custom-background-overlay)) !important;
}

.rcx-message-generic-preview > a {
    display: none;
}

html {
    // background-color: transparent !important;
}

.rcx-message, .rcx-room-header > div {
    padding-inline-start: .25rem !important;
}

.rcx-message-toolbar {
    box-shadow: 0 0 2px 2px #00000044;
    background: color-mix(var(--rcx-color-surface-room), transparent 20%);
    backdrop-filter: blur(4px);
}

.bubble-visible {
    top: 52px !important;
}

.rcx-room-header {
    background: color-mix(var(--rcx-color-surface-room), transparent 10%);
    box-shadow: 0 0 2px 2px #00000022;
    z-index: 10;
    backdrop-filter: blur(4px);
    border-radius: var(--rcx-border-radius-default) var(--rcx-border-radius-default) 0 0;

    > div {
        background: transparent !important;
    }

     > hr {
        display: none;
    }
}

#main-content {
    div:has(>.rcx-box--focusable[role=button]) {
        position: relative;
    }

    .rcx-box--focusable[role=button] {
        margin-top: 50px;
        margin-inline: 6px;
        border-radius: var(--rcx-border-radius-default) !important;
        overflow: hidden;
        position: absolute;
        width: calc(100% - 12px);
        z-index: 10;
        background: color-mix(var(--rcx-color-status-background-info), transparent 10%) !important;
        backdrop-filter: blur(4px);
        box-shadow: 0 0 2px 2px #00000044;
    }
}

.rc-message-box {
    padding-inline: .5rem !important;
    box-shadow: 0 0 6px 6px var(--rcx-color-surface-room);
}

.rc-message-box .rcx-input-box__wrapper {
    border-radius: var(--rcx-border-radius-default);
    margin-block-start: 0 !important;
}

.rc-message-box {
    display: flex;
    flex-direction: column;
    padding-block-end: .25rem !important;
    align-items: stretch;
    z-index: 10;

    & .rcx-field {
        padding-inline: 12px;
        margin-bottom: 2px !important;
    }

    & > div:has(.rcx-tag) {
        order: 1;
        justify-content: end !important;
        margin-inline: 18px;
        margin-top: -20px;
    }

    & .rcx-tag {
        align-self: end;
        background: transparent !important;
        color: var(--rcx-color-font-annotation, #9ea2a8) !important;
    }
}

.rc-message-box__activity-wrapper {
    font-size: .625rem !important;
    font-weight: 700 !important;
    margin-inline: 12px;
    vertical-align: cemter;
    background: var(--rcx-color-surface-light) !important;
    border-bottom-left-radius: var(--rcx-border-radius-default);
    border-bottom-right-radius: var(--rcx-border-radius-default);
    align-self: stretch;
    padding-inline: 12px;
}

.rcx-avatar {
    background: #ffffff11;
    border-radius: var(--rcx-border-radius-avatar) !important;
    overflow: hidden;
}

.rcx-navbar-group .rcx-button:has(.rcx-avatar):hover {
    border: none !important;
    background: none !important;
}

.rcx-toastbar {
    backdrop-filter: blur(4px);
}

/* FIX for the squized avatar */
.rcx-navbar .rcx-navbar-group .rcx-button .rcx-avatar, .rcx-sidebar-rail .rcx-navbar-group .rcx-button .rcx-avatar {
    position: absolute;
}



// .messages-list > div {
//     margin-bottom: 100px;
// }

// .messages-container .wrapper {
//     margin-top: -44px;
//     height: calc(100% + 120px + 44px);
// }

.messages-box {
    overflow: visible;

    & .rcx-input-box__wrapper {
        background: #262931ee;
        backdrop-filter: blur(4px);
        box-shadow: 0px 0px 4px 0px #00000022;
    }
    
    & textarea ~ div {
        background: transparent !important;
    }
}

.rcx-input-box__wrapper div ~ div {
    background: transparent !important;
}

.rcx-room-header ~ div {
    margin-top: -44px;
}

.focus.rcx-autocomplete,
.focus.rcx-input-box--small:not(.rcx-input-box--undecorated),
.focus.rcx-input-box:not(.rcx-input-box--undecorated),
.focus.rcx-input-box__wrapper,
.focus.rcx-select,
.is-focused.rcx-autocomplete,
.is-focused.rcx-input-box--small:not(.rcx-input-box--undecorated),
.is-focused.rcx-input-box:not(.rcx-input-box--undecorated),
.is-focused.rcx-input-box__wrapper,
.is-focused.rcx-select,
.rcx-autocomplete:focus,
.rcx-autocomplete:focus-within,
.rcx-input-box--small:focus-within:not(.rcx-input-box--undecorated),
.rcx-input-box--small:focus:not(.rcx-input-box--undecorated),
.rcx-input-box:focus-within:not(.rcx-input-box--undecorated),
.rcx-input-box:focus:not(.rcx-input-box--undecorated),
.rcx-input-box__wrapper:focus,
.rcx-input-box__wrapper:focus-within,
.rcx-select:focus,
.rcx-select:focus-within,
.rcx-message.focus.focus-visible,
.rcx-message:focus-visible,
.rcx-message.is-focused,
.rcx-button--icon.focus.focus-visible,
.rcx-button--icon:focus-visible,
.rcx-button--icon.is-focused,
.rcx-css-1banssg:focus-visible,
.rcx-sidebar-item:focus-visible {
    border: 1px solid color-mix(var(--rcx-color-stroke-highlight), transparent 10%) !important;
    box-shadow: 0 0 0px 4px color-mix(var(--rcx-color-stroke-highlight), transparent 60%) !important;
}
  `;

  let styleTag = document.getElementById("theme-2");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "theme-2";
    document.head.appendChild(styleTag);
    styleTag.innerHTML = css;
  } else {
    document.head.removeChild(styleTag)
  }

  setTimeout(() => {
      let styleTagSiderbar = document.getElementById("sidebar-palette");
      if (styleTagSiderbar) {
        document.head.removeChild(styleTagSiderbar)
      }
    }, 1500);
};

// window.applyCustomTheme2({
//     background: '#25353c',
//     backgroundLight: '#eff3f5',
//     containerBorder: 1,
//     borderRadiusDefault: 10,
//     borderRadiusSmall: 8,
//     borderRadiusAvatar: 30,
//     abac: 'top-secret',
//     abac: 'unclassified'
// });