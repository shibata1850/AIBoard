import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument } from '../../../server/api/openai';

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: content string is required' },
        { status: 400 }
      );
    }
    
    const result = await analyzeDocument(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Document analysis API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
