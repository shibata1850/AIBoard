import { VercelRequest, VercelResponse } from '@vercel/node';
import { extractPdfTables } from '../server/api/extract-pdf-tables';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const expressReq = {
      body: req.body,
      method: req.method,
      headers: req.headers,
      url: req.url
    } as any;

    const expressRes = {
      status: (code: number) => ({
        json: (data: any) => res.status(code).json(data)
      }),
      json: (data: any) => res.json(data)
    } as any;

    await extractPdfTables(expressReq, expressRes);
  } catch (error) {
    console.error('Vercel API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
