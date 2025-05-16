import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

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
 * OpenAI APIを使用してチャット応答を生成する
 */
export async function generateChatResponse(messages: any[]) {
  try {
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid request: messages array is required');
    }
    
    console.log('Generating chat response with OpenAI API');
    
    const formattedMessages = messages.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text,
    }));
    
    const systemMessage = {
      role: 'system',
      content: '中小企業向けの財務アドバイザーとして、財務諸表の分析や経営アドバイスを提供します。専門的かつ実用的な回答を心がけてください。'
    };
    
    const apiMessages = [systemMessage, ...formattedMessages];
    
    console.log('Formatted messages for OpenAI:', JSON.stringify(apiMessages));
    
    const completion = await openai.chat.completions.create({
      model: process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4.1',
      messages: apiMessages as any,
      temperature: 0.2,
      max_tokens: 2048,
    });
    
    console.log('OpenAI API response received');
    
    const text = completion.choices[0]?.message?.content || '';
    return { text };
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
}

/**
 * OpenAI APIを使用して文書を分析する
 */
export async function analyzeDocument(content: string) {
  try {
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid request: content string is required');
    }
    
    let decodedContent = content;
    try {
      if (/^[A-Za-z0-9+/=]+$/.test(content)) {
        try {
          if (typeof Buffer !== 'undefined') {
            const buffer = Buffer.from(content, 'base64');
            decodedContent = buffer.toString('utf-8');
            console.log('Successfully decoded Base64 content using Buffer');
          } else {
            decodedContent = atob(content);
            console.log('Successfully decoded Base64 content using atob');
          }
        } catch (decodeError) {
          console.warn('Failed to decode base64 content:', decodeError);
        }
      }
      
      if (decodedContent.length > 10000) {
        console.warn(`Content too long (${decodedContent.length} chars), truncating to 10000 chars`);
        decodedContent = decodedContent.substring(0, 10000);
      }
    } catch (decodeError) {
      console.warn('Failed to decode content as Base64, using original content:', decodeError);
    }
    
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
    
    try {
      console.log('Attempting analysis with OpenAI API');
      
      const completion = await openai.chat.completions.create({
        model: process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4.1',
        messages: [
          {
            role: 'system',
            content: '中小企業向けの財務アドバイザーとして、財務諸表の分析や経営アドバイスを提供します。専門的かつ実用的な回答を心がけてください。'
          },
          {
            role: 'user',
            content: prompt
          }
        ] as any,
        temperature: 0.2,
        max_tokens: 2048,
      });
      
      const text = completion.choices[0]?.message?.content || '';
      console.log('OpenAI analysis successful');
      return { text };
    } catch (primaryError: any) {
      console.warn('OpenAI API error:', primaryError);
      
      if (isQuotaOrRateLimitError(primaryError)) {
        console.log('Quota/rate limit detected, retrying with fallback settings...');
        
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            const backoffTime = RETRY_DELAY_MS * Math.pow(2, attempt);
            console.log(`Retrying with OpenAI API (attempt ${attempt + 1}) after ${backoffTime}ms delay...`);
            await sleep(backoffTime);
            
            const completion = await openai.chat.completions.create({
              model: 'gpt-3.5-turbo', // フォールバックとして古いモデルを使用
              messages: [
                {
                  role: 'system',
                  content: '中小企業向けの財務アドバイザーとして、財務諸表の分析や経営アドバイスを提供します。'
                },
                {
                  role: 'user',
                  content: `以下の財務文書を簡潔に分析してください：\n${decodedContent.substring(0, 5000)}`
                }
              ] as any,
              temperature: 0.3,
              max_tokens: 1024,
            });
            
            const text = completion.choices[0]?.message?.content || '';
            console.log(`Retry ${attempt + 1} successful`);
            return { text };
          } catch (retryError) {
            console.warn(`Retry ${attempt + 1} failed:`, retryError);
            
            if (attempt === MAX_RETRIES - 1) {
              throw new Error('すべてのAPIモデルが制限に達しました。しばらく時間をおいてから再度お試しください。(30分程度後に再試行することをお勧めします)');
            }
          }
        }
      }
      
      throw primaryError;
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
