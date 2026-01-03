"""
データ処理モジュール
"""
from typing import Dict, List, Optional
import math


class DataProcessor:
    """データの整形と処理を行うクラス"""

    @staticmethod
    def floor_numeric_values(data: Dict[str, any]) -> Dict[str, int]:
        """
        辞書内のすべての数値を整数化（小数点以下切り捨て）

        Args:
            data: 数値を含む辞書

        Returns:
            整数化された辞書
        """
        result = {}
        for key, value in data.items():
            if value is None:
                result[key] = None
            elif isinstance(value, (int, float)):
                # 小数点以下切り捨て
                result[key] = int(math.floor(value))
            else:
                result[key] = value

        return result

    @staticmethod
    def generate_output_columns(
        past: int = 5,
        future: int = 5
    ) -> List[str]:
        """
        出力列名のリストを決定的な順序で生成

        Args:
            past: 過去の営業日数
            future: 未来の営業日数

        Returns:
            列名のリスト（決定的な順序）
        """
        fields = ['open', 'high', 'low', 'close', 'volume']
        columns = []

        # d-5 から d+5 まで順番に
        for offset in range(-past, future + 1):
            if offset == 0:
                offset_str = "d0"
            elif offset < 0:
                offset_str = f"d{offset}"
            else:
                offset_str = f"d+{offset}"

            # 各フィールドに対して列を追加
            for field in fields:
                columns.append(f"{field}_{offset_str}")

        return columns

    @staticmethod
    def create_output_row(
        input_row: Dict,
        fetched_data: Optional[Dict[str, int]],
        adjusted_date: Optional[str] = None
    ) -> Dict:
        """
        入力行とフェッチデータを結合して出力行を作成

        Args:
            input_row: 入力行のデータ
            fetched_data: 取得した株価データ（Noneの場合はエラー行）
            adjusted_date: 補正された基準日（YYYY-MM-DD形式）

        Returns:
            出力行の辞書
        """
        # 入力データをコピー
        output = dict(input_row)

        # 補正された基準日を追加（存在する場合）
        if adjusted_date:
            output['adjusted_base_date'] = adjusted_date

        # 株価データを追加
        if fetched_data:
            output.update(fetched_data)
            output['fetch_status'] = 'success'
        else:
            output['fetch_status'] = 'failed'
            # 失敗時は空値で埋める
            columns = DataProcessor.generate_output_columns()
            for col in columns:
                output[col] = None

        return output
