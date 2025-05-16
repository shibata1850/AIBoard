set -e

echo "Building and deploying login error handling fix..."

export VERCEL_TOKEN="OXWWVjnlWneESNMZ5psBefPi"
export VERCEL_ORG_ID="UqbeR2NG79HTeS0zUSHxtzH7"
export VERCEL_PROJECT_ID="prj_fTt5BA27RRp44Vi1ATSO73CRUPg2"

npm install --legacy-peer-deps

npm run build

npx vercel deploy --token "$VERCEL_TOKEN" --prod --yes

echo "Deployment completed successfully!"
echo "Please verify the following changes:"
echo "1. Enhanced login error handling with user-friendly messages"
echo "2. Improved error display UI on login screen"
echo "3. Added accessibility labels to login form elements"
