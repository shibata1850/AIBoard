set -e

echo "Building and deploying with enhanced Gemini API quota fix..."

export VERCEL_TOKEN="HEqj5cGWQl0RVYD0OOpGpDFH"
export VERCEL_ORG_ID="UqbeR2NG79HTeS0zUSHxtzH7"
export VERCEL_PROJECT_ID="prj_DNRx0F8Ny9p3QUNSqMXxT4jPJ8BA"

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Building application..."
npm run build

echo "Deploying to Vercel..."
npx vercel deploy --token "$VERCEL_TOKEN" --prod --yes

echo "Deployment completed successfully!"
echo "Please verify the following changes:"
echo "1. Enhanced Gemini API quota error handling with multiple fallback models"
echo "2. Improved error detection and user-friendly messages"
echo "3. Content length limiting to prevent issues with large documents"
echo "4. Exponential backoff retry logic with gradually increasing temperature"
