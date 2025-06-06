const fs = require('fs');
const path = require('path');
const { analyzeDocument } = require('./server/api/analyze');

const TEST_FILES = [
  '/home/ubuntu/test_financial_data.txt',
];

async function testFileAnalysis() {
  console.log('=== ファイル分析APIテスト ===');
  
  for (const filePath of TEST_FILES) {
    try {
      console.log(`\nテストファイル: ${path.basename(filePath)}`);
      console.log('ファイル読み込み中...');
      
      const fileContent = fs.readFileSync(filePath, 'utf8');
      console.log(`ファイルサイズ: ${fileContent.length} 文字`);
      
      console.log('分析API呼び出し中...');
      const startTime = Date.now();
      
      const result = await analyzeDocument(fileContent);
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.log(`分析完了! 処理時間: ${duration.toFixed(2)}秒`);
      console.log('結果の一部:');
      console.log(result.text.substring(0, 200) + '...');
      
      console.log('テスト成功 ✓');
    } catch (error) {
      console.error(`テスト失敗 ✗: ${error.message}`);
      console.error(error);
    }
  }
}

testFileAnalysis()
  .then(() => {
    console.log('\n全テスト完了');
    process.exit(0);
  })
  .catch(err => {
    console.error('予期せぬエラー:', err);
    process.exit(1);
  });
