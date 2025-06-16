import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function getRelevantCompanyInfo(userMessage: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('company_info')
      .select('title, content, category')
      .or(`title.ilike.%${userMessage}%,content.ilike.%${userMessage}%`)
      .limit(3);

    if (error || !data || data.length === 0) {
      return '';
    }

    const companyContext = data
      .map(info => `【${info.category}】${info.title}\n${info.content}`)
      .join('\n\n');

    return `\n\n以下は関連する社内情報です：\n${companyContext}\n\n上記の社内情報を参考にして回答してください。`;
  } catch (error) {
    console.error('Error fetching company info:', error);
    return '';
  }
}

export async function generateChatResponse(messages: any[]) {
  try {
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid request: messages array is required');
    }
    
    console.log('Generating chat response with messages:', JSON.stringify(messages));
    
    const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    if (messages.length > 0 && !messages[0].isUser) {
      messages = [
        { id: 'dummy-user', text: '財務分析について教えてください', isUser: true, timestamp: Date.now() },
        ...messages
      ];
    }

    const lastUserMessage = messages.filter(msg => msg.isUser).pop();
    const companyContext = lastUserMessage ? await getRelevantCompanyInfo(lastUserMessage.text) : '';
    
    const formattedMessages = messages.map((msg, index) => {
      if (msg.isUser && index === messages.length - 1 && companyContext) {
        return {
          role: 'user',
          parts: [{ text: msg.text + companyContext }],
        };
      }
      return {
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.text }],
      };
    });
    
    console.log('Formatted messages:', JSON.stringify(formattedMessages));
    
    if (formattedMessages.length === 1) {
      console.log('Using generateContent for single message');
      const result = await model.generateContent(formattedMessages[0].parts[0].text);
      const response = await result.response;
      const text = response.text();
      console.log('Generated response:', text);
      return { text };
    }
    
    console.log('Using chat for multiple messages');
    const chat = model.startChat({
      history: formattedMessages.slice(0, -1),
    });
    
    const lastMessage = formattedMessages[formattedMessages.length - 1];
    console.log('Sending last message:', lastMessage.parts[0].text);
    
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = await result.response;
    const text = response.text();
    
    console.log('Generated response:', text);
    return { text };
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
}
