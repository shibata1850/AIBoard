set -e

echo "Building and deploying with comprehensive Gemini API quota fix..."

export VERCEL_TOKEN="OXWWVjnlWneESNMZ5psBefPi"
export VERCEL_ORG_ID="UqbeR2NG79HTeS0zUSHxtzH7"
export VERCEL_PROJECT_ID="prj_fTt5BA27RRp44Vi1ATSO73CRUPg2"

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Building application..."
npm run build

echo "Deploying to Vercel..."
npx vercel deploy --token "$VERCEL_TOKEN" --prod --yes

echo "Deployment completed successfully!"
echo "Please verify the following changes:"
echo "1. Enhanced Gemini API quota error handling with multiple fallback models"
echo "2. Improved client-side error handling with retry logic"
echo "3. Better file size detection and user feedback"
echo "4. Content length limiting to prevent issues with large documents"
echo "5. Exponential backoff retry logic with gradually increasing temperature"
