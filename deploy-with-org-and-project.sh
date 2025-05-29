#!/bin/bash
set -e

echo "=== AIBoard Vercelデプロイ（組織IDとプロジェクトID指定）==="

export VERCEL_TOKEN="OXWWVjnlWneESNMZ5psBefPi"
export VERCEL_ORG_ID="UqbeR2NG79HTeS0zUSHxtzH7"
export VERCEL_PROJECT_ID="prj_DNRx0F8Ny9p3QUNSqMXxT4jPJ8BA"

echo "Vercel設定:"
echo "- 組織ID: $VERCEL_ORG_ID"
echo "- プロジェクトID: $VERCEL_PROJECT_ID"

echo "Vercel CLIをインストールしています..."
npm install -g vercel

echo "最新の変更をコミットしています..."
git add vercel.json deploy-with-org-and-project.sh
git commit -m "Vercelデプロイ設定の更新（組織IDとプロジェクトID指定）" || echo "コミットする変更はありません"

echo "変更をプッシュしています..."
git push origin devin/1747787781-aiboard-setup || echo "プッシュする変更はありません"

echo "Vercelにデプロイしています..."
vercel --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID" --yes

echo "=== デプロイ完了 ==="
echo "AIBoardアプリケーションがVercelにデプロイされました。"
echo "デプロイURLはVercelダッシュボードで確認できます。"
