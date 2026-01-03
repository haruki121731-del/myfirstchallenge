// Price tracker and comparison UI injector

import { formatPrice, detectStore } from '../utils/helpers.js';
import { getMessage } from '../utils/i18n.js';

/**
 * Price tracker overlay UI
 */
class PriceTracker {
  constructor() {
    this.store = detectStore(window.location.href);
    this.overlayVisible = false;
    this.priceData = null;

    this.init();
  }

  async init() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.injectUI());
    } else {
      this.injectUI();
    }

    // Listen for price updates
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'updatePriceComparison') {
        this.updatePriceDisplay(request.prices);
        sendResponse({ success: true });
      }
      return true;
    });
  }

  /**
   * Inject price comparison UI into page
   */
  injectUI() {
    // Create floating button
    this.createFloatingButton();

    // Create overlay panel
    this.createOverlayPanel();
  }

  /**
   * Create floating comparison button
   */
  createFloatingButton() {
    const button = document.createElement('button');
    button.id = 'smart-shopping-float-btn';
    button.className = 'smart-shopping-float-btn';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>価格比較</span>
    `;

    button.addEventListener('click', () => this.toggleOverlay());

    document.body.appendChild(button);
  }

  /**
   * Create overlay panel for price comparison
   */
  createOverlayPanel() {
    const overlay = document.createElement('div');
    overlay.id = 'smart-shopping-overlay';
    overlay.className = 'smart-shopping-overlay';
    overlay.innerHTML = `
      <div class="smart-shopping-panel">
        <div class="panel-header">
          <h3>価格比較</h3>
          <button class="close-btn" id="smart-shopping-close">×</button>
        </div>
        <div class="panel-content" id="smart-shopping-content">
          <div class="loading">
            <div class="spinner"></div>
            <p>価格を比較中...</p>
          </div>
        </div>
        <div class="panel-footer">
          <button class="action-btn primary" id="smart-shopping-watchlist">
            <span>📌</span>
            <span>ウォッチリストに追加</span>
          </button>
          <button class="action-btn secondary" id="smart-shopping-coupons">
            <span>🎫</span>
            <span>クーポンを検索</span>
          </button>
        </div>
      </div>
    `;

    // Add event listeners
    overlay.querySelector('#smart-shopping-close').addEventListener('click', () => {
      this.hideOverlay();
    });

    overlay.querySelector('#smart-shopping-watchlist').addEventListener('click', () => {
      this.addToWatchlist();
    });

    overlay.querySelector('#smart-shopping-coupons').addEventListener('click', () => {
      this.searchCoupons();
    });

    // Close on outside click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hideOverlay();
      }
    });

    document.body.appendChild(overlay);
  }

  /**
   * Toggle overlay visibility
   */
  toggleOverlay() {
    if (this.overlayVisible) {
      this.hideOverlay();
    } else {
      this.showOverlay();
    }
  }

  /**
   * Show overlay and fetch prices
   */
  async showOverlay() {
    const overlay = document.getElementById('smart-shopping-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      this.overlayVisible = true;

      // Fetch price comparison
      await this.fetchPriceComparison();
    }
  }

  /**
   * Hide overlay
   */
  hideOverlay() {
    const overlay = document.getElementById('smart-shopping-overlay');
    if (overlay) {
      overlay.style.display = 'none';
      this.overlayVisible = false;
    }
  }

  /**
   * Fetch price comparison data
   */
  async fetchPriceComparison() {
    try {
      // Get product info from detector
      const productInfo = await this.getCurrentProduct();

      if (!productInfo) {
        this.showError('商品情報を取得できませんでした');
        return;
      }

      // Request price comparison from background
      const response = await chrome.runtime.sendMessage({
        action: 'comparePrices',
        product: productInfo
      });

      if (response && response.prices) {
        this.updatePriceDisplay(response.prices);
      }
    } catch (error) {
      console.error('Error fetching price comparison:', error);
      this.showError('価格比較中にエラーが発生しました');
    }
  }

  /**
   * Get current product information
   */
  async getCurrentProduct() {
    return new Promise((resolve) => {
      window.postMessage({ type: 'GET_PRODUCT_INFO' }, '*');

      const handler = (event) => {
        if (event.data.type === 'PRODUCT_INFO_RESPONSE') {
          window.removeEventListener('message', handler);
          resolve(event.data.product);
        }
      };

      window.addEventListener('message', handler);

      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener('message', handler);
        resolve(null);
      }, 5000);
    });
  }

  /**
   * Update price display in overlay
   */
  updatePriceDisplay(prices) {
    const content = document.getElementById('smart-shopping-content');
    if (!content) return;

    // Sort prices by total (price + shipping)
    const sortedPrices = prices.sort((a, b) => {
      const totalA = a.price + (a.shipping || 0);
      const totalB = b.price + (b.shipping || 0);
      return totalA - totalB;
    });

    const bestPrice = sortedPrices[0];

    let html = '<div class="price-list">';

    sortedPrices.forEach((priceData, index) => {
      const isBest = index === 0;
      const total = priceData.price + (priceData.shipping || 0);

      html += `
        <div class="price-item ${isBest ? 'best-price' : ''}" data-url="${priceData.url}">
          <div class="store-info">
            <div class="store-name">${this.getStoreName(priceData.store)}</div>
            ${isBest ? '<span class="best-badge">最安値</span>' : ''}
          </div>
          <div class="price-info">
            <div class="price">${formatPrice(priceData.price, priceData.currency)}</div>
            <div class="shipping-info">
              送料: ${priceData.shipping === 0 ? '無料' : formatPrice(priceData.shipping, priceData.currency)}
            </div>
            <div class="total-price">合計: ${formatPrice(total, priceData.currency)}</div>
          </div>
          <button class="go-btn" data-url="${priceData.url}">
            <span>→</span>
          </button>
        </div>
      `;
    });

    html += '</div>';

    content.innerHTML = html;

    // Add click handlers for go buttons
    content.querySelectorAll('.go-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = btn.dataset.url;
        window.open(url, '_blank');
      });
    });

    // Add click handlers for price items
    content.querySelectorAll('.price-item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.dataset.url;
        window.open(url, '_blank');
      });
    });
  }

  /**
   * Show error message
   */
  showError(message) {
    const content = document.getElementById('smart-shopping-content');
    if (content) {
      content.innerHTML = `
        <div class="error-message">
          <p>⚠️ ${message}</p>
        </div>
      `;
    }
  }

  /**
   * Get localized store name
   */
  getStoreName(store) {
    const names = {
      'amazon': 'Amazon',
      'rakuten': '楽天市場',
      'yahoo': 'Yahoo!ショッピング',
      'alibaba': 'Alibaba',
      'aliexpress': 'AliExpress'
    };
    return names[store.toLowerCase()] || store;
  }

  /**
   * Add product to watchlist
   */
  async addToWatchlist() {
    try {
      const productInfo = await this.getCurrentProduct();

      if (!productInfo) {
        alert('商品情報を取得できませんでした');
        return;
      }

      const response = await chrome.runtime.sendMessage({
        action: 'addToWatchlist',
        product: productInfo
      });

      if (response && response.success) {
        alert('ウォッチリストに追加しました！');
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert('エラーが発生しました');
    }
  }

  /**
   * Search for coupons
   */
  async searchCoupons() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getCoupons',
        url: window.location.href
      });

      if (response && response.coupons && response.coupons.length > 0) {
        this.displayCoupons(response.coupons);
      } else {
        alert('現在利用可能なクーポンはありません');
      }
    } catch (error) {
      console.error('Error searching coupons:', error);
      alert('クーポン検索中にエラーが発生しました');
    }
  }

  /**
   * Display coupons in overlay
   */
  displayCoupons(coupons) {
    const content = document.getElementById('smart-shopping-content');
    if (!content) return;

    let html = '<div class="coupon-list"><h4>利用可能なクーポン</h4>';

    coupons.forEach(coupon => {
      html += `
        <div class="coupon-card">
          <div class="coupon-discount">${coupon.discount}</div>
          <div class="coupon-description">${coupon.description}</div>
          <div class="coupon-code-container">
            <code class="coupon-code">${coupon.code}</code>
            <button class="copy-btn" data-code="${coupon.code}">コピー</button>
          </div>
        </div>
      `;
    });

    html += '</div>';

    content.innerHTML = html;

    // Add copy button handlers
    content.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const code = btn.dataset.code;
        try {
          await navigator.clipboard.writeText(code);
          btn.textContent = '✓ コピー済み';
          setTimeout(() => {
            btn.textContent = 'コピー';
          }, 2000);
        } catch (error) {
          console.error('Error copying code:', error);
        }
      });
    });
  }
}

// Initialize price tracker when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PriceTracker();
  });
} else {
  new PriceTracker();
}

export default PriceTracker;
