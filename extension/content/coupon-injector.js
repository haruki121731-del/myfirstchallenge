// Coupon auto-apply injector

import { detectStore } from '../utils/helpers.js';

/**
 * Coupon injector for automatic coupon application
 */
class CouponInjector {
  constructor() {
    this.store = detectStore(window.location.href);
    this.isCartPage = this.detectCartPage();
    this.isCheckoutPage = this.detectCheckoutPage();

    if (this.isCartPage || this.isCheckoutPage) {
      this.init();
    }
  }

  init() {
    console.log('Coupon Injector initialized on', this.store);

    // Listen for coupon application requests
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'applyCoupon') {
        this.applyCoupon(request.code);
        sendResponse({ success: true });
      }
      return true;
    });

    // Auto-search for coupons on cart/checkout pages
    this.autoSearchCoupons();
  }

  /**
   * Detect if current page is a cart page
   */
  detectCartPage() {
    const url = window.location.href.toLowerCase();
    const path = window.location.pathname.toLowerCase();

    return (
      url.includes('/cart') ||
      url.includes('/basket') ||
      url.includes('/shopping-cart') ||
      path.includes('/cart') ||
      document.querySelector('[class*="cart"], [id*="cart"]') !== null
    );
  }

  /**
   * Detect if current page is a checkout page
   */
  detectCheckoutPage() {
    const url = window.location.href.toLowerCase();
    const path = window.location.pathname.toLowerCase();

    return (
      url.includes('/checkout') ||
      url.includes('/purchase') ||
      path.includes('/checkout') ||
      document.querySelector('[class*="checkout"], [id*="checkout"]') !== null
    );
  }

  /**
   * Auto-search for applicable coupons
   */
  async autoSearchCoupons() {
    try {
      // Show searching indicator
      this.showCouponSearchIndicator();

      // Request coupons from background
      const response = await chrome.runtime.sendMessage({
        action: 'getCoupons',
        url: window.location.href,
        autoApply: true
      });

      if (response && response.coupons && response.coupons.length > 0) {
        this.showCouponNotification(response.coupons);

        // Auto-apply best coupon if enabled
        const settings = await this.getSettings();
        if (settings.autoApplyCoupons) {
          await this.autoApplyBestCoupon(response.coupons);
        }
      } else {
        this.hideCouponSearchIndicator();
      }
    } catch (error) {
      console.error('Error auto-searching coupons:', error);
      this.hideCouponSearchIndicator();
    }
  }

  /**
   * Show coupon search indicator
   */
  showCouponSearchIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'smart-shopping-coupon-indicator';
    indicator.className = 'smart-shopping-coupon-indicator';
    indicator.innerHTML = `
      <div class="indicator-content">
        <div class="spinner"></div>
        <span>クーポンを検索中...</span>
      </div>
    `;

    document.body.appendChild(indicator);
  }

  /**
   * Hide coupon search indicator
   */
  hideCouponSearchIndicator() {
    const indicator = document.getElementById('smart-shopping-coupon-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * Show coupon notification
   */
  showCouponNotification(coupons) {
    this.hideCouponSearchIndicator();

    const notification = document.createElement('div');
    notification.id = 'smart-shopping-coupon-notification';
    notification.className = 'smart-shopping-coupon-notification';

    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-header">
          <h4>🎫 ${coupons.length}個のクーポンが利用可能です！</h4>
          <button class="close-notification">×</button>
        </div>
        <div class="coupon-list-notification">
          ${coupons.map(coupon => `
            <div class="coupon-item-notification">
              <div class="coupon-info">
                <span class="coupon-discount">${coupon.discount}</span>
                <span class="coupon-description">${coupon.description}</span>
              </div>
              <button class="apply-coupon-btn" data-code="${coupon.code}">適用</button>
            </div>
          `).join('')}
        </div>
        <button class="try-all-btn">すべて試す</button>
      </div>
    `;

    // Add event listeners
    notification.querySelector('.close-notification').addEventListener('click', () => {
      notification.remove();
    });

    notification.querySelectorAll('.apply-coupon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.applyCoupon(btn.dataset.code);
      });
    });

    notification.querySelector('.try-all-btn').addEventListener('click', () => {
      this.autoApplyBestCoupon(coupons);
    });

    document.body.appendChild(notification);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  /**
   * Apply coupon code based on store
   */
  async applyCoupon(code) {
    console.log('Applying coupon:', code);

    try {
      switch (this.store) {
        case 'amazon':
          await this.applyAmazonCoupon(code);
          break;
        case 'rakuten':
          await this.applyRakutenCoupon(code);
          break;
        case 'yahoo':
          await this.applyYahooCoupon(code);
          break;
        default:
          // Generic coupon application
          await this.applyGenericCoupon(code);
          break;
      }

      this.showSuccessMessage(`クーポン「${code}」を適用しました！`);
    } catch (error) {
      console.error('Error applying coupon:', error);
      this.showErrorMessage(`クーポンの適用に失敗しました: ${code}`);
    }
  }

  /**
   * Apply Amazon coupon
   */
  async applyAmazonCoupon(code) {
    const couponInput = document.querySelector('#gc-ui-pin-box input, input[name="claimCode"]');

    if (couponInput) {
      couponInput.value = code;
      couponInput.dispatchEvent(new Event('input', { bubbles: true }));

      // Find and click apply button
      const applyButton = document.querySelector('#gc-apply-button, button[name="submit.addGiftCertificate"]');
      if (applyButton) {
        applyButton.click();
      }
    } else {
      throw new Error('Coupon input not found');
    }
  }

  /**
   * Apply Rakuten coupon
   */
  async applyRakutenCoupon(code) {
    const couponInput = document.querySelector('input[name="coupon_cd"], input[class*="coupon"]');

    if (couponInput) {
      couponInput.value = code;
      couponInput.dispatchEvent(new Event('input', { bubbles: true }));

      // Find and click apply button
      const applyButton = document.querySelector('button[class*="coupon"], input[type="submit"][class*="coupon"]');
      if (applyButton) {
        applyButton.click();
      }
    } else {
      throw new Error('Coupon input not found');
    }
  }

  /**
   * Apply Yahoo Shopping coupon
   */
  async applyYahooCoupon(code) {
    const couponInput = document.querySelector('input[name="couponCode"], input[class*="coupon"]');

    if (couponInput) {
      couponInput.value = code;
      couponInput.dispatchEvent(new Event('input', { bubbles: true }));

      // Find and click apply button
      const applyButton = document.querySelector('button[class*="applyCoupon"]');
      if (applyButton) {
        applyButton.click();
      }
    } else {
      throw new Error('Coupon input not found');
    }
  }

  /**
   * Apply generic coupon (fallback)
   */
  async applyGenericCoupon(code) {
    // Try to find coupon input by common patterns
    const selectors = [
      'input[name*="coupon"]',
      'input[name*="promo"]',
      'input[name*="discount"]',
      'input[id*="coupon"]',
      'input[id*="promo"]',
      'input[placeholder*="coupon"]',
      'input[placeholder*="promo"]'
    ];

    for (const selector of selectors) {
      const input = document.querySelector(selector);
      if (input) {
        input.value = code;
        input.dispatchEvent(new Event('input', { bubbles: true }));

        // Try to find and click apply button
        const parent = input.closest('form, div');
        if (parent) {
          const applyButton = parent.querySelector('button[type="submit"], button[class*="apply"], input[type="submit"]');
          if (applyButton) {
            applyButton.click();
            return;
          }
        }
      }
    }

    throw new Error('Could not find coupon input field');
  }

  /**
   * Auto-apply best coupon from list
   */
  async autoApplyBestCoupon(coupons) {
    // Sort coupons by potential savings (if available)
    const sortedCoupons = [...coupons].sort((a, b) => {
      // Prefer verified coupons
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;

      // Prefer higher discounts
      const aDiscount = this.extractDiscountValue(a.discount);
      const bDiscount = this.extractDiscountValue(b.discount);
      return bDiscount - aDiscount;
    });

    for (const coupon of sortedCoupons) {
      try {
        await this.applyCoupon(coupon.code);
        await this.delay(1000); // Wait for coupon to be applied
        break; // Stop after first successful application
      } catch (error) {
        console.error('Failed to apply coupon:', coupon.code, error);
        continue; // Try next coupon
      }
    }
  }

  /**
   * Extract numeric discount value from string
   */
  extractDiscountValue(discountText) {
    const match = discountText.match(/(\d+)%|¥(\d+)/);
    if (match) {
      return parseInt(match[1] || match[2]);
    }
    return 0;
  }

  /**
   * Get user settings
   */
  async getSettings() {
    try {
      const result = await chrome.storage.sync.get(['settings']);
      return result.settings || { autoApplyCoupons: true };
    } catch (error) {
      return { autoApplyCoupons: true };
    }
  }

  /**
   * Show success message
   */
  showSuccessMessage(message) {
    this.showMessage(message, 'success');
  }

  /**
   * Show error message
   */
  showErrorMessage(message) {
    this.showMessage(message, 'error');
  }

  /**
   * Show message toast
   */
  showMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `smart-shopping-toast smart-shopping-toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize coupon injector
new CouponInjector();

export default CouponInjector;
