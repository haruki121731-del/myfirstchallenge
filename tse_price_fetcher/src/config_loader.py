"""
設定ファイル読み込みモジュール
"""
import json
from pathlib import Path
from typing import Dict, Any


class ConfigLoader:
    """プロジェクト設定を読み込むクラス"""

    def __init__(self, config_path: str = None):
        """
        Args:
            config_path: 設定ファイルのパス。Noneの場合はデフォルトパスを使用
        """
        if config_path is None:
            # デフォルトパスを設定
            current_dir = Path(__file__).parent
            config_path = current_dir.parent / "config" / "project_config.json"

        self.config_path = Path(config_path)
        self.config = self._load_config()

    def _load_config(self) -> Dict[str, Any]:
        """設定ファイルを読み込む"""
        if not self.config_path.exists():
            raise FileNotFoundError(f"設定ファイルが見つかりません: {self.config_path}")

        with open(self.config_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def get(self, key_path: str, default: Any = None) -> Any:
        """
        ドット記法でネストされた設定値を取得

        Args:
            key_path: 'meta.project_name' のようなドット区切りのキーパス
            default: キーが存在しない場合のデフォルト値

        Returns:
            設定値
        """
        keys = key_path.split('.')
        value = self.config

        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default

        return value

    def get_meta(self) -> Dict[str, Any]:
        """メタ情報を取得"""
        return self.config.get('meta', {})

    def get_input_config(self) -> Dict[str, Any]:
        """入力設定を取得"""
        return self.config.get('input', {})

    def get_data_provider_config(self) -> Dict[str, Any]:
        """データプロバイダー設定を取得"""
        return self.config.get('data_provider', {})

    def get_business_logic_config(self) -> Dict[str, Any]:
        """ビジネスロジック設定を取得"""
        return self.config.get('business_logic', {})

    def get_output_config(self) -> Dict[str, Any]:
        """出力設定を取得"""
        return self.config.get('output', {})

    def is_deterministic(self) -> bool:
        """決定的実行モードかどうかを返す"""
        return self.get('meta.deterministic', True)
