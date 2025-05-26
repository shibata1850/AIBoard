const pdfParse = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');
const { fixJapaneseEncoding } = require('./japaneseEncoding');
const { getBestAvailableModel, getModelCapabilities } = require('./modelCompatibility');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Check if a file is a PDF based on its MIME type
 * @param {string} mimeType - The MIME type of the file
 * @returns {boolean} - True if the file is a PDF
 */
function isPdfFile(mimeType) {
  return mimeType === 'application/pdf';
}

/**
 * Check if text contains financial content
 * @param {string} text - The text to check
 * @returns {boolean} - True if the text contains financial content
 */
function hasFinancialContent(text) {
  if (!text || text.length < 50) return false;
  
  const financialTerms = [
    '資産', '負債', '純資産', '売上', '利益', '営業', '経常', '当期', '純利', 
    '貸借対照表', '損益計算書', 'キャッシュフロー', '財務', '会計', '決算', 
    '流動', '固定', '資本', '収益', '費用', '粗利', '営業利益', '経常利益', '当期純利益',
    '自己資本比率', '流動比率', '売上高営業利益率', 'ROA', 'ROE', '資金繰り'
  ];
  
  return financialTerms.some(term => text.includes(term));
}

/**
 * Extract text from a PDF file
 * @param {string} base64Content - The base64-encoded content of the PDF file
 * @returns {Promise<string>} - The extracted text
 */
async function extractTextFromPdf(base64Content) {
  try {
    console.log('PDFからテキストを抽出中...');
    const startTime = Date.now();
    
    // Decode base64 content
    let pdfBuffer;
    try {
      pdfBuffer = Buffer.from(base64Content, 'base64');
    } catch (decodeError) {
      console.error('Base64デコードエラー:', decodeError);
      throw new Error('PDFコンテンツのデコードに失敗しました。有効なPDFファイルを提供してください。');
    }
    
    // Validate PDF structure
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(pdfBuffer);
      const pageCount = pdfDoc.getPageCount();
      console.log(`PDF文書が正常に読み込まれました。ページ数: ${pageCount}`);
    } catch (pdfError) {
      console.error('PDF構造検証エラー:', pdfError);
      throw new Error('PDFファイルの構造が無効です。有効なPDFファイルを提供してください。');
    }
    
    // Extract text using pdf-parse
    let extractedText;
    try {
      const data = await pdfParse(pdfBuffer);
      extractedText = data.text || '';
    } catch (parseError) {
      console.error('PDFパースエラー:', parseError);
      return '注: このPDFからテキストを抽出できませんでした。このPDFは画像ベースのスキャン文書である可能性があります。財務諸表の分析のために、テキスト形式のデータを提供してください。';
    }
    
    // Fix Japanese encoding issues
    try {
      extractedText = fixJapaneseEncoding(extractedText);
    } catch (encodingError) {
      console.warn('日本語エンコーディング修正エラー:', encodingError);
      // Continue with the original text if encoding fix fails
    }
    
    const endTime = Date.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`テキスト抽出完了! 処理時間: ${processingTime}秒`);
    console.log(`抽出されたテキスト (${extractedText.length} 文字):`);
    console.log(extractedText.substring(0, 200) + (extractedText.length > 200 ? '...' : ''));
    
    return extractedText;
  } catch (error) {
    console.error('PDFテキスト抽出中にエラーが発生しました:', error);
    throw error;
  }
}

/**
 * Process a PDF file with Gemini API
 * @param {string} base64Content - The base64-encoded content of the PDF file
 * @param {boolean} isFinancial - Whether the PDF contains financial content
 * @returns {Promise<object>} - The analysis result
 */
async function processPdfWithGemini(base64Content, isFinancial = true) {
  try {
    console.log('PDFをGeminiで処理中...');
    const startTime = Date.now();
    
    // Extract text from PDF
    const extractedText = await extractTextFromPdf(base64Content);
    
    if (!extractedText || extractedText.length < 50) {
      return { 
        text: '注: このPDFからテキストを抽出できませんでした。このPDFは画像ベースのスキャン文書である可能性があります。財務諸表の分析のために、テキスト形式のデータを提供してください。'
      };
    }
    
    // Check if the extracted text contains financial content
    const containsFinancialContent = hasFinancialContent(extractedText);
    console.log(`財務コンテンツの検出: ${containsFinancialContent ? '検出されました ✓' : '検出されませんでした ✗'}`);
    
    // Override isFinancial based on content detection
    isFinancial = isFinancial || containsFinancialContent;
    
    // Get the optimal model for PDF processing
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4';
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const modelName = await getBestAvailableModel(apiKey, true);
    const { supportsPdf } = getModelCapabilities(modelName);
    console.log(`選択されたモデル: ${modelName}, PDF対応: ${supportsPdf ? 'はい' : 'いいえ'}`);
    
    // Create the model
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Create the prompt based on whether the content is financial
    const prompt = isFinancial 
      ? `あなたは財務分析の専門家です。以下の財務文書を詳細に分析し、具体的な財務状況、問題点、改善策を説明してください。
      
      分析すべき重要な点：
      1. 売上高と利益率の推移
      2. 財務健全性（負債比率、流動比率など）
      3. 資金繰り状況
      4. 経営効率（ROA、ROEなど）
      5. キャッシュフローの状況
      
      分析結果は以下の形式で出力してください：
      
      ## 全体的な財務状況
      [具体的な財務状況の説明]
      
      ## 主要な財務指標
      [具体的な数値と説明]
      
      ## 問題点と課題
      [具体的な問題点の説明]
      
      ## 改善策と提案
      [具体的な改善策の提案]
      
      ## 今後の見通し
      [今後の見通しについての説明]
      
      以下が分析対象の文書です：
      
      ${extractedText}`
      : `以下の文書を分析し、主要なポイントと重要な情報を要約してください。
      文書の種類を特定し、その内容に応じた適切な分析を行ってください。
      
      分析結果は以下の形式で出力してください：
      
      ## 文書の種類
      [文書の種類の説明]
      
      ## 主要なポイント
      [主要なポイントの説明]
      
      ## 重要な情報
      [重要な情報の説明]
      
      ## 分析と考察
      [分析と考察の説明]
      
      以下が分析対象の文書です：
      
      ${extractedText}`;
    
    // Generate content
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const endTime = Date.now();
      const processingTime = ((endTime - startTime) / 1000).toFixed(2);
      console.log(`Gemini処理完了! 処理時間: ${processingTime}秒`);
      
      return { text };
    } catch (generationError) {
      console.error('Gemini生成エラー:', generationError);
      
      // Try with a different model if the first one fails
      try {
        console.log('別のモデルで再試行中...');
        const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const fallbackResult = await fallbackModel.generateContent(prompt);
        const fallbackResponse = await fallbackResult.response;
        const fallbackText = fallbackResponse.text();
        
        return { text: fallbackText };
      } catch (fallbackError) {
        console.error('フォールバックモデルでのエラー:', fallbackError);
        throw generationError; // Throw the original error
      }
    }
  } catch (error) {
    console.error('PDFのGemini処理中にエラーが発生しました:', error);
    
    // Handle specific error types
    if (error.message.includes('model not found')) {
      // Model not found error
      return { text: '申し訳ありませんが、現在このモデルは利用できません。別のモデルで分析を試みています...' };
    } else if (error.message.includes('API key')) {
      // API key error
      return { text: 'APIキーの問題が発生しました。システム管理者にお問い合わせください。' };
    } else {
      // General error
      return { text: '文書の分析中にエラーが発生しました。別のファイルを試すか、後でもう一度お試しください。' };
    }
  }
}

module.exports = {
  isPdfFile,
  extractTextFromPdf,
  processPdfWithGemini,
  hasFinancialContent
};
