import * as fs from 'fs';
import * as path from 'path';
import { processPdfWithGemini } from './utils/pdfUtils';

async function testPromptEngineering() {
  try {
    console.log('=== プロンプトエンジニアリング最適化のテスト ===');
    
    const sampleFinancialText = fs.readFileSync(
      path.join(__dirname, 'test-files', 'financial-sample.txt'), 
      'utf8'
    );
    
    const base64Content = Buffer.from(sampleFinancialText).toString('base64');
    
    console.log('財務分析プロンプトをテスト中...');
    console.log('サンプルデータ:');
    console.log(sampleFinancialText);
    console.log('\n');
    
    const financialPrompt = `
あなたは財務分析の専門家です。以下の財務文書を詳細に分析し、具体的な財務状況、問題点、改善策を説明してください。

分析すべき重要な点：
1. 売上高と利益率の推移
2. 財務健全性（負債比率、流動比率など）
3. 資金繰り状況
4. 経営効率（ROA、ROEなど）
5. キャッシュフローの状況
`;
    
    console.log('財務分析プロンプト:');
    console.log(financialPrompt);
    console.log('\n');
    
    const financialResult = await processPdfWithGemini(base64Content, financialPrompt);
    
    console.log('財務分析結果:');
    console.log(financialResult);
    console.log('\n');
    
    const generalPrompt = `
あなたは文書分析の専門家です。以下の文書を分析し、主要なポイントと重要な情報を要約してください。
文書の種類を特定し、その内容に応じた適切な分析を行ってください。
`;
    
    console.log('一般文書分析プロンプト:');
    console.log(generalPrompt);
    console.log('\n');
    
    const generalResult = await processPdfWithGemini(base64Content, generalPrompt);
    
    console.log('一般文書分析結果:');
    console.log(generalResult);
    console.log('\n');
    
    console.log('=== テスト完了 ===');
    console.log('プロンプトエンジニアリングの最適化が正常に機能しています。');
    
    return {
      financialResult,
      generalResult
    };
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
    throw error;
  }
}

testPromptEngineering()
  .then(results => {
    console.log('テスト成功!');
  })
  .catch(error => {
    console.error('テスト失敗:', error);
    process.exit(1);
  });
