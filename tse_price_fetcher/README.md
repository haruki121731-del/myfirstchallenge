# TSE TradingView Price Fetcher

東証プライム上場企業の株価を、完全に再現可能・検証可能な形で時系列取得し、分析や研究にそのまま使える構造化データとして自動整形するシステム。

## 概要

本システムは、Excel または Google Sheets に記載された東証番号（4桁）と基準日から、TradingView を通じて株価データを取得し、同じ表・同じ行に結果を書き戻します。

### 主要な特徴

- **Single Source of Truth**: 株価データの取得元を TradingView に完全統一
- **決定的な実行**: 同じ入力に対して常に同じ出力を保証
- **自動日付補正**: 基準日が休日の場合、直近の過去営業日を自動的に使用
- **前後5営業日取得**: イベントスタディや分析に適した11営業日分のデータを取得
- **整数化処理**: すべての数値は小数点以下切り捨てで整数化

## システム要件

- Python 3.8 以上
- インターネット接続（TradingView へのアクセス）

## インストール

```bash
# リポジトリをクローン
cd tse_price_fetcher

# 依存パッケージをインストール
pip install -r requirements.txt
```

## 使用方法

### Excel ファイルの処理

```bash
python src/main.py --source excel --excel-file input.xlsx
```

出力ファイルを指定する場合:

```bash
python src/main.py --source excel --excel-file input.xlsx --output-file output.xlsx
```

### Google Sheets の処理

```bash
python src/main.py --source sheets \
  --spreadsheet-id "YOUR_SPREADSHEET_ID" \
  --credentials "path/to/credentials.json"
```

スプレッドシート名で指定する場合:

```bash
python src/main.py --source sheets \
  --spreadsheet-name "株価データ" \
  --sheet-name "シート1" \
  --credentials "path/to/credentials.json"
```

## 入力ファイル形式

Excel または Google Sheets の最初のシートに、以下の列を含むテーブルを用意してください：

| tyo.code | base_date  |
|----------|------------|
| 7203     | 2024-01-15 |
| 9984     | 2024-01-15 |
| 6758     | 2024-01-20 |

### 必須列

1. **tyo.code**: 東証4桁コード（文字列、数値どちらでも可）
2. **base_date**: 基準日（YYYY-MM-DD形式）

## 出力形式

入力データに加えて、以下の列が追加されます：

### 追加される列

1. **adjusted_base_date**: 補正後の基準日（d0）
2. **fetch_status**: 取得状況（success / failed）
3. **株価データ列**: 各営業日・各フィールドのデータ

### 株価データ列の命名規則

`{field}_{offset}` 形式で命名されます：

- **field**: open, high, low, close, volume
- **offset**: d-5, d-4, ..., d0, d+1, ..., d+5

例:
- `open_d-5`: 5営業日前の始値
- `close_d0`: 基準日（補正後）の終値
- `volume_d+3`: 3営業日後の出来高

### 出力例

| tyo.code | base_date  | adjusted_base_date | fetch_status | open_d-5 | high_d-5 | ... | close_d0 | ... | volume_d+5 |
|----------|------------|-------------------|--------------|----------|----------|-----|----------|-----|------------|
| 7203     | 2024-01-15 | 2024-01-15       | success      | 1234     | 1250     | ... | 1280     | ... | 1000000    |

## データ取得ロジック

### 1. 基準日の補正

基準日に TradingView のデータが存在しない場合（土日・祝日など）、直近の過去営業日を自動的に基準日（d0）として使用します。

### 2. 営業日の定義

「営業日かどうか」は TradingView に日足データ（candle）が存在するかどうかのみで判定します。外部の祝日カレンダーは使用しません。

### 3. データウィンドウ

d0 を中心に、以下のデータを取得します：

- 過去5営業日（d-5 〜 d-1）
- 基準日（d0）
- 未来5営業日（d+1 〜 d+5）

合計11営業日分のデータが取得されます。

### 4. 数値処理

すべての数値（open, high, low, close, volume）は以下の処理を行います：

- 小数点以下を切り捨て（floor）
- 整数値として出力

例:
- 1234.9 → 1234
- 567.01 → 567
- 100.0 → 100

## Google Sheets の認証設定

Google Sheets を使用する場合は、Google Cloud Console でサービスアカウントを作成し、認証情報をダウンロードしてください。

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成
3. Google Sheets API を有効化
4. サービスアカウントを作成
5. 認証情報（JSON）をダウンロード
6. スプレッドシートをサービスアカウントのメールアドレスと共有

## 設定ファイル

`config/project_config.json` で動作をカスタマイズできます。

主な設定項目：

- **candle_window**: 取得する営業日数（past, future）
- **numeric_format**: 数値フォーマット（整数化の設定）
- **column_naming**: 列名の命名パターン

## トラブルシューティング

### データが取得できない

- 東証コードが正しいか確認してください（4桁の数字）
- TradingView にそのシンボルが存在するか確認してください
- インターネット接続を確認してください

### Google Sheets に接続できない

- 認証情報（JSON）のパスが正しいか確認してください
- サービスアカウントとスプレッドシートを共有しているか確認してください
- Google Sheets API が有効化されているか確認してください

## ライセンス

MIT License

## 注意事項

- 本システムは TradingView の非公式 API を使用しています
- データの精度や可用性については TradingView に依存します
- 投資判断は自己責任で行ってください
- 本システムは研究・分析目的で設計されています

## 開発者向け情報

### プロジェクト構造

```
tse_price_fetcher/
├── config/
│   └── project_config.json      # システム設定
├── src/
│   ├── __init__.py
│   ├── config_loader.py         # 設定読み込み
│   ├── main.py                  # メインエントリーポイント
│   ├── data_providers/
│   │   ├── __init__.py
│   │   └── tradingview_fetcher.py  # TradingView データ取得
│   ├── io_handlers/
│   │   ├── __init__.py
│   │   ├── excel_handler.py     # Excel 入出力
│   │   └── sheets_handler.py    # Google Sheets 入出力
│   └── business_logic/
│       ├── __init__.py
│       ├── date_handler.py      # 日付処理
│       └── data_processor.py    # データ処理
├── requirements.txt
└── README.md
```

### 設計原則

1. **決定的実行**: 同じ入力 → 必ず同じ出力
2. **単一情報源**: データは TradingView のみから取得
3. **自動補正**: ユーザーの手動介入を最小化
4. **構造化出力**: 後続処理が容易な形式
5. **再現性**: すべての処理が追跡可能

## バージョン

1.0.0 - 初回リリース
