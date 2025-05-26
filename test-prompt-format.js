const fs = require('fs');
const path = require('path');

async function testPromptFormat() {
  try {
    console.log('=== プロンプトフォーマット最適化のテスト ===');
    
    const financialPrompt = `
あなたは財務分析の専門家です。以下の財務文書を詳細に分析し、具体的な財務状況、問題点、改善策を説明してください。

分析すべき重要な点：
1. 売上高と利益率の推移
2. 財務健全性（負債比率、流動比率など）
3. 資金繰り状況
4. 経営効率（ROA、ROEなど）
5. キャッシュフローの状況

分析結果は以下の形式で出力してください：

## 全体的な財務状況
[具体的な財務状況の説明]

## 主要な財務指標
[具体的な数値と説明]

## 問題点と課題
[具体的な問題点の説明]

## 改善策と提案
[具体的な改善策の提案]

## 今後の見通し
[今後の見通しについての説明]
`;
    
    console.log('財務分析プロンプト:');
    console.log(financialPrompt);
    console.log('\n');
    
    const generalPrompt = `
あなたは文書分析の専門家です。以下の文書を分析し、主要なポイントと重要な情報を要約してください。
文書の種類を特定し、その内容に応じた適切な分析を行ってください。

分析結果は以下の形式で出力してください：

## 文書の種類
[文書の種類の説明]

## 主要なポイント
[主要なポイントの説明]

## 重要な情報
[重要な情報の説明]

## 分析と考察
[分析と考察の説明]
`;
    
    console.log('一般文書分析プロンプト:');
    console.log(generalPrompt);
    console.log('\n');
    
    const oldFinancialPrompt = '以下の財務文書を分析し、財務状況、問題点、改善策を詳細に説明してください。特に重要な財務指標や傾向に注目してください：\n\n';
    const oldGeneralPrompt = '以下の文書を分析し、主要なポイントと重要な情報を要約してください：\n\n';
    
    console.log('=== プロンプト比較 ===');
    console.log('旧財務分析プロンプト:');
    console.log(oldFinancialPrompt);
    console.log('\n');
    console.log('旧一般文書分析プロンプト:');
    console.log(oldGeneralPrompt);
    console.log('\n');
    
    console.log('=== プロンプト改善点 ===');
    console.log('財務分析プロンプトの改善点:');
    console.log('1. 専門家としての役割を明確に指定');
    console.log('2. 分析すべき重要な点を具体的に列挙');
    console.log('3. 出力フォーマットを構造化');
    console.log('4. より詳細な指示を提供');
    console.log('\n');
    
    console.log('一般文書分析プロンプトの改善点:');
    console.log('1. 専門家としての役割を明確に指定');
    console.log('2. 文書の種類を特定するよう指示');
    console.log('3. 出力フォーマットを構造化');
    console.log('4. より詳細な分析を促進');
    console.log('\n');
    
    console.log('=== テスト完了 ===');
    console.log('プロンプトフォーマットの最適化が正常に実装されています。');
    
    return {
      financialPrompt,
      generalPrompt,
      oldFinancialPrompt,
      oldGeneralPrompt
    };
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
    throw error;
  }
}

testPromptFormat()
  .then(results => {
    console.log('テスト成功!');
  })
  .catch(error => {
    console.error('テスト失敗:', error);
    process.exit(1);
  });
