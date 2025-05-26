import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from '../../types/chat';

export async function generateChatResponse(messages: Message[]) {
  try {
    console.log('Generating chat response with messages:', JSON.stringify(messages));
    
    const apiKey = process.env.GEMINI_API_KEY || 
                  process.env.EXPO_PUBLIC_GEMINI_API_KEY || 
                  process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      throw new Error('APIキーが設定されていません。システム管理者にお問い合わせください。');
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    if (messages.length > 0 && !messages[0].isUser) {
      messages.unshift({
        id: 'system-prompt',
        text: 'あなたは経営コンサルタントAIです。ユーザーの質問に対して、経営や財務の専門知識を活かして回答してください。',
        isUser: false,
        timestamp: Date.now(),
      });
    }
    
    const history = messages.map((msg, index) => ({
      role: (index === 0) ? 'user' : (msg.isUser ? 'user' : 'model'), // Force first message to be user
      parts: [{ text: msg.text }],
    }));
    
    const chat = model.startChat({
      history: history.slice(0, -1),
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });
    
    const result = await chat.sendMessage(messages[messages.length - 1].text);
    const response = await result.response;
    const text = response.text();
    
    console.log('Generated response:', text);
    return { text };
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
}
