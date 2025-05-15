// Import directly from TypeScript files
const path = require('path');
require('ts-node').register();

if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
  console.error('Error: EXPO_PUBLIC_OPENAI_API_KEY environment variable is not set');
  console.error('Please set this variable before running the test');
  process.exit(1);
}

if (!process.env.EXPO_PUBLIC_OPENAI_MODEL) {
  process.env.EXPO_PUBLIC_OPENAI_MODEL = 'gpt-4.1';
}

async function testOpenAIIntegration() {
  console.log('=== OpenAI API 統合テスト ===');
  
  try {
    // Import the API modules
    const { generateChatResponse } = require('./server/api/chat.ts');
    const { analyzeDocument } = require('./server/api/analyze.ts');
    
    // チャット機能のテスト
    console.log('\n1. チャット機能テスト:');
    const chatMessages = [
      { id: '1', text: '財務分析について教えてください', isUser: true, timestamp: Date.now() }
    ];
    
    console.log('チャットメッセージ送信中...');
    const chatResult = await generateChatResponse(chatMessages);
    console.log('チャット応答:');
    console.log(chatResult.text.substring(0, 200) + '...');
    console.log('チャット機能テスト成功 ✓');
    
    // 文書分析機能のテスト
    console.log('\n2. 文書分析機能テスト:');
    const sampleDocument = `
    株式会社サンプル
    財務諸表

    【貸借対照表】
    資産の部
      流動資産: 50,000,000円
      固定資産: 120,000,000円
      資産合計: 170,000,000円

    負債の部
      流動負債: 30,000,000円
      固定負債: 60,000,000円
      負債合計: 90,000,000円

    純資産の部
      資本金: 50,000,000円
      利益剰余金: 30,000,000円
      純資産合計: 80,000,000円

    負債・純資産合計: 170,000,000円

    【損益計算書】
    売上高: 200,000,000円
    売上原価: 140,000,000円
    売上総利益: 60,000,000円
    販売費及び一般管理費: 40,000,000円
    営業利益: 20,000,000円
    営業外収益: 2,000,000円
    営業外費用: 3,000,000円
    経常利益: 19,000,000円
    特別利益: 0円
    特別損失: 1,000,000円
    税引前当期純利益: 18,000,000円
    法人税等: 6,000,000円
    当期純利益: 12,000,000円
    `;
    
    console.log('文書分析中...');
    const analysisResult = await analyzeDocument(sampleDocument);
    console.log('分析結果:');
    console.log(analysisResult.text.substring(0, 200) + '...');
    console.log('文書分析機能テスト成功 ✓');
    
    console.log('\nすべてのテストが成功しました! ✓');
    return true;
  } catch (error) {
    console.error('テスト失敗:', error);
    return false;
  }
}

testOpenAIIntegration()
  .then(success => {
    console.log(`\nテスト結果: ${success ? '成功' : '失敗'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('予期せぬエラー:', err);
    process.exit(1);
  });
