
set -e

echo "AIボードのVercelパブリックデプロイを開始します..."

export VERCEL_TOKEN="HEqj5cGWQl0RVYD0OOpGpDFH"
export VERCEL_ORG_ID="UqbeR2NG79HTeS0zUSHxtzH7"
export VERCEL_PROJECT_ID="prj_DNRx0F8Ny9p3QUNSqMXxT4jPJ8BA"

echo "依存関係をインストールしています..."
npm install --legacy-peer-deps

echo "アプリケーションをビルドしています..."
npm run build

echo "ビルド出力を確認しています..."
ls -la dist

echo "Vercelにパブリックデプロイしています..."
npx vercel --token "$VERCEL_TOKEN" --prod --public

echo "デプロイが完了しました！"
echo "デプロイURLは上記の出力で確認できます。"

echo "プロジェクト保護設定を無効化しています..."
curl -X PATCH "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID?teamId=$VERCEL_ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "installCommand": "npm install --legacy-peer-deps",
    "framework": null,
    "publicSource": true,
    "ssoProtection": {
      "deploymentType": "none"
    }
  }'

echo "デプロイが完了し、保護設定が無効化されました！"
