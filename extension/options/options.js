// Options page script

// Storage keys
const STORAGE_KEYS = {
  SETTINGS: 'settings',
  WATCHLIST: 'watchlist',
  PRICE_HISTORY: 'priceHistory',
  COUPONS_CACHE: 'couponsCache'
};

// Default settings
const DEFAULT_SETTINGS = {
  autoApplyCoupons: true,
  priceAlerts: true,
  autoPriceCheck: true,
  language: 'ja',
  currency: 'JPY',
  enabledStores: ['amazon', 'rakuten', 'yahoo']
};

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadStats();
  setupEventListeners();
});

/**
 * Load settings from storage
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get([STORAGE_KEYS.SETTINGS]);
    const settings = result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;

    // Apply settings to UI
    document.getElementById('auto-apply-coupons').checked = settings.autoApplyCoupons;
    document.getElementById('price-alerts').checked = settings.priceAlerts;
    document.getElementById('auto-price-check').checked = settings.autoPriceCheck;
    document.getElementById('language').value = settings.language;
    document.getElementById('currency').value = settings.currency;

    // Set enabled stores
    document.querySelectorAll('input[name="store"]').forEach(checkbox => {
      checkbox.checked = settings.enabledStores.includes(checkbox.value);
    });

  } catch (error) {
    console.error('Error loading settings:', error);
    showStatus('設定の読み込みに失敗しました', true);
  }
}

/**
 * Load statistics
 */
async function loadStats() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.WATCHLIST]);
    const watchlist = result[STORAGE_KEYS.WATCHLIST] || [];

    document.getElementById('watchlist-count').textContent = watchlist.length;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Save settings button
  document.getElementById('save-settings').addEventListener('click', saveSettings);

  // Premium upgrade button
  document.getElementById('upgrade-premium').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://example.com/premium' });
  });

  // Export watchlist button
  document.getElementById('export-watchlist').addEventListener('click', exportWatchlist);

  // Clear cache button
  document.getElementById('clear-cache').addEventListener('click', clearCache);

  // Reset all button
  document.getElementById('reset-all').addEventListener('click', resetAllData);

  // Links
  document.getElementById('privacy-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://example.com/privacy' });
  });

  document.getElementById('terms-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://example.com/terms' });
  });

  document.getElementById('support-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://example.com/support' });
  });
}

/**
 * Save settings to storage
 */
async function saveSettings() {
  try {
    const settings = {
      autoApplyCoupons: document.getElementById('auto-apply-coupons').checked,
      priceAlerts: document.getElementById('price-alerts').checked,
      autoPriceCheck: document.getElementById('auto-price-check').checked,
      language: document.getElementById('language').value,
      currency: document.getElementById('currency').value,
      enabledStores: Array.from(document.querySelectorAll('input[name="store"]:checked'))
        .map(checkbox => checkbox.value)
    };

    await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: settings });

    showStatus('✓ 設定を保存しました', false);

    // Reload extension if language changed
    const result = await chrome.storage.sync.get([STORAGE_KEYS.SETTINGS]);
    const oldSettings = result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;

    if (oldSettings.language !== settings.language) {
      setTimeout(() => {
        chrome.runtime.reload();
      }, 1000);
    }

  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('設定の保存に失敗しました', true);
  }
}

/**
 * Export watchlist to JSON
 */
async function exportWatchlist() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.WATCHLIST]);
    const watchlist = result[STORAGE_KEYS.WATCHLIST] || [];

    if (watchlist.length === 0) {
      alert('ウォッチリストが空です');
      return;
    }

    const dataStr = JSON.stringify(watchlist, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `watchlist-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);

    showStatus('✓ ウォッチリストをエクスポートしました', false);
  } catch (error) {
    console.error('Error exporting watchlist:', error);
    showStatus('エクスポートに失敗しました', true);
  }
}

/**
 * Clear cache
 */
async function clearCache() {
  if (!confirm('キャッシュをクリアしますか？')) {
    return;
  }

  try {
    await chrome.storage.local.remove([
      STORAGE_KEYS.PRICE_HISTORY,
      STORAGE_KEYS.COUPONS_CACHE
    ]);

    showStatus('✓ キャッシュをクリアしました', false);
  } catch (error) {
    console.error('Error clearing cache:', error);
    showStatus('キャッシュのクリアに失敗しました', true);
  }
}

/**
 * Reset all data
 */
async function resetAllData() {
  if (!confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
    return;
  }

  if (!confirm('本当によろしいですか？ウォッチリスト、設定、履歴などすべてが削除されます。')) {
    return;
  }

  try {
    // Clear all storage
    await chrome.storage.local.clear();
    await chrome.storage.sync.clear();

    // Restore default settings
    await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS });

    showStatus('✓ すべてのデータをリセットしました', false);

    // Reload page after 1 second
    setTimeout(() => {
      window.location.reload();
    }, 1000);

  } catch (error) {
    console.error('Error resetting data:', error);
    showStatus('データのリセットに失敗しました', true);
  }
}

/**
 * Show status message
 */
function showStatus(message, isError = false) {
  const statusElement = document.getElementById('save-status');
  statusElement.textContent = message;
  statusElement.className = isError ? 'save-status error' : 'save-status';

  // Clear after 3 seconds
  setTimeout(() => {
    statusElement.textContent = '';
  }, 3000);
}
