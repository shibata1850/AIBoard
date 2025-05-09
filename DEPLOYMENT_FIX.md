# AIボード デプロイ問題の修正

## 修正された問題

1. **ビルドスクリプトの修正**
   - 問題: package.jsonのビルドスクリプトが`expo export`を使用していましたが、Webアプリケーションのビルドには`expo export:web`が必要です。
   - 修正: package.jsonのビルドスクリプトを`expo export:web`に変更しました。
   ```json
   "scripts": {
     "dev": "expo start",
     "build": "expo export:web",
     "build:web": "expo export:web",
     "serve": "npm run build:web && node server.js",
     ...
   }
   ```

2. **Vercel設定の更新**
   - 問題: vercel.jsonの設定が不十分でした。
   - 修正: より詳細な公開アクセス設定を追加しました。
   ```json
   {
     "version": 2,
     "public": true,
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install --legacy-peer-deps",
     "framework": null,
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ],
     "github": {
       "silent": true,
       "autoAlias": true
     },
     "headers": [...],
     "functions": {...},
     "routes": [...],
     "env": {
       "VERCEL_PROJECT_PROTECTION": "false"
     }
   }
   ```

## デプロイ方法

以下のいずれかの方法でアプリケーションをデプロイできます：

### 方法1: デプロイスクリプトを使用する

```bash
./vercel-deploy.sh
```

このスクリプトは、依存関係のインストール、ビルド、Vercelへのデプロイを自動的に行います。

### 方法2: 手動でデプロイする

1. 依存関係をインストールします：
   ```bash
   npm install --legacy-peer-deps
   ```

2. アプリケーションをビルドします：
   ```bash
   npm run build
   ```

3. Vercelにデプロイします：
   ```bash
   npx vercel --prod
   ```

## 注意事項

- デプロイ時に以下の環境変数が正しく設定されていることを確認してください：
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - `EXPO_PUBLIC_GEMINI_API_KEY`
  - `EXPO_PUBLIC_CHAT_API_BASE_URL`

- デプロイ後にアプリケーションが正常に動作しない場合は、Vercelダッシュボードでデプロイログを確認してください。

## 詳細な説明

修正したビルドスクリプトにより、Expoプロジェクトが正しくWebアプリケーションとしてビルドされるようになりました。以前のスクリプトでは、Webビルド用の正しいコマンドが使用されていなかったため、デプロイ時に500エラー（FUNCTION_INVOCATION_FAILED）が発生していました。

また、vercel.jsonファイルの設定を更新し、より詳細な公開アクセス設定を追加しました。これにより、アプリケーションが正しくデプロイされ、公開アクセスが可能になります。
