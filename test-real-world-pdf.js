/**
 * Test script for real-world PDF processing with improved functionality
 * This script tests the enhanced PDF processing capabilities with actual PDF files
 */

const fs = require('fs');
const path = require('path');
const { processPdfWithGemini } = require('./utils/pdfUtils');
const { getBestAvailableModel } = require('./utils/modelCompatibility');
const { fixJapaneseEncoding } = require('./utils/japaneseEncoding');

process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

async function testRealWorldPdf() {
  try {
    console.log('=== 実際のPDFファイルを使用した処理テスト ===');
    
    const testPdfPath = process.argv[2] || path.join(__dirname, 'test-files', 'financial-sample.pdf');
    
    if (!fs.existsSync(testPdfPath)) {
      console.error(`テストファイルが見つかりません: ${testPdfPath}`);
      console.log('使用方法: node test-real-world-pdf.js [PDFファイルのパス]');
      return false;
    }
    
    console.log(`テストファイル: ${path.basename(testPdfPath)}`);
    
    console.log('利用可能なGeminiモデルを確認中...');
    const bestModel = await getBestAvailableModel(true);
    console.log(`PDF処理に最適なモデル: ${bestModel}`);
    
    const pdfBuffer = fs.readFileSync(testPdfPath);
    const base64Content = pdfBuffer.toString('base64');
    console.log(`PDFファイルをBase64エンコードしました (${base64Content.length} 文字)`);
    
    console.log('\nPDFをGeminiで処理中...');
    const startTime = Date.now();
    
    const result = await processPdfWithGemini(base64Content);
    
    const endTime = Date.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`処理完了! 処理時間: ${processingTime}秒`);
    
    const fixedResult = fixJapaneseEncoding(result.text || result);
    
    console.log('\n=== 分析結果 ===');
    console.log(fixedResult);
    
    const resultPath = path.join(__dirname, 'test-results', `${path.basename(testPdfPath, '.pdf')}-result.txt`);
    
    if (!fs.existsSync(path.join(__dirname, 'test-results'))) {
      fs.mkdirSync(path.join(__dirname, 'test-results'));
    }
    
    fs.writeFileSync(resultPath, fixedResult);
    console.log(`分析結果を保存しました: ${resultPath}`);
    
    console.log('\n=== テスト完了 ===');
    return true;
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
    
    console.error('エラーの詳細:');
    console.error('- メッセージ:', error.message);
    console.error('- 名前:', error.name);
    console.error('- コード:', error.code);
    
    if (error.response) {
      console.error('- レスポンス:', error.response);
    }
    
    return false;
  }
}

testRealWorldPdf()
  .then(success => {
    console.log(`\n全体のテスト結果: ${success ? '成功 ✓' : '失敗 ✗'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('予期せぬエラー:', err);
    process.exit(1);
  });
