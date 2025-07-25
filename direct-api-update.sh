
set -e

echo "AIボードのVercel保護設定を直接APIで更新します..."

export VERCEL_TOKEN="HEqj5cGWQl0RVYD0OOpGpDFH"
export VERCEL_ORG_ID="team_JnqFhUXHbY6mX9PObgzq1xiZ"
export VERCEL_PROJECT_ID="prj_DNRx0F8Ny9p3QUNSqMXxT4jPJ8BA"

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
