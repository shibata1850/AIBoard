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
   - 問題: vercel.jsonの設定に複数の問題がありました。
   - 修正1: `headers`と`routes`の競合を解決するため、headersをroutesの中に移動しました。
   ```json
   "routes": [
     { "handle": "filesystem" },
     { "src": "/api/(.*)", "dest": "/server/api/$1" },
     { 
       "src": "/(.*)", 
       "dest": "/index.html",
       "headers": {
         "Access-Control-Allow-Origin": "*",
         "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
         "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Accept"
       }
     }
   ]
   ```
   
   - 修正2: 存在しないサーバーレス関数を参照していた`functions`セクションを削除しました。
   
   - 修正3: APIルートを実際のディレクトリ構造（`server/api`）に合わせて更新しました。

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
   npx vercel --token "$VERCEL_TOKEN" --prod
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

また、vercel.jsonファイルの設定を更新し、以下の問題を修正しました：

1. `headers`と`routes`の競合：Vercelの設定では、これらのプロパティが競合する可能性があります。この問題を解決するために、headersをroutesの中に移動しました。

2. 存在しないサーバーレス関数：`functions`セクションが`api/**/*.js`パターンを参照していましたが、このパターンに一致するファイルが存在しませんでした。このセクションを削除しました。

3. APIルートの不一致：APIルートが`/api/(.*)`から`/api/$1`にマッピングされていましたが、実際のAPIファイルは`server/api`ディレクトリにありました。ルートを更新して正しいディレクトリを指すようにしました。

これらの修正により、アプリケーションが正しくデプロイされ、公開アクセスが可能になります。
