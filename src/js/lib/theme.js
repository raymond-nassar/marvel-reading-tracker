// Which theme the page is wearing, separated from the DOM that wears it.
//
// The two functions here are the whole of the decision, and neither touches the document, so both
// can be tested directly. `src/js/main.js` keeps the parts that must touch it: setting the
// attribute, updating the meta tag, and listening for a system change.

export const THEMES = ['system', 'dark', 'light'];

export const DEFAULT_THEME = 'system';

// 'system' writes no attribute at all, which is what hands the decision back to the stylesheet's
// `prefers-color-scheme` block. Writing `data-theme="system"` instead would match neither the dark
// selector nor the light one, so the page would fall through to the bare `:root` defaults and sit
// on dark while the control claimed to be following the system.
//
// Anything unrecognised resolves the same way. A value can reach here from a settings blob written
// by an older version or edited by hand, and the safe reading of "I do not know this theme" is to
// let the system decide rather than to write an attribute nobody styles.
export function themeAttribute(theme) {
  return theme === 'dark' || theme === 'light' ? theme : null;
}

// Used on the way in from storage and on the way in from the control, so an unknown value is
// normalised once rather than at each call site.
export function normaliseTheme(theme) {
  return THEMES.includes(theme) ? theme : DEFAULT_THEME;
}
