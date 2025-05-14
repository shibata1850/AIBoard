import { GoogleGenerativeAI } from '@google/generative-ai';
import { preparePdfForAnalysis } from '../../utils/pdfUtils';

const MODELS = {
  PRIMARY: 'gemini-2.5-pro', // Gemini 2.5 Pro for PDF processing
  FALLBACK_1: 'gemini-1.5-flash',
  FALLBACK_2: 'gemini-pro',
  FALLBACK_3: 'gemini-1.0-pro',
  LAST_RESORT: 'gemini-pro-vision', // 最終手段として使用
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const MAX_CONTENT_LENGTH = 10000; // 長すぎる文書を制限
const PDF_CONTENT_PREFIX = 'data:application/pdf;base64,';

/**
 * 指定された時間だけ待機する
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * クォータエラーかどうかを判定する
 */
function isQuotaOrRateLimitError(error: any): boolean {
  if (!error || !error.message) return false;
  
  const errorMsg = error.message.toLowerCase();
  const quotaPatterns = [
    'quota',
    'rate limit',
    '429',
    'too many requests',
    'exceeded',
    'limit',
    'throttle',
    'capacity',
    'overloaded',
    'busy',
    'try again later',
    'temporary',
    'unavailable'
  ];
  
  return quotaPatterns.some(pattern => errorMsg.includes(pattern));
}

/**
 * 文書を分析する
 */
export async function analyzeDocument(content: string) {
  try {
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid request: content string is required');
    }
    
    const isPdf = content.startsWith(PDF_CONTENT_PREFIX) || 
                 (content.startsWith('data:') && content.includes('application/pdf'));
    
    let decodedContent = content;
    let pdfData = null;
    
    if (isPdf) {
      try {
        console.log('PDF content detected, preparing for Gemini 2.5 Pro analysis');
        pdfData = await preparePdfForAnalysis(content);
        console.log(`PDF prepared successfully. Page count: ${pdfData.pageCount}`);
      } catch (pdfError) {
        console.error('Error preparing PDF:', pdfError);
        throw new Error('PDFの処理中にエラーが発生しました。別のファイルを試してください。');
      }
    } else {
      try {
        if (/^[A-Za-z0-9+/=]+$/.test(content)) {
          const buffer = Buffer.from(content, 'base64');
          decodedContent = buffer.toString('utf-8');
          console.log('Successfully decoded Base64 content');
        }
        
        if (decodedContent.length > MAX_CONTENT_LENGTH) {
          console.warn(`Content too long (${decodedContent.length} chars), truncating to ${MAX_CONTENT_LENGTH} chars`);
          decodedContent = decodedContent.substring(0, MAX_CONTENT_LENGTH);
        }
      } catch (decodeError) {
        console.warn('Failed to decode content as Base64, using original content:', decodeError);
      }
    }
    
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const prompt = isPdf ? `
    あなたは財務分析の専門家です。添付されたPDFファイルを分析し、財務状況、経営状態、改善点などについて詳細に解説してください。
    特に以下の点に注目してください：
    1. 財務健全性
    2. 収益性
    3. 成長性
    4. リスク要因
    5. 改善のための具体的なアドバイス
    ` : `
    あなたは財務分析の専門家です。以下の文書を分析し、財務状況、経営状態、改善点などについて詳細に解説してください。
    特に以下の点に注目してください：
    1. 財務健全性
    2. 収益性
    3. 成長性
    4. リスク要因
    5. 改善のための具体的なアドバイス

    文書：
    ${decodedContent}
    `;
    
    const shortPrompt = isPdf ? `
    添付されたPDFファイルの財務データを簡潔に分析してください。
    ` : `
    以下の財務文書を簡潔に分析してください：
    ${decodedContent}
    `;
    
    try {
      console.log(`Attempting analysis with primary model: ${MODELS.PRIMARY}`);
      const primaryModel = genAI.getGenerativeModel({ 
        model: MODELS.PRIMARY,
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      });
      
      let result;
      if (isPdf && pdfData) {
        console.log('Using Gemini 2.5 Pro for direct PDF analysis');
        result = await primaryModel.generateContent({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                { inlineData: { mimeType: 'application/pdf', data: pdfData.base64Data } }
              ]
            }
          ]
        });
      } else {
        result = await primaryModel.generateContent(prompt);
      }
      
      const response = await result.response;
      const text = response.text();
      console.log('Primary model analysis successful');
      return { text };
    } catch (primaryError: any) {
      console.warn(`Primary model (${MODELS.PRIMARY}) error:`, primaryError);
      
      if (isQuotaOrRateLimitError(primaryError)) {
        console.log('Quota/rate limit detected for primary model, trying first fallback model...');
        
        try {
          const fallbackModel1 = genAI.getGenerativeModel({ 
            model: MODELS.FALLBACK_1,
            generationConfig: {
              temperature: 0.2,
              topP: 0.8,
              maxOutputTokens: 2048,
            }
          });
          
          let result;
          if (isPdf && pdfData) {
            console.log('Using fallback model 1 for PDF analysis');
            result = await fallbackModel1.generateContent({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: prompt },
                    { inlineData: { mimeType: 'application/pdf', data: pdfData.base64Data } }
                  ]
                }
              ]
            });
          } else {
            result = await fallbackModel1.generateContent(prompt);
          }
          
          const response = await result.response;
          const text = response.text();
          console.log('First fallback model analysis successful');
          return { text };
        } catch (fallback1Error: any) {
          console.warn(`First fallback model (${MODELS.FALLBACK_1}) error:`, fallback1Error);
          
          if (isQuotaOrRateLimitError(fallback1Error)) {
            console.log('Quota/rate limit detected for first fallback model, trying second fallback model...');
            
            try {
              const fallbackModel2 = genAI.getGenerativeModel({ 
                model: MODELS.FALLBACK_2,
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 1024,
                }
              });
              
              let result;
              if (isPdf && pdfData) {
                console.log('Using fallback model 2 for PDF analysis');
                result = await fallbackModel2.generateContent({
                  contents: [
                    {
                      role: 'user',
                      parts: [
                        { text: shortPrompt },
                        { inlineData: { mimeType: 'application/pdf', data: pdfData.base64Data } }
                      ]
                    }
                  ]
                });
              } else {
                result = await fallbackModel2.generateContent(shortPrompt);
              }
              
              const response = await result.response;
              const text = response.text();
              console.log('Second fallback model analysis successful');
              return { text };
            } catch (fallback2Error: any) {
              console.error('Second fallback model error:', fallback2Error);
              
              if (isQuotaOrRateLimitError(fallback2Error)) {
                console.log('Trying last resort model with minimal prompt...');
                try {
                  const lastResortModel = genAI.getGenerativeModel({ 
                    model: MODELS.LAST_RESORT,
                    generationConfig: {
                      temperature: 0.4,
                      maxOutputTokens: 512,
                    }
                  });
                  
                  let result;
                  if (isPdf && pdfData) {
                    console.log('Using last resort model for PDF analysis');
                    const minimalPdfPrompt = '財務分析を簡潔に行ってください。';
                    result = await lastResortModel.generateContent({
                      contents: [
                        {
                          role: 'user',
                          parts: [
                            { text: minimalPdfPrompt },
                            { inlineData: { mimeType: 'application/pdf', data: pdfData.base64Data } }
                          ]
                        }
                      ]
                    });
                  } else {
                    const minimalPrompt = `財務分析: ${decodedContent.substring(0, 2000)}`;
                    result = await lastResortModel.generateContent(minimalPrompt);
                  }
                  
                  const response = await result.response;
                  const text = response.text();
                  console.log('Last resort model analysis successful');
                  return { text };
                } catch (lastResortError) {
                  console.error('All models failed with quota/rate limit errors');
                  throw new Error('すべてのAPIモデルが制限に達しました。しばらく時間をおいてから再度お試しください。(30分程度後に再試行することをお勧めします)');
                }
              }
              throw fallback2Error;
            }
          }
          throw fallback1Error;
        }
      } else {
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            const backoffTime = RETRY_DELAY_MS * Math.pow(2, attempt);
            console.log(`Retrying with primary model (attempt ${attempt + 1}) after ${backoffTime}ms delay...`);
            await sleep(backoffTime); // 指数バックオフ
            
            const primaryModel = genAI.getGenerativeModel({ 
              model: MODELS.PRIMARY,
              generationConfig: {
                temperature: 0.2 + (attempt * 0.1), // 徐々に温度を上げる
                maxOutputTokens: 2048,
              }
            });
            
            let result;
            if (isPdf && pdfData) {
              console.log(`Using Gemini 2.5 Pro for PDF analysis (retry ${attempt + 1})`);
              result = await primaryModel.generateContent({
                contents: [
                  {
                    role: 'user',
                    parts: [
                      { text: prompt },
                      { inlineData: { mimeType: 'application/pdf', data: pdfData.base64Data } }
                    ]
                  }
                ]
              });
            } else {
              result = await primaryModel.generateContent(prompt);
            }
            
            const response = await result.response;
            const text = response.text();
            console.log(`Retry ${attempt + 1} successful`);
            return { text };
          } catch (retryError) {
            console.warn(`Retry ${attempt + 1} failed:`, retryError);
            
            if (attempt === MAX_RETRIES - 1) {
              console.log('All retries failed, trying fallback model as last resort...');
              try {
                const fallbackModel = genAI.getGenerativeModel({ 
                  model: MODELS.FALLBACK_1,
                  generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1024,
                  }
                });
                
                let result;
                if (isPdf && pdfData) {
                  console.log('Using fallback model after retries for PDF analysis');
                  result = await fallbackModel.generateContent({
                    contents: [
                      {
                        role: 'user',
                        parts: [
                          { text: shortPrompt },
                          { inlineData: { mimeType: 'application/pdf', data: pdfData.base64Data } }
                        ]
                      }
                    ]
                  });
                } else {
                  result = await fallbackModel.generateContent(shortPrompt);
                }
                
                const response = await result.response;
                const text = response.text();
                console.log('Fallback after retries successful');
                return { text };
              } catch (finalError) {
                console.error('Final fallback attempt failed:', finalError);
                throw finalError;
              }
            }
          }
        }
        
        throw primaryError;
      }
    }
  } catch (error: any) {
    console.error('Document analysis API error:', error);
    
    const errorMessage = error.message || '文書の分析中にエラーが発生しました';
    let userFriendlyMessage = '文書の分析中にエラーが発生しました。しばらく時間をおいてから再度お試しください。';
    
    if (errorMessage.includes('API') || errorMessage.includes('制限') || isQuotaOrRateLimitError(error)) {
      userFriendlyMessage = 'APIの制限に達しました。30分程度時間をおいてから再度お試しください。より小さなファイルを使用すると成功する可能性が高くなります。';
    } else if (errorMessage.includes('content')) {
      userFriendlyMessage = '文書の内容を処理できませんでした。別の形式や小さなサイズのファイルをお試しください。';
    }
    
    throw new Error(userFriendlyMessage);
  }
}
