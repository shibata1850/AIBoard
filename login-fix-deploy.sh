set -e

echo "Building and deploying login fix..."

echo "Building the application..."
npm run build

echo "Deploying to Vercel..."
npx vercel deploy --prod

echo "Deployment completed successfully!"
