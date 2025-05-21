#!/bin/bash
set -e

echo "Deploying AIBoard with Gemini 2.0 PDF processing update..."

export VERCEL_TOKEN="OXWWVjnlWneESNMZ5psBefPi"
export VERCEL_ORG_ID="UqbeR2NG79HTeS0zUSHxtzH7"
export VERCEL_PROJECT_ID="prj_DNRx0F8Ny9p3QUNSqMXxT4jPJ8BA"

export EXPO_PUBLIC_GEMINI_API_KEY="AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4"
export NEXT_PUBLIC_GEMINI_API_KEY="AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4"

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Building application..."
npm run build

echo "Deploying to Vercel with explicit environment variables..."
npx vercel deploy --token "$VERCEL_TOKEN" --prod --yes \
  -e EXPO_PUBLIC_GEMINI_API_KEY="$EXPO_PUBLIC_GEMINI_API_KEY" \
  -e NEXT_PUBLIC_GEMINI_API_KEY="$NEXT_PUBLIC_GEMINI_API_KEY"

echo "Deployment completed successfully!"
echo "PDF processing improvements summary:"
echo "1. Improved PDF text extraction with pdf-parse"
echo "2. Added direct PDF processing with Gemini 2.0 Flash"
echo "3. Added size-based approach selection (direct vs File API)"
echo "4. Improved error handling with better fallback mechanisms"
echo "5. Enhanced user feedback for PDF processing issues"
echo "6. Explicit environment variable setting during deployment"
