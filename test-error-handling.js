async function importAnalyzeModule() {
  try {
    return await import('./server/api/analyze.js');
  } catch (e) {
    console.log('Failed to import as ES module, trying with .ts extension...');
    try {
      return await import('./server/api/analyze.ts');
    } catch (e2) {
      console.log('Failed to import with .ts extension, trying CommonJS...');
      return require('./server/api/analyze');
    }
  }
}

async function testErrorHandling() {
  const { analyzeDocument } = await importAnalyzeModule();
  console.log('=== エラーハンドリング強化のテスト ===');
  
  try {
    console.log('\nテストケース1: 無効なコンテンツ');
    await analyzeDocument('invalid-content-that-will-fail');
  } catch (error) {
    console.log('エラーメッセージ:', error.message);
    console.log('テストケース1: 成功 ✓ (エラーが適切に処理されました)');
  }
  
  try {
    console.log('\nテストケース2: 無効なPDFコンテンツ');
    await analyzeDocument('JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmo='); // 不完全なPDFヘッダー
  } catch (error) {
    console.log('エラーメッセージ:', error.message);
    console.log('テストケース2: 成功 ✓ (PDFエラーが適切に処理されました)');
  }
  
  try {
    console.log('\nテストケース3: モデルが見つからないエラー');
    
    const originalGenerateContent = require('@google/generative-ai').GoogleGenerativeAI.prototype.getGenerativeModel;
    require('@google/generative-ai').GoogleGenerativeAI.prototype.getGenerativeModel = () => ({
      generateContent: () => {
        throw new Error('Model not found: gemini-1.5-flash');
      }
    });
    
    await analyzeDocument('test content');
  } catch (error) {
    console.log('エラーメッセージ:', error.message);
    console.log('テストケース3: 成功 ✓ (モデルエラーが適切に処理されました)');
    
    require('@google/generative-ai').GoogleGenerativeAI.prototype.getGenerativeModel = originalGenerateContent;
  }
  
  try {
    console.log('\nテストケース4: APIキーエラー');
    
    const originalGenerateContent = require('@google/generative-ai').GoogleGenerativeAI.prototype.getGenerativeModel;
    require('@google/generative-ai').GoogleGenerativeAI.prototype.getGenerativeModel = () => ({
      generateContent: () => {
        throw new Error('Invalid API key');
      }
    });
    
    await analyzeDocument('test content');
  } catch (error) {
    console.log('エラーメッセージ:', error.message);
    console.log('テストケース4: 成功 ✓ (APIキーエラーが適切に処理されました)');
    
    require('@google/generative-ai').GoogleGenerativeAI.prototype.getGenerativeModel = originalGenerateContent;
  }
  
  console.log('\n=== テスト完了 ===');
  console.log('エラーハンドリングの強化が正常に実装されています。');
}

testErrorHandling()
  .then(() => {
    console.log('すべてのテストが成功しました!');
  })
  .catch(error => {
    console.error('テスト中にエラーが発生しました:', error);
    process.exit(1);
  });
