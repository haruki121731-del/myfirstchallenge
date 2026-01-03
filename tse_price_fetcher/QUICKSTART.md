# クイックスタートガイド

## 📦 最速セットアップ（3ステップ）

### ステップ 1: セットアップ

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```
setup.bat
```

これで必要な環境がすべて自動でインストールされます。

---

### ステップ 2: Excel ファイルを準備

以下の2つの列を含む Excel ファイルを用意してください：

| tyo.code | base_date  |
|----------|------------|
| 7203     | 2024-01-15 |
| 9984     | 2024-01-15 |
| 6758     | 2024-01-20 |

**必須項目:**
- **tyo.code**: 東証4桁コード（例: 7203 はトヨタ自動車）
- **base_date**: 基準日（YYYY-MM-DD形式）

💡 `sample_input.csv` をExcelで開いて使うこともできます！

---

### ステップ 3: 実行

**Mac/Linux:**
```bash
./run.sh
```

**Windows:**
```
run.bat
```

または直接：
```bash
python run.py
```

**対話的に以下を選択するだけ:**
1. Excel ファイルを選択
2. 出力方法を選択（上書き or 新規ファイル）
3. 確認して実行

---

## ✅ 完了！

実行が終わると、元のファイル（または新規ファイル）に以下のデータが追加されます：

- **adjusted_base_date**: 補正された基準日
- **fetch_status**: 取得状況（success/failed）
- **株価データ**: 前後5営業日分（計11日）の OHLCV データ
  - `open_d-5`, `high_d-5`, `low_d-5`, `close_d-5`, `volume_d-5`
  - ...
  - `open_d0`, `high_d0`, `low_d0`, `close_d0`, `volume_d0`
  - ...
  - `open_d+5`, `high_d+5`, `low_d+5`, `close_d+5`, `volume_d+5`

合計 **55列** の株価データが追加されます！

---

## 📋 出力例

### 入力:
| tyo.code | base_date  |
|----------|------------|
| 7203     | 2024-01-15 |

### 出力（一部抜粋）:
| tyo.code | base_date  | adjusted_base_date | fetch_status | close_d-5 | close_d-4 | ... | close_d0 | close_d+1 | ... |
|----------|------------|-------------------|--------------|-----------|-----------|-----|----------|-----------|-----|
| 7203     | 2024-01-15 | 2024-01-15       | success      | 2145      | 2158      | ... | 2180     | 2175      | ... |

---

## 🎯 主な機能

1. **自動日付補正**: 基準日が土日・祝日の場合、直近の過去営業日を自動使用
2. **TradingView データ**: 世界標準の TradingView から取得
3. **決定的実行**: 同じ入力 → 常に同じ出力
4. **整数化**: すべての数値は小数点以下切り捨て
5. **前後5営業日**: イベントスタディに最適な11営業日分を自動取得

---

## 💡 ヒント

### サンプルファイルを使う
```bash
# sample_input.csv を Excel で開いて編集
# または cp して使う
cp sample_input.csv my_stocks.csv
```

### 複数銘柄を一度に処理
Excel に何行でも追加できます。すべて自動で処理されます。

### エラーが出た場合
- 東証コードが4桁の数字か確認
- 基準日が YYYY-MM-DD 形式か確認
- インターネット接続を確認

---

## 🔧 上級者向け

### コマンドラインで直接実行

```bash
# Excel ファイル
python src/main.py --source excel --excel-file input.xlsx

# 出力先を指定
python src/main.py --source excel --excel-file input.xlsx --output-file output.xlsx

# Google Sheets（認証情報が必要）
python src/main.py --source sheets \
  --spreadsheet-id "YOUR_ID" \
  --credentials "credentials.json"
```

### 設定のカスタマイズ

`config/project_config.json` を編集することで、以下をカスタマイズできます：
- 取得する営業日数（past/future）
- 数値フォーマット
- 列名のパターン

---

## 📚 詳細情報

詳しい情報は `README.md` をご覧ください。

---

## ❓ トラブルシューティング

| 問題 | 解決方法 |
|------|---------|
| Python が見つからない | Python 3.8以上をインストール |
| パッケージエラー | `pip install -r requirements.txt` を実行 |
| データが取得できない | 東証コードと日付形式を確認 |
| Google Sheets エラー | credentials.json のパスを確認 |

---

**それでは、株価データの取得を始めましょう！** 🚀
