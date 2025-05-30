#!/bin/bash
set -e

echo "=== AIBoard Vercelデプロイ修正スクリプト ==="

# 環境変数の設定
export VERCEL_PROJECT_ID="prj_DNRx0F8Ny9p3QUNSqMXxT4jPJ8BA"
export VERCEL_ORG_ID="UqbeR2NG79HTeS0zUSHxtzH7"
export VERCEL_TOKEN="OXWWVjnlWneESNMZ5psBefPi"

echo "Vercel設定:"
echo "- プロジェクトID: $VERCEL_PROJECT_ID"
echo "- 組織ID: $VERCEL_ORG_ID"

echo "ビルド出力ディレクトリの修正..."
# vercel.jsonの更新
cat > vercel.json << EOL
{
  "version": 2,
  "buildCommand": "npm run build && mkdir -p web-build && cp -r dist/* web-build/",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": null,
  "outputDirectory": "web-build",
  "public": true,
  "routes": [
    {
      "src": "/_expo/static/(.*)",
      "dest": "/_expo/static/$1",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/favicon.ico",
      "dest": "/favicon.ico"
    },
    {
      "src": "/api/(.*)",
      "dest": "/server/api/$1"
    },
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
    "GEMINI_API_KEY": "AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4",
    "NEXT_PUBLIC_GEMINI_API_KEY": "AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4",
    "EXPO_PUBLIC_GEMINI_API_KEY": "AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4"
  }
}
EOL

# server.jsの更新
cat > server.js << EOL
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ビルド出力ディレクトリを'dist'から'web-build'に変更
app.use(express.static(path.join(__dirname, 'web-build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });
}

module.exports = app;
EOL

echo "最新の変更をコミットしています..."
git add vercel.json server.js fix-deployment.sh
git commit -m "Vercelデプロイ設定の修正: ビルド出力ディレクトリとルーティング設定の更新" || echo "コミットする変更はありません"

echo "変更をプッシュしています..."
git push origin devin/1747787781-aiboard-setup || echo "プッシュする変更はありません"

echo "Vercel CLIをインストールしています..."
npm install -g vercel@latest

echo "Vercelにデプロイしています..."
# 個人アカウントをスコープとして設定しないように修正
vercel deploy --token "$VERCEL_TOKEN" --prod --yes

echo "=== デプロイ完了 ==="
echo "AIBoardアプリケーションがVercelにデプロイされました。"
echo "デプロイURLはVercelダッシュボードで確認できます。"
