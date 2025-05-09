import { Message } from '../types/chat';
import { generateChatResponse } from '../server/api/chat';
import { analyzeDocument as analyzeDocumentAPI } from '../server/api/analyze';

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
  try {
    const result = await analyzeDocumentAPI(content);
    
    if (!result.text) {
      console.error('Invalid API response:', result);
      throw new Error('無効な応答フォーマット: テキストフィールドがありません');
    }

    return result.text;
  } catch (error) {
    console.error('Error analyzing document:', error);
    if (error instanceof Error) {
      throw new Error(`文書分析エラー: ${error.message}`);
    }
    throw new Error('文書の分析中に予期せぬエラーが発生しました');
  }
}
