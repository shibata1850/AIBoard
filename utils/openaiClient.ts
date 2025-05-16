import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Enable browser usage with proper security considerations
});

/**
 * Generate chat response using OpenAI API
 * This is a client-side compatible version that uses fetch instead of direct OpenAI SDK calls
 */
export async function generateChatResponse(messages: any[]) {
  try {
    const apiBaseUrl = process.env.EXPO_PUBLIC_CHAT_API_BASE_URL || '';
    console.log('Making API request to:', `${apiBaseUrl}/api/chat`);

    const response = await fetch(`${apiBaseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      console.error('API request failed:', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`APIリクエストが失敗しました (Status: ${response.status})`);
    }

    const data = await response.json();
    
    if (!data.text) {
      console.error('Invalid API response:', data);
      throw new Error('無効な応答フォーマット: テキストフィールドがありません');
    }

    return data.text;
  } catch (error) {
    console.error('Error generating chat response:', error);
    if (error instanceof Error) {
      throw new Error(`チャットエラー: ${error.message}`);
    }
    throw new Error('チャット応答の生成中に予期せぬエラーが発生しました');
  }
}

/**
 * Analyze document using OpenAI API
 * This is a client-side compatible version that uses fetch instead of direct OpenAI SDK calls
 */
export async function analyzeDocument(content: string) {
  try {
    const apiBaseUrl = process.env.EXPO_PUBLIC_CHAT_API_BASE_URL || '';
    console.log('Making API request to:', `${apiBaseUrl}/api/analyze`);

    const response = await fetch(`${apiBaseUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      console.error('API request failed:', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`文書分析が失敗しました (Status: ${response.status})`);
    }

    const data = await response.json();

    if (!data.text) {
      console.error('Invalid API response:', data);
      throw new Error('無効な応答フォーマット: テキストフィールドがありません');
    }

    return data.text;
  } catch (error) {
    console.error('Error analyzing document:', error);
    if (error instanceof Error) {
      throw new Error(`文書分析エラー: ${error.message}`);
    }
    throw new Error('文書の分析中に予期せぬエラーが発生しました');
  }
}
