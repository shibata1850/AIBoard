#!/bin/bash
set -e

echo "Performing force clean deployment with updated Gemini API key..."

export VERCEL_TOKEN="OXWWVjnlWneESNMZ5psBefPi"
export VERCEL_ORG_ID="UqbeR2NG79HTeS0zUSHxtzH7"
export VERCEL_PROJECT_ID="prj_fTt5BA27RRp44Vi1ATSO73CRUPg2"

export EXPO_PUBLIC_GEMINI_API_KEY="AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4"
export NEXT_PUBLIC_GEMINI_API_KEY="AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4"

echo "Cleaning node_modules and build artifacts..."
rm -rf node_modules
rm -rf .next
rm -rf .expo
rm -rf dist

echo "Reinstalling dependencies..."
npm install --legacy-peer-deps

echo "Building application..."
npm run build

echo "Deploying to Vercel with explicit environment variables and --force flag..."
npx vercel deploy --token "$VERCEL_TOKEN" --prod --yes --force \
  -e EXPO_PUBLIC_GEMINI_API_KEY="$EXPO_PUBLIC_GEMINI_API_KEY" \
  -e NEXT_PUBLIC_GEMINI_API_KEY="$NEXT_PUBLIC_GEMINI_API_KEY"

echo "Force clean deployment completed successfully!"
echo "Please verify the following:"
echo "1. Gemini API key has been updated to: $EXPO_PUBLIC_GEMINI_API_KEY"
echo "2. All caches have been cleared with --force flag"
echo "3. Environment variables have been explicitly set during deployment"
