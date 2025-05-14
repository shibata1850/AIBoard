set -e

echo "Building and deploying with Gemini 2.5 Pro PDF processing functionality..."

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
echo "1. Gemini 2.5 Pro model integration for direct PDF processing"
echo "2. Enhanced PDF handling with proper metadata extraction"
echo "3. Improved error handling for PDF files"
echo "4. Multi-tier fallback strategy for all file types"
echo "5. Removed redundant PDF text extraction step"
