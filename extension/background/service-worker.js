// Background service worker for Smart Shopping Assistant

import { generateId, detectStore, extractAsin } from '../utils/helpers.js';

// Initialize extension
console.log('Smart Shopping Assistant - Background Service Worker Initialized');

// Storage keys
const STORAGE_KEYS = {
  WATCHLIST: 'watchlist',
  USER_STATS: 'userStats',
  PRICE_HISTORY: 'priceHistory',
  COUPONS_CACHE: 'couponsCache',
  SETTINGS: 'settings'
};

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.action);

  switch (request.action) {
    case 'comparePrices':
      handleComparePrices(request.product)
        .then(result => sendResponse(result))
        .catch(error => {
          console.error('Error comparing prices:', error);
          sendResponse({ error: error.message });
        });
      return true; // Keep channel open for async response

    case 'getCoupons':
      handleGetCoupons(request.url, request.autoApply)
        .then(result => sendResponse(result))
        .catch(error => {
          console.error('Error getting coupons:', error);
          sendResponse({ error: error.message });
        });
      return true;

    case 'addToWatchlist':
      handleAddToWatchlist(request.product)
        .then(result => sendResponse(result))
        .catch(error => {
          console.error('Error adding to watchlist:', error);
          sendResponse({ error: error.message });
        });
      return true;

    case 'removeFromWatchlist':
      handleRemoveFromWatchlist(request.itemId)
        .then(result => sendResponse(result))
        .catch(error => {
          console.error('Error removing from watchlist:', error);
          sendResponse({ error: error.message });
        });
      return true;

    case 'getWatchlist':
      handleGetWatchlist()
        .then(result => sendResponse(result))
        .catch(error => {
          console.error('Error getting watchlist:', error);
          sendResponse({ error: error.message });
        });
      return true;

    case 'productDetected':
      handleProductDetected(request.product);
      sendResponse({ success: true });
      return false;

    default:
      sendResponse({ error: 'Unknown action' });
      return false;
  }
});

/**
 * Handle price comparison request
 */
async function handleComparePrices(product) {
  console.log('Comparing prices for:', product.title);

  try {
    const prices = await fetchPricesFromStores(product);

    // Add current store price
    prices.push({
      store: product.currentStore,
      price: product.currentPrice,
      currency: product.currency || 'JPY',
      shipping: product.shipping || 0,
      url: product.url || '',
      points: product.points || 0
    });

    // Update price history
    await updatePriceHistory(product, prices);

    return { prices };
  } catch (error) {
    console.error('Error in handleComparePrices:', error);
    throw error;
  }
}

/**
 * Fetch prices from multiple stores
 */
async function fetchPricesFromStores(product) {
  const prices = [];

  // Simulate price fetching from multiple stores
  // In production, this would call actual APIs or scraping services

  const stores = ['amazon', 'rakuten', 'yahoo'];
  const currentStore = product.currentStore?.toLowerCase();

  for (const store of stores) {
    if (store === currentStore) continue; // Skip current store

    try {
      const price = await fetchPriceFromStore(store, product);
      if (price) {
        prices.push(price);
      }
    } catch (error) {
      console.error(`Error fetching price from ${store}:`, error);
    }
  }

  return prices;
}

/**
 * Fetch price from specific store
 */
async function fetchPriceFromStore(store, product) {
  // Simulate API call with mock data
  // In production, this would call actual store APIs or scraping services

  const basePrice = product.currentPrice || 10000;
  const variance = 0.9 + Math.random() * 0.2; // ±10% price variance

  const mockPrice = Math.floor(basePrice * variance);
  const mockShipping = mockPrice >= 3000 ? 0 : (store === 'amazon' ? 410 : 550);

  return {
    store: store,
    price: mockPrice,
    currency: 'JPY',
    shipping: mockShipping,
    url: generateStoreUrl(store, product),
    points: Math.floor(mockPrice * (store === 'rakuten' ? 0.01 : 0.005))
  };
}

/**
 * Generate store URL for product
 */
function generateStoreUrl(store, product) {
  // In production, this would generate actual product URLs

  switch (store) {
    case 'amazon':
      return `https://www.amazon.co.jp/dp/${product.asin || 'MOCK123'}`;
    case 'rakuten':
      return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(product.title || '')}`;
    case 'yahoo':
      return `https://shopping.yahoo.co.jp/search?p=${encodeURIComponent(product.title || '')}`;
    default:
      return '';
  }
}

/**
 * Handle get coupons request
 */
async function handleGetCoupons(url, autoApply = false) {
  console.log('Getting coupons for:', url);

  try {
    // Check cache first
    const cachedCoupons = await getCachedCoupons(url);
    if (cachedCoupons && Date.now() - cachedCoupons.timestamp < 3600000) {
      // Use cache if less than 1 hour old
      return { coupons: cachedCoupons.data };
    }

    // Fetch fresh coupons
    const coupons = await fetchCouponsFromAPI(url);

    // Cache coupons
    await cacheCoupons(url, coupons);

    return { coupons };
  } catch (error) {
    console.error('Error in handleGetCoupons:', error);
    throw error;
  }
}

/**
 * Fetch coupons from API or scraping service
 */
async function fetchCouponsFromAPI(url) {
  const store = detectStore(url);

  // Simulate coupon fetching
  // In production, this would call actual coupon APIs or scraping services

  const mockCoupons = [];

  if (store === 'amazon') {
    mockCoupons.push(
      {
        code: 'SAVE10',
        discount: '10% OFF',
        description: '¥2,000以上のご購入で10%オフ',
        verified: true
      },
      {
        code: 'FIRSTBUY',
        discount: '¥500 OFF',
        description: '初回購入限定500円オフ',
        verified: true
      }
    );
  } else if (store === 'rakuten') {
    mockCoupons.push(
      {
        code: 'RAKUTEN2024',
        discount: '15% OFF',
        description: '楽天会員限定15%オフクーポン',
        verified: true
      },
      {
        code: 'POINT5X',
        discount: '5倍ポイント',
        description: 'ポイント5倍キャンペーン',
        verified: true
      }
    );
  } else if (store === 'yahoo') {
    mockCoupons.push(
      {
        code: 'YAHOO1000',
        discount: '¥1,000 OFF',
        description: '¥5,000以上のお買い物で使える1,000円クーポン',
        verified: true
      }
    );
  }

  return mockCoupons;
}

/**
 * Get cached coupons
 */
async function getCachedCoupons(url) {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.COUPONS_CACHE]);
    const cache = result[STORAGE_KEYS.COUPONS_CACHE] || {};
    return cache[url] || null;
  } catch (error) {
    console.error('Error getting cached coupons:', error);
    return null;
  }
}

/**
 * Cache coupons
 */
async function cacheCoupons(url, coupons) {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.COUPONS_CACHE]);
    const cache = result[STORAGE_KEYS.COUPONS_CACHE] || {};

    cache[url] = {
      data: coupons,
      timestamp: Date.now()
    };

    await chrome.storage.local.set({ [STORAGE_KEYS.COUPONS_CACHE]: cache });
  } catch (error) {
    console.error('Error caching coupons:', error);
  }
}

/**
 * Handle add to watchlist request
 */
async function handleAddToWatchlist(product) {
  console.log('Adding to watchlist:', product.title);

  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.WATCHLIST]);
    const watchlist = result[STORAGE_KEYS.WATCHLIST] || [];

    // Check if already in watchlist
    const existing = watchlist.find(item => item.url === product.url);
    if (existing) {
      return { success: true, message: 'Already in watchlist' };
    }

    // Add to watchlist
    const watchlistItem = {
      id: generateId(),
      title: product.title,
      store: product.store,
      url: product.url,
      image: product.image,
      originalPrice: product.price,
      currentPrice: product.price,
      currency: product.currency || 'JPY',
      shipping: product.shipping || 0,
      points: product.points || 0,
      addedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
      priceHistory: [{
        price: product.price,
        timestamp: new Date().toISOString()
      }]
    };

    watchlist.push(watchlistItem);

    await chrome.storage.local.set({ [STORAGE_KEYS.WATCHLIST]: watchlist });

    // Set up price alert alarm
    await setupPriceAlertAlarm();

    return { success: true, item: watchlistItem };
  } catch (error) {
    console.error('Error in handleAddToWatchlist:', error);
    throw error;
  }
}

/**
 * Handle remove from watchlist request
 */
async function handleRemoveFromWatchlist(itemId) {
  console.log('Removing from watchlist:', itemId);

  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.WATCHLIST]);
    const watchlist = result[STORAGE_KEYS.WATCHLIST] || [];

    const filtered = watchlist.filter(item => item.id !== itemId);

    await chrome.storage.local.set({ [STORAGE_KEYS.WATCHLIST]: filtered });

    return { success: true };
  } catch (error) {
    console.error('Error in handleRemoveFromWatchlist:', error);
    throw error;
  }
}

/**
 * Handle get watchlist request
 */
async function handleGetWatchlist() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.WATCHLIST]);
    const watchlist = result[STORAGE_KEYS.WATCHLIST] || [];

    // Update current prices for all items
    await updateWatchlistPrices(watchlist);

    return { watchlist };
  } catch (error) {
    console.error('Error in handleGetWatchlist:', error);
    throw error;
  }
}

/**
 * Update watchlist prices
 */
async function updateWatchlistPrices(watchlist) {
  // In production, this would fetch current prices for all watchlist items
  // For now, we'll simulate price changes

  const promises = watchlist.map(async (item) => {
    // Simulate price fluctuation
    const priceChange = (Math.random() - 0.5) * 0.05; // ±2.5%
    const newPrice = Math.floor(item.originalPrice * (1 + priceChange));

    if (newPrice !== item.currentPrice) {
      item.currentPrice = newPrice;
      item.priceHistory.push({
        price: newPrice,
        timestamp: new Date().toISOString()
      });

      // Check if price dropped
      if (newPrice < item.originalPrice * 0.95) {
        await sendPriceDropNotification(item);
      }
    }

    item.lastChecked = new Date().toISOString();
  });

  await Promise.all(promises);

  // Save updated watchlist
  await chrome.storage.local.set({ [STORAGE_KEYS.WATCHLIST]: watchlist });
}

/**
 * Send price drop notification
 */
async function sendPriceDropNotification(item) {
  try {
    const discount = item.originalPrice - item.currentPrice;
    const discountPercent = Math.floor((discount / item.originalPrice) * 100);

    await chrome.notifications.create({
      type: 'basic',
      iconUrl: '../assets/icons/icon128.png',
      title: '価格が下がりました！',
      message: `${item.title}\n${discountPercent}% OFF（¥${discount}引き）`,
      priority: 2
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Handle product detected event
 */
async function handleProductDetected(product) {
  console.log('Product detected:', product.title);

  // Could trigger automatic price comparison or coupon search here
  // For now, just log it
}

/**
 * Update price history
 */
async function updatePriceHistory(product, prices) {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.PRICE_HISTORY]);
    const history = result[STORAGE_KEYS.PRICE_HISTORY] || {};

    const key = product.asin || product.url;
    if (!history[key]) {
      history[key] = [];
    }

    history[key].push({
      timestamp: new Date().toISOString(),
      prices: prices
    });

    // Keep only last 30 days of history
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    history[key] = history[key].filter(entry =>
      new Date(entry.timestamp).getTime() > thirtyDaysAgo
    );

    await chrome.storage.local.set({ [STORAGE_KEYS.PRICE_HISTORY]: history });
  } catch (error) {
    console.error('Error updating price history:', error);
  }
}

/**
 * Setup price alert alarm
 */
async function setupPriceAlertAlarm() {
  try {
    // Check prices every 6 hours
    await chrome.alarms.create('priceCheck', {
      periodInMinutes: 360
    });
  } catch (error) {
    console.error('Error setting up alarm:', error);
  }
}

/**
 * Handle alarm events
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'priceCheck') {
    console.log('Running scheduled price check');
    const result = await chrome.storage.local.get([STORAGE_KEYS.WATCHLIST]);
    const watchlist = result[STORAGE_KEYS.WATCHLIST] || [];
    await updateWatchlistPrices(watchlist);
  }
});

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');

    // Initialize default settings
    await chrome.storage.sync.set({
      [STORAGE_KEYS.SETTINGS]: {
        autoApplyCoupons: true,
        priceAlerts: true,
        language: 'ja',
        currency: 'JPY'
      }
    });

    // Initialize user stats
    await chrome.storage.local.set({
      [STORAGE_KEYS.USER_STATS]: {
        totalSaved: 0,
        cashbackEarned: 0,
        couponsUsed: 0,
        productsTracked: 0
      }
    });

    // Setup price check alarm
    await setupPriceAlertAlarm();

    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('options/welcome.html')
    });
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});

/**
 * Handle notification clicks
 */
chrome.notifications.onClicked.addListener((notificationId) => {
  // Open watchlist when notification is clicked
  chrome.action.openPopup();
});

// Export for testing
export {
  handleComparePrices,
  handleGetCoupons,
  handleAddToWatchlist,
  handleRemoveFromWatchlist,
  handleGetWatchlist
};
