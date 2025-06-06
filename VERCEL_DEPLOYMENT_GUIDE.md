# AIボード Vercel自動デプロイガイド

このガイドでは、AIボードアプリケーションをVercelに自動的にデプロイするための設定手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント
- AIボードのGitHubリポジトリへのアクセス権

## 1. Vercelプロジェクトの設定

1. [Vercel](https://vercel.com/)にアクセスし、ログインします
2. 「New Project」をクリックします
3. GitHubリポジトリ「AIBoard」をインポートします
4. 以下の設定を行います：
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install --legacy-peer-deps`
5. 「Environment Variables」セクションで、以下の環境変数を追加します：
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   EXPO_PUBLIC_CHAT_API_BASE_URL=https://your-vercel-app-url.vercel.app
   ```
6. 「Deploy」ボタンをクリックしてデプロイを開始します
7. デプロイが完了したら、Vercelダッシュボードから以下の情報を取得します：
   - Vercel Project ID
   - Vercel Organization ID
   - Vercel Token（Settings > Tokens から生成）

## 2. GitHub Secretsの設定

1. GitHubリポジトリ「AIBoard」の「Settings」タブに移動します
2. 「Secrets and variables」→「Actions」を選択します
3. 「New repository secret」ボタンをクリックして、以下のシークレットを追加します：
   ```
   VERCEL_TOKEN=your_vercel_token
   VERCEL_ORG_ID=your_vercel_org_id
   VERCEL_PROJECT_ID=your_vercel_project_id
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   EXPO_PUBLIC_CHAT_API_BASE_URL=https://your-vercel-app-url.vercel.app
   ```

## 3. GitHub Actionsワークフローの有効化

1. GitHubリポジトリの「Actions」タブに移動します
2. 「Deploy to Vercel」ワークフローを選択します
3. 「Enable workflow」ボタンをクリックします

## 4. 自動デプロイのテスト

1. コードを変更してmain-branchにプッシュします
2. GitHubリポジトリの「Actions」タブで、ワークフローの実行状況を確認します
3. ワークフローが成功すると、アプリケーションが自動的にVercelにデプロイされます

## 5. ログアウト機能のテスト

デプロイが完了したら、以下の手順でログアウト機能をテストします：

1. デプロイされたURLにアクセスします
2. アプリケーションにログインします
3. 設定画面に移動します
4. ログアウトボタンをクリックします
5. 確認ダイアログの「ログアウト」ボタンをクリックします
6. ログイン画面にリダイレクトされることを確認します

ブラウザのコンソールで以下のログが順番に表示されることを確認してください：
- `Settings: confirmSignOut called`
- `Settings: Logout button pressed`
- `AuthProvider: clearCurrentUser starting`
- `AuthProvider: clearCurrentUser succeeded`
- `AuthProvider: state reset`
- `AuthProvider: supabase.auth.signOut starting`
- `AuthProvider: supabase.auth.signOut succeeded`
- `Settings: signOut succeeded`

## トラブルシューティング

### ビルドエラー

ビルドエラーが発生した場合は、GitHub Actionsのログを確認してください。一般的な問題は以下の通りです：

1. 依存関係のインストールエラー
   - package.jsonに必要なすべての依存関係が含まれていることを確認してください
   - `--legacy-peer-deps`フラグが使用されていることを確認してください

2. 環境変数の問題
   - すべての必要な環境変数が正しく設定されていることを確認してください

3. ビルドコマンドの問題
   - package.jsonのscriptsセクションに正しいビルドコマンドが含まれていることを確認してください

### ログアウト機能の問題

ログアウト機能が正常に動作しない場合は、以下を確認してください：

1. ブラウザのコンソールでエラーメッセージを確認します
2. Chrome拡張機能による "A listener indicated an asynchronous response..." エラーが表示される場合は、シークレットモードでテストしてみてください
3. ログアウト処理の順序が正しいことを確認します：
   - AsyncStorageのクリア
   - 状態のリセット
   - Supabaseセッションの終了
   - 画面遷移

## 手動デプロイ（代替方法）

GitHub Actionsを使用せずに手動でデプロイする場合は、以下の手順を実行してください：

1. リポジトリをクローンします：
   ```
   git clone https://github.com/shibata1850/AIBoard.git
   cd AIBoard
   ```

2. 依存関係をインストールします：
   ```
   npm install --legacy-peer-deps
   ```

3. アプリケーションをビルドします：
   ```
   npm run build
   ```

4. Vercelにデプロイします：
   ```
   npx vercel --prod
   ```

5. プロンプトに従って必要な情報を入力します

## 注意事項

- GitHub Actionsワークフローは、main-branchへのプッシュ時に自動的に実行されます
- 環境変数の値は、実際のプロジェクトに合わせて変更してください
- Vercel Tokenは定期的に更新することをお勧めします
- `EXPO_PUBLIC_CHAT_API_BASE_URL`は、最初のデプロイ後に更新する必要があります
