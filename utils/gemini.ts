import { Message } from '../types/chat';
import { generateChatResponse } from '../server/api/chat';
import { analyzeDocument as analyzeDocumentAPI } from '../server/api/analyze';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

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

export async function generateFreeChatResponse(messages: Message[]): Promise<string> {
  try {
    const result = await generateChatResponse(messages);
    
    if (!result.text) {
      console.error('Invalid API response:', result);
      throw new Error('無効な応答フォーマット: テキストフィールドがありません');
    }

    return result.text;
  } catch (error) {
    console.error('Error generating chat response:', error);
    if (error instanceof Error) {
      throw new Error(`チャットエラー: ${error.message}`);
    }
    throw new Error('チャット応答の生成中に予期せぬエラーが発生しました');
  }
}

export async function analyzeDocument(content: string): Promise<string> {
  let lastError: any = null;
  
  if (content.length > 50000) {
    console.warn(`Content too large (${content.length} chars), truncating to 50000 chars`);
    content = content.substring(0, 50000);
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const contentHash = Math.abs(hash).toString(36).substring(0, 32);
  
  try {
    const { supabase } = require('../utils/supabase');
    const { data: cachedResult } = await supabase
      .from('document_analyses')
      .select('content')
      .eq('content_hash', contentHash)
      .single();
    
    if (cachedResult) {
      console.log('Using cached analysis result');
      return cachedResult.content;
    }
  } catch (cacheError) {
    console.log('Cache check failed, proceeding with fresh analysis:', cacheError);
  }
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} to analyze document (content length: ${content.length})`);
      
      const result = await analyzeDocumentAPI(content);
      
      if (!result.text) {
        console.error('Invalid API response:', result);
        throw new Error('無効な応答フォーマット: テキストフィールドがありません');
      }

      try {
        const { supabase } = require('../utils/supabase');
        await supabase
          .from('document_analyses')
          .insert({
            id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            content_hash: contentHash,
            content: result.text,
            created_at: new Date().toISOString()
          });
        console.log('Analysis result cached successfully');
      } catch (cacheInsertError) {
        console.warn('Failed to cache result:', cacheInsertError);
      }

      return result.text;
    } catch (error) {
      lastError = error;
      console.error(`Error analyzing document (attempt ${attempt + 1}):`, error);
      
      if (isQuotaOrRateLimitError(error)) {
        console.log(`Quota/rate limit detected, waiting ${RETRY_DELAY_MS * (attempt + 1)}ms before retry...`);
        
        if (attempt === MAX_RETRIES - 1) {
          throw new Error('APIの制限に達しました。しばらく時間をおいてから再度お試しください。より小さなファイルを使用すると成功する可能性が高くなります。');
        }
        
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
      
      if (error instanceof Error) {
        throw new Error(`文書分析エラー: ${error.message}`);
      }
      throw new Error('文書の分析中に予期せぬエラーが発生しました');
    }
  }
  
  if (lastError instanceof Error) {
    throw new Error(`文書分析エラー: ${lastError.message}`);
  }
  throw new Error('文書の分析中に予期せぬエラーが発生しました');
}
