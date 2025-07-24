import { VercelRequest, VercelResponse } from '@vercel/node';

import { extractAndVerify, approveAndAnalyze } from '../server/api/verify';

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
