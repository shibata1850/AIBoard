# AIボード (AI Board)

<!-- Verification: Repository access and linting setup confirmed -->

AIボードは中小企業向けの財務分析・アドバイスツールです。財務諸表などを詳しく分析して、的確なアドバイスを提供します。

> **Note**: This is a verification test change by Devin AI to confirm repository access and PR creation functionality.

<!-- Test comment added for PR verification -->

## 機能

- AIチャット: 財務や経営に関する質問に回答
- 書類分析: 財務諸表などの書類をアップロードして分析
- プロンプト管理: よく使うプロンプトを保存して再利用
- グループ機能: チームでの共同作業をサポート
- ダークモード対応: 使いやすいUIデザイン

## 技術スタック

- [Expo](https://expo.dev/) / [React Native](https://reactnative.dev/)
- [Supabase](https://supabase.com/) (認証・データベース)
- [Google Gemini API](https://ai.google.dev/) (AI機能)
- [TypeScript](https://www.typescriptlang.org/)

## 開発環境のセットアップ

### 前提条件

- Node.js 18以上
- npm 9以上
- Expo CLI

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/ai-board.git
cd ai-board

# 依存関係のインストール
npm install
```

### 環境変数の設定

`.env.development`ファイルを作成し、以下の環境変数を設定します：

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_CHAT_API_BASE_URL=http://localhost:3000
```

### 開発サーバーの起動

```bash
# 開発サーバーを起動
npm run dev
```

### モバイルアプリのビルド

```bash
# iOSビルド
npm run ios

# Androidビルド
npm run android
```

## データベースのセットアップ

Supabaseプロジェクトを作成し、`supabase/migrations`ディレクトリ内のSQLファイルを実行してデータベースをセットアップします。

## デプロイ

### Expoへのデプロイ

```bash
# EASでビルド
eas build --platform all

# EASでデプロイ
eas submit --platform all
```

## トラブルシューティング

### ログアウト機能について

- Chrome拡張機能による "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received" というエラーが表示される場合がありますが、これは拡張機能の問題であり、アプリケーションの機能には影響しません。
- ログアウト機能のテストを行う場合は、シークレットモードや拡張機能を無効化した状態でも確認することをお勧めします。
- ログアウト後は自動的にログイン画面にリダイレクトされます。

## 検証ステータス

✅ リポジトリアクセス: 確認済み  
❌ Lint設定: 未設定 (package.jsonにlintスクリプトなし)  
✅ PR作成: テスト中

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

<!-- Dummy change for PR test -->

## 検証済み

- リポジトリアクセス: ✅
- Lintコマンド実行: ✅ (2025年7月4日に再検証済み - 69 warnings detected)
