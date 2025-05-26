const fs = require('fs');
const path = require('path');
const { processPdfWithGemini } = require('./utils/pdfUtils');
const { getBestAvailableModel, GeminiModel } = require('./utils/modelCompatibility');

async function testModelIntegration() {
  try {
    console.log('=== モデル互換性とPDF処理の統合テスト ===');
    
    // APIキーを取得
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4';
    
    // 最適なモデルを取得
    console.log('最適なモデルを取得中...');
    const bestModel = await getBestAvailableModel(apiKey, true);
    console.log(`選択されたモデル: ${bestModel}`);
    
    // サンプルPDFファイルを読み込み
    const samplePdfPath = path.join(__dirname, 'test-files', 'financial-sample.pdf');
    
    if (!fs.existsSync(samplePdfPath)) {
      console.error(`テストファイルが見つかりません: ${samplePdfPath}`);
      return;
    }
    
    console.log(`テストファイル: ${path.basename(samplePdfPath)}`);
    
    const pdfBuffer = fs.readFileSync(samplePdfPath);
    const base64Content = pdfBuffer.toString('base64');
    
    // カスタムプロンプトを定義
    const customPrompt = `
You are a financial analysis expert. Please analyze the following financial document in detail and explain the financial situation, issues, and improvement measures.
Please summarize the key points concisely.
`;
    
    console.log('PDFをGeminiで処理中...');
    console.log('カスタムプロンプト:', customPrompt);
    
    const startTime = Date.now();
    
    // processPdfWithGemini関数を呼び出し
    const result = await processPdfWithGemini(base64Content, customPrompt);
    
    const endTime = Date.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`処理完了! 処理時間: ${processingTime}秒`);
    console.log('分析結果:');
    console.log(result);
    
    // エラーケースのテスト
    console.log('\n=== エラーケースのテスト ===');
    
    console.log('1. 無効なコンテンツでのテスト');
    try {
      await processPdfWithGemini('invalid-content');
      console.log('❌ エラーが発生しませんでした（期待値: エラー）');
    } catch (error) {
      console.log('✅ 適切にエラーが処理されました:', error.message);
    }
    
    console.log('\n=== テスト完了 ===');
    return result;
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
    throw error;
  }
}

testModelIntegration()
  .then(result => {
    console.log('モデル互換性とPDF処理の統合テスト成功!');
  })
  .catch(error => {
    console.error('テスト失敗:', error);
    process.exit(1);
  });
