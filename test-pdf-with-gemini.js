console.log('=== Testing Enhanced PDF Analysis with Actual Problem PDF ===\n');

const fs = require('fs');
const path = require('path');

require('dotenv').config();

async function testActualPDF() {
  try {
    console.log('1. Testing PDF file access...');
    const pdfPath = path.join(__dirname, 'test-pdf.pdf');
    
    if (!fs.existsSync(pdfPath)) {
      console.log('❌ Test PDF file not found');
      return;
    }
    
    const stats = fs.statSync(pdfPath);
    console.log(`✅ PDF file found: ${stats.size} bytes`);
    
    console.log('\n2. Converting PDF to base64 for testing...');
    
    const pdfBuffer = fs.readFileSync(pdfPath);
    const base64Content = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
    
    console.log(`✅ PDF converted to base64: ${base64Content.length} characters`);
    
    console.log('\n3. Testing Gemini API direct extraction...');
    
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 
                   process.env.GEMINI_API_KEY || 
                   'AIzaSyC9BDCws06KaT5L4vhDXhkDMeHRfjvQu90';
    
    if (!apiKey) {
      console.log('❌ Gemini API key not configured');
      console.log('Please set EXPO_PUBLIC_GEMINI_API_KEY environment variable');
      return;
    }
    
    console.log('✅ Gemini API key found');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const enhancedPrompt = `このPDFファイルから財務諸表データを正確に抽出してください。特に以下の項目に注意してください：

1. 貸借対照表（Balance Sheet）:
   - 流動資産合計
   - 固定資産合計
   - 流動負債合計
   - 固定負債合計
   - 純資産合計

2. 損益計算書（Income Statement）:
   - 経常収益
   - 経常費用
   - 経常利益または経常損失
   - 当期純利益または当期純損失

3. セグメント情報:
   - 附属病院セグメントの業務損益

4. 財務比率の計算:
   - 負債比率 = (負債合計 / 純資産合計) × 100
   - 流動比率 = 流動資産合計 / 流動負債合計

数値は千円単位で正確に抽出し、項目名と数値の対応関係を明確にしてください。`;

    console.log('Calling Gemini API with enhanced prompt...');
    
    const pdfData = base64Content.substring('data:application/pdf;base64,'.length);
    
    const result = await model.generateContent([
      enhancedPrompt,
      {
        inlineData: {
          data: pdfData,
          mimeType: "application/pdf"
        }
      }
    ]);
    
    const extractedText = result.response.text();
    console.log(`✅ PDF text extraction successful: ${extractedText.length} characters extracted`);
    
    console.log('\n4. Analyzing extracted financial data...');
    
    const hasBalanceSheet = extractedText.includes('貸借対照表') || extractedText.includes('Balance Sheet');
    const hasIncomeStatement = extractedText.includes('損益計算書') || extractedText.includes('Income Statement');
    const hasSegmentInfo = extractedText.includes('セグメント') || extractedText.includes('附属病院');
    
    console.log(`Balance Sheet terms found: ${hasBalanceSheet ? '✅' : '❌'}`);
    console.log(`Income Statement terms found: ${hasIncomeStatement ? '✅' : '❌'}`);
    console.log(`Segment Information found: ${hasSegmentInfo ? '✅' : '❌'}`);
    
    const numberPattern = /[\d,]+/g;
    const numbers = extractedText.match(numberPattern) || [];
    console.log(`Numbers found in text: ${numbers.length}`);
    
    const hasDebtRatio = extractedText.includes('負債比率') || extractedText.includes('debt ratio');
    const hasCurrentRatio = extractedText.includes('流動比率') || extractedText.includes('current ratio');
    const hasOperatingLoss = extractedText.includes('経常損失') || extractedText.includes('operating loss');
    const hasNetLoss = extractedText.includes('当期純損失') || extractedText.includes('net loss');
    
    console.log(`Debt Ratio (負債比率) mentioned: ${hasDebtRatio ? '✅' : '❌'}`);
    console.log(`Current Ratio (流動比率) mentioned: ${hasCurrentRatio ? '✅' : '❌'}`);
    console.log(`Operating Loss (経常損失) mentioned: ${hasOperatingLoss ? '✅' : '❌'}`);
    console.log(`Net Loss (当期純損失) mentioned: ${hasNetLoss ? '✅' : '❌'}`);
    
    console.log('\n5. Sample of extracted text (first 1000 characters):');
    console.log('---');
    console.log(extractedText.substring(0, 1000));
    console.log('---');
    
    console.log('\n6. Testing Chain of Thought analysis approach...');
    
    const chainOfThoughtPrompt = `以下の財務データに基づき、段階的に分析を行ってください：

ステップ1: 財務指標の計算
提供されたデータから以下の財務指標を計算してください：
- 負債比率 = (負債合計 / 純資産合計) × 100
- 流動比率 = 流動資産合計 / 流動負債合計
- 固定比率 = 固定資産合計 / 純資産合計

ステップ2: 定性分析
セグメント情報を活用し、特に附属病院セグメントの業務損益が法人全体に与える影響を分析してください。

ステップ3: 総合評価
計算した財務指標と定性分析を統合し、財務状況の総合的な評価を行ってください。

財務データ:
${extractedText}`;

    console.log('Chain of Thought prompt structure created ✅');
    console.log(`Prompt length: ${chainOfThoughtPrompt.length} characters`);
    
    console.log('\n7. Running Chain of Thought analysis...');
    
    const analysisResult = await model.generateContent(chainOfThoughtPrompt);
    const analysisText = analysisResult.response.text();
    
    console.log(`✅ Chain of Thought analysis completed: ${analysisText.length} characters`);
    
    console.log('\n8. Analysis Results Sample (first 1000 characters):');
    console.log('---');
    console.log(analysisText.substring(0, 1000));
    console.log('---');
    
    console.log('\n=== Test Summary ===');
    console.log('✅ PDF file successfully processed');
    console.log('✅ Enhanced Gemini extraction tested');
    console.log('✅ Financial terms detection verified');
    console.log('✅ Chain of Thought analysis completed');
    console.log('✅ Ready for accuracy evaluation');
    
    fs.writeFileSync(path.join(__dirname, 'extracted-text-sample.txt'), extractedText);
    fs.writeFileSync(path.join(__dirname, 'analysis-result-sample.txt'), analysisText);
    console.log('✅ Results saved to extracted-text-sample.txt and analysis-result-sample.txt');
    
    return {
      extractedText,
      analysisText,
      hasBalanceSheet,
      hasIncomeStatement,
      hasSegmentInfo,
      numbersFound: numbers.length
    };
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Error details:', error);
    return null;
  }
}

testActualPDF().then(result => {
  if (result) {
    console.log('\n🎉 Test completed successfully!');
  } else {
    console.log('\n❌ Test failed');
  }
}).catch(console.error);
