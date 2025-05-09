# AIボード Vercel デプロイメントガイド

このガイドでは、AIボードアプリケーションをVercelにデプロイする手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント（無料プランで十分です）
- AIボードのGitHubリポジトリへのアクセス権

## デプロイ手順

### 1. Vercelにサインアップ/ログイン

1. [Vercel](https://vercel.com/)にアクセスします
2. GitHubアカウントでサインアップまたはログインします

### 2. プロジェクトのインポート

1. Vercelダッシュボードで「New Project」をクリックします
2. 「Import Git Repository」セクションで、AIBoardリポジトリを選択します
   - リポジトリが表示されない場合は、「Add GitHub Account」または「Configure GitHub App」をクリックして、Vercelに必要な権限を付与してください

### 3. プロジェクト設定

1. プロジェクト名を入力します（例：「ai-board」）
2. フレームワークプリセットとして「Next.js」を選択します
3. 「Environment Variables」セクションで、以下の環境変数を追加します：

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_CHAT_API_BASE_URL=https://your-vercel-app-url.vercel.app
```

注意: `EXPO_PUBLIC_CHAT_API_BASE_URL`は最初のデプロイ後に更新する必要があります。最初は空白のままでも構いません。

### 4. ビルド設定

1. 「Build and Output Settings」セクションで、以下の設定を確認します：
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

2. 「Deploy」ボタンをクリックしてデプロイを開始します

### 5. デプロイ後の設定

1. デプロイが完了したら、生成されたURLをコピーします（例：https://ai-board.vercel.app）
2. プロジェクト設定に戻り、環境変数を編集します
3. `EXPO_PUBLIC_CHAT_API_BASE_URL`の値を、生成されたURLに更新します
4. 「Save」をクリックして変更を保存します
5. 「Redeploy」をクリックして、更新された環境変数でアプリケーションを再デプロイします

### 6. ログアウト機能のテスト

デプロイが完了したら、以下の手順でログアウト機能をテストします：

1. アプリケーションにログインします
2. 設定画面に移動します
3. ログアウトボタンをクリックします
4. 確認ダイアログの「ログアウト」ボタンをクリックします
5. ログイン画面にリダイレクトされることを確認します

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

ビルドエラーが発生した場合は、Vercelのデプロイログを確認してください。一般的な問題は以下の通りです：

1. 依存関係のインストールエラー
   - package.jsonに必要なすべての依存関係が含まれていることを確認してください

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

## 継続的デプロイ

GitHubリポジトリに変更をプッシュするたびに、Vercelは自動的に新しいデプロイを作成します。これにより、アプリケーションを常に最新の状態に保つことができます。

各デプロイは一意のURLを持ち、本番環境に影響を与えることなくテストできます。デプロイが成功したら、「Promote to Production」ボタンをクリックして、変更を本番環境に反映させることができます。
