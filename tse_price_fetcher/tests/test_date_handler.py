"""
DateHandler のテスト
"""
import sys
from pathlib import Path

# src ディレクトリをパスに追加
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

from business_logic.date_handler import DateHandler
from datetime import datetime


def test_parse_date():
    """日付パースのテスト"""
    handler = DateHandler()

    # 正常系
    assert handler.parse_date('2024-01-15') == datetime(2024, 1, 15)
    assert handler.parse_date('2023-12-31') == datetime(2023, 12, 31)

    # 異常系
    assert handler.parse_date('2024-13-01') is None  # 不正な月
    assert handler.parse_date('2024/01/15') is None  # 不正な形式
    assert handler.parse_date('invalid') is None
    assert handler.parse_date('') is None
    assert handler.parse_date(None) is None

    print("✓ test_parse_date passed")


def test_validate_tyo_code():
    """東証コード検証のテスト"""
    handler = DateHandler()

    # 正常系
    assert handler.validate_tyo_code('7203') is True
    assert handler.validate_tyo_code('9984') is True
    assert handler.validate_tyo_code('0001') is True

    # 異常系
    assert handler.validate_tyo_code('123') is False   # 3桁
    assert handler.validate_tyo_code('12345') is False # 5桁
    assert handler.validate_tyo_code('abcd') is False  # アルファベット
    assert handler.validate_tyo_code('') is False
    assert handler.validate_tyo_code(None) is False

    print("✓ test_validate_tyo_code passed")


def test_format_date():
    """日付フォーマットのテスト"""
    handler = DateHandler()

    dt = datetime(2024, 1, 15)
    assert handler.format_date(dt) == '2024-01-15'

    dt = datetime(2023, 12, 31)
    assert handler.format_date(dt) == '2023-12-31'

    print("✓ test_format_date passed")


if __name__ == '__main__':
    test_parse_date()
    test_validate_tyo_code()
    test_format_date()
    print("\n✅ All tests passed!")
