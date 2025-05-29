#!/bin/bash
set -e

echo "=== AIBoard Vercelデプロイ（プロジェクトリンク使用）==="

export VERCEL_TOKEN="OXWWVjnlWneESNMZ5psBefPi"

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
git add vercel.json deploy-with-link.sh
git commit -m "Vercelデプロイ設定の更新（プロジェクトリンク使用）" || echo "コミットする変更はありません"

echo "変更をプッシュしています..."
git push origin devin/1747787781-aiboard-setup || echo "プッシュする変更はありません"

echo "Vercelにデプロイしています..."
vercel --token "$VERCEL_TOKEN" --yes

echo "=== デプロイ完了 ==="
echo "AIBoardアプリケーションがVercelにデプロイされました。"
echo "デプロイURLはVercelダッシュボードで確認できます。"
