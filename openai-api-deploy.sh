set -e

echo "Building and deploying with OpenAI API integration..."

if [ -z "$VERCEL_TOKEN" ] || [ -z "$VERCEL_ORG_ID" ] || [ -z "$VERCEL_PROJECT_ID" ]; then
  echo "Error: Required environment variables are not set."
  echo "Please set VERCEL_TOKEN, VERCEL_ORG_ID, and VERCEL_PROJECT_ID before running this script."
  exit 1
fi

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Building application..."
npm run build

echo "Deploying to Vercel..."
npx vercel deploy --token "$VERCEL_TOKEN" --prod --yes

echo "Deployment completed successfully!"
echo "Please verify the following changes:"
echo "1. OpenAI GPT-4.1 model integration for chat and document analysis"
echo "2. Enhanced PDF handling with proper metadata extraction"
echo "3. Improved error handling for API rate limits"
echo "4. Multi-tier fallback strategy for all file types"
echo "5. Tab navigation order: 分析機能, 分析履歴, フリーチャット, マイプロンプト"
