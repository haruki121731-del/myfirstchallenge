#!/usr/bin/env python3
"""
TSE TradingView Price Fetcher - シンプル実行スクリプト

ユーザーが対話的にファイルを選択して実行できるインターフェース
"""
import os
import sys
from pathlib import Path
from glob import glob

# srcディレクトリをパスに追加
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from src.main import TSEPriceFetcher


def print_header():
    """ヘッダーを表示"""
    print("=" * 60)
    print("TSE TradingView Price Fetcher")
    print("東証株価データ取得ツール")
    print("=" * 60)
    print()


def find_excel_files():
    """カレントディレクトリからExcelファイルを検索"""
    patterns = ['*.xlsx', '*.xls']
    files = []
    for pattern in patterns:
        files.extend(glob(pattern))
    return sorted(files)


def select_file():
    """ファイル選択インターフェース"""
    print("📁 Excel ファイルを選択してください")
    print()

    # カレントディレクトリのExcelファイルを検索
    excel_files = find_excel_files()

    if excel_files:
        print("見つかったファイル:")
        for i, file in enumerate(excel_files, 1):
            print(f"  {i}. {file}")
        print()

        while True:
            choice = input("番号を選択 [1-{}] または ファイルパスを入力: ".format(len(excel_files)))

            # 数字が入力された場合
            if choice.isdigit():
                idx = int(choice) - 1
                if 0 <= idx < len(excel_files):
                    return excel_files[idx]
                else:
                    print("❌ 無効な番号です。もう一度入力してください。")
            # ファイルパスが入力された場合
            elif choice:
                if os.path.exists(choice):
                    return choice
                else:
                    print(f"❌ ファイルが見つかりません: {choice}")
            else:
                print("❌ ファイルを選択してください。")
    else:
        print("ℹ️ カレントディレクトリに Excel ファイルが見つかりませんでした")
        print()

        while True:
            file_path = input("Excel ファイルのパスを入力してください: ").strip()
            if file_path and os.path.exists(file_path):
                return file_path
            else:
                print("❌ ファイルが見つかりません。もう一度入力してください。")


def select_output_option(input_file):
    """出力オプションの選択"""
    print()
    print("📝 出力方法を選択してください")
    print()
    print("  1. 入力ファイルを上書き（元のファイルに結果を追記）")
    print("  2. 新しいファイルに出力")
    print()

    while True:
        choice = input("番号を選択 [1-2]: ").strip()

        if choice == "1":
            return None  # 上書き
        elif choice == "2":
            # デフォルトの出力ファイル名を提案
            base_name = Path(input_file).stem
            default_output = f"{base_name}_result.xlsx"

            output = input(f"出力ファイル名 [{default_output}]: ").strip()
            return output if output else default_output
        else:
            print("❌ 1 または 2 を入力してください。")


def confirm_execution(input_file, output_file):
    """実行確認"""
    print()
    print("=" * 60)
    print("実行内容の確認")
    print("=" * 60)
    print(f"📄 入力ファイル: {input_file}")

    if output_file:
        print(f"📄 出力ファイル: {output_file}")
    else:
        print(f"📄 出力ファイル: {input_file} (上書き)")

    print()
    print("処理内容:")
    print("  - TradingView から株価データを取得")
    print("  - 基準日が休日の場合は自動補正")
    print("  - 前後5営業日（計11日分）のデータを取得")
    print("  - すべての数値を整数化")
    print()

    while True:
        confirm = input("実行してよろしいですか？ [Y/n]: ").strip().lower()

        if confirm in ['', 'y', 'yes']:
            return True
        elif confirm in ['n', 'no']:
            return False
        else:
            print("❌ Y または N を入力してください。")


def main():
    """メイン処理"""
    try:
        print_header()

        # ファイル選択
        input_file = select_file()

        if not input_file:
            print("❌ ファイルが選択されませんでした。")
            sys.exit(1)

        # 出力オプション選択
        output_file = select_output_option(input_file)

        # 実行確認
        if not confirm_execution(input_file, output_file):
            print()
            print("⏸️  処理をキャンセルしました。")
            sys.exit(0)

        # 処理実行
        print()
        print("=" * 60)
        print("🚀 処理を開始します...")
        print("=" * 60)
        print()

        fetcher = TSEPriceFetcher()
        fetcher.process_excel(
            file_path=input_file,
            output_path=output_file
        )

        print()
        print("=" * 60)
        print("✅ 処理が完了しました！")
        print("=" * 60)

        if output_file:
            print(f"📄 結果: {output_file}")
        else:
            print(f"📄 結果: {input_file}")

        print()

    except KeyboardInterrupt:
        print()
        print()
        print("⏸️  処理が中断されました。")
        sys.exit(1)
    except Exception as e:
        print()
        print("=" * 60)
        print("❌ エラーが発生しました")
        print("=" * 60)
        print(f"エラー内容: {e}")
        print()
        print("トラブルシューティング:")
        print("  1. 入力ファイルの形式を確認してください")
        print("     - 必須列: tyo.code, base_date")
        print("  2. インターネット接続を確認してください")
        print("  3. README.md のトラブルシューティングをご覧ください")
        sys.exit(1)


if __name__ == '__main__':
    main()
