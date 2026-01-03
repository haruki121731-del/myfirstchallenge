// Popup script for Smart Shopping Assistant
import { formatPrice, formatDiscount, detectLanguage } from '../utils/helpers.js';
import { getMessage } from '../utils/i18n.js';

// State
let currentTab = 'prices';
let currentProduct = null;
let watchlistItems = [];
let userStats = {
  totalSaved: 0,
  cashbackEarned: 0
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await initializeUI();
  await loadUserData();
  setupEventListeners();
  await loadCurrentProduct();
});

// Initialize UI with translations
async function initializeUI() {
  // Apply i18n translations
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = getMessage(key);
  });

  // Set extension title
  document.getElementById('extension-title').textContent = getMessage('extensionName');
}

// Setup event listeners
function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Settings button
  document.getElementById('settings-btn')?.addEventListener('click', openSettings);

  // Premium button
  document.getElementById('premium-btn')?.addEventListener('click', openPremiumPage);

  // Add to watchlist button
  document.getElementById('add-to-watchlist-btn')?.addEventListener('click', addToWatchlist);

  // Go to best price button
  document.getElementById('go-to-best-price')?.addEventListener('click', goToBestPrice);

  // Coupon search
  document.getElementById('search-coupons-btn')?.addEventListener('click', searchCoupons);

  // Watchlist sorting
  document.getElementById('sort-watchlist')?.addEventListener('change', (e) => {
    sortWatchlist(e.target.value);
  });
}

// Switch tabs
function switchTab(tabName) {
  currentTab = tabName;

  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab`);
  });

  // Load tab-specific content
  switch (tabName) {
    case 'prices':
      loadCurrentProduct();
      break;
    case 'coupons':
      loadCoupons();
      break;
    case 'watchlist':
      loadWatchlist();
      break;
  }
}

// Load current product from active tab
async function loadCurrentProduct() {
  const loading = document.getElementById('loading');
  const noProduct = document.getElementById('no-product');
  const productDetails = document.getElementById('product-details');

  // Show loading
  loading?.classList.remove('hidden');
  noProduct?.classList.add('hidden');
  productDetails?.classList.add('hidden');

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send message to content script to get product info
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getProductInfo' });

    if (response && response.product) {
      currentProduct = response.product;
      await displayProductInfo(currentProduct);
      await comparePrices(currentProduct);
    } else {
      // No product detected
      loading?.classList.add('hidden');
      noProduct?.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error loading product:', error);
    loading?.classList.add('hidden');
    noProduct?.classList.remove('hidden');
  }
}

// Display product information
async function displayProductInfo(product) {
  const loading = document.getElementById('loading');
  const productDetails = document.getElementById('product-details');

  // Update product image
  const productImage = document.getElementById('product-image');
  if (productImage && product.image) {
    productImage.src = product.image;
    productImage.alt = product.title;
  }

  // Update product title
  const productTitle = document.getElementById('product-title');
  if (productTitle) {
    productTitle.textContent = product.title;
  }

  // Update product brand
  const productBrand = document.getElementById('product-brand');
  if (productBrand && product.brand) {
    productBrand.textContent = product.brand;
  }

  // Update current price
  const currentPrice = document.getElementById('current-price');
  if (currentPrice) {
    currentPrice.textContent = formatPrice(product.price, product.currency);
  }

  // Update shipping info
  const shippingInfo = document.getElementById('shipping-info');
  if (shippingInfo) {
    const shippingText = product.shipping === 0
      ? getMessage('free')
      : formatPrice(product.shipping, product.currency);
    shippingInfo.textContent = `${getMessage('shipping')}: ${shippingText}`;
  }

  // Update points info
  const pointsInfo = document.getElementById('points-info');
  if (pointsInfo && product.points) {
    pointsInfo.textContent = `${getMessage('points')}: ${product.points}`;
  }

  // Hide loading, show product details
  loading?.classList.add('hidden');
  productDetails?.classList.remove('hidden');
}

// Compare prices across stores
async function comparePrices(product) {
  try {
    // Send request to background script to fetch prices from other stores
    const response = await chrome.runtime.sendMessage({
      action: 'comparePrices',
      product: {
        title: product.title,
        asin: product.asin,
        ean: product.ean,
        currentStore: product.store,
        currentPrice: product.price
      }
    });

    if (response && response.prices) {
      displayPriceComparison(response.prices, product);
    }
  } catch (error) {
    console.error('Error comparing prices:', error);
  }
}

// Display price comparison results
function displayPriceComparison(prices, currentProduct) {
  const priceList = document.getElementById('price-list');
  if (!priceList) return;

  // Clear existing list
  priceList.innerHTML = '';

  // Sort prices by total (price + shipping)
  const sortedPrices = prices.sort((a, b) => {
    const totalA = a.price + (a.shipping || 0);
    const totalB = b.price + (b.shipping || 0);
    return totalA - totalB;
  });

  const bestPrice = sortedPrices[0];
  const currentTotal = currentProduct.price + (currentProduct.shipping || 0);
  const bestTotal = bestPrice.price + (bestPrice.shipping || 0);

  // Display each price
  sortedPrices.forEach((priceData, index) => {
    const priceItem = createPriceItem(priceData, index === 0);
    priceList.appendChild(priceItem);
  });

  // Update savings summary if there's a better price
  if (bestTotal < currentTotal) {
    const savings = currentTotal - bestTotal;
    updateSavingsSummary(savings, currentProduct.currency, bestPrice.url);
  }
}

// Create price item element
function createPriceItem(priceData, isBest) {
  const item = document.createElement('div');
  item.className = `price-item ${isBest ? 'best-price' : ''}`;

  const storeInfo = document.createElement('div');
  storeInfo.className = 'store-info';

  const storeName = document.createElement('div');
  storeName.className = 'store-name';
  storeName.textContent = getMessage(priceData.store.toLowerCase()) || priceData.store;

  storeInfo.appendChild(storeName);

  const storePrice = document.createElement('div');
  storePrice.className = 'store-price';

  const price = document.createElement('div');
  price.className = 'price';
  price.textContent = formatPrice(priceData.price, priceData.currency);

  const priceNote = document.createElement('div');
  priceNote.className = 'price-note';
  const shippingText = priceData.shipping === 0
    ? getMessage('free')
    : `+${formatPrice(priceData.shipping, priceData.currency)}`;
  priceNote.textContent = `${getMessage('shipping')}: ${shippingText}`;

  storePrice.appendChild(price);
  storePrice.appendChild(priceNote);

  item.appendChild(storeInfo);
  item.appendChild(storePrice);

  // Add click handler to open store page
  item.addEventListener('click', () => {
    chrome.tabs.create({ url: priceData.url });
  });

  return item;
}

// Update savings summary
function updateSavingsSummary(savings, currency, bestPriceUrl) {
  const savingsSummary = document.getElementById('savings-summary');
  const savingsValue = document.getElementById('savings-value');
  const goToBestPriceBtn = document.getElementById('go-to-best-price');

  if (savingsSummary && savingsValue) {
    savingsValue.textContent = formatPrice(savings, currency);
    savingsSummary.classList.remove('hidden');

    if (goToBestPriceBtn) {
      goToBestPriceBtn.onclick = () => {
        chrome.tabs.create({ url: bestPriceUrl });
      };
    }
  }
}

// Add product to watchlist
async function addToWatchlist() {
  if (!currentProduct) return;

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'addToWatchlist',
      product: currentProduct
    });

    if (response && response.success) {
      // Show success notification
      showNotification('商品をウォッチリストに追加しました', 'success');

      // Update button state
      const btn = document.getElementById('add-to-watchlist-btn');
      if (btn) {
        btn.textContent = '✓ ウォッチリスト登録済み';
        btn.disabled = true;
      }
    }
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    showNotification('エラーが発生しました', 'error');
  }
}

// Load coupons
async function loadCoupons() {
  const couponsLoading = document.getElementById('coupons-loading');
  const couponsList = document.getElementById('coupons-list');
  const noCoupons = document.getElementById('no-coupons');

  // Show loading
  couponsLoading?.classList.remove('hidden');
  couponsList.innerHTML = '';
  noCoupons?.classList.add('hidden');

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Request coupons from background script
    const response = await chrome.runtime.sendMessage({
      action: 'getCoupons',
      url: tab.url
    });

    couponsLoading?.classList.add('hidden');

    if (response && response.coupons && response.coupons.length > 0) {
      displayCoupons(response.coupons);
    } else {
      noCoupons?.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error loading coupons:', error);
    couponsLoading?.classList.add('hidden');
    noCoupons?.classList.remove('hidden');
  }
}

// Display coupons
function displayCoupons(coupons) {
  const couponsList = document.getElementById('coupons-list');
  if (!couponsList) return;

  couponsList.innerHTML = '';

  coupons.forEach(coupon => {
    const couponCard = createCouponCard(coupon);
    couponsList.appendChild(couponCard);
  });
}

// Create coupon card element
function createCouponCard(coupon) {
  const card = document.createElement('div');
  card.className = 'coupon-card';

  card.innerHTML = `
    <div class="coupon-header">
      <div class="coupon-discount">${coupon.discount}</div>
      ${coupon.verified ? '<div class="coupon-badge">Verified</div>' : ''}
    </div>
    <div class="coupon-description">${coupon.description}</div>
    <div class="coupon-code">
      <div class="code-display">${coupon.code}</div>
      <button class="apply-btn" data-code="${coupon.code}" data-i18n="applyCoupon">Apply</button>
    </div>
  `;

  // Add apply button handler
  const applyBtn = card.querySelector('.apply-btn');
  applyBtn?.addEventListener('click', () => applyCoupon(coupon.code));

  return card;
}

// Apply coupon code
async function applyCoupon(code) {
  try {
    // Copy code to clipboard
    await navigator.clipboard.writeText(code);

    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send message to content script to apply coupon
    await chrome.tabs.sendMessage(tab.id, {
      action: 'applyCoupon',
      code: code
    });

    showNotification(`クーポンコード「${code}」をコピーしました`, 'success');
  } catch (error) {
    console.error('Error applying coupon:', error);
    showNotification('クーポンの適用に失敗しました', 'error');
  }
}

// Search coupons
async function searchCoupons() {
  const searchInput = document.getElementById('coupon-search-input');
  const query = searchInput?.value.trim();

  if (!query) {
    loadCoupons();
    return;
  }

  // Filter displayed coupons based on search query
  const coupons = document.querySelectorAll('.coupon-card');
  coupons.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query.toLowerCase()) ? 'block' : 'none';
  });
}

// Load watchlist
async function loadWatchlist() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getWatchlist' });

    if (response && response.watchlist) {
      watchlistItems = response.watchlist;
      displayWatchlist(watchlistItems);
    }
  } catch (error) {
    console.error('Error loading watchlist:', error);
  }
}

// Display watchlist
function displayWatchlist(items) {
  const watchlistContainer = document.getElementById('watchlist-items');
  const emptyState = document.getElementById('empty-watchlist');

  if (!watchlistContainer || !emptyState) return;

  watchlistContainer.innerHTML = '';

  if (items.length === 0) {
    watchlistContainer.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  watchlistContainer.classList.remove('hidden');
  emptyState.classList.add('hidden');

  items.forEach(item => {
    const watchlistItem = createWatchlistItem(item);
    watchlistContainer.appendChild(watchlistItem);
  });
}

// Create watchlist item element
function createWatchlistItem(item) {
  const container = document.createElement('div');
  container.className = 'watchlist-item';

  const priceChange = item.currentPrice < item.originalPrice ? 'down' :
                      item.currentPrice > item.originalPrice ? 'up' : '';
  const changeAmount = Math.abs(item.currentPrice - item.originalPrice);
  const changePercent = ((changeAmount / item.originalPrice) * 100).toFixed(1);

  container.innerHTML = `
    <div class="watchlist-item-header">
      <img src="${item.image}" alt="${item.title}" class="watchlist-item-image">
      <div class="watchlist-item-info">
        <div class="watchlist-item-title">${item.title}</div>
        <div class="watchlist-item-store">${item.store}</div>
      </div>
    </div>
    <div class="watchlist-item-prices">
      <div class="current-watchlist-price">${formatPrice(item.currentPrice, item.currency)}</div>
      ${priceChange ? `
        <div class="price-change ${priceChange}">
          ${priceChange === 'down' ? '↓' : '↑'} ${changePercent}%
        </div>
      ` : ''}
    </div>
    <div class="watchlist-item-actions">
      <button class="watchlist-btn view" data-url="${item.url}">View</button>
      <button class="watchlist-btn remove" data-id="${item.id}">Remove</button>
    </div>
  `;

  // Add event listeners
  container.querySelector('.view')?.addEventListener('click', (e) => {
    const url = e.target.dataset.url;
    chrome.tabs.create({ url });
  });

  container.querySelector('.remove')?.addEventListener('click', async (e) => {
    const id = e.target.dataset.id;
    await removeFromWatchlist(id);
  });

  return container;
}

// Sort watchlist
function sortWatchlist(sortBy) {
  let sorted = [...watchlistItems];

  switch (sortBy) {
    case 'price-low':
      sorted.sort((a, b) => a.currentPrice - b.currentPrice);
      break;
    case 'price-high':
      sorted.sort((a, b) => b.currentPrice - a.currentPrice);
      break;
    case 'savings':
      sorted.sort((a, b) => {
        const savingsA = a.originalPrice - a.currentPrice;
        const savingsB = b.originalPrice - b.currentPrice;
        return savingsB - savingsA;
      });
      break;
    case 'date':
    default:
      sorted.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
      break;
  }

  displayWatchlist(sorted);
}

// Remove from watchlist
async function removeFromWatchlist(itemId) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'removeFromWatchlist',
      itemId: itemId
    });

    if (response && response.success) {
      showNotification('ウォッチリストから削除しました', 'success');
      await loadWatchlist();
    }
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    showNotification('削除に失敗しました', 'error');
  }
}

// Load user data (stats)
async function loadUserData() {
  try {
    const result = await chrome.storage.local.get(['userStats']);
    if (result.userStats) {
      userStats = result.userStats;
      updateStatsDisplay();
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

// Update stats display
function updateStatsDisplay() {
  const totalSaved = document.getElementById('total-saved');
  const cashbackEarned = document.getElementById('cashback-earned');

  if (totalSaved) {
    totalSaved.textContent = formatPrice(userStats.totalSaved, 'JPY');
  }

  if (cashbackEarned) {
    cashbackEarned.textContent = formatPrice(userStats.cashbackEarned, 'JPY');
  }
}

// Open settings page
function openSettings() {
  chrome.runtime.openOptionsPage();
}

// Open premium page
function openPremiumPage() {
  chrome.tabs.create({ url: 'https://example.com/premium' });
}

// Go to best price
function goToBestPrice() {
  // This will be handled by the button's onclick set in updateSavingsSummary
}

// Show notification
function showNotification(message, type = 'info') {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 10000;
    animation: slideUp 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
