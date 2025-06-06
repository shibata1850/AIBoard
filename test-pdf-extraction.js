const fs = require('fs');
const path = require('path');
const { extractTextFromPdf } = require('./utils/pdfUtils');

async function testPdfExtraction() {
  try {
    console.log('=== PDF テキスト抽出テスト ===');
    
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
    
    console.log('テキスト抽出中...');
    const startTime = Date.now();
    
    const extractedText = await extractTextFromPdf(base64Content);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`テキスト抽出完了! 処理時間: ${duration.toFixed(2)}秒`);
    console.log(`抽出されたテキスト (${extractedText.length} 文字):`);
    console.log(extractedText.substring(0, 200) + '...');
    
    if (extractedText.length > 0) {
      console.log('テスト成功 ✓');
      return true;
    } else {
      console.error('テスト失敗: 抽出されたテキストが空です');
      return false;
    }
  } catch (error) {
    console.error(`テスト失敗 ✗: ${error.message}`);
    console.error(error);
    return false;
  }
}

testPdfExtraction()
  .then(success => {
    console.log(`\nテスト結果: ${success ? '成功' : '失敗'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('予期せぬエラー:', err);
    process.exit(1);
  });
