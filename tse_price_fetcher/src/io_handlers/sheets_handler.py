"""
Google Sheets の読み書きモジュール
"""
from typing import List, Dict, Optional
import gspread
from google.oauth2.service_account import Credentials


class SheetsHandler:
    """Google Sheets の入出力を行うクラス"""

    def __init__(self, credentials_path: str = None):
        """
        Args:
            credentials_path: Google Cloud サービスアカウント認証情報のJSONファイルパス
        """
        self.credentials_path = credentials_path
        self.client: Optional[gspread.Client] = None
        self.spreadsheet = None
        self.worksheet = None

        if credentials_path:
            self._authenticate()

    def _authenticate(self):
        """Google Sheets API に認証"""
        scopes = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]

        creds = Credentials.from_service_account_file(
            self.credentials_path,
            scopes=scopes
        )
        self.client = gspread.authorize(creds)

    def open_spreadsheet(self, spreadsheet_id: str = None, spreadsheet_name: str = None):
        """
        スプレッドシートを開く

        Args:
            spreadsheet_id: スプレッドシートID（URLから取得）
            spreadsheet_name: スプレッドシート名
        """
        if not self.client:
            raise RuntimeError("認証が必要です。credentials_path を指定してください。")

        if spreadsheet_id:
            self.spreadsheet = self.client.open_by_key(spreadsheet_id)
        elif spreadsheet_name:
            self.spreadsheet = self.client.open(spreadsheet_name)
        else:
            raise ValueError("spreadsheet_id または spreadsheet_name を指定してください。")

    def read(self, sheet_name: str = None) -> List[Dict]:
        """
        シートを読み込み、辞書のリストとして返す

        Args:
            sheet_name: シート名（Noneの場合は最初のシート）

        Returns:
            各行を辞書として格納したリスト
        """
        if not self.spreadsheet:
            raise RuntimeError("スプレッドシートを開く必要があります。")

        # シート選択
        if sheet_name:
            self.worksheet = self.spreadsheet.worksheet(sheet_name)
        else:
            self.worksheet = self.spreadsheet.sheet1

        # 全データを取得
        all_values = self.worksheet.get_all_values()

        if not all_values:
            return []

        # ヘッダー行
        headers = all_values[0]
        data = []

        # データ行を辞書に変換
        for row in all_values[1:]:
            row_dict = {}
            for idx, header in enumerate(headers):
                value = row[idx] if idx < len(row) else None
                # 空文字列をNoneに変換
                row_dict[header] = value if value != '' else None
            data.append(row_dict)

        return data

    def write(self, data: List[Dict], sheet_name: str = None):
        """
        データをシートに書き込む

        Args:
            data: 書き込むデータ（辞書のリスト）
            sheet_name: シート名（Noneの場合は最初のシート）
        """
        if not self.spreadsheet:
            raise RuntimeError("スプレッドシートを開く必要があります。")

        if not data:
            return

        # シート選択または作成
        if sheet_name:
            try:
                self.worksheet = self.spreadsheet.worksheet(sheet_name)
            except gspread.exceptions.WorksheetNotFound:
                self.worksheet = self.spreadsheet.add_worksheet(
                    title=sheet_name,
                    rows=len(data) + 1,
                    cols=20
                )
        else:
            self.worksheet = self.spreadsheet.sheet1

        # シートをクリア
        self.worksheet.clear()

        # ヘッダーを決定的な順序で準備
        all_keys = set()
        for row in data:
            all_keys.update(row.keys())

        # 決定的な順序
        priority_keys = ['tyo.code', 'base_date', 'adjusted_base_date', 'fetch_status']
        headers = []

        for key in priority_keys:
            if key in all_keys:
                headers.append(key)
                all_keys.remove(key)

        remaining_keys = sorted(all_keys)
        headers.extend(remaining_keys)

        # データを2次元配列に変換
        rows_to_write = [headers]

        for row in data:
            row_values = [row.get(header, '') for header in headers]
            rows_to_write.append(row_values)

        # 一括書き込み
        self.worksheet.update(rows_to_write, value_input_option='USER_ENTERED')
