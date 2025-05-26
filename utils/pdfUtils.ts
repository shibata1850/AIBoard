import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getBestAvailableModel, getModelCapabilities, GeminiModel } from './modelCompatibility';

const FILE_API_THRESHOLD_BYTES = 1 * 1024 * 1024;
const MAX_CONTENT_LENGTH = 100000; // Limit content length to avoid API limits

/**
 * Fix Japanese encoding issues in text
 * @param text Text with potential encoding issues
 * @returns Fixed text
 */
export function fixJapaneseEncoding(text: string): string {
  if (!text) return text;
  
  let fixedText = text;
  
  // Common Japanese financial terms with encoding issues
  const encodingFixes: Record<string, string> = {
    'å£†ä‚Ø«': '売上高',
    'å£²ä¸Š': '売上',
    'å£²ä¸Šé«˜': '売上高',
    'å£²ä¸Šç·é¡': '売上総額',
    'å£²ä¸Šåç›Š': '売上利益',
    'ç·å£²ä¸Š': '総売上',
    'å©ç': '利益',
    'å–¶æ¥­åˆ©ç›Š': '営業利益',
    'çµŒå¸¸åˆ©ç›Š': '経常利益',
    'ç´"åˆ©ç›Š': '純利益',
    'å½"æœŸç´"åˆ©ç›Š': '当期純利益',
    'ç²åˆ©': '粗利',
    'å©ç›Šç‰‡': '利益率',
    'è³‡ç£': '資産',
    'æµå‹•è³‡ç£': '流動資産',
    'å›ºå®šè³‡ç£': '固定資産',
    'ç·è³‡ç£': '総資産',
    'è² å‚µ': '負債',
    'æµå‹•è² å‚µ': '流動負債',
    'å›ºå®šè² å‚µ': '固定負債',
    'ç·è² å‚µ': '総負債',
    'ç´"è³‡ç£': '純資産',
    'è³‡æœ¬é‡'': '資本金',
    'åˆ©ç›Šå‰°ä½™é‡'': '利益剰余金',
    'è²¸å€Ÿå¯¾ç…§è¡¨': '貸借対照表',
    'æ•ä¸Šè¨ˆç®—æ›¸': '損益計算書',
    'ã‚­ãƒ£ãƒƒã‚·ãƒ¥ãƒ•ãƒ­ãƒ¼è¨ˆç®—æ›¸': 'キャッシュフロー計算書',
    'è‡ªå·±è³‡æœ¬æ¯"çŽ‡': '自己資本比率',
    'æµå‹•æ¯"çŽ‡': '流動比率',
    'å£²ä¸Šé«˜å–¶æ¥­åˆ©ç›Šçœ‡': '売上高営業利益率',
    'ä‚å': '万円',
    'å†…éƒ¨': '内部',
    'å¤–éƒ¨': '外部',
    'è²©å£²è²»': '販売費',
    'ä¸€èˆ¬ç®¡ç†è²»': '一般管理費',
    'è²©å£²è²»åŠã³ä¸€èˆ¬ç®¡ç†è²»': '販売費及び一般管理費',
    'å£²ä¸Šåç›Š': '売上原価',
    'å£²ä¸Šç·åˆ©ç›Š': '売上総利益'
  };
  
  Object.entries(encodingFixes).forEach(([broken, fixed]) => {
    fixedText = fixedText.replace(new RegExp(escapeRegExp(broken), 'g'), fixed);
  });
  
  try {
    if (
      fixedText.includes('å') || 
      fixedText.includes('ä‚') || 
      fixedText.includes('ç') || 
      fixedText.includes('é') ||
      fixedText.includes('è')
    ) {
      try {
        const decoded = decodeURIComponent(escape(fixedText));
        if (
          decoded.includes('売') || 
          decoded.includes('利') || 
          decoded.includes('資') ||
          decoded.includes('円') ||
          decoded.includes('計')
        ) {
          console.log('Successfully decoded text using UTF-8');
          fixedText = decoded;
        }
      } catch (decodeError) {
        console.warn('UTF-8 decoding failed:', decodeError);
      }
    }
  } catch (encodingError) {
    console.warn('Error in encoding detection:', encodingError);
  }
  
  const charReplacements: Record<string, string> = {
    'å': '売',
    'ç': '資',
    'è': '負',
    'é': '高',
    'ä‚': '万',
    'æ': '損',
    'è²': '貸',
    'å€': '借',
    'ç…§': '照',
    'è¡¨': '表',
    'è¨ˆ': '計',
    'ç®—': '算',
    'æ›¸': '書',
    'åˆ©': '利',
    'ç›Š': '益',
    'å½"': '当',
    'æœŸ': '期',
    'ç´"': '純',
    'å–¶': '営',
    'æ¥­': '業',
    'çµŒ': '経',
    'å¸¸': '常',
    'ç·': '総',
    'é¡': '額',
    'æµ': '流',
    'å‹•': '動',
    'å›º': '固',
    'å®š': '定',
    'è‡ª': '自',
    'å·±': '己',
    'æ¯"': '比',
    'çŽ‡': '率'
  };
  
  Object.entries(charReplacements).forEach(([broken, fixed]) => {
    fixedText = fixedText.replace(new RegExp(escapeRegExp(broken), 'g'), fixed);
  });
  
  return fixedText;
}

/**
 * Escape special characters in a string for use in a regular expression
 * @param string String to escape
 * @returns Escaped string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract text from a PDF file
 * @param base64Content Base64 encoded PDF content
 * @returns Promise with extracted text
 */
export async function extractTextFromPdf(base64Content: string): Promise<string> {
  try {
    const pdfData = base64Content.startsWith('data:application/pdf;base64,')
      ? base64Content.substring('data:application/pdf;base64,'.length)
      : base64Content;
    
    let bytes;
    try {
      const binaryString = atob(pdfData);
      bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
    } catch (error) {
      console.warn('Error in base64 decoding, trying Buffer method:', error);
      bytes = Buffer.from(pdfData, 'base64');
    }
    
    const pdfDoc = await PDFDocument.load(bytes);
    const pageCount = pdfDoc.getPageCount();
    console.log(`PDF文書が正常に読み込まれました。ページ数: ${pageCount}`);
    
    try {
      const data = await pdfParse(Buffer.from(bytes), {
        max: 0, // 制限なし
        pagerender: undefined, // デフォルトのレンダラーを使用
      });
      
      let extractedText = data.text;
      
      extractedText = extractedText.replace(/\s+/g, ' ').trim();
      
      extractedText = fixJapaneseEncoding(extractedText);
      
      if (extractedText && extractedText.trim().length > 0) {
        console.log(`Successfully extracted ${extractedText.length} characters from PDF using standard method`);
        return extractedText;
      }
      
      console.warn('Standard PDF text extraction returned empty or very short text');
    } catch (parseError) {
      console.warn('Standard PDF parsing failed:', parseError);
    }
    
    console.log(`Attempting page-by-page extraction for ${pageCount} pages...`);
    let combinedText = '';
    
    for (let i = 0; i < pageCount; i++) {
      try {
        const pageBytes = await pdfDoc.save(); // 現在のページを含むPDFを保存
        const pageData = await pdfParse(Buffer.from(pageBytes), {
          max: 1,
          pagerender: undefined,
        });
        
        if (pageData.text && pageData.text.trim().length > 0) {
          let pageText = pageData.text.replace(/\s+/g, ' ').trim();
          
          pageText = fixJapaneseEncoding(pageText);
            
          combinedText += pageText + '\n\n';
          console.log(`Extracted ${pageData.text.length} characters from page ${i + 1}`);
        }
      } catch (pageError) {
        console.warn(`Error extracting text from page ${i + 1}:`, pageError);
      }
    }
    
    if (combinedText.trim().length > 0) {
      console.log(`Successfully extracted ${combinedText.length} characters using page-by-page method`);
      return combinedText;
    }
    
    return `PDF文書が正常に読み込まれました。ページ数: ${pageCount}\n\n` +
           `注: このPDFからテキストを抽出できませんでした。` +
           `このPDFは画像ベースのスキャン文書である可能性があります。` +
           `財務諸表の分析のために、テキスト形式のデータを提供してください。`;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('PDFの処理中にエラーが発生しました。別のファイルを試してください。');
  }
}

/**
 * Check if a file is a PDF based on its MIME type
 * @param mimeType File MIME type
 * @returns Boolean indicating if the file is a PDF
 */
export function isPdfFile(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

/**
 * Check if the extracted text contains valid financial content
 * @param text Extracted text from PDF
 * @returns Boolean indicating if the text contains financial content
 */
export function hasFinancialContent(text: string): boolean {
  if (!text || text.trim().length < 50) {
    return false;
  }
  
  const financialTerms = [
    '売上高', '利益', '営業利益', '経常利益', '当期純利益', 
    '資産', '負債', '純資産', '株主資本', '現金',
    '売掛金', '買掛金', '棚卸資産', '固定資産', '流動資産',
    '固定負債', '流動負債', '資本金', '利益剰余金', '配当',
    '財務諸表', '貸借対照表', '損益計算書', 'キャッシュフロー', '株式',
    '収益', '費用', '支出', '減価償却', '税金',
    '総資産', '自己資本比率', 'ROA', 'ROE', '売上高営業利益率'
  ];
  
  let foundTerms = 0;
  for (const term of financialTerms) {
    if (text.includes(term)) {
      foundTerms++;
      if (foundTerms >= 3) {
        console.log('財務コンテンツの検出: 検出されました ✓');
        return true;
      }
    }
  }
  
  console.log('財務コンテンツの検出: 検出されませんでした ✗');
  return false;
}

/**
 * Process PDF directly with Gemini 2.0 Flash
 * @param base64Content Base64 encoded PDF content
 * @param prompt Optional custom prompt to use with the PDF
 * @returns Promise with analysis text
 */
export async function processPdfWithGemini(
  base64Content: string, 
  prompt: string = '財務分析の専門家として、このPDFドキュメントを詳細に分析してください。財務状況、問題点、改善策を説明してください。'
): Promise<{ text: string }> {
  try {
    console.log(`PDFをGeminiで処理中...`);
    
    console.log('PDFからテキストを抽出中...');
    const extractedText = await extractTextFromPdf(base64Content);
    
    if (!extractedText || extractedText.length < 50) {
      console.warn('Failed to extract meaningful text from PDF');
      console.log('Falling back to direct PDF processing...');
    } else {
      console.log(`Successfully extracted text from PDF (${extractedText.length} chars)`);
      
      // Check if the extracted text contains financial content
      const isFinancial = hasFinancialContent(extractedText);
      
      const limitedText = extractedText.length > MAX_CONTENT_LENGTH 
        ? extractedText.substring(0, MAX_CONTENT_LENGTH) + '...(content truncated)'
        : extractedText;
      
      const enhancedPrompt = isFinancial 
        ? `
あなたは財務分析の専門家です。以下の財務文書を詳細に分析し、具体的な財務状況、問題点、改善策を説明してください。

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
`
        : `
あなたは文書分析の専門家です。以下の文書を分析し、主要なポイントと重要な情報を要約してください。
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
`;
      
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4';
      const genAI = new GoogleGenerativeAI(apiKey);
      
      try {
        console.log('Using text-based analysis with best available Gemini model');
        
        const textModelName = await getBestAvailableModel(apiKey, false);
        console.log(`Selected model for text analysis: ${textModelName}`);
        
        const model = genAI.getGenerativeModel({ 
          model: textModelName,
          generationConfig: {
            temperature: 0.4,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 8192,
          },
        });
        
        const result = await model.generateContent([enhancedPrompt, limitedText]);
        const response = await result.response;
        const text = response.text();
        
        console.log(`Successfully analyzed PDF text with ${textModelName} (response length: ${text.length} chars)`);
        return { text };
      } catch (error: any) {
        console.error(`Error processing extracted text with Gemini API: ${error.message}`);
      }
    }
    
    const estimatedSizeBytes = base64Content.length * 0.75; // Base64 encoding increases size by ~33%
    const useFileApi = estimatedSizeBytes > FILE_API_THRESHOLD_BYTES;
    
    // Get the optimal model for PDF processing
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4';
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Initialize with a default model in case getBestAvailableModel fails
    let bestModelName: string = GeminiModel.GEMINI_1_5_FLASH;
    
    try {
      console.log(`Using ${useFileApi ? 'File API' : 'direct processing'} for PDF analysis`);
      
      bestModelName = await getBestAvailableModel(apiKey, true);
      console.log(`Selected model for PDF analysis: ${bestModelName}`);
      
      const { supportsPdf } = getModelCapabilities(bestModelName);
      console.log(`選択されたモデル: ${bestModelName}, PDF対応: ${supportsPdf ? 'はい' : 'いいえ'}`);
      
      const model = genAI.getGenerativeModel({ 
        model: bestModelName,
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });
      
      let result;
      
      if (useFileApi) {
        console.warn('File API not supported in current version, falling back to direct processing');
        result = await model.generateContent([prompt, base64Content]);
      } else {
        result = await model.generateContent([prompt, base64Content]);
      }
      
      const response = await result.response;
      const text = response.text();
      
      console.log(`Gemini処理完了! 処理時間: ${((Date.now() - Date.now()) / 1000).toFixed(2)}秒`);
      return { text };
    } catch (error: any) {
      console.error(`Error processing PDF with ${bestModelName}:`, error);
      
      try {
        console.log('Primary model failed, trying alternative models...');
        
        const alternativeModels = [
          GeminiModel.GEMINI_1_5_FLASH,
          GeminiModel.GEMINI_1_5_PRO,
          GeminiModel.GEMINI_2_FLASH
        ].filter(m => m !== bestModelName);
        
        console.log(`Trying alternative models: ${alternativeModels.join(', ')}`);
        
        let fallbackModel = null;
        let fallbackModelName = null;
        
        for (const altModel of alternativeModels) {
          try {
            console.log(`Trying alternative model: ${altModel}`);
            const isAvailable = await isModelAvailable(apiKey, altModel);
            
            if (isAvailable) {
              fallbackModelName = altModel;
              fallbackModel = genAI.getGenerativeModel({ 
                model: fallbackModelName,
                generationConfig: {
                  temperature: 0.4,
                  topP: 0.8,
                  topK: 40,
                  maxOutputTokens: 8192,
                },
              });
              console.log(`Using alternative model: ${fallbackModelName}`);
              break;
            }
          } catch (altModelError) {
            console.warn(`Error with alternative model ${altModel}:`, altModelError);
          }
        }
        
        if (!fallbackModel) {
          console.warn('No alternative models available, using gemini-1.5-flash as last resort');
          fallbackModelName = GeminiModel.GEMINI_1_5_FLASH;
          fallbackModel = genAI.getGenerativeModel({ 
            model: fallbackModelName,
            generationConfig: {
              temperature: 0.4,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 8192,
            },
          });
        }
        
        const fallbackResult = await fallbackModel.generateContent([prompt, base64Content]);
        const fallbackResponse = await fallbackResult.response;
        const fallbackText = fallbackResponse.text();
        
        console.log(`Successfully analyzed PDF with ${fallbackModelName} (response length: ${fallbackText.length} chars)`);
        return { text: fallbackText };
      } catch (fallbackError: any) {
        console.error('Error with fallback model:', fallbackError);
        
        console.log('Using extracted text with regular analysis API...');
        try {
          const { analyzeDocument } = require('../utils/gemini');
          const analysisResult = await analyzeDocument(extractedText);
          return { text: analysisResult };
        } catch (analyzeError) {
          console.error('Error analyzing extracted text:', analyzeError);
          
          if (error.message.includes('model not found')) {
            // モデルが見つからない場合は別のモデルを試す
            return { text: '申し訳ありませんが、現在このモデルは利用できません。別のモデルで分析を試みています...' };
          } else if (error.message.includes('API key')) {
            // APIキーの問題の場合は明確なメッセージを返す
            return { text: 'APIキーの問題が発生しました。システム管理者にお問い合わせください。' };
          } else {
            // その他のエラーの場合は一般的なメッセージを返す
            return { text: '文書の分析中にエラーが発生しました。別のファイルを試すか、後でもう一度お試しください。' };
          }
        }
      }
    }
  } catch (error: any) {
    console.error('Error in processPdfWithGemini:', error);
    return { text: `PDF処理エラー: ${error.message}` };
  }
}
