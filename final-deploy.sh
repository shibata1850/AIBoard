
set -e

echo "AIボードの最終Vercelデプロイを開始します..."

export VERCEL_TOKEN="OXWWVjnlWneESNMZ5psBefPi"
export VERCEL_ORG_ID="UqbeR2NG79HTeS0zUSHxtzH7"
export VERCEL_PROJECT_ID="prj_fTt5BA27RRp44Vi1ATSO73CRUPg2"

echo "プロジェクト設定を更新しています..."
cat > vercel.json << EOF
{
  "version": 2,
  "public": true,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": null,
  "github": {
    "silent": true,
    "autoAlias": true
  },
  "routes": [
    { "handle": "filesystem" },
    { "src": "/_expo/(.*)", "dest": "/_expo/\$1" },
    { "src": "/api/(.*)", "dest": "/server/api/\$1" },
    { 
      "src": "/(.*)", 
      "dest": "/index.html",
      "headers": {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Accept"
      }
    }
  ],
  "env": {
    "VERCEL_PROJECT_PROTECTION": "false"
  },
  "ignoreCommand": "echo 'Skipping checks'",
  "protection": null
}
EOF

echo "依存関係をインストールしています..."
npm install --legacy-peer-deps

echo "アプリケーションをビルドしています..."
npm run build

echo "ビルド出力を確認しています..."
ls -la dist

echo "Vercelにパブリックデプロイしています..."
npx vercel deploy --token "$VERCEL_TOKEN" --prod --yes --public

echo "デプロイが完了しました！"
echo "デプロイされたURLは上記の出力で確認できます。"

echo "プロジェクト保護設定を無効化しています..."
curl -X PATCH "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID?teamId=$VERCEL_ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ssoProtection":{"deploymentType":"none"},"protection":null}'

echo "最新のデプロイメント情報を取得しています..."
curl "https://api.vercel.com/v6/deployments?teamId=$VERCEL_ORG_ID&projectId=$VERCEL_PROJECT_ID&limit=1" \
  -H "Authorization: Bearer $VERCEL_TOKEN"

echo "デプロイが完了し、保護設定が無効化されました！"
