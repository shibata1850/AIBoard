import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, base64Content, verifiedData } = req.body;

    console.log('Verification API called with action:', action);

    if (action === 'extract') {
      const mockVerifiedData = {
        statements: {
          貸借対照表: {
            資産の部: { 
              資産合計: 71892603000,
              流動資産: { 流動資産合計: 8838001000 }, 
              固定資産: { 固定資産合計: 63054602000 } 
            },
            負債の部: { 
              負債合計: 27947258000,
              流動負債: { 流動負債合計: 7020870000 },
              固定負債: { 固定負債合計: 20926388000 }
            },
            純資産の部: { 純資産合計: 43945344000 }
          },
          損益計算書: {
            経常収益: { 経常収益合計: 34070467000 },
            経常費用: { 経常費用合計: 34723539000 },
            経常損失: 653072000,
            当期純損失: 598995000
          },
          セグメント情報: {
            附属病院: { 業務損益: -410984000 }
          }
        },
        ratios: {
          負債比率: 63.60,
          流動比率: 125.89,
          固定比率: 143.50,
          自己資本比率: 61.12
        },
        verificationStatus: 'verified',
        verifiedAt: new Date().toISOString()
      };

      return res.status(200).json({ 
        success: true, 
        verifiedData: mockVerifiedData 
      });
    } else if (action === 'approve') {
      const mockAnalysis = "財務分析が完了しました。提供されたデータに基づく包括的な分析結果です。";
      
      return res.status(200).json({ 
        success: true, 
        analysis: mockAnalysis 
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
