const { getBestAvailableModel, isModelAvailable, GeminiModel } = require('./utils/modelCompatibility.js');

async function testModelCompatibility() {
  try {
    console.log('=== モデル互換性チェック機能のテスト ===');
    
    const apiKey = 'AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4';
    
    console.log('\n1. 各モデルの可用性をチェック中...');
    
    const models = [
      GeminiModel.GEMINI_2_FLASH,
      GeminiModel.GEMINI_1_5_FLASH,
      GeminiModel.GEMINI_1_5_PRO,
      GeminiModel.GEMINI_PRO
    ];
    
    const availabilityResults = {};
    
    for (const model of models) {
      try {
        console.log(`モデル ${model} の可用性をチェック中...`);
        const available = await isModelAvailable(apiKey, model);
        availabilityResults[model] = available;
        console.log(`モデル ${model} の可用性: ${available ? '利用可能 ✓' : '利用不可 ✗'}`);
      } catch (error) {
        console.error(`モデル ${model} のチェック中にエラーが発生しました:`, error);
        availabilityResults[model] = false;
      }
    }
    
    console.log('\n2. 最適なモデルを選択中...');
    
    console.log('PDF対応が必要な場合:');
    const bestModelWithPdf = await getBestAvailableModel(apiKey, true);
    console.log(`選択されたモデル: ${bestModelWithPdf}`);
    
    console.log('\nPDF対応が不要な場合:');
    const bestModelWithoutPdf = await getBestAvailableModel(apiKey, false);
    console.log(`選択されたモデル: ${bestModelWithoutPdf}`);
    
    console.log('\n=== テスト結果サマリー ===');
    console.log('モデル可用性:');
    for (const [model, available] of Object.entries(availabilityResults)) {
      console.log(`- ${model}: ${available ? '利用可能 ✓' : '利用不可 ✗'}`);
    }
    
    console.log('\n最適なモデル:');
    console.log(`- PDF対応あり: ${bestModelWithPdf}`);
    console.log(`- PDF対応なし: ${bestModelWithoutPdf}`);
    
    console.log('\n=== テスト完了 ===');
    return {
      availabilityResults,
      bestModelWithPdf,
      bestModelWithoutPdf
    };
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
    throw error;
  }
}

testModelCompatibility()
  .then(results => {
    console.log('モデル互換性チェックテスト成功!');
  })
  .catch(error => {
    console.error('モデル互換性チェックテスト失敗:', error);
    process.exit(1);
  });
