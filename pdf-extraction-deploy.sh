set -e

echo "Building and deploying with PDF text extraction functionality..."

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
echo "1. PDF text extraction functionality for file uploads"
echo "2. Enhanced error handling for PDF processing"
echo "3. Improved user feedback during file processing"
