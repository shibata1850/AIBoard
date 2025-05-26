const fs = require('fs');
const path = require('path');
const { processPdfWithGemini } = require('./utils/pdfUtils.js');

async function testPdfWithModelCompatibility() {
  try {
    console.log('=== モデル互換性を使用したPDF処理のテスト ===');
    
    const sampleTextPath = path.join(__dirname, 'test-files', 'financial-sample.txt');
    
    if (!fs.existsSync(sampleTextPath)) {
      console.error(`テストファイルが見つかりません: ${sampleTextPath}`);
      return;
    }
    
    console.log(`テストファイル: ${path.basename(sampleTextPath)}`);
    
    const sampleText = fs.readFileSync(sampleTextPath, 'utf8');
    const base64Content = Buffer.from(sampleText).toString('base64');
    
    console.log('PDFをGeminiで処理中...');
    const startTime = Date.now();
    
    const result = await processPdfWithGemini(base64Content);
    
    const endTime = Date.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`処理完了! 処理時間: ${processingTime}秒`);
    console.log('分析結果:');
    console.log(result);
    
    console.log('\n=== テスト完了 ===');
    return result;
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
    throw error;
  }
}

testPdfWithModelCompatibility()
  .then(result => {
    console.log('テスト成功!');
  })
  .catch(error => {
    console.error('テスト失敗:', error);
    process.exit(1);
  });
