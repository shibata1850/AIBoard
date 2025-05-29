# PDF処理機能の改善

このドキュメントでは、AIBoardアプリケーションのPDF処理機能に対して行われた改善点について説明します。

## 1. テキスト抽出機能の強化

### 実装された機能

- **ページごとの抽出**: PDFの全体抽出が失敗した場合、ページごとに抽出を試みるフォールバックメカニズムを実装
- **日本語文字エンコーディング修正**: 日本語文字のエンコーディング問題を解決するための専用モジュール（`encodingFixes.ts`）を作成
- **テキスト長の最適化**: APIの制限を考慮したテキスト長の自動調整機能

### 主要なコード

```typescript
// ページごとの抽出（フォールバックメカニズム）
try {
  console.log('Attempting page-by-page extraction as fallback...');
  const pdfDoc = await PDFDocument.load(pdfData);
  const pageCount = pdfDoc.getPageCount();
  
  let allText = '';
  for (let i = 0; i < Math.min(pageCount, 10); i++) {
    try {
      const pageData = await pdfParse(pdfData, { max: 1, pagerender: i });
      allText += pageData.text + '\n\n';
    } catch (pageError) {
      console.error(`Error extracting text from page ${i}:`, pageError);
    }
  }
  
  // 抽出されたテキストを処理
  let extractedText = fixJapaneseEncoding(allText);
  
  // テキスト長の制限
  if (extractedText.length > MAX_CONTENT_LENGTH) {
    extractedText = extractedText.substring(0, MAX_CONTENT_LENGTH);
  }
  
  return extractedText;
} catch (fallbackError) {
  console.error('Fallback extraction failed:', fallbackError);
  throw new Error('PDFからテキストを抽出できませんでした。別のファイルを試してください。');
}
```

## 2. プロンプトエンジニアリングの最適化

### 実装された機能

- **財務分析向けプロンプトの改善**: 財務指標、資産・負債状況、収益性、安全性、成長性などの分析ポイントを明確化
- **日本語財務用語の認識強化**: 日本語の財務用語を正確に認識するためのプロンプト設計
- **構造化された出力フォーマット**: 表形式でのデータ表示やトレンド分析の指示を追加

### 主要なコード

```typescript
const enhancedPrompt = customPrompt || `
あなたは財務アドバイザーAIです。以下の文書を分析し、財務状況を詳細に解説してください。

分析すべき点:
1. 主要な財務指標（売上高、営業利益、経常利益、当期純利益など）
2. 資産・負債・純資産の状況
3. 収益性（売上高営業利益率、ROA、ROEなど）
4. 安全性（流動比率、自己資本比率など）
5. 成長性（前年比増減など）

特に注目すべき点や改善点があれば指摘し、経営改善のためのアドバイスを提供してください。
数値データは表形式でまとめ、トレンドや比率も計算して示してください。

文書:
${limitedText}
`;
```

## 3. モデル互換性チェック機能

### 実装された機能

- **利用可能なGeminiモデルの自動検出**: 利用可能なモデルを動的に検出し、最適なモデルを選択
- **PDF対応モデルの優先選択**: PDF処理に最適なモデル（gemini-1.5-flash）を優先的に使用
- **フォールバックメカニズム**: 最適なモデルが利用できない場合の代替モデル選択機能

### 主要なコード

```typescript
// 最適なモデルの取得
const bestModelName = await getBestAvailableModel(apiKey, true);
console.log(`Using model: ${bestModelName}`);

// フォールバックメカニズム
const alternativeModels = [
  'gemini-1.5-flash',
  'gemini-1.0-pro',
  'gemini-pro'
];

for (const modelName of alternativeModels) {
  try {
    if (await isModelAvailable(genAI, modelName)) {
      console.log(`Trying alternative model: ${modelName}`);
      const fallbackModel = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.2,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      });
      
      const result = await fallbackModel.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();
      
      return { text, model: modelName };
    }
  } catch (modelError) {
    console.error(`Error with model ${modelName}:`, modelError);
  }
}
```

## 4. エラーハンドリングの強化

### 実装された機能

- **多層的なエラーハンドリング**: 各処理段階でのエラーキャッチと適切な回復メカニズム
- **ユーザーフレンドリーなエラーメッセージ**: エンドユーザー向けの分かりやすいエラーメッセージ
- **詳細なログ記録**: デバッグを容易にするための詳細なログ出力

### 主要なコード

```typescript
try {
  // PDFの処理
} catch (error) {
  console.error('Error in processPdfWithGemini:', error);
  
  // エラーの種類に応じた処理
  if (error.message.includes('API key')) {
    throw new Error('APIキーが無効です。システム管理者にお問い合わせください。');
  } else if (error.message.includes('PDF')) {
    throw new Error('PDFファイルの処理中にエラーが発生しました。別のファイルを試してください。');
  } else {
    throw new Error('分析中にエラーが発生しました。しばらく経ってからもう一度お試しください。');
  }
}
```

## 5. 包括的テストフレームワーク

### 実装された機能

- **Jest設定**: ユニットテストとコンポーネントテスト用のJest設定
- **React Testing Library**: Reactコンポーネントのテスト環境
- **Playwright**: E2Eテスト用の設定
- **モック実装**: 外部依存関係のモック化

### 主要なファイル

- `jest.config.js`: Jestの設定ファイル
- `jest.setup.js`: テスト環境のセットアップファイル
- `__tests__/`: ユニットテストとコンポーネントテスト
- `__e2e__/`: E2Eテスト
- `TESTING.md`: テスト実行手順の文書

## 6. APIキー管理の改善

### 実装された機能

- **環境変数の使用**: APIキーを環境変数として管理
- **クロスプラットフォーム対応**: Expo/React NativeとNext.jsの両方に対応する環境変数の設定
- **セキュリティ強化**: `.gitignore`の更新によるAPIキーの漏洩防止

### 主要なコード

```typescript
// 環境変数からAPIキーを取得
const apiKey = process.env.GEMINI_API_KEY || 
              process.env.EXPO_PUBLIC_GEMINI_API_KEY || 
              process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables');
  throw new Error('APIキーが設定されていません。システム管理者にお問い合わせください。');
}
```

## 今後の課題

1. **Gemini APIキーの更新**: 有効なAPIキーの取得と設定
2. **PDFライブラリの互換性問題**: 代替PDFパースライブラリの検討
3. **Vercelデプロイの再設定**: 新しいVercelプロジェクトの作成と環境変数の設定
4. **日本語PDFのサポート強化**: より多様な日本語PDFファイルへの対応

## テスト方法

```bash
# ユニットテストとコンポーネントテスト
npm test

# テストカバレッジレポート
npm run test:coverage

# E2Eテスト
npm run test:e2e

# 実際のPDFファイルを使用したテスト
node test-real-world-pdf.js [PDFファイルのパス]
```

詳細なテスト手順は `TESTING.md` ファイルを参照してください。
