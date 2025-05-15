import OpenAI from 'openai';
import { preparePdfForAnalysis, extractTextFromPdf, analyzePdfFinancialData } from '../../utils/pdfUtils';

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
        console.log('PDF content detected, extracting text for analysis');
        const extractedText = await extractTextFromPdf(content);
        console.log('PDF text extraction successful');
        
        decodedContent = extractedText;
        
        pdfData = await preparePdfForAnalysis(content);
        console.log(`PDF prepared successfully. Page count: ${pdfData.pageCount}`);
      } catch (pdfError) {
        console.error('Error processing PDF:', pdfError);
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
    
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
    
    const model = process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4.1';
    console.log(`Using OpenAI model: ${model}`);
    
    const prompt = `
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
    
    const shortPrompt = `
    以下の財務文書を簡潔に分析してください：
    ${decodedContent}
    `;
    
    try {
      console.log('Attempting analysis with OpenAI');
      
      const messages = [
        {
          role: 'system',
          content: 'あなたは財務分析の専門家です。提供された文書を分析してください。'
        },
        {
          role: 'user',
          content: prompt
        }
      ];
      
      const completion = await openai.chat.completions.create({
        model: model,
        messages: messages as any,
        temperature: 0.2,
        max_tokens: 2048,
      });
      
      const text = completion.choices[0]?.message?.content || '';
      console.log('OpenAI analysis successful');
      return { text };
    } catch (primaryError: any) {
      console.warn('OpenAI error:', primaryError);
      
      if (isQuotaOrRateLimitError(primaryError)) {
        console.log('Quota/rate limit detected, retrying with shorter prompt...');
        
        try {
          const messages = [
            {
              role: 'system',
              content: 'あなたは財務分析の専門家です。提供された文書を簡潔に分析してください。'
            },
            {
              role: 'user',
              content: shortPrompt
            }
          ];
          
          const completion = await openai.chat.completions.create({
            model: model,
            messages: messages as any,
            temperature: 0.3,
            max_tokens: 1024,
          });
          
          const text = completion.choices[0]?.message?.content || '';
          console.log('OpenAI retry with shorter prompt successful');
          return { text };
        } catch (retryError: any) {
          console.error('OpenAI retry failed:', retryError);
          throw new Error('APIの制限に達しました。しばらく時間をおいてから再度お試しください。');
        }
      } else {
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            const backoffTime = RETRY_DELAY_MS * Math.pow(2, attempt);
            console.log(`Retrying with OpenAI (attempt ${attempt + 1}) after ${backoffTime}ms delay...`);
            await sleep(backoffTime); // 指数バックオフ
            
            const messages = [
              {
                role: 'system',
                content: 'あなたは財務分析の専門家です。提供された文書を分析してください。'
              },
              {
                role: 'user',
                content: attempt === 0 ? prompt : shortPrompt
              }
            ];
            
            const completion = await openai.chat.completions.create({
              model: model,
              messages: messages as any,
              temperature: 0.2 + (attempt * 0.1), // 徐々に温度を上げる
              max_tokens: 2048 - (attempt * 512), // 徐々にトークン数を減らす
            });
            
            const text = completion.choices[0]?.message?.content || '';
            console.log(`Retry ${attempt + 1} successful`);
            return { text };
          } catch (retryError) {
            console.warn(`Retry ${attempt + 1} failed:`, retryError);
            
            if (attempt === MAX_RETRIES - 1) {
              console.error('All retries failed');
              throw new Error('文書の分析中にエラーが発生しました。しばらく時間をおいてから再度お試しください。');
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
