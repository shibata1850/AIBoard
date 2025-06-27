import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChainOfThoughtPrompts } from '../../utils/chainOfThoughtPrompts';
import { ExtractedFinancialData } from '../../types/financialStatements';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const MODELS = {
  PRIMARY: 'gemini-1.5-flash',
  FALLBACK_1: 'gemini-pro',
  FALLBACK_2: 'gemini-1.0-pro',
  LAST_RESORT: 'gemini-pro-vision', // 最終手段として使用
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const MAX_CONTENT_LENGTH = 10000; // 長すぎる文書を制限

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
    
    let decodedContent = content;
    try {
      if (/^[A-Za-z0-9+/=]+$/.test(content)) {
        if (typeof Buffer !== 'undefined') {
          const buffer = Buffer.from(content, 'base64');
          decodedContent = buffer.toString('utf-8');
          console.log('Successfully decoded Base64 content using Buffer (Node.js)');
        } else {
          try {
            const binaryString = atob(content);
            decodedContent = decodeURIComponent(escape(binaryString));
            console.log('Successfully decoded Base64 content using atob (browser)');
          } catch (atobError) {
            console.warn('atob decoding failed, using content as-is:', atobError);
            decodedContent = content;
          }
        }
      }
      
      if (decodedContent.length > MAX_CONTENT_LENGTH) {
        console.warn(`Content too long (${decodedContent.length} chars), truncating to ${MAX_CONTENT_LENGTH} chars`);
        decodedContent = decodedContent.substring(0, MAX_CONTENT_LENGTH);
      }
    } catch (decodeError) {
      console.warn('Failed to decode content as Base64, using original content:', decodeError);
    }
    
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);

    if (/^[A-Za-z0-9+/=]+$/.test(content) && content.length > 1000) {
      console.log('Attempting to extract structured data from PDF...');
      const structuredData = await extractStructuredDataFromPdf(content);
      
      if (structuredData && structuredData.statements && structuredData.ratios) {
        console.log('Using Chain of Thought analysis for extracted structured financial data');
        const analysisResult = await performChainOfThoughtAnalysis(structuredData, genAI);
        return { text: analysisResult };
      }
    }

    try {
      const structuredData = JSON.parse(decodedContent);
      if (structuredData.statements && structuredData.ratios) {
        console.log('Using Chain of Thought analysis for structured financial data');
        const analysisResult = await performChainOfThoughtAnalysis(structuredData, genAI);
        return { text: analysisResult };
      }
    } catch (parseError) {
      console.log('Content is not structured data, using traditional analysis');
    }
    
    const prompt = `
    あなたは財務分析の専門家です。以下の文書を分析し、財務状況、経営状態、改善点などについて詳細に解説してください。
    特に以下の点に注目してください：
    1. 財務健全性（負債比率、流動比率の正確な計算）
    2. 収益性（経常利益・損失の正確な識別）
    3. 成長性
    4. セグメント情報の活用（附属病院セグメントの業務損益など）
    5. リスク要因
    6. 改善のための具体的なアドバイス

    重要：負債比率、流動比率、経常損失、当期純損失の数値は正確に抽出・計算してください。

    文書：
    ${decodedContent}
    `;
    
    const shortPrompt = `
    以下の財務文書を簡潔に分析してください：
    ${decodedContent}
    `;
    
    try {
      console.log(`Attempting analysis with primary model: ${MODELS.PRIMARY}`);
      const primaryModel = genAI.getGenerativeModel({ 
        model: MODELS.PRIMARY,
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      });
      
      const result = await primaryModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('Primary model analysis successful');
      return { text };
    } catch (primaryError: any) {
      console.warn(`Primary model (${MODELS.PRIMARY}) error:`, primaryError);
      
      if (isQuotaOrRateLimitError(primaryError)) {
        console.log('Quota/rate limit detected for primary model, trying first fallback model...');
        
        try {
          const fallbackModel1 = genAI.getGenerativeModel({ 
            model: MODELS.FALLBACK_1,
            generationConfig: {
              temperature: 0.2,
              topP: 0.8,
              maxOutputTokens: 2048,
            }
          });
          
          const result = await fallbackModel1.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          console.log('First fallback model analysis successful');
          return { text };
        } catch (fallback1Error: any) {
          console.warn(`First fallback model (${MODELS.FALLBACK_1}) error:`, fallback1Error);
          
          if (isQuotaOrRateLimitError(fallback1Error)) {
            console.log('Quota/rate limit detected for first fallback model, trying second fallback model...');
            
            try {
              const fallbackModel2 = genAI.getGenerativeModel({ 
                model: MODELS.FALLBACK_2,
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 1024,
                }
              });
              
              const result = await fallbackModel2.generateContent(shortPrompt);
              const response = await result.response;
              const text = response.text();
              console.log('Second fallback model analysis successful');
              return { text };
            } catch (fallback2Error: any) {
              console.error('Second fallback model error:', fallback2Error);
              
              if (isQuotaOrRateLimitError(fallback2Error)) {
                console.log('Trying last resort model with minimal prompt...');
                try {
                  const lastResortModel = genAI.getGenerativeModel({ 
                    model: MODELS.LAST_RESORT,
                    generationConfig: {
                      temperature: 0.4,
                      maxOutputTokens: 512,
                    }
                  });
                  
                  const minimalPrompt = `財務分析: ${decodedContent.substring(0, 2000)}`;
                  const result = await lastResortModel.generateContent(minimalPrompt);
                  const response = await result.response;
                  const text = response.text();
                  console.log('Last resort model analysis successful');
                  return { text };
                } catch (lastResortError) {
                  console.error('All models failed with quota/rate limit errors');
                  throw new Error('すべてのAPIモデルが制限に達しました。しばらく時間をおいてから再度お試しください。(30分程度後に再試行することをお勧めします)');
                }
              }
              throw fallback2Error;
            }
          }
          throw fallback1Error;
        }
      } else {
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            const backoffTime = RETRY_DELAY_MS * Math.pow(2, attempt);
            console.log(`Retrying with primary model (attempt ${attempt + 1}) after ${backoffTime}ms delay...`);
            await sleep(backoffTime); // 指数バックオフ
            
            const primaryModel = genAI.getGenerativeModel({ 
              model: MODELS.PRIMARY,
              generationConfig: {
                temperature: 0.2 + (attempt * 0.1), // 徐々に温度を上げる
                maxOutputTokens: 2048,
              }
            });
            
            const result = await primaryModel.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            console.log(`Retry ${attempt + 1} successful`);
            return { text };
          } catch (retryError) {
            console.warn(`Retry ${attempt + 1} failed:`, retryError);
            
            if (attempt === MAX_RETRIES - 1) {
              console.log('All retries failed, trying fallback model as last resort...');
              try {
                const fallbackModel = genAI.getGenerativeModel({ 
                  model: MODELS.FALLBACK_1,
                  generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1024,
                  }
                });
                
                const result = await fallbackModel.generateContent(shortPrompt);
                const response = await result.response;
                const text = response.text();
                console.log('Fallback after retries successful');
                return { text };
              } catch (finalError) {
                console.error('Final fallback attempt failed:', finalError);
                throw finalError;
              }
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

async function extractStructuredDataFromPdf(base64Content: string): Promise<ExtractedFinancialData | null> {
  try {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempPdfPath = path.join(tempDir, `temp_${uuidv4()}.pdf`);
    const pdfBuffer = Buffer.from(base64Content, 'base64');
    fs.writeFileSync(tempPdfPath, pdfBuffer);
    
    console.log('Running Python data extractor...');
    
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', ['data_extractor.py', tempPdfPath], {
        cwd: process.cwd(),
        env: { ...process.env }
      });
      
      let output = '';
      let errorOutput = '';
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        try {
          fs.unlinkSync(tempPdfPath);
        } catch (cleanupError) {
          console.warn('Failed to clean up temp file:', cleanupError);
        }
        
        if (code === 0) {
          try {
            const structuredData = JSON.parse(output);
            resolve(structuredData);
          } catch (parseError) {
            console.error('Failed to parse Python extractor output:', parseError);
            resolve(null);
          }
        } else {
          console.error('Python extractor failed:', errorOutput);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error in extractStructuredDataFromPdf:', error);
    return null;
  }
}

async function performChainOfThoughtAnalysis(structuredData: ExtractedFinancialData, genAI: GoogleGenerativeAI): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODELS.PRIMARY,
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 2048,
      }
    });

    console.log('Step 1: Calculating financial ratios with explicit formulas');
    const calculationPrompt = ChainOfThoughtPrompts.createFinancialCalculationPrompt(structuredData);
    const calculationResult = await model.generateContent(calculationPrompt);
    let calculatedRatios;
    
    try {
      const calculationText = calculationResult.response.text();
      const jsonMatch = calculationText.match(/\{[\s\S]*\}/);
      calculatedRatios = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (parseError) {
      console.warn('Failed to parse calculation results, using fallback');
      calculatedRatios = { 財務指標: structuredData.ratios };
    }

    console.log('Step 2: Performing qualitative analysis with segment information');
    const qualitativePrompt = ChainOfThoughtPrompts.createQualitativeAnalysisPrompt(structuredData, calculatedRatios);
    const qualitativeResult = await model.generateContent(qualitativePrompt);
    let qualitativeAnalysis;
    
    try {
      const qualitativeText = qualitativeResult.response.text();
      const jsonMatch = qualitativeText.match(/\{[\s\S]*\}/);
      qualitativeAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { 
        収益性分析: qualitativeText,
        財務健全性分析: '構造化データに基づく分析',
        セグメント分析: structuredData.statements.セグメント情報 ? 'セグメント情報を活用した分析' : 'セグメント情報なし'
      };
    } catch (parseError) {
      console.warn('Failed to parse qualitative analysis, using text response');
      qualitativeAnalysis = { 分析結果: qualitativeResult.response.text() };
    }

    console.log('Step 3: Generating comprehensive final report');
    const finalReportPrompt = ChainOfThoughtPrompts.createFinalReportPrompt(calculatedRatios, qualitativeAnalysis);
    const finalResult = await model.generateContent(finalReportPrompt);

    return finalResult.response.text();
  } catch (error) {
    console.error('Chain of Thought analysis failed:', error);
    throw error;
  }
}
