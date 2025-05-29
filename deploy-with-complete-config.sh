#!/bin/bash
set -e

echo "=== AIBoard Vercelデプロイ（完全設定）==="

export VERCEL_PROJECT_ID="prj_DNRx0F8Ny9p3QUNSqMXxT4jPJ8BA"
export VERCEL_ORG_ID="UqbeR2NG79HTeS0zUSHxtzH7"
export VERCEL_TOKEN="OXWWVjnlWneESNMZ5psBefPi"

echo "Vercel設定:"
echo "- プロジェクトID: $VERCEL_PROJECT_ID"
echo "- 組織ID: $VERCEL_ORG_ID"

echo "Vercel CLIをインストールしています..."
npm install -g vercel

echo "vercel.jsonを作成しています..."
cat > vercel.json << EOL
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": "web-build",
  "public": true,
  "github": {
    "enabled": true,
    "silent": false
  },
  "env": {
    "GEMINI_API_KEY": "AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4",
    "NEXT_PUBLIC_GEMINI_API_KEY": "AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4",
    "EXPO_PUBLIC_GEMINI_API_KEY": "AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4"
  }
}
EOL

echo "最新の変更をコミットしています..."
git add vercel.json deploy-with-complete-config.sh
git commit -m "Vercelデプロイ設定の完全更新" || echo "コミットする変更はありません"

echo "変更をプッシュしています..."
git push origin devin/1747787781-aiboard-setup || echo "プッシュする変更はありません"

echo "Vercelにデプロイしています..."
vercel --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID" --prod --yes

echo "=== デプロイ完了 ==="
echo "AIBoardアプリケーションがVercelにデプロイされました。"
echo "デプロイURLはVercelダッシュボードで確認できます。"
