#!/bin/bash

# TSE Price Fetcher - 簡単実行スクリプト

# 仮想環境が存在する場合はアクティベート
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# 対話型スクリプトを実行
python3 run.py
