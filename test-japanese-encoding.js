const fs = require('fs');
const path = require('path');
const { fixJapaneseEncoding } = require('./utils/japaneseEncoding.js');

async function testJapaneseEncoding() {
  try {
    console.log('=== 日本語エンコーディング修正機能のテスト ===');
    
    const sampleTextPath = path.join(__dirname, 'test-files', 'japanese-financial-sample.txt');
    
    if (!fs.existsSync(sampleTextPath)) {
      console.error(`テストファイルが見つかりません: ${sampleTextPath}`);
      return;
    }
    
    console.log(`テストファイル: ${path.basename(sampleTextPath)}`);
    
    const sampleText = fs.readFileSync(sampleTextPath, 'utf8');
    console.log('元のテキスト:');
    console.log(sampleText.substring(0, 100) + '...');
    
    const corruptedText = sampleText
      .replace(/売上高/g, 'å£†ä‚Ø«')
      .replace(/利益/g, 'å©ç')
      .replace(/資産/g, 'è³‡ç£')
      .replace(/万円/g, 'ä‚å')
      .replace(/貸借対照表/g, 'è²¸å€Ÿå¯¾ç…§è¡¨')
      .replace(/損益計算書/g, 'æ•ä¸Šè¨ˆç®—æ›¸');
    
    console.log('\n破損したテキスト:');
    console.log(corruptedText.substring(0, 100) + '...');
    
    console.log('\nエンコーディング修正を実行中...');
    const fixedText = fixJapaneseEncoding(corruptedText);
    
    console.log('\n修正後のテキスト:');
    console.log(fixedText.substring(0, 100) + '...');
    
    const keyTerms = ['売上高', '利益', '資産', '万円', '貸借対照表', '損益計算書'];
    console.log('\n主要な用語の修正結果:');
    
    let allTermsFixed = true;
    for (const term of keyTerms) {
      const isFixed = fixedText.includes(term);
      console.log(`- ${term}: ${isFixed ? '修正成功 ✓' : '修正失敗 ✗'}`);
      if (!isFixed) allTermsFixed = false;
    }
    
    console.log(`\n総合結果: ${allTermsFixed ? '全ての用語が正常に修正されました ✓' : '一部の用語が修正されませんでした ✗'}`);
    
    console.log('\n=== 実際のエンコーディング問題のテスト ===');
    
    const realWorldIssues = [
      'å£²ä¸Šé«˜å–¶æ¥­åˆ©ç›Šçœ‡: 25.0%',
      'è‡ªå·±è³‡æœ¬æ¯"çŽ‡: 66.7%',
      'æµå‹•æ¯"çŽ‡: 333.3%',
      'è²©å£²è²»åŠã³ä¸€èˆ¬ç®¡ç†è²»: 3,000,000円'
    ];
    
    for (const issue of realWorldIssues) {
      const fixed = fixJapaneseEncoding(issue);
      console.log(`元: ${issue}`);
      console.log(`修正後: ${fixed}`);
      console.log('---');
    }
    
    console.log('\n=== テスト完了 ===');
    return { allTermsFixed, fixedText };
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
    throw error;
  }
}

testJapaneseEncoding()
  .then(result => {
    console.log('日本語エンコーディング修正機能のテスト成功!');
    process.exit(0);
  })
  .catch(error => {
    console.error('テスト失敗:', error);
    process.exit(1);
  });
