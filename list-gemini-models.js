const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listGeminiModels() {
  try {
    console.log('=== Gemini API 利用可能なモデル一覧 ===');
    
    // Gemini APIキー
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.error('GEMINI_API_KEYが設定されていません。');
      return false;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 利用可能なモデルを取得
    console.log('利用可能なモデルを取得中...');
    const models = await genAI.listModels();
    
    console.log('利用可能なモデル:');
    models.models.forEach(model => {
      console.log(`- ${model.name} (${model.displayName})`);
      console.log(`  サポートされているメソッド: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('');
    });
    
    return true;
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    console.error(error);
    return false;
  }
}

listGeminiModels()
  .then(success => {
    console.log(`\n実行結果: ${success ? '成功' : '失敗'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('予期せぬエラー:', err);
    process.exit(1);
  });
