#!/bin/bash
set -e

echo "=== AIBoard Vercelデプロイ（新プロジェクトキー使用）==="

export VERCEL_PROJECT_ID="prj_DNRx0F8Ny9p3QUNSqMXxT4jPJ8BA"
export VERCEL_ORG_ID="UqbeR2NG79HTeS0zUSHxtzH7"
export VERCEL_TOKEN="OXWWVjnlWneESNMZ5psBefPi"

echo "Vercel設定:"
echo "- プロジェクトID: $VERCEL_PROJECT_ID"
echo "- 組織ID: $VERCEL_ORG_ID"

echo "Vercel CLIをインストールしています..."
npm install -g vercel

echo "最新の変更をコミットしています..."
git add .
git commit -m "Vercelデプロイ前の最終変更" || echo "コミットする変更はありません"

echo "変更をプッシュしています..."
git push origin devin/1747787781-aiboard-setup || echo "プッシュする変更はありません"

echo "Vercelにデプロイしています..."
vercel deploy --prod --yes --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID" --confirm

echo "=== デプロイ完了 ==="
echo "AIBoardアプリケーションがVercelにデプロイされました。"
echo "デプロイURLはVercelダッシュボードで確認できます。"
