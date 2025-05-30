#!/bin/bash
set -e

echo "=== AIBoard Vercelデプロイ（修正版）==="

# 環境変数の設定
export VERCEL_TOKEN="OXWWVjnlWneESNMZ5psBefPi"
export VERCEL_ORG_ID="UqbeR2NG79HTeS0zUSHxtzH7"
export VERCEL_PROJECT_ID="prj_DNRx0F8Ny9p3QUNSqMXxT4jPJ8BA"

echo "Vercel設定:"
echo "- 組織ID: $VERCEL_ORG_ID"
echo "- プロジェクトID: $VERCEL_PROJECT_ID"

echo "Vercel CLIをインストールしています..."
npm install -g vercel@latest

echo "vercel.jsonを更新しています..."
cat > vercel.json << EOL
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
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

echo "utils/pdfUtils.tsの型エラーを修正しています..."
# HarmCategory と HarmBlockThreshold を正しくインポートして使用するように修正
sed -i 's/"HARM_CATEGORY_HARASSMENT"/HarmCategory.HARM_CATEGORY_HARASSMENT/g' utils/pdfUtils.ts
sed -i 's/"HARM_CATEGORY_HATE_SPEECH"/HarmCategory.HARM_CATEGORY_HATE_SPEECH/g' utils/pdfUtils.ts
sed -i 's/"HARM_CATEGORY_SEXUALLY_EXPLICIT"/HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT/g' utils/pdfUtils.ts
sed -i 's/"HARM_CATEGORY_DANGEROUS_CONTENT"/HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT/g' utils/pdfUtils.ts
sed -i 's/"BLOCK_MEDIUM_AND_ABOVE"/HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE/g' utils/pdfUtils.ts

echo "最新の変更をコミットしています..."
git add vercel.json utils/pdfUtils.ts deploy-with-fixed-scope.sh
git commit -m "Vercelデプロイ設定の修正と型エラーの修正" || echo "コミットする変更はありません"

echo "変更をプッシュしています..."
git push origin devin/1747787781-aiboard-setup || echo "プッシュする変更はありません"

echo "Vercelにデプロイしています..."
# --token と --scope オプションを使用して認証
vercel deploy --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID" --prod --yes

echo "=== デプロイ完了 ==="
echo "AIBoardアプリケーションがVercelにデプロイされました。"
echo "デプロイURLはVercelダッシュボードで確認できます。"
