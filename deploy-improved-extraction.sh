#!/bin/bash
set -e

echo "=== AIBoard PDF抽出機能改善のデプロイ ==="

if [ -z "$VERCEL_TOKEN" ] || [ -z "$VERCEL_ORG_ID" ] || [ -z "$VERCEL_PROJECT_ID" ]; then
  echo "エラー: 必要な環境変数が設定されていません。"
  echo "以下の環境変数を設定してください:"
  echo "- VERCEL_TOKEN"
  echo "- VERCEL_ORG_ID"
  echo "- VERCEL_PROJECT_ID"
  exit 1
fi

git add utils/pdfUtils.ts test-improved-extraction.js
git commit -m "PDFテキスト抽出機能の強化: ページごとの抽出とエラーハンドリングの改善"

git push origin devin/1747787781-aiboard-setup

echo "Vercelにデプロイしています..."
npx vercel deploy --token "$VERCEL_TOKEN" --prod --yes

echo "=== デプロイ完了 ==="
echo "改善されたPDFテキスト抽出機能がデプロイされました。"
