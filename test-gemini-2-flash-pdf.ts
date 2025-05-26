import fs from 'fs';
import path from 'path';
import { processPdfWithGemini } from './utils/pdfUtils';

async function testGemini2FlashPdfProcessing() {
  try {
    console.log('=== Gemini 2.0 Flash PDFテスト (改良版) ===');
    
    const testPdfPath = process.env.TEST_PDF_PATH || './test-files/sample.pdf';
    
    if (!fs.existsSync(testPdfPath)) {
      console.error(`テストファイルが見つかりません: ${testPdfPath}`);
      console.log('テスト用PDFファイルのパスを環境変数 TEST_PDF_PATH で指定してください');
      return false;
    }
    
    console.log(`テストファイル: ${path.basename(testPdfPath)}`);
    
    const pdfBuffer = fs.readFileSync(testPdfPath);
    const base64Content = pdfBuffer.toString('base64');
    console.log(`PDFファイルをBase64エンコードしました (${base64Content.length} 文字)`);
    
    console.log('\n直接処理方式でテスト中...');
    const startTime = Date.now();
    
    const testPrompt = 'このPDFファイルを分析し、内容を簡潔に要約してください。特に財務情報や数値データに注目してください。';
    
    const result = await processPdfWithGemini(base64Content, testPrompt);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`処理完了! 処理時間: ${duration.toFixed(2)}秒`);
    console.log(`生成されたテキスト (${result.text.length} 文字):`);
    console.log(result.text.substring(0, 500) + '...\n');
    
    if (result.text.length > 0) {
      console.log('Gemini 2.0 Flash PDFテスト成功 ✓');
      return true;
    } else {
      console.error('Gemini 2.0 Flash PDFテスト失敗: 生成されたテキストが空です');
      return false;
    }
  } catch (error) {
    console.error(`テスト失敗 ✗: ${error instanceof Error ? error.message : String(error)}`);
    console.error(error);
    return false;
  }
}

testGemini2FlashPdfProcessing()
  .then(success => {
    console.log(`\n全体のテスト結果: ${success ? '成功' : '失敗'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('予期せぬエラー:', err);
    process.exit(1);
  });
