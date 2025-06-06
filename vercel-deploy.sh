

set -e

echo "AIボードのVercelデプロイを開始します..."

export VERCEL_TOKEN="OXWWVjnlWneESNMZ5psBefPi"
export VERCEL_ORG_ID="UqbeR2NG79HTeS0zUSHxtzH7"
export VERCEL_PROJECT_ID="prj_fTt5BA27RRp44Vi1ATSO73CRUPg2"

echo "依存関係をインストールしています..."
npm install --legacy-peer-deps

echo "アプリケーションをビルドしています..."
npm run build

echo "Vercelにデプロイしています..."
npx vercel --token "$VERCEL_TOKEN" --prod --confirm

echo "デプロイが完了しました！"
echo "デプロイされたURLは上記の出力で確認できます。"
