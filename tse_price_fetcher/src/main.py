"""
TSE TradingView Price Fetcher - メインモジュール

東証プライム上場企業の株価を TradingView から取得し、
Excel または Google Sheets に書き戻すシステム
"""
import argparse
import sys
from pathlib import Path
from typing import List, Dict

from config_loader import ConfigLoader
from data_providers.tradingview_fetcher import TradingViewFetcher
from business_logic.date_handler import DateHandler
from business_logic.data_processor import DataProcessor
from io_handlers.excel_handler import ExcelHandler
from io_handlers.sheets_handler import SheetsHandler


class TSEPriceFetcher:
    """株価取得システムのメインクラス"""

    def __init__(self, config_path: str = None):
        """
        Args:
            config_path: 設定ファイルのパス
        """
        self.config = ConfigLoader(config_path)
        self.fetcher = TradingViewFetcher()
        self.date_handler = DateHandler()
        self.data_processor = DataProcessor()

    def process_excel(self, file_path: str, output_path: str = None):
        """
        Excel ファイルを処理

        Args:
            file_path: 入力 Excel ファイルのパス
            output_path: 出力ファイルのパス（Noneの場合は入力ファイルを上書き）
        """
        print(f"Excel ファイルを読み込み中: {file_path}")

        # Excel ファイルを読み込み
        excel_handler = ExcelHandler(file_path)
        input_data = excel_handler.read()

        if not input_data:
            print("エラー: データが見つかりません")
            return

        print(f"読み込み完了: {len(input_data)} 行")

        # データを処理
        output_data = self._process_data(input_data)

        # 結果を書き込み
        output_file = output_path if output_path else file_path
        print(f"結果を書き込み中: {output_file}")

        output_handler = ExcelHandler(output_file)
        output_handler.write(output_data)
        output_handler.close()

        print("処理完了")

    def process_sheets(
        self,
        spreadsheet_id: str = None,
        spreadsheet_name: str = None,
        sheet_name: str = None,
        credentials_path: str = None
    ):
        """
        Google Sheets を処理

        Args:
            spreadsheet_id: スプレッドシート ID
            spreadsheet_name: スプレッドシート名
            sheet_name: シート名
            credentials_path: Google Cloud 認証情報のパス
        """
        print("Google Sheets に接続中...")

        # Google Sheets に接続
        sheets_handler = SheetsHandler(credentials_path)
        sheets_handler.open_spreadsheet(
            spreadsheet_id=spreadsheet_id,
            spreadsheet_name=spreadsheet_name
        )

        # データを読み込み
        input_data = sheets_handler.read(sheet_name)

        if not input_data:
            print("エラー: データが見つかりません")
            return

        print(f"読み込み完了: {len(input_data)} 行")

        # データを処理
        output_data = self._process_data(input_data)

        # 結果を書き込み
        print("結果を書き込み中...")
        sheets_handler.write(output_data, sheet_name)

        print("処理完了")

    def _process_data(self, input_data: List[Dict]) -> List[Dict]:
        """
        入力データを処理して株価データを取得

        Args:
            input_data: 入力データ（辞書のリスト）

        Returns:
            処理済みデータ（辞書のリスト）
        """
        output_data = []
        window_config = self.config.get_business_logic_config().get('candle_window', {})

        total = len(input_data)

        for idx, row in enumerate(input_data, 1):
            print(f"\n処理中 [{idx}/{total}]:")

            # 必須フィールドの取得
            tyo_code = row.get('tyo.code')
            base_date_str = row.get('base_date')

            # バリデーション
            if not self.date_handler.validate_tyo_code(str(tyo_code)):
                print(f"  エラー: 無効な東証コード: {tyo_code}")
                output_row = self.data_processor.create_output_row(
                    input_row=row,
                    fetched_data=None
                )
                output_data.append(output_row)
                continue

            base_date = self.date_handler.parse_date(str(base_date_str))
            if not base_date:
                print(f"  エラー: 無効な基準日: {base_date_str}")
                output_row = self.data_processor.create_output_row(
                    input_row=row,
                    fetched_data=None
                )
                output_data.append(output_row)
                continue

            # 株価データを取得
            print(f"  東証コード: {tyo_code}, 基準日: {base_date_str}")

            adjusted_d0, price_data = self.fetcher.get_symbol_data(
                tyo_code=str(tyo_code),
                base_date=base_date,
                window_config=window_config
            )

            if adjusted_d0 and price_data:
                adjusted_date_str = self.date_handler.format_date(adjusted_d0)
                print(f"  取得成功: 補正後基準日 = {adjusted_date_str}")

                # 数値を整数化（念のため再度実行）
                price_data = self.data_processor.floor_numeric_values(price_data)

                output_row = self.data_processor.create_output_row(
                    input_row=row,
                    fetched_data=price_data,
                    adjusted_date=adjusted_date_str
                )
            else:
                print(f"  取得失敗")
                output_row = self.data_processor.create_output_row(
                    input_row=row,
                    fetched_data=None
                )

            output_data.append(output_row)

        return output_data


def main():
    """メイン関数"""
    parser = argparse.ArgumentParser(
        description='TSE TradingView Price Fetcher - 東証株価データ取得ツール'
    )

    # 入力ソースの選択
    parser.add_argument(
        '--source',
        choices=['excel', 'sheets'],
        required=True,
        help='入力ソース (excel または sheets)'
    )

    # Excel 関連オプション
    parser.add_argument(
        '--excel-file',
        type=str,
        help='Excel ファイルのパス'
    )

    parser.add_argument(
        '--output-file',
        type=str,
        help='出力 Excel ファイルのパス（指定しない場合は入力ファイルを上書き）'
    )

    # Google Sheets 関連オプション
    parser.add_argument(
        '--spreadsheet-id',
        type=str,
        help='Google スプレッドシート ID'
    )

    parser.add_argument(
        '--spreadsheet-name',
        type=str,
        help='Google スプレッドシート名'
    )

    parser.add_argument(
        '--sheet-name',
        type=str,
        help='シート名'
    )

    parser.add_argument(
        '--credentials',
        type=str,
        help='Google Cloud 認証情報 JSON ファイルのパス'
    )

    # 設定ファイル
    parser.add_argument(
        '--config',
        type=str,
        help='設定ファイルのパス'
    )

    args = parser.parse_args()

    # フェッチャーを初期化
    fetcher = TSEPriceFetcher(config_path=args.config)

    # ソースに応じて処理
    if args.source == 'excel':
        if not args.excel_file:
            print("エラー: --excel-file を指定してください")
            sys.exit(1)

        fetcher.process_excel(
            file_path=args.excel_file,
            output_path=args.output_file
        )

    elif args.source == 'sheets':
        if not args.spreadsheet_id and not args.spreadsheet_name:
            print("エラー: --spreadsheet-id または --spreadsheet-name を指定してください")
            sys.exit(1)

        if not args.credentials:
            print("エラー: --credentials を指定してください")
            sys.exit(1)

        fetcher.process_sheets(
            spreadsheet_id=args.spreadsheet_id,
            spreadsheet_name=args.spreadsheet_name,
            sheet_name=args.sheet_name,
            credentials_path=args.credentials
        )


if __name__ == '__main__':
    main()
