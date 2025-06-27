import { Request, Response } from 'express';
import { UnifiedFinancialExtractor } from '../../utils/extractionService';

export async function extractFinancialItem(req: Request, res: Response) {
  try {
    const { base64Content, itemType } = req.body;
    
    if (!base64Content || !itemType) {
      return res.status(400).json({ error: 'base64Content and itemType are required' });
    }
    
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }
    
    const extractor = new UnifiedFinancialExtractor(apiKey);
    let result;
    
    switch (itemType) {
      case 'segment_profit_loss':
        result = await extractor.extractSegmentProfitLoss(base64Content);
        break;
      case 'total_liabilities':
        result = await extractor.extractTotalLiabilities(base64Content);
        break;
      case 'current_liabilities':
        result = await extractor.extractCurrentLiabilities(base64Content);
        break;
      case 'ordinary_expenses':
        result = await extractor.extractOrdinaryExpenses(base64Content);
        break;
      default:
        return res.status(400).json({ error: 'Invalid itemType' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Financial item extraction error:', error);
    res.status(500).json({ 
      error: 'Extraction failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
