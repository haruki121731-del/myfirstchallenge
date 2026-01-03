"""
日付処理モジュール
"""
from datetime import datetime
from typing import Optional
import re


class DateHandler:
    """日付の検証と変換を行うクラス"""

    @staticmethod
    def parse_date(date_str: str) -> Optional[datetime]:
        """
        YYYY-MM-DD形式の文字列をdatetimeに変換

        Args:
            date_str: 日付文字列

        Returns:
            datetime オブジェクト、または変換失敗時は None
        """
        if not date_str or not isinstance(date_str, str):
            return None

        # YYYY-MM-DD 形式の検証
        pattern = r'^\d{4}-\d{2}-\d{2}$'
        if not re.match(pattern, date_str):
            return None

        try:
            return datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            return None

    @staticmethod
    def format_date(dt: datetime) -> str:
        """
        datetime を YYYY-MM-DD 形式の文字列に変換

        Args:
            dt: datetime オブジェクト

        Returns:
            YYYY-MM-DD 形式の文字列
        """
        return dt.strftime('%Y-%m-%d')

    @staticmethod
    def validate_tyo_code(code: str) -> bool:
        """
        東証コードが4桁の数字かどうかを検証

        Args:
            code: 東証コード

        Returns:
            有効な場合 True
        """
        if not code or not isinstance(code, str):
            return False

        pattern = r'^[0-9]{4}$'
        return bool(re.match(pattern, code))
