set -e

echo "Building and deploying with fixed tab navigation and analysis page..."

npm install --legacy-peer-deps

npm run build

npx vercel deploy --prod

echo "Deployment completed successfully!"
echo "Please verify the following changes:"
echo "1. Tab name changed from 'メインチャット' to 'フリーチャット'"
echo "2. Tab order rearranged to: 分析機能, 分析履歴, フリーチャット, マイプロンプト"
echo "3. Text input removed from analysis page"
echo "4. File upload functionality fixed on analysis page"
