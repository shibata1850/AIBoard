import { GoogleGenerativeAI } from '@google/generative-ai';

export async function analyzeDocument(content: string) {
  try {
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid request: content string is required');
    }
    
    let decodedContent = content;
    try {
      if (/^[A-Za-z0-9+/=]+$/.test(content)) {
        const buffer = Buffer.from(content, 'base64');
        decodedContent = buffer.toString('utf-8');
        console.log('Successfully decoded Base64 content');
      }
    } catch (decodeError) {
      console.warn('Failed to decode content as Base64, using original content:', decodeError);
    }
    
    const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
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
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return { text };
  } catch (error) {
    console.error('Document analysis API error:', error);
    throw error;
  }
}
