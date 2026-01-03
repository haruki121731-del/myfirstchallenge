# スマートショッピングアシスタント / Smart Shopping Assistant

<p align="center">
  <strong>価格比較・クーポン検索・割引アラートで最安値をゲット！</strong>
</p>

## 📋 概要

スマートショッピングアシスタントは、オンラインショッピングを効率化し、賢く節約できるブラウザ拡張機能です。Amazon、楽天市場、Yahoo!ショッピング、Alibabaなど主要ECサイトに対応し、価格比較、クーポン検索、価格アラート機能を提供します。

## ✨ 主要機能

### 🔍 価格比較・ベストプライス表示
- 複数のECサイト間で商品価格を横断比較
- 送料・ポイントを考慮した実質価格を計算
- 最安値を自動検出し、節約額を表示

### 🎫 クーポン検索・自動適用
- カート画面で利用可能なクーポンを自動検索
- 最適なクーポンコードを自動適用
- 検証済みクーポンを優先表示

### 📊 価格アラート（ウォッチリスト）
- 気になる商品を追跡リストに追加
- 価格推移をモニタリング
- 価格が下がった際に通知

### 🤖 AIレコメンド機能
- ユーザー行動に基づく商品推薦
- 割引度の高い類似商品を提案
- クーポン情報の自動要約

### 💰 キャッシュバック/ポイント連携
- 対応カード会社やポイントサービスと連携
- 拡張経由の購入でキャッシュバック還元
- 獲得ポイントの自動計算

### 🌏 多言語・多通貨対応
- 日本語、中国語、英語をサポート
- 主要通貨の自動換算
- ローカライズされたUI

## 🎯 対応サイト

- **Amazon** (amazon.co.jp, amazon.com)
- **楽天市場** (rakuten.co.jp)
- **Yahoo!ショッピング** (shopping.yahoo.co.jp)
- **Alibaba** (alibaba.com)
- **AliExpress** (aliexpress.com)

## 🚀 インストール方法

### Chrome / Edge

1. このリポジトリをクローンまたはダウンロード
2. Chrome/Edgeで `chrome://extensions/` を開く
3. 「デベロッパーモード」を有効化
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. `extension` フォルダを選択

### Firefox

1. このリポジトリをクローンまたはダウンロード
2. Firefoxで `about:debugging#/runtime/this-firefox` を開く
3. 「一時的なアドオンを読み込む」をクリック
4. `extension/manifest.json` を選択

## 📁 プロジェクト構成

```
extension/
├── manifest.json           # 拡張機能のメタデータ
├── _locales/              # 多言語対応
│   ├── ja/messages.json   # 日本語
│   ├── en/messages.json   # 英語
│   └── zh/messages.json   # 中国語
├── popup/                 # ポップアップUI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/               # コンテンツスクリプト
│   ├── detector.js        # 商品検出
│   ├── price-tracker.js   # 価格追跡
│   └── coupon-injector.js # クーポン注入
├── background/            # バックグラウンド処理
│   └── service-worker.js  # サービスワーカー
├── utils/                 # ユーティリティ
│   ├── helpers.js         # ヘルパー関数
│   └── i18n.js           # 国際化
├── options/               # 設定ページ
│   ├── options.html
│   ├── options.css
│   └── options.js
├── styles/                # スタイル
│   └── content.css        # コンテンツスクリプト用CSS
└── assets/                # アセット
    ├── icons/            # アイコン
    └── images/           # 画像
```

## 🛠️ 技術スタック

- **Manifest V3** - 最新のChrome拡張機能API
- **JavaScript ES6+** - モジュール形式
- **Chrome Extension APIs** - Storage, Alarms, Notifications
- **HTML5/CSS3** - モダンUI
- **Web Scraping** - 価格情報取得
- **AI Integration** - レコメンデーション機能

## 💡 使い方

### 価格比較

1. 商品ページを開く
2. 拡張機能アイコンをクリック
3. 「価格比較」タブで他サイトの価格を確認
4. 最安値をクリックして購入

### クーポン検索

1. カートまたはチェックアウトページを開く
2. 自動的にクーポンが検索されます
3. 通知からクーポンを選択して適用

### ウォッチリスト

1. 商品ページで「ウォッチリストに追加」をクリック
2. 価格が下がると通知が届きます
3. 拡張機能の「ウォッチリスト」タブで管理

## ⚙️ 設定

拡張機能アイコンを右クリックして「オプション」を選択すると、以下の設定が可能です：

- クーポン自動適用の有効/無効
- 価格アラートの設定
- 表示言語と通貨の変更
- 対応ストアの選択
- データのエクスポート/リセット

## 💰 収益化戦略

### 基本モデル（無料）
- アフィリエイトコミッション（Amazon、楽天、Yahoo!など）
- 広告掲載（非侵襲的）

### プレミアムプラン（¥500/月）
- 高度な価格分析レポート
- AI推奨商品機能
- 価格予測アラート
- 広告非表示
- 無制限のウォッチリスト
- 優先サポート

## 🔒 プライバシー

- ユーザーデータはローカルに保存
- 個人情報の収集なし
- 閲覧履歴は保存されません
- オプトインベースのアナリティクス

## 🧪 開発

### 必要な環境

- Node.js 16+
- Chrome/Firefox ブラウザ

### ビルド

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build

# 開発モード
npm run dev
```

### テスト

```bash
# テストの実行
npm test

# リントチェック
npm run lint
```

## 📈 ロードマップ

- [ ] より多くのECサイト対応
- [ ] 価格予測AI機能
- [ ] ブラウザ間の同期
- [ ] モバイル版開発
- [ ] API公開
- [ ] サードパーティ統合

## 🤝 コントリビューション

コントリビューションを歓迎します！以下の手順でお願いします：

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。

## 📞 サポート

問題や質問がある場合は、GitHubのIssuesセクションで報告してください。

## 🎉 謝辞

このプロジェクトは以下の技術・サービスを活用しています：

- Chrome Extension API
- Web Scraping technologies
- AI/ML libraries
- Open source community

---

Made with ❤️ for smart shoppers
