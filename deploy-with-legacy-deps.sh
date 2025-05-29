#!/bin/bash
set -e

echo "=== AIBoard Vercelデプロイ（レガシー依存関係対応）==="

export VERCEL_TOKEN="OXWWVjnlWneESNMZ5psBefPi"
export VERCEL_PROJECT_ID="prj_DNRx0F8Ny9p3QUNSqMXxT4jPJ8BA"

echo "Vercel設定:"
echo "- プロジェクトID: $VERCEL_PROJECT_ID"

echo "Vercel CLIをインストールしています..."
npm install -g vercel

echo "最新の変更をコミットしています..."
git add vercel.json deploy-with-legacy-deps.sh
git commit -m "Vercelデプロイ設定の更新（レガシー依存関係対応）" || echo "コミットする変更はありません"

echo "変更をプッシュしています..."
git push origin devin/1747787781-aiboard-setup || echo "プッシュする変更はありません"

echo "Vercelにデプロイしています..."
vercel --token "$VERCEL_TOKEN" --yes

echo "=== デプロイ完了 ==="
echo "AIBoardアプリケーションがVercelにデプロイされました。"
echo "デプロイURLはVercelダッシュボードで確認できます。"
