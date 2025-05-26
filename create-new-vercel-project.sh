#!/bin/bash
set -e

echo "=== AIBoard 新規Vercelプロジェクト作成 ==="

npm install -g vercel

echo "新しいVercelプロジェクトを作成しています..."
vercel --yes

echo "=== 新規プロジェクト作成完了 ==="
echo "新しいVercelプロジェクトが作成されました。"
echo "プロジェクト情報を確認するには、Vercelダッシュボードを確認してください。"
