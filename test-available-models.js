const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAvailableModels() {
  try {
    console.log('=== 利用可能なGemini APIモデルでのPDF処理テスト ===');
    
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
    
    // Gemini APIキー
    const apiKey = 'AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4';
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // テスト対象のモデル
    const models = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro'
    ];
    
    // 各モデルでテスト
    for (const modelName of models) {
      try {
        console.log(`\n${modelName}モデルを使用してPDFを処理中...`);
        const startTime = Date.now();
        
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.4,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 8192,
          },
        });
        
        // PDFコンテンツを直接送信
        const prompt = `
        このPDFファイルを分析し、内容を詳細に説明してください。
        特に財務情報や数値データに注目してください。
        
        PDFの内容: ${base64Content.substring(0, 10000)}... (PDFの内容が長いため省略)
        `;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        console.log(`処理完了! 処理時間: ${duration.toFixed(2)}秒`);
        console.log(`生成されたテキスト (${text.length} 文字):`);
        console.log(text.substring(0, 500) + '...');
        
        if (text.length > 0) {
          console.log(`${modelName}モデルでのテスト成功 ✓`);
        } else {
          console.error(`${modelName}モデルでのテスト失敗: 生成されたテキストが空です`);
        }
      } catch (modelError) {
        console.error(`${modelName}モデルでのテスト失敗 ✗: ${modelError.message}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`テスト失敗 ✗: ${error.message}`);
    console.error(error);
    return false;
  }
}

testAvailableModels()
  .then(success => {
    console.log(`\n全体のテスト結果: ${success ? '完了' : '失敗'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('予期せぬエラー:', err);
    process.exit(1);
  });
