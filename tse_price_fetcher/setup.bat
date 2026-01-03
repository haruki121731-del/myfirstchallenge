@echo off
REM TSE Price Fetcher - Windowsセットアップスクリプト

echo ======================================
echo TSE TradingView Price Fetcher
echo セットアップを開始します
echo ======================================
echo.

REM Pythonバージョンチェック
echo Python バージョンを確認中...
python --version

if %ERRORLEVEL% NEQ 0 (
    echo エラー: Python がインストールされていません
    echo Python 3.8以上をインストールしてください
    pause
    exit /b 1
)

echo.
echo ✓ Python が見つかりました
echo.

REM 仮想環境の作成
set /p create_venv="仮想環境を作成しますか？ (推奨) [Y/n]: "
if "%create_venv%"=="" set create_venv=Y

if /i "%create_venv%"=="Y" (
    echo 仮想環境を作成中...
    python -m venv venv

    echo 仮想環境をアクティベート中...
    call venv\Scripts\activate.bat

    echo ✓ 仮想環境が作成されました
    echo.
)

REM 依存パッケージのインストール
echo 依存パッケージをインストール中...
python -m pip install --upgrade pip
pip install -r requirements.txt

if %ERRORLEVEL% NEQ 0 (
    echo エラー: パッケージのインストールに失敗しました
    pause
    exit /b 1
)

echo.
echo ✓ すべての依存パッケージがインストールされました
echo.

REM セットアップ完了
echo ======================================
echo ✅ セットアップが完了しました！
echo ======================================
echo.
echo 次のステップ：
echo 1. Excel ファイルを用意してください
echo    - 必須列: tyo.code (東証4桁コード)
echo    - 必須列: base_date (YYYY-MM-DD形式)
echo.
echo 2. ツールを実行してください：
echo    run.bat
echo.
echo または：
echo    python run.py
echo.
echo 詳細は QUICKSTART.md をご覧ください
echo.

pause
