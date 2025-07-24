import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Content } = req.body;
    
    if (!base64Content) {
      return res.status(400).json({ error: 'Base64 PDF content is required' });
    }

    console.log('PDF table extraction requested - using fallback due to Vercel limitations');
    
    return res.status(200).json({
      success: false,
      message: 'Table extraction not available in Vercel environment - using fallback',
      tables: [],
      metadata: {
        tablesFound: 0,
        extractionMethod: 'fallback',
        confidence: 'low',
        reason: 'Vercel serverless limitations'
      }
    });

  } catch (error) {
    console.error('Vercel API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
