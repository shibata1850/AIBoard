import { Request } from 'express';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, fileName } = body;
    
    if (!content) {
      return Response.json({ error: 'Content is required' }, { status: 400 });
    }

    console.log(`Analyzing document: ${fileName || 'unknown'}`);
    
    const { analyzeDocument } = require('../../server/api/analyze');
    const result = await analyzeDocument(content, fileName);
    
    return Response.json(result);

  } catch (error) {
    console.error('Analysis API error:', error);
    return Response.json({
      error: 'Failed to analyze document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
