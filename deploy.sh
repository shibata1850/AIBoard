

set -e

echo "AIボードのVercelデプロイを開始します..."

echo "依存関係をインストールしています..."
npm install --legacy-peer-deps

echo "アプリケーションをビルドしています..."
npm run build

echo "Vercelにデプロイしています..."
npx vercel --prod --confirm --token $VERCEL_TOKEN

echo "デプロイが完了しました！"
echo "デプロイされたURLは上記の出力で確認できます。"
