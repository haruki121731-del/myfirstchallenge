// Utility helper functions

/**
 * Format price with currency symbol
 * @param {number} price - Price value
 * @param {string} currency - Currency code (JPY, USD, CNY, etc.)
 * @returns {string} Formatted price string
 */
export function formatPrice(price, currency = 'JPY') {
  const formatter = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return formatter.format(price);
}

/**
 * Format discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} currentPrice - Current price
 * @returns {string} Formatted discount percentage
 */
export function formatDiscount(originalPrice, currentPrice) {
  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return `${discount.toFixed(0)}% OFF`;
}

/**
 * Detect language from browser or URL
 * @returns {string} Language code (ja, en, zh)
 */
export function detectLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;

  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('zh')) return 'zh';
  return 'en';
}

/**
 * Extract domain from URL
 * @param {string} url - Full URL
 * @returns {string} Domain name
 */
export function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return '';
  }
}

/**
 * Detect store from URL
 * @param {string} url - Product page URL
 * @returns {string} Store name (amazon, rakuten, yahoo, etc.)
 */
export function detectStore(url) {
  const domain = extractDomain(url).toLowerCase();

  if (domain.includes('amazon')) return 'amazon';
  if (domain.includes('rakuten')) return 'rakuten';
  if (domain.includes('yahoo') && domain.includes('shopping')) return 'yahoo';
  if (domain.includes('alibaba')) return 'alibaba';
  if (domain.includes('aliexpress')) return 'aliexpress';

  return 'unknown';
}

/**
 * Extract ASIN from Amazon URL
 * @param {string} url - Amazon product URL
 * @returns {string|null} ASIN code
 */
export function extractAsin(url) {
  const match = url.match(/\/dp\/([A-Z0-9]{10})|\/gp\/product\/([A-Z0-9]{10})/);
  return match ? (match[1] || match[2]) : null;
}

/**
 * Extract product ID from Rakuten URL
 * @param {string} url - Rakuten product URL
 * @returns {string|null} Product ID
 */
export function extractRakutenId(url) {
  const match = url.match(/\/([0-9a-zA-Z_-]+)\/[0-9]+/);
  return match ? match[1] : null;
}

/**
 * Clean price string and convert to number
 * @param {string} priceText - Price text (e.g., "¥1,234", "$12.34")
 * @returns {number} Price as number
 */
export function cleanPrice(priceText) {
  if (typeof priceText === 'number') return priceText;

  // Remove currency symbols and commas, then parse
  const cleaned = priceText.replace(/[¥$€£,]/g, '').trim();
  const number = parseFloat(cleaned);

  return isNaN(number) ? 0 : number;
}

/**
 * Detect currency from text or region
 * @param {string} text - Text that might contain currency symbol
 * @returns {string} Currency code
 */
export function detectCurrency(text = '') {
  if (text.includes('¥') || text.includes('円')) return 'JPY';
  if (text.includes('$')) return 'USD';
  if (text.includes('€')) return 'EUR';
  if (text.includes('£')) return 'GBP';
  if (text.includes('元')) return 'CNY';

  return 'JPY'; // Default to JPY
}

/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 1000) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Calculate shipping based on price and store
 * @param {number} price - Product price
 * @param {string} store - Store name
 * @returns {number} Estimated shipping cost
 */
export function estimateShipping(price, store) {
  // Simple shipping estimation logic
  // In production, this should use actual store APIs

  if (price >= 3000) return 0; // Free shipping over 3000 yen

  switch (store.toLowerCase()) {
    case 'amazon':
      return 410;
    case 'rakuten':
      return 550;
    case 'yahoo':
      return 500;
    default:
      return 600;
  }
}

/**
 * Calculate points earned
 * @param {number} price - Product price
 * @param {string} store - Store name
 * @returns {number} Points earned
 */
export function calculatePoints(price, store) {
  switch (store.toLowerCase()) {
    case 'rakuten':
      return Math.floor(price * 0.01); // 1% points
    case 'yahoo':
      return Math.floor(price * 0.01); // 1% points
    case 'amazon':
      return Math.floor(price * 0.005); // 0.5% points
    default:
      return 0;
  }
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Format date to locale string
 * @param {Date|string} date - Date object or string
 * @param {string} locale - Locale code
 * @returns {string} Formatted date string
 */
export function formatDate(date, locale = 'ja-JP') {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Check if URL is a product page
 * @param {string} url - URL to check
 * @returns {boolean} True if product page
 */
export function isProductPage(url) {
  const domain = extractDomain(url).toLowerCase();

  // Amazon product pages
  if (domain.includes('amazon') && (url.includes('/dp/') || url.includes('/gp/product/'))) {
    return true;
  }

  // Rakuten product pages
  if (domain.includes('rakuten') && url.includes('/product/')) {
    return true;
  }

  // Yahoo Shopping product pages
  if (domain.includes('yahoo') && url.includes('/shopping/') && url.includes('/product/')) {
    return true;
  }

  // Alibaba/AliExpress product pages
  if ((domain.includes('alibaba') || domain.includes('aliexpress')) && url.includes('/product/')) {
    return true;
  }

  return false;
}

/**
 * Convert currency
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {Promise<number>} Converted amount
 */
export async function convertCurrency(amount, fromCurrency, toCurrency) {
  // Simple conversion rates (in production, use real-time API)
  const rates = {
    'JPY': 1,
    'USD': 149.5,
    'EUR': 163.2,
    'CNY': 20.8,
    'GBP': 190.3
  };

  if (fromCurrency === toCurrency) return amount;

  // Convert to JPY first, then to target currency
  const inJpy = amount / (rates[fromCurrency] || 1);
  const converted = inJpy * (rates[toCurrency] || 1);

  return Math.round(converted * 100) / 100;
}
