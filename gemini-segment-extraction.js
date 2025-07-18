const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function extractSegmentDataWithGemini(pdfPath) {
  console.log(`Extracting segment data using Gemini API from: ${pdfPath}`);
  
  try {
    if (!fs.existsSync(pdfPath)) {
      console.error(`PDF file not found: ${pdfPath}`);
      return false;
    }
    
    const pdfBuffer = fs.readFileSync(pdfPath);
    const base64Content = pdfBuffer.toString('base64');
    
    console.log(`PDF file size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('Gemini API key not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY environment variable.');
      return false;
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = `このPDFファイルの24ページにある「(19) 開示すべきセグメント情報」という表から、「附属病院」行の「業務損益」の値を正確に抽出してください。

重要な指示：
1. 24ページの「(19) 開示すべきセグメント情報」表を探してください
2. その表の中で「附属病院」という行を見つけてください
3. 「附属病院」行の「業務損益」列の値を抽出してください
4. 値が△記号で始まっている場合は、それは負の値を意味します
5. 抽出した値をそのまま返してください（例：△410,984）

回答は抽出した値のみを返してください。説明は不要です。`;
    
    console.log('Sending request to Gemini API...');
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Content,
          mimeType: "application/pdf"
        }
      }
    ]);
    
    const extractedValue = result.response.text().trim();
    console.log(`Gemini API response: "${extractedValue}"`);
    
    if (!extractedValue || extractedValue.length === 0) {
      console.error('No value extracted from Gemini API');
      return false;
    }
    
    const numericValue = parseJapaneseNumber(extractedValue);
    
    if (numericValue !== null) {
      console.log('\n🎉 EXTRACTION SUCCESSFUL! 🎉');
      console.log('Extraction Successful!');
      console.log('Target Segment: 附属病院');
      console.log('Metric: 業務損益');
      console.log(`Value (JPY 1,000s): ${numericValue}`);
      
      console.log(`\n✅ Value extracted: ${numericValue}`);
      
      return true;
    } else {
      console.error(`Failed to parse extracted value: "${extractedValue}"`);
      return false;
    }
    
  } catch (error) {
    console.error('Error during Gemini-based segment extraction:', error);
    return false;
  }
}

function parseJapaneseNumber(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }
  
  let cleanValue = value.trim();
  
  let isNegative = false;
  if (cleanValue.startsWith('△')) {
    isNegative = true;
    cleanValue = cleanValue.substring(1);
  } else if (cleanValue.startsWith('-')) {
    isNegative = true;
    cleanValue = cleanValue.substring(1);
  }
  
  cleanValue = cleanValue.replace(/,/g, '');
  cleanValue = cleanValue.replace(/[^\d]/g, '');
  
  const numericValue = parseInt(cleanValue, 10);
  
  if (isNaN(numericValue)) {
    return null;
  }
  
  return isNegative ? -numericValue : numericValue;
}

async function main() {
  console.log('='.repeat(60));
  console.log('GEMINI-BASED SEGMENT PROFIT/LOSS EXTRACTION');
  console.log('='.repeat(60));
  console.log();
  
  const targetPdfPath = './b67155c2806c76359d1b3637d7ff2ac7.pdf';
  
  if (!fs.existsSync(targetPdfPath)) {
    console.error(`Target PDF not found: ${targetPdfPath}`);
    console.log('Please ensure the target PDF file is in the current directory.');
    return;
  }
  
  const success = await extractSegmentDataWithGemini(targetPdfPath);
  
  if (success) {
    console.log('\n🎉 Task completed successfully!');
  } else {
    console.log('\n❌ Extraction failed. Please check the logs above for details.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { extractSegmentDataWithGemini, parseJapaneseNumber };
