import * as fs from 'fs';
import * as path from 'path';
import { extractTextFromPdf } from './utils/pdfUtils';

async function testExtraction() {
  try {
    console.log('=== PDFテキスト抽出機能のテスト ===');
    
    const testFilePath = path.join(__dirname, 'test-files', 'sample.pdf');
    
    if (!fs.existsSync(testFilePath)) {
      console.error(`テストファイルが見つかりません: ${testFilePath}`);
      return;
    }
    
    console.log(`テストファイル: ${path.basename(testFilePath)}`);
    
    const pdfBuffer = fs.readFileSync(testFilePath);
    const base64Content = pdfBuffer.toString('base64');
    console.log(`PDFファイルをBase64エンコードしました (${base64Content.length} 文字)`);
    
    console.log('\nテキスト抽出機能をテスト中...');
    const startTime = Date.now();
    
    const extractedText = await extractTextFromPdf(base64Content);
    
    const endTime = Date.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`処理完了! 処理時間: ${processingTime}秒`);
    console.log(`抽出されたテキスト (${extractedText.length} 文字):`);
    console.log(extractedText);
    
    if (extractedText.includes('売上高') || extractedText.includes('利益') || extractedText.includes('資産')) {
      console.log('日本語エンコーディングは正常 ✓');
      console.log('テキスト抽出テスト成功 ✓');
    } else {
      console.log('警告: 日本語エンコーディングに問題があります ⚠');
      console.log('エンコーディング修正を試みます...');
      
      try {
        const decoded = decodeURIComponent(escape(extractedText));
        console.log('手動デコード結果:', decoded);
        
        if (decoded.includes('売上高') || decoded.includes('利益') || decoded.includes('資産')) {
          console.log('手動デコード後の日本語エンコーディングは正常 ✓');
        } else {
          console.log('手動デコード後も日本語エンコーディングに問題があります ✗');
        }
      } catch (e) {
        console.log('手動デコードに失敗しました:', e);
      }
    }
    
    console.log('\n=== テスト完了 ===');
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
  }
}

testExtraction();
