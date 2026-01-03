# スマートショッピングアシスタント / Smart Shopping Assistant

価格比較・クーポン検索・割引アラート機能を提供するブラウザ拡張機能プロジェクト

## 📁 プロジェクト構成

```
myfirstchallenge/
├── extension/                    # ブラウザ拡張機能（メイン実装）
│   ├── manifest.json            # 拡張機能マニフェスト
│   ├── _locales/                # 多言語対応（ja, en, zh）
│   ├── popup/                   # ポップアップUI
│   ├── content/                 # コンテンツスクリプト
│   ├── background/              # バックグラウンド処理
│   ├── utils/                   # ユーティリティ関数
│   ├── options/                 # 設定ページ
│   ├── styles/                  # スタイルシート
│   ├── assets/                  # アイコン・画像
│   └── README.md                # 拡張機能ドキュメント
├── src/                         # 既存の自律ランタイムスケルトン
│   └── runtime/                 # タスク管理ランタイム
├── SHOPPING_ASSISTANT_DOCUMENTATION.md  # 完全実装ドキュメント
├── package.json
└── README.md                    # このファイル
```

## 🚀 クイックスタート

### ブラウザ拡張機能のインストール

1. **Chromeの場合:**
   ```
   1. chrome://extensions/ を開く
   2. 「デベロッパーモード」を有効化
   3. 「パッケージ化されていない拡張機能を読み込む」をクリック
   4. `extension/` フォルダを選択
   ```

2. **Firefoxの場合:**
   ```
   1. about:debugging#/runtime/this-firefox を開く
   2. 「一時的なアドオンを読み込む」をクリック
   3. `extension/manifest.json` を選択
   ```

### 開発

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build

# 開発モード
npm run dev
```

## ✨ 主要機能

- 🔍 **価格比較** - Amazon、楽天、Yahoo!など複数サイトの価格を横断比較
- 🎫 **クーポン検索** - 利用可能なクーポンを自動検索・適用
- 📊 **価格アラート** - ウォッチリストで価格推移を追跡
- 🤖 **AIレコメンド** - 割引度の高い商品を推薦
- 💰 **キャッシュバック** - ポイント・キャッシュバック情報を表示
- 🌏 **多言語対応** - 日本語、英語、中国語をサポート

## 📚 ドキュメント

- [拡張機能README](extension/README.md) - 拡張機能の詳細説明
- [完全実装ドキュメント](SHOPPING_ASSISTANT_DOCUMENTATION.md) - アーキテクチャと実装詳細

## 🎯 対応サイト

- Amazon (amazon.co.jp, amazon.com)
- 楽天市場 (rakuten.co.jp)
- Yahoo!ショッピング (shopping.yahoo.co.jp)
- Alibaba (alibaba.com)
- AliExpress (aliexpress.com)

## 💡 技術スタック

- **Manifest V3** - Chrome拡張機能API
- **JavaScript ES6+** - モジュール形式
- **HTML5/CSS3** - モダンUI
- **Chrome APIs** - Storage, Alarms, Notifications
- **Web Scraping** - 価格情報取得

## 📈 ステータス

- ✅ MVP実装完了
- ✅ 全主要機能実装
- ✅ 多言語対応（日本語、英語、中国語）
- ⏳ 実際のAPI連携（次フェーズ）
- ⏳ Chrome Web Store公開準備

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストを歓迎します！

---

Made with ❤️ for smart shoppers