// Internationalization utility

/**
 * Get localized message
 * @param {string} key - Message key
 * @param {Array<string>} substitutions - Optional substitution values
 * @returns {string} Localized message
 */
export function getMessage(key, substitutions = []) {
  if (typeof chrome !== 'undefined' && chrome.i18n) {
    return chrome.i18n.getMessage(key, substitutions) || key;
  }
  return key;
}

/**
 * Get current locale
 * @returns {string} Current locale code
 */
export function getCurrentLocale() {
  if (typeof chrome !== 'undefined' && chrome.i18n) {
    return chrome.i18n.getUILanguage();
  }
  return navigator.language || 'ja';
}

/**
 * Apply i18n to DOM element
 * @param {HTMLElement} element - DOM element
 */
export function applyI18n(element) {
  const i18nElements = element.querySelectorAll('[data-i18n]');

  i18nElements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const message = getMessage(key);

    // Update text content or placeholder based on element type
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = message;
    } else {
      el.textContent = message;
    }
  });
}

/**
 * Format number with locale
 * @param {number} number - Number to format
 * @param {object} options - Intl.NumberFormat options
 * @returns {string} Formatted number
 */
export function formatNumber(number, options = {}) {
  const locale = getCurrentLocale();
  return new Intl.NumberFormat(locale, options).format(number);
}

/**
 * Format date with locale
 * @param {Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export function formatDate(date, options = {}) {
  const locale = getCurrentLocale();
  return new Intl.DateTimeFormat(locale, options).format(date);
}
