import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, base64Content, verifiedData } = req.body;

    if (action === 'extract') {
      const { extractStructuredDataFromPdf } = require('../server/api/analyze');
      const { performAutomaticIntegrityCheck, addVerificationMetadata } = require('../server/api/verification');
      
      const extractedData = await extractStructuredDataFromPdf(base64Content);
      
      if (!extractedData) {
        throw new Error('Failed to extract financial data from PDF');
      }
      
      const verification = performAutomaticIntegrityCheck(extractedData);
      const result = addVerificationMetadata(extractedData, verification);
      
      return res.status(200).json({ 
        success: true, 
        verifiedData: result 
      });
    } else if (action === 'approve') {
      const { performChainOfThoughtAnalysis } = require('../server/api/analyze');
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);
      
      verifiedData.verificationStatus = 'approved';
      verifiedData.verifiedAt = new Date().toISOString();
      
      const analysis = await performChainOfThoughtAnalysis(verifiedData, genAI);
      
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
