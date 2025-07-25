

set -e

echo "AIボードのVercelデプロイを開始します..."

export VERCEL_TOKEN="HEqj5cGWQl0RVYD0OOpGpDFH"
export VERCEL_ORG_ID="team_JnqFhUXHbY6mX9PObgzq1xiZ"
export VERCEL_PROJECT_ID="prj_DNRx0F8Ny9p3QUNSqMXxT4jPJ8BA"

echo "依存関係をインストールしています..."
npm install --legacy-peer-deps

echo "アプリケーションをビルドしています..."
npm run build

echo "Vercelにデプロイしています..."
npx vercel --token "$VERCEL_TOKEN" --prod --confirm

echo "デプロイが完了しました！"
echo "デプロイされたURLは上記の出力で確認できます。"
