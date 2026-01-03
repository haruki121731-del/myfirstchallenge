#!/bin/bash

# TSE TradingView Price Fetcher - 実行例

echo "=== TSE TradingView Price Fetcher ==="
echo ""

# Excel ファイルの処理例
echo "Excel ファイルを処理する例:"
echo "python src/main.py --source excel --excel-file sample_input.xlsx"
echo ""

# Google Sheets の処理例
echo "Google Sheets を処理する例:"
echo "python src/main.py --source sheets \\"
echo "  --spreadsheet-id \"YOUR_SPREADSHEET_ID\" \\"
echo "  --credentials \"path/to/credentials.json\""
echo ""

# 実際に実行する場合は以下のコメントを解除
# python src/main.py --source excel --excel-file sample_input.xlsx
