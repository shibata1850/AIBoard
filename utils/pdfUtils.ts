import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';

/**
 * Prepare PDF content for analysis
 * @param base64Content Base64 encoded PDF content
 * @returns Object with PDF data and metadata
 */
export async function preparePdfForAnalysis(base64Content: string): Promise<{
  base64Data: string;
  pageCount: number;
  isPrepared: boolean;
}> {
  try {
    const pdfData = base64Content.startsWith('data:application/pdf;base64,')
      ? base64Content.substring('data:application/pdf;base64,'.length)
      : base64Content;
    
    const binaryString = atob(pdfData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const pdfDoc = await PDFDocument.load(bytes);
    const pageCount = pdfDoc.getPageCount();
    
    const formattedBase64 = pdfData.startsWith('data:application/pdf;base64,')
      ? pdfData
      : `data:application/pdf;base64,${pdfData}`;
    
    return {
      base64Data: formattedBase64,
      pageCount,
      isPrepared: true
    };
  } catch (error) {
    console.error('Error preparing PDF for analysis:', error);
    throw new Error('PDFの準備中にエラーが発生しました。別のファイルを試してください。');
  }
}

/**
 * Extract text from PDF using pdf-parse library
 * @param base64Content Base64 encoded PDF content
 * @returns Promise with extracted text
 */
export async function extractTextFromPdf(base64Content: string): Promise<string> {
  try {
    const pdfData = base64Content.startsWith('data:application/pdf;base64,')
      ? base64Content.substring('data:application/pdf;base64,'.length)
      : base64Content;
    
    const buffer = Buffer.from(pdfData, 'base64');
    
    const data = await pdfParse(buffer);
    
    const { pageCount } = await preparePdfForAnalysis(base64Content);
    
    if (!data.text || data.text.trim().length === 0) {
      return `PDF文書からテキストを抽出できませんでした。ページ数: ${pageCount}\n\n` +
             `このPDFはスキャンされた画像かもしれません。別のPDFファイルを試してください。`;
    }
    
    return `PDF文書からテキストを抽出しました。ページ数: ${pageCount}\n\n` +
           `抽出されたテキスト:\n${data.text}`;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('PDFからのテキスト抽出中にエラーが発生しました。別のファイルを試してください。');
  }
}

/**
 * Analyze PDF content for financial data
 * @param pdfText Extracted text from PDF
 * @returns Analysis result
 */
export function analyzePdfFinancialData(pdfText: string): string {
  try {
    const analysis = {
      hasBalanceSheet: pdfText.includes('貸借対照表') || pdfText.includes('バランスシート') || 
                      pdfText.includes('資産') && pdfText.includes('負債') && pdfText.includes('純資産'),
      hasIncomeStatement: pdfText.includes('損益計算書') || pdfText.includes('収益') && pdfText.includes('費用'),
      hasCashFlow: pdfText.includes('キャッシュフロー') || pdfText.includes('現金流量'),
      hasFinancialRatios: pdfText.includes('比率') || pdfText.includes('レシオ') || pdfText.includes('率'),
      hasRevenue: /売上[高額]|収益|収入/g.test(pdfText),
      hasProfit: /利益|損失|当期純利益|営業利益|経常利益/g.test(pdfText),
      hasAssets: /資産|総資産|固定資産|流動資産/g.test(pdfText),
      hasLiabilities: /負債|総負債|固定負債|流動負債/g.test(pdfText),
      hasEquity: /純資産|株主資本|資本金/g.test(pdfText),
    };
    
    const revenueMatch = pdfText.match(/売上[高額][:：]?\s*([0-9,]+)\s*[万千百]?円/);
    const profitMatch = pdfText.match(/当期純利益[:：]?\s*([0-9,]+)\s*[万千百]?円/);
    const assetsMatch = pdfText.match(/総資産[:：]?\s*([0-9,]+)\s*[万千百]?円/);
    
    let analysisText = '## 財務分析レポート\n\n';
    
    analysisText += '### 文書タイプ\n';
    if (analysis.hasBalanceSheet) analysisText += '- 貸借対照表が含まれています\n';
    if (analysis.hasIncomeStatement) analysisText += '- 損益計算書が含まれています\n';
    if (analysis.hasCashFlow) analysisText += '- キャッシュフロー計算書が含まれています\n';
    if (!analysis.hasBalanceSheet && !analysis.hasIncomeStatement && !analysis.hasCashFlow) {
      analysisText += '- 標準的な財務諸表は検出されませんでした\n';
    }
    
    analysisText += '\n### 検出された財務データ\n';
    if (revenueMatch) analysisText += `- 売上高: ${revenueMatch[1]}円\n`;
    if (profitMatch) analysisText += `- 当期純利益: ${profitMatch[1]}円\n`;
    if (assetsMatch) analysisText += `- 総資産: ${assetsMatch[1]}円\n`;
    if (!revenueMatch && !profitMatch && !assetsMatch) {
      analysisText += '- 具体的な数値データは検出されませんでした\n';
    }
    
    analysisText += '\n### 財務健全性の評価\n';
    if (analysis.hasFinancialRatios) {
      analysisText += '- 財務比率の情報が含まれています\n';
    } else {
      analysisText += '- 財務比率の情報は検出されませんでした\n';
    }
    
    analysisText += '\n### 総合評価\n';
    if (analysis.hasRevenue && analysis.hasProfit && analysis.hasAssets && analysis.hasLiabilities && analysis.hasEquity) {
      analysisText += '- 文書には基本的な財務情報が含まれています\n';
      analysisText += '- 売上、利益、資産、負債、純資産に関する情報が確認できます\n';
    } else {
      analysisText += '- 文書には一部の財務情報が欠けています\n';
      if (!analysis.hasRevenue) analysisText += '  - 売上に関する情報が見つかりません\n';
      if (!analysis.hasProfit) analysisText += '  - 利益に関する情報が見つかりません\n';
      if (!analysis.hasAssets) analysisText += '  - 資産に関する情報が見つかりません\n';
      if (!analysis.hasLiabilities) analysisText += '  - 負債に関する情報が見つかりません\n';
      if (!analysis.hasEquity) analysisText += '  - 純資産に関する情報が見つかりません\n';
    }
    
    analysisText += '\n### 推奨事項\n';
    analysisText += '- より詳細な分析のためには、完全な財務諸表セットを提供してください\n';
    analysisText += '- 過去3年間のデータがあれば、トレンド分析が可能になります\n';
    analysisText += '- 業界平均との比較データがあれば、競合分析が可能になります\n';
    
    return analysisText;
  } catch (error) {
    console.error('Error analyzing PDF financial data:', error);
    return '財務データの分析中にエラーが発生しました。データが不完全または形式が正しくない可能性があります。';
  }
}

/**
 * Check if a file is a PDF based on its MIME type
 * @param mimeType File MIME type
 * @returns Boolean indicating if the file is a PDF
 */
export function isPdfFile(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}
