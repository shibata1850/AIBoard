set -e

echo "Building and deploying with fixed file upload functionality..."

npm run build

npx vercel deploy --prod

echo "Deployment completed successfully!"
echo "The file upload functionality should now work correctly in the web environment."
