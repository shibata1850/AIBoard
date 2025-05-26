const fs = require('fs');
const path = require('path');
async function importPdfUtils() {
  try {
    try {
      return await import('./utils/pdfUtils.js');
    } catch (e) {
      console.log('Failed to import as ES module, trying CommonJS...');
      return require('./utils/pdfUtils');
    }
  } catch (error) {
    console.error('Error importing pdfUtils:', error);
    throw error;
  }
}

async function testImprovedExtraction() {
  const { extractTextFromPdf } = await importPdfUtils();
  try {
    console.log('=== PDFテキスト抽出機能の改善テスト ===');
    
    const testFilePath = path.join(__dirname, 'test-files', 'sample.pdf');
    
    if (!fs.existsSync(testFilePath)) {
      console.error(`テストファイルが見つかりません: ${testFilePath}`);
      return;
    }
    
    console.log(`テストファイル: ${path.basename(testFilePath)}`);
    
    const pdfBuffer = fs.readFileSync(testFilePath);
    const base64Content = pdfBuffer.toString('base64');
    console.log(`PDFファイルをBase64エンコードしました (${base64Content.length} 文字)`);
    
    console.log('\n改善されたテキスト抽出機能をテスト中...');
    const startTime = Date.now();
    
    const extractedText = await extractTextFromPdf(base64Content);
    
    const endTime = Date.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`処理完了! 処理時間: ${processingTime}秒`);
    console.log(`抽出されたテキスト (${extractedText.length} 文字):`);
    console.log(extractedText.substring(0, 500) + '...');
    
    if (extractedText.length > 100) {
      console.log('テキスト抽出テスト成功 ✓');
    } else {
      console.log('テキスト抽出テスト失敗 ✗: 抽出されたテキストが短すぎます');
    }
    
    console.log('\n=== テスト完了 ===');
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
  }
}

testImprovedExtraction();
