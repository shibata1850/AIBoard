import { extractStructuredDataFromPdf } from './analyze';
import { performAutomaticIntegrityCheck, addVerificationMetadata, VerifiedFinancialData } from './verification';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function extractAndVerify(base64Content: string): Promise<VerifiedFinancialData> {
  try {
    const extractedData = await extractStructuredDataFromPdf(base64Content);
    
    if (!extractedData) {
      throw new Error('Failed to extract financial data from PDF');
    }
    
    const verification = performAutomaticIntegrityCheck(extractedData);
    const verifiedData = addVerificationMetadata(extractedData, verification);
    
    return verifiedData;
  } catch (error) {
    console.error('Error in extractAndVerify:', error);
    throw error;
  }
}

export async function approveAndAnalyze(verifiedData: VerifiedFinancialData): Promise<string> {
  const { performChainOfThoughtAnalysis } = require('./analyze');
  
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  verifiedData.verificationStatus = 'approved';
  verifiedData.verifiedAt = new Date().toISOString();
  
  return await performChainOfThoughtAnalysis(verifiedData, genAI);
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, base64Content, verifiedData } = req.body;

    if (action === 'extract') {
      const result = await extractAndVerify(base64Content);
      return res.status(200).json({ 
        success: true, 
        verifiedData: result 
      });
    } else if (action === 'approve') {
      const analysis = await approveAndAnalyze(verifiedData);
      return res.status(200).json({ 
        success: true, 
        analysis 
      });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Verification API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
