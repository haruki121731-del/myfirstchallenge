@echo off
REM TSE Price Fetcher - 簡単実行スクリプト (Windows)

REM 仮想環境が存在する場合はアクティベート
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM 対話型スクリプトを実行
python run.py

pause
