import OpenAI from 'openai';

export async function generateChatResponse(messages: any[]) {
  try {
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid request: messages array is required');
    }
    
    console.log('Generating chat response with messages:', JSON.stringify(messages));
    
    const openai = new OpenAI({
      apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
      dangerouslyAllowBrowser: true,
    });
    
    if (messages.length > 0 && !messages[0].isUser) {
      messages = [
        { id: 'dummy-user', text: '財務分析について教えてください', isUser: true, timestamp: Date.now() },
        ...messages
      ];
    }
    
    const formattedMessages = messages.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text,
    }));
    
    console.log('Formatted messages:', JSON.stringify(formattedMessages));
    
    const model = process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4.1';
    console.log(`Using OpenAI model: ${model}`);
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: formattedMessages as any,
      temperature: 0.2,
      max_tokens: 2048,
    });
    
    const text = completion.choices[0]?.message?.content || '';
    console.log('Generated response:', text);
    return { text };
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
}
