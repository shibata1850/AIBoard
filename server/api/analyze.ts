import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple inline implementation of isQuotaOrRateLimitError to avoid dependency
function isQuotaOrRateLimitError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || '';
  const errorString = JSON.stringify(error).toLowerCase();
  
  return (
    errorMessage.includes('quota') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many requests') ||
    errorMessage.includes('exceeded') ||
    errorMessage.includes('limit') ||
    errorString.includes('quota') ||
    errorString.includes('rate limit') ||
    errorString.includes('too many requests') ||
    errorString.includes('exceeded') ||
    errorString.includes('limit')
  );
}

export async function analyzeDocument(content: string) {
  try {
    console.log(`Analyzing document with content length: ${content.length}`);
    
    // Try to decode if it's a base64 string
    let decodedContent = content;
    try {
      if (content.match(/^[A-Za-z0-9+/=]+$/)) {
        const buff = Buffer.from(content, 'base64');
        decodedContent = buff.toString('utf-8');
        console.log(`Successfully decoded Base64 content (length: ${decodedContent.length})`);
      }
    } catch (decodeError) {
      console.warn('Failed to decode content as Base64, using original content:', decodeError);
    }
    
    // Hardcoded API key to ensure it's used
    const apiKey = 'AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4';
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const prompt = `
    あなたは財務分析の専門家です。以下の文書を分析し、財務状況、経営状態、改善点などについて詳細に解説してください。
    特に以下の点に注目してください：
    1. 売上高と利益率の推移
    2. 財務健全性（負債比率、流動比率など）
    3. 資金繰り状況
    4. 経営効率（ROA、ROEなど）
    5. 改善すべき点と具体的な提案
    
    分析結果は以下の形式で出力してください：
    
    
    [全体的な財務状況の要約]
    
    [分析内容]
    
    [分析内容]
    
    [分析内容]
    
    [分析内容]
    
    [具体的な改善点と提案]
    
    [まとめと今後の見通し]
    
    以下が分析対象の文書です：
    ${decodedContent}
    `;
    
    // Try with gemini-1.5-flash first
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });
      
      console.log('Sending request to gemini-1.5-flash model...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Successfully generated analysis with gemini-1.5-flash');
      return { text };
    } catch (flashError) {
      console.error('Error with gemini-1.5-flash model:', flashError);
      
      // If it's a quota/rate limit error, try with gemini-1.5-pro
      if (isQuotaOrRateLimitError(flashError)) {
        try {
          console.log('Quota/rate limit detected, trying with gemini-1.5-pro model...');
          
          const fallbackModel = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-pro',
            generationConfig: {
              temperature: 0.5,  // Slightly higher temperature for the fallback
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 8192,
            },
          });
          
          const fallbackResult = await fallbackModel.generateContent(prompt);
          const fallbackResponse = await fallbackResult.response;
          const fallbackText = fallbackResponse.text();
          
          console.log('Successfully generated analysis with gemini-1.5-pro');
          return { text: fallbackText };
        } catch (fallbackError) {
          console.error('Error with gemini-1.5-pro model:', fallbackError);
          
          // If it's still a quota/rate limit error, try with gemini-pro as last resort
          if (isQuotaOrRateLimitError(fallbackError)) {
            try {
              console.log('Quota/rate limit detected, trying with gemini-pro model as last resort...');
              
              const lastResortModel = genAI.getGenerativeModel({ 
                model: 'gemini-pro',
                generationConfig: {
                  temperature: 0.6,  // Even higher temperature for the last resort
                  topP: 0.9,
                  topK: 40,
                  maxOutputTokens: 4096,  // gemini-pro has lower token limit
                },
              });
              
              const lastResortResult = await lastResortModel.generateContent(prompt);
              const lastResortResponse = await lastResortResult.response;
              const lastResortText = lastResortResponse.text();
              
              console.log('Successfully generated analysis with gemini-pro');
              return { text: lastResortText };
            } catch (lastResortError) {
              console.error('All models failed with quota/rate limit errors');
              throw new Error('すべてのAPIモデルが制限に達しました。しばらく時間をおいてから再度お試しください。(30分程度後に再試行することをお勧めします)');
            }
          }
          throw fallbackError;
        }
      }
      
      // If it's not a quota/rate limit error, try with a higher temperature
      try {
        console.log('Trying again with gemini-1.5-flash and higher temperature...');
        
        const retryModel = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.7,  // Higher temperature for retry
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 8192,
          },
        });
        
        const retryResult = await retryModel.generateContent(prompt);
        const retryResponse = await retryResult.response;
        const retryText = retryResponse.text();
        
        console.log('Successfully generated analysis with gemini-1.5-flash (higher temperature)');
        return { text: retryText };
      } catch (retryError) {
        console.error('Error with gemini-1.5-flash retry:', retryError);
        throw retryError;
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
