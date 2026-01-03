"""
TradingView データ取得モジュール
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import pandas as pd
from tvdatafeed import TvDatafeed, Interval


class TradingViewFetcher:
    """TradingView からデータを取得するクラス"""

    def __init__(self):
        """初期化（認証なしモード）"""
        self.tv = TvDatafeed()

    def fetch_candles_around_date(
        self,
        symbol: str,
        base_date: datetime,
        past_candles: int = 5,
        future_candles: int = 5
    ) -> Tuple[Optional[datetime], Optional[pd.DataFrame]]:
        """
        基準日を中心に前後の日足データを取得

        Args:
            symbol: TradingViewのシンボル（例: "7203"）
            base_date: 基準日
            past_candles: 過去の取得数
            future_candles: 未来の取得数

        Returns:
            (補正された基準日, データフレーム) のタプル
            データが取得できない場合は (None, None)
        """
        # TSE: プレフィックスを追加
        full_symbol = f"{symbol}"
        exchange = "TSE"

        # 十分な期間のデータを取得（前後余裕を持って）
        # base_date から十分に過去と未来のデータを取得
        total_candles_needed = past_candles + future_candles + 20  # バッファを追加
        n_bars = max(100, total_candles_needed * 2)

        try:
            # データ取得
            df = self.tv.get_hist(
                symbol=full_symbol,
                exchange=exchange,
                interval=Interval.in_daily,
                n_bars=n_bars
            )

            if df is None or df.empty:
                return None, None

            # インデックスを datetime 型に変換
            df.index = pd.to_datetime(df.index)

            # 基準日以前の最も近い日を探す（d0の補正）
            valid_dates = df.index
            dates_before_or_equal = valid_dates[valid_dates <= base_date]

            if len(dates_before_or_equal) == 0:
                # 基準日以前のデータが存在しない
                return None, None

            # d0 = 基準日以前の最も近い日
            d0 = dates_before_or_equal[-1]

            # d0 を中心に前後のデータを取得
            d0_index = valid_dates.get_loc(d0)

            # 必要な範囲を計算
            start_index = max(0, d0_index - past_candles)
            end_index = min(len(valid_dates), d0_index + future_candles + 1)

            # スライス
            selected_dates = valid_dates[start_index:end_index]
            result_df = df.loc[selected_dates].copy()

            # 列名を小文字に統一
            result_df.columns = [col.lower() for col in result_df.columns]

            # 必要な列のみを抽出
            required_cols = ['open', 'high', 'low', 'close', 'volume']
            result_df = result_df[required_cols]

            # d0 からの相対位置を計算
            result_df['offset'] = range(
                -(d0_index - start_index),
                end_index - d0_index
            )

            return d0, result_df

        except Exception as e:
            print(f"エラー: {symbol} のデータ取得に失敗: {e}")
            return None, None

    def get_symbol_data(
        self,
        tyo_code: str,
        base_date: datetime,
        window_config: Dict
    ) -> Tuple[Optional[datetime], Optional[Dict[str, int]]]:
        """
        東証コードから株価データを取得し、整数化して返す

        Args:
            tyo_code: 東証4桁コード
            base_date: 基準日
            window_config: ウィンドウ設定

        Returns:
            (補正された基準日, フラット化されたデータ辞書)
            データ形式: {"open_d-5": 1234, "high_d-5": 1250, ..., "volume_d+5": 1000000}
        """
        past = window_config.get('past', 5)
        future = window_config.get('future', 5)

        # データ取得
        d0, df = self.fetch_candles_around_date(
            symbol=tyo_code,
            base_date=base_date,
            past_candles=past,
            future_candles=future
        )

        if d0 is None or df is None or df.empty:
            return None, None

        # データをフラット化
        result = {}

        for _, row in df.iterrows():
            offset = int(row['offset'])

            # オフセット文字列を生成（d0, d-1, d+1 形式）
            if offset == 0:
                offset_str = "d0"
            elif offset < 0:
                offset_str = f"d{offset}"  # d-5, d-4, ...
            else:
                offset_str = f"d+{offset}"  # d+1, d+2, ...

            # 各フィールドを整数化して格納（小数点以下切り捨て）
            for field in ['open', 'high', 'low', 'close', 'volume']:
                key = f"{field}_{offset_str}"
                value = row[field]

                # 整数化（小数点以下切り捨て）
                result[key] = int(value) if pd.notna(value) else None

        return d0, result
