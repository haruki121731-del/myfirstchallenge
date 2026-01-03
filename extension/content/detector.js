// Product page detector and information extractor

import {
  detectStore,
  extractAsin,
  extractRakutenId,
  cleanPrice,
  detectCurrency,
  isProductPage,
  generateId
} from '../utils/helpers.js';

/**
 * Detect and extract product information from current page
 */
class ProductDetector {
  constructor() {
    this.store = detectStore(window.location.href);
    this.url = window.location.href;
    this.isProduct = isProductPage(this.url);
  }

  /**
   * Extract product information based on store
   * @returns {Object|null} Product information
   */
  extractProductInfo() {
    if (!this.isProduct) return null;

    switch (this.store) {
      case 'amazon':
        return this.extractAmazonProduct();
      case 'rakuten':
        return this.extractRakutenProduct();
      case 'yahoo':
        return this.extractYahooProduct();
      case 'alibaba':
      case 'aliexpress':
        return this.extractAlibabaProduct();
      default:
        return null;
    }
  }

  /**
   * Extract Amazon product information
   * @returns {Object} Product data
   */
  extractAmazonProduct() {
    try {
      const title = this.getAmazonTitle();
      const price = this.getAmazonPrice();
      const image = this.getAmazonImage();
      const asin = extractAsin(this.url);
      const brand = this.getAmazonBrand();
      const shipping = this.getAmazonShipping();
      const points = this.getAmazonPoints();

      return {
        id: generateId(),
        store: 'amazon',
        title: title,
        price: price,
        currency: detectCurrency('¥'),
        image: image,
        url: this.url,
        asin: asin,
        brand: brand,
        shipping: shipping,
        points: points,
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error extracting Amazon product:', error);
      return null;
    }
  }

  getAmazonTitle() {
    const selectors = [
      '#productTitle',
      '#title',
      'h1.product-title',
      'span[id*="productTitle"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent.trim();
      }
    }

    return document.title.split(':')[0].trim();
  }

  getAmazonPrice() {
    const selectors = [
      '.a-price .a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '.a-price-whole',
      'span[class*="price"] span.a-offscreen'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return cleanPrice(element.textContent);
      }
    }

    return 0;
  }

  getAmazonImage() {
    const selectors = [
      '#landingImage',
      '#imgBlkFront',
      '#ebooksImgBlkFront',
      'img.a-dynamic-image'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.src) {
        return element.src;
      }
    }

    return '';
  }

  getAmazonBrand() {
    const selectors = [
      '#bylineInfo',
      'a#brand',
      '.product-brand',
      'tr:has(th:contains("Brand")) td'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent.trim().replace('ブランド:', '').replace('Brand:', '').trim();
      }
    }

    return '';
  }

  getAmazonShipping() {
    const freeShippingText = document.body.textContent;
    if (freeShippingText.includes('通常配送無料') || freeShippingText.includes('FREE Shipping')) {
      return 0;
    }

    const shippingElement = document.querySelector('#delivery-message, #mir-layout-DELIVERY_BLOCK');
    if (shippingElement) {
      const shippingText = shippingElement.textContent;
      const match = shippingText.match(/¥[\d,]+/);
      if (match) {
        return cleanPrice(match[0]);
      }
    }

    return 410; // Default Amazon shipping
  }

  getAmazonPoints() {
    const pointsElement = document.querySelector('#loyalty-points, .loyalty-points');
    if (pointsElement) {
      const pointsText = pointsElement.textContent;
      const match = pointsText.match(/[\d,]+/);
      if (match) {
        return parseInt(match[0].replace(/,/g, ''));
      }
    }
    return 0;
  }

  /**
   * Extract Rakuten product information
   * @returns {Object} Product data
   */
  extractRakutenProduct() {
    try {
      const title = this.getRakutenTitle();
      const price = this.getRakutenPrice();
      const image = this.getRakutenImage();
      const productId = extractRakutenId(this.url);
      const brand = this.getRakutenBrand();
      const shipping = this.getRakutenShipping();
      const points = this.getRakutenPoints();

      return {
        id: generateId(),
        store: 'rakuten',
        title: title,
        price: price,
        currency: detectCurrency('¥'),
        image: image,
        url: this.url,
        productId: productId,
        brand: brand,
        shipping: shipping,
        points: points,
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error extracting Rakuten product:', error);
      return null;
    }
  }

  getRakutenTitle() {
    const selectors = [
      'h1[class*="productTitle"]',
      '.item-name h1',
      'h1.title',
      '[itemprop="name"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent.trim();
      }
    }

    return document.title.split('|')[0].trim();
  }

  getRakutenPrice() {
    const selectors = [
      '[class*="price"] [class*="main"]',
      '.price2',
      '[itemprop="price"]',
      'span.price'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return cleanPrice(element.textContent || element.getAttribute('content'));
      }
    }

    return 0;
  }

  getRakutenImage() {
    const selectors = [
      '.item-image img',
      '[itemprop="image"]',
      '#rakutenLimitedId_ImageMain img',
      'img.main-image'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.src) {
        return element.src;
      }
    }

    return '';
  }

  getRakutenBrand() {
    const brandElement = document.querySelector('[itemprop="brand"], .brand-name');
    return brandElement ? brandElement.textContent.trim() : '';
  }

  getRakutenShipping() {
    const shippingElement = document.querySelector('.delivery-info, [class*="shipping"]');
    if (shippingElement) {
      const shippingText = shippingElement.textContent;
      if (shippingText.includes('送料無料') || shippingText.includes('無料')) {
        return 0;
      }
      const match = shippingText.match(/¥[\d,]+/);
      if (match) {
        return cleanPrice(match[0]);
      }
    }
    return 550; // Default Rakuten shipping
  }

  getRakutenPoints() {
    const pointsElement = document.querySelector('[class*="point"]');
    if (pointsElement) {
      const pointsText = pointsElement.textContent;
      const match = pointsText.match(/[\d,]+/);
      if (match) {
        return parseInt(match[0].replace(/,/g, ''));
      }
    }
    return Math.floor(this.getRakutenPrice() * 0.01); // Default 1%
  }

  /**
   * Extract Yahoo Shopping product information
   * @returns {Object} Product data
   */
  extractYahooProduct() {
    try {
      const title = this.getYahooTitle();
      const price = this.getYahooPrice();
      const image = this.getYahooImage();
      const brand = this.getYahooBrand();
      const shipping = this.getYahooShipping();
      const points = this.getYahooPoints();

      return {
        id: generateId(),
        store: 'yahoo',
        title: title,
        price: price,
        currency: detectCurrency('¥'),
        image: image,
        url: this.url,
        brand: brand,
        shipping: shipping,
        points: points,
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error extracting Yahoo product:', error);
      return null;
    }
  }

  getYahooTitle() {
    const selectors = [
      'h1[class*="Name"]',
      '.productName',
      'h1.product-title'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent.trim();
      }
    }

    return document.title.split('-')[0].trim();
  }

  getYahooPrice() {
    const selectors = [
      '[class*="Price_price"]',
      '.product-price',
      'span.price'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return cleanPrice(element.textContent);
      }
    }

    return 0;
  }

  getYahooImage() {
    const selectors = [
      '.product-image img',
      'img[class*="ProductImage"]',
      '.item-image img'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.src) {
        return element.src;
      }
    }

    return '';
  }

  getYahooBrand() {
    const brandElement = document.querySelector('[class*="Brand"], .brand-name');
    return brandElement ? brandElement.textContent.trim() : '';
  }

  getYahooShipping() {
    const shippingElement = document.querySelector('[class*="shipping"], .delivery-info');
    if (shippingElement) {
      const shippingText = shippingElement.textContent;
      if (shippingText.includes('送料無料')) {
        return 0;
      }
      const match = shippingText.match(/¥[\d,]+/);
      if (match) {
        return cleanPrice(match[0]);
      }
    }
    return 500; // Default Yahoo shipping
  }

  getYahooPoints() {
    const pointsElement = document.querySelector('[class*="point"]');
    if (pointsElement) {
      const pointsText = pointsElement.textContent;
      const match = pointsText.match(/[\d,]+/);
      if (match) {
        return parseInt(match[0].replace(/,/g, ''));
      }
    }
    return Math.floor(this.getYahooPrice() * 0.01); // Default 1%
  }

  /**
   * Extract Alibaba/AliExpress product information
   * @returns {Object} Product data
   */
  extractAlibabaProduct() {
    try {
      const title = this.getAlibabaTitle();
      const price = this.getAlibabaPrice();
      const image = this.getAlibabaImage();
      const shipping = 0; // Usually free shipping

      return {
        id: generateId(),
        store: this.store,
        title: title,
        price: price,
        currency: detectCurrency('$'),
        image: image,
        url: this.url,
        shipping: shipping,
        points: 0,
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error extracting Alibaba/AliExpress product:', error);
      return null;
    }
  }

  getAlibabaTitle() {
    const selectors = [
      'h1[class*="product-title"]',
      '.product-name',
      'h1.title'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent.trim();
      }
    }

    return document.title.split('-')[0].trim();
  }

  getAlibabaPrice() {
    const selectors = [
      '[class*="product-price"]',
      '.price-current',
      'span.price'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return cleanPrice(element.textContent);
      }
    }

    return 0;
  }

  getAlibabaImage() {
    const selectors = [
      '.product-image img',
      'img[class*="productImage"]',
      '.magnifier-image'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.src) {
        return element.src;
      }
    }

    return '';
  }
}

// Initialize detector
const detector = new ProductDetector();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProductInfo') {
    const productInfo = detector.extractProductInfo();
    sendResponse({ product: productInfo });
  }
  return true; // Keep message channel open for async response
});

// Notify background script when product is detected
if (detector.isProduct) {
  const productInfo = detector.extractProductInfo();
  if (productInfo) {
    chrome.runtime.sendMessage({
      action: 'productDetected',
      product: productInfo
    });
  }
}

export default ProductDetector;
