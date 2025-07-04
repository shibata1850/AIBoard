const fs = require('fs');
const path = require('path');

const { analyzeDocument } = require('./server/api/analyze.ts');

const testPrompt = `# 役割
あなたは、与えられた指示を100%忠実に実行する、極めて優秀な財務分析AIです。思考の過程や最終的なレポートは、必ず以下の指示体系に従ってください。

# 入力データ
- \`financial_statements.json\` ファイル。このファイル内の数値は100%正確です。

# 出力形式
- Markdown形式のレポート。

# 指示体系
以下の「5つの分析タスク」を順番に、一つも飛ばさずに実行し、レポートを生成してください。

### 【タスク1】財務健全性分析
- JSONデータから「負債合計」「純資産合計」「流動資産合計」「流動負債合計」を引用する。
- **負債比率**と**流動比率**を計算し、結果を専門的に評価する。

### 【タスク2】収益性分析
- JSONデータから「経常損失」額を引用する。
- **セグメント情報（operatingProfitLoss）を必ず参照し、「附属病院の4.1億円の赤字」が経常損失の主因であると明確に指摘する。**

### 【タスク3】キャッシュ・フロー分析
- **このタスクは必須です。絶対に省略しないでください。**
- JSONデータから「業務活動」「投資活動」「財務活動」の3つのキャッシュ・フローの数値を引用する。
- 「**巨額の設備投資（投資CF）を、借入金（財務CF）で賄っている**」という資金の流れを明確に解説する。

### 【タスク4】リスク分析と改善提案
- 上記のタスク1〜3の分析結果に基づき、**具体的な数値を伴うリスク**を3つ以上指摘する。
- それぞれのリスクに対し、**具体的で実行可能な改善提案**を提示する。

### 【タスク5】最終レポートのフォーマット
- 上記タスク1〜4の結果を統合し、以下の章立てで最終レポートを作成する。
  1. エグゼクティブ・サマリー
  2. 財務健全性分析
  3. 収益性分析
  4. **キャッシュ・フロー分析**
  5. リスク分析と改善提案
  6. 結論
- レポート内の全ての数値には、必ずJSONキーを情報源として \`[引用: data.key]\` の形式で引用を付与する。
  - 例：経常損失は-654,006千円 \`[引用: data.ordinaryLoss]\` です。

---

### ## 自己検証ステップ ##
レポートの生成完了後、以下のチェックリストを**あなた自身で確認**してください。一つでも「No」があれば、レポートを修正し、全ての項目が「Yes」になるまでやり直してください。

1.  レポートに「キャッシュ・フロー分析」の章は含まれていますか？ (Yes/No)
2.  レポート内の全ての数値に \`[引用: ...]\` 形式の引用は付いていますか？ (Yes/No)
3.  附属病院の赤字について言及しましたか？ (Yes/No)`;

async function runQATest() {
  try {
    console.log('=== QA Test: AIBoard Analysis Function ===');
    console.log('Loading financial statements data...');
    
    const financialDataPath = '/home/ubuntu/attachments/3668e878-8f24-49b3-8c70-f6acfbbacfa4/financial_statements.json';
    const financialData = JSON.parse(fs.readFileSync(financialDataPath, 'utf8'));
    
    console.log('Financial data loaded successfully');
    console.log('Executing analysis with specified prompt...');
    
    const result = { text: 'Test file deprecated - use test-refactored-analysis.ts' };
    
    console.log('\n=== ANALYSIS RESULT ===');
    console.log(result);
    
    const outputPath = '/home/ubuntu/repos/AIBoard/qa-test-result.md';
    fs.writeFileSync(outputPath, result.text, 'utf8');
    console.log(`\nResult saved to: ${outputPath}`);
    
    console.log('\n=== VALIDATION CHECKS ===');
    
    const reportText = result.text;
    const hasOrdinaryLoss = reportText.includes('654006') || reportText.includes('6.54億') || reportText.includes('65.4億');
    const hasHospitalLoss = reportText.includes('410984') || reportText.includes('4.1億') || reportText.includes('41.0億');
    const hasLongTermDebt = reportText.includes('10366372') || reportText.includes('103億') || reportText.includes('1036億');
    
    console.log(`✓ 基準1 (データ正確性): ${hasOrdinaryLoss && hasHospitalLoss ? 'PASS' : 'FAIL'}`);
    
    const mentionsHospitalDeficit = reportText.includes('附属病院') && (reportText.includes('赤字') || reportText.includes('損失') || reportText.includes('マイナス'));
    console.log(`✓ 基準2 (核心的洞察): ${mentionsHospitalDeficit ? 'PASS' : 'FAIL'}`);
    
    const hasHealthAnalysis = reportText.includes('健全性') || reportText.includes('負債比率') || reportText.includes('流動比率');
    const hasProfitabilityAnalysis = reportText.includes('収益性') || reportText.includes('経常損失');
    const hasCashFlowAnalysis = reportText.includes('キャッシュ') || reportText.includes('現金');
    
    console.log(`✓ 基準3 (分析の網羅性): ${hasHealthAnalysis && hasProfitabilityAnalysis && hasCashFlowAnalysis ? 'PASS' : 'FAIL'}`);
    
    const hasSpecificRecommendations = reportText.includes('改善') || reportText.includes('提案') || reportText.includes('対策');
    console.log(`✓ 基準4 (提言の具体性): ${hasSpecificRecommendations ? 'PASS' : 'FAIL'}`);
    
    const hasCitations = reportText.includes('[引用:') && reportText.includes('data.');
    console.log(`✓ 基準5 (引用の遵守): ${hasCitations ? 'PASS' : 'FAIL'}`);
    
    const allChecksPassed = hasOrdinaryLoss && hasHospitalLoss && mentionsHospitalDeficit && 
                           hasHealthAnalysis && hasProfitabilityAnalysis && hasCashFlowAnalysis && 
                           hasSpecificRecommendations && hasCitations;
    
    console.log(`\n=== FINAL RESULT: ${allChecksPassed ? 'PASS' : 'FAIL'} ===`);
    
    return result;
    
  } catch (error) {
    console.error('Test execution failed:', error);
    console.log('\n=== FINAL RESULT: FAIL ===');
    console.log('Error during test execution:', error.message);
    throw error;
  }
}

if (require.main === module) {
  runQATest().catch(console.error);
}

module.exports = { runQATest };
