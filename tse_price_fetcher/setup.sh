#!/bin/bash

# TSE Price Fetcher - セットアップスクリプト

echo "======================================"
echo "TSE TradingView Price Fetcher"
echo "セットアップを開始します"
echo "======================================"
echo ""

# Pythonバージョンチェック
echo "Python バージョンを確認中..."
python3 --version

if [ $? -ne 0 ]; then
    echo "❌ エラー: Python 3 がインストールされていません"
    echo "Python 3.8以上をインストールしてください"
    exit 1
fi

echo ""
echo "✓ Python が見つかりました"
echo ""

# 仮想環境の作成（推奨）
read -p "仮想環境を作成しますか？ (推奨) [Y/n]: " create_venv
create_venv=${create_venv:-Y}

if [[ $create_venv =~ ^[Yy]$ ]]; then
    echo "仮想環境を作成中..."
    python3 -m venv venv

    echo "仮想環境をアクティベート中..."
    source venv/bin/activate

    echo "✓ 仮想環境が作成されました"
    echo ""
fi

# 依存パッケージのインストール
echo "依存パッケージをインストール中..."
pip install --upgrade pip
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ エラー: パッケージのインストールに失敗しました"
    exit 1
fi

echo ""
echo "✓ すべての依存パッケージがインストールされました"
echo ""

# セットアップ完了
echo "======================================"
echo "✅ セットアップが完了しました！"
echo "======================================"
echo ""
echo "次のステップ："
echo "1. Excel ファイルを用意してください"
echo "   - 必須列: tyo.code (東証4桁コード)"
echo "   - 必須列: base_date (YYYY-MM-DD形式)"
echo ""
echo "2. ツールを実行してください："
echo "   ./run.sh"
echo ""
echo "または："
echo "   python run.py"
echo ""

# 仮想環境の使い方を表示
if [[ $create_venv =~ ^[Yy]$ ]]; then
    echo "仮想環境を使用する場合："
    echo "  source venv/bin/activate  # 有効化"
    echo "  deactivate               # 無効化"
    echo ""
fi

echo "詳細は QUICKSTART.md をご覧ください"
