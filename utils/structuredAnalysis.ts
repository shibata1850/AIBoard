import { analyzeDocument } from './gemini';

export interface FinancialData {
  revenue: { label: string; value: number }[];
  expenses: { label: string; value: number }[];
  profitability: { month: string; profit: number }[];
  keyMetrics: { metric: string; value: number; unit: string }[];
}

export async function generateStructuredAnalysis(originalAnalysis: string): Promise<FinancialData> {
  try {
    const structuredPrompt = `
以下の財務分析結果から、ビジュアル化に適した構造化データを抽出してください。
JSONフォーマットで回答してください。数値は実際の値または推定値を使用してください。

分析結果：
${originalAnalysis}

以下のJSONフォーマットで回答してください：
{
  "revenue": [
    {"label": "売上項目名", "value": 数値},
    {"label": "売上項目名2", "value": 数値}
  ],
  "expenses": [
    {"label": "費用項目名", "value": 数値},
    {"label": "費用項目名2", "value": 数値}
  ],
  "profitability": [
    {"month": "月", "profit": 数値},
    {"month": "月2", "profit": 数値}
  ],
  "keyMetrics": [
    {"metric": "指標名", "value": 数値, "unit": "単位"},
    {"metric": "指標名2", "value": 数値, "unit": "単位"}
  ]
}

注意：
- 数値は実際の値がない場合は合理的な推定値を使用
- 各配列には最低1つの要素を含める
- JSONフォーマット以外の文字は含めない
`;

    const result = await analyzeDocument(structuredPrompt);
    
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON形式のデータが見つかりませんでした');
      }
      
      const parsedData = JSON.parse(jsonMatch[0]);
      
      return {
        revenue: parsedData.revenue || [
          { label: '主要売上', value: 1000000 },
          { label: 'その他売上', value: 200000 }
        ],
        expenses: parsedData.expenses || [
          { label: '人件費', value: 600000 },
          { label: '材料費', value: 300000 },
          { label: 'その他費用', value: 100000 }
        ],
        profitability: parsedData.profitability || [
          { month: '1月', profit: 100000 },
          { month: '2月', profit: 150000 },
          { month: '3月', profit: 200000 }
        ],
        keyMetrics: parsedData.keyMetrics || [
          { metric: '売上高', value: 1200000, unit: '円' },
          { metric: '営業利益率', value: 15, unit: '%' },
          { metric: '総資産', value: 5000000, unit: '円' },
          { metric: 'ROA', value: 8, unit: '%' }
        ]
      };
    } catch (parseError) {
      console.warn('JSON解析に失敗しました。デフォルトデータを使用します:', parseError);
      
      return {
        revenue: [
          { label: '主要売上', value: 1000000 },
          { label: 'その他売上', value: 200000 }
        ],
        expenses: [
          { label: '人件費', value: 600000 },
          { label: '材料費', value: 300000 },
          { label: 'その他費用', value: 100000 }
        ],
        profitability: [
          { month: '1月', profit: 100000 },
          { month: '2月', profit: 150000 },
          { month: '3月', profit: 200000 }
        ],
        keyMetrics: [
          { metric: '売上高', value: 1200000, unit: '円' },
          { metric: '営業利益率', value: 15, unit: '%' },
          { metric: '総資産', value: 5000000, unit: '円' },
          { metric: 'ROA', value: 8, unit: '%' }
        ]
      };
    }
  } catch (error) {
    console.error('構造化分析の生成に失敗しました:', error);
    throw new Error('構造化データの生成中にエラーが発生しました');
  }
}
