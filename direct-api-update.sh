
set -e

echo "AIボードのVercel保護設定を直接APIで更新します..."

export VERCEL_TOKEN="OXWWVjnlWneESNMZ5psBefPi"
export VERCEL_ORG_ID="UqbeR2NG79HTeS0zUSHxtzH7"
export VERCEL_PROJECT_ID="prj_fTt5BA27RRp44Vi1ATSO73CRUPg2"

echo "プロジェクト保護設定を無効化しています..."
curl -X PATCH "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID?teamId=$VERCEL_ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "publicSource": true,
    "ssoProtection": {
      "deploymentType": "none"
    },
    "protection": null
  }'

echo "プロジェクト設定を確認しています..."
curl "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID?teamId=$VERCEL_ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN"

echo "最新のデプロイメント情報を取得しています..."
curl "https://api.vercel.com/v6/deployments?teamId=$VERCEL_ORG_ID&projectId=$VERCEL_PROJECT_ID&limit=1" \
  -H "Authorization: Bearer $VERCEL_TOKEN"

echo "保護設定の更新が完了しました！"
