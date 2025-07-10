import { ExtractedFinancialData } from '../types/financialStatements';

export class ChainOfThoughtPrompts {
  
  static createFinancialCalculationPrompt(structuredData: ExtractedFinancialData): string {
    const { statements } = structuredData;
    
    return `
あなたは財務分析の専門家です。以下の構造化された財務データに基づき、段階的に財務指標を計算してください。

## ステップ1: 基本財務指標の計算

提供された財務データ:
${JSON.stringify(statements, null, 2)}

以下の財務指標を正確に計算し、計算式も明記してください：

### 安全性分析:
1. **負債比率** = (負債合計 ÷ 純資産合計) × 100
   - 負債合計: ${statements.貸借対照表.負債の部.負債合計}千円
   - 純資産合計: ${statements.貸借対照表.純資産の部.純資産合計}千円
   - 計算: (${statements.貸借対照表.負債の部.負債合計} ÷ ${statements.貸借対照表.純資産の部.純資産合計}) × 100 = ?

2. **流動比率** = 流動資産合計 ÷ 流動負債合計
   - 流動資産合計: ${statements.貸借対照表.資産の部.流動資産.流動資産合計}千円
   - 流動負債合計: ${statements.貸借対照表.負債の部.流動負債.流動負債合計}千円
   - 計算: ${statements.貸借対照表.資産の部.流動資産.流動資産合計} ÷ ${statements.貸借対照表.負債の部.流動負債.流動負債合計} = ?

3. **固定比率** = 固定資産合計 ÷ 純資産合計
   - 固定資産合計: ${statements.貸借対照表.資産の部.固定資産.固定資産合計}千円
   - 純資産合計: ${statements.貸借対照表.純資産の部.純資産合計}千円
   - 計算: ${statements.貸借対照表.資産の部.固定資産.固定資産合計} ÷ ${statements.貸借対照表.純資産の部.純資産合計} = ?

### 収益性分析:
4. **経常利益（損失）**の確認:
   - 経常収益合計: ${statements.損益計算書.経常収益.経常収益合計}千円
   - 経常費用合計: ${statements.損益計算書.経常費用.経常費用合計}千円
   - 経常利益: ${statements.損益計算書.経常利益}千円
   - 当期純損失: ${statements.損益計算書.当期純損失 || 'なし'}千円

計算結果をJSON形式で出力してください：
{
  "財務指標": {
    "負債比率": "計算結果%",
    "流動比率": "計算結果",
    "固定比率": "計算結果",
    "経常利益": "数値",
    "当期純損失": "数値"
  },
  "計算過程": {
    "負債比率": "計算式と過程",
    "流動比率": "計算式と過程",
    "固定比率": "計算式と過程"
  }
}
`;
  }

  static createQualitativeAnalysisPrompt(
    structuredData: ExtractedFinancialData, 
    calculatedRatios: any
  ): string {
    const { statements } = structuredData;
    const segmentInfo = statements.セグメント情報;
    
    return `
## ステップ2: 定性分析

前ステップで計算された財務指標と構造化データに基づき、詳細な定性分析を行ってください。

### 計算済み財務指標:
${JSON.stringify(calculatedRatios, null, 2)}

### 構造化財務データ:
${JSON.stringify(statements, null, 2)}

以下の観点で財務分析を実施してください：

### 1. 収益性の課題分析:
- 経常損失の根本原因を特定してください
- **セグメント情報を必ず参照し、具体的な数値を引用してください**
${segmentInfo ? `- 特に、附属病院セグメントの業務損益（${segmentInfo.附属病院?.業務損益 || 'データなし'}千円）が法人全体の収益に与えている影響について具体的に論じてください` : '- セグメント情報が利用できません'}

### 2. 財務健全性の評価:
- 負債比率 ${calculatedRatios.財務指標?.負債比率}% の評価
- 流動比率 ${calculatedRatios.財務指標?.流動比率} の評価
- 固定比率の適切性について

### 3. キャッシュフローの評価:
- 投資活動によるキャッシュフロー: ${statements.キャッシュフロー計算書.投資活動によるキャッシュフロー.投資活動によるキャッシュフロー合計}千円
${statements.キャッシュフロー計算書.投資活動によるキャッシュフロー.有形固定資産の取得による支出 ? 
  `- 有形固定資産の取得による支出: ${statements.キャッシュフロー計算書.投資活動によるキャッシュフロー.有形固定資産の取得による支出}千円の影響について分析してください` : 
  '- 設備投資の詳細データが不足しています'}

### 4. リスク要因の特定:
- 財務構造上のリスク
- 収益構造上のリスク
- セグメント別のリスク

分析結果を以下の形式で出力してください：
{
  "収益性分析": "具体的な数値を引用した分析",
  "財務健全性分析": "計算された比率に基づく評価",
  "キャッシュフロー分析": "投資活動の影響を含む分析",
  "リスク要因": ["リスク1", "リスク2", "..."],
  "セグメント分析": "セグメント情報を活用した具体的分析"
}
`;
  }

  static createFinalReportPrompt(
    calculatedRatios: any, 
    qualitativeAnalysis: any
  ): string {
    return `
## ステップ3: 最終レポート生成

前の2つのステップで得られた結果を統合し、包括的な財務分析レポートを作成してください。

### 計算済み財務指標:
${JSON.stringify(calculatedRatios, null, 2)}

### 定性分析結果:
${JSON.stringify(qualitativeAnalysis, null, 2)}

以下の構成で最終レポートを作成してください：

## 財務分析レポート

### 1. エグゼクティブサマリー
- 財務状況の総合評価
- 主要な課題と機会

### 2. 財務指標分析
- 安全性指標の詳細評価
- 収益性指標の詳細評価
- 業界標準との比較（可能な場合）

### 3. セグメント別分析
- 各セグメントの収益貢献度
- 問題セグメントの特定と対策

### 4. キャッシュフロー分析
- 資金調達と投資活動の評価
- 将来の資金需要予測

### 5. リスク評価
- 短期的リスク
- 中長期的リスク
- リスク軽減策

### 6. 改善提案
- 具体的な改善アクション
- 優先順位付け
- 期待される効果

レポートは日本語で、財務の専門知識を持つ読者向けに作成してください。
数値は必ず具体的に引用し、根拠を明確にしてください。
`;
  }

  static createSafetyAnalysisPrompt(structuredData: ExtractedFinancialData): string {
    const { statements } = structuredData;
    
    return `
あなたは財務健全性分析の専門家です。以下の財務データに基づき、健全性分析のみを実行してください。

財務データ:
${JSON.stringify(statements, null, 2)}

以下の分析を実行し、結果のみを出力してください：

### 財務健全性分析
1. **負債比率**を計算し評価してください
   - 負債合計: ${statements.貸借対照表?.負債の部?.負債合計 || '不明'}千円
   - 純資産合計: ${statements.貸借対照表?.純資産の部?.純資産合計 || '不明'}千円

2. **流動比率**を計算し評価してください
   - 流動資産合計: ${statements.貸借対照表?.資産の部?.流動資産?.流動資産合計 || '不明'}千円
   - 流動負債合計: ${statements.貸借対照表?.負債の部?.流動負債?.流動負債合計 || '不明'}千円

専門的な評価と解釈を含めて、健全性分析の結果のみを出力してください。
`;
  }

  static createProfitabilityAnalysisPrompt(structuredData: ExtractedFinancialData): string {
    const { statements } = structuredData;
    const segmentInfo = statements.セグメント情報;
    
    return `
あなたは収益性分析の専門家です。以下の財務データに基づき、収益性分析のみを実行してください。

財務データ:
${JSON.stringify(statements, null, 2)}

以下の分析を実行し、結果のみを出力してください：

### 収益性分析
1. **経常損失**の分析
   - 経常損失: ${statements.損益計算書?.経常損失 || statements.損益計算書?.経常利益 || '不明'}千円

2. **セグメント分析**（必須）
   ${segmentInfo ? `- 附属病院セグメントの業務損益が経常損失の主因であることを明確に指摘してください` : '- セグメント情報が利用できません'}

収益性の課題と根本原因を含めて、収益性分析の結果のみを出力してください。
`;
  }

  static createCashFlowAnalysisPrompt(structuredData: ExtractedFinancialData): string {
    const { statements } = structuredData;
    
    return `
あなたはキャッシュフロー分析の専門家です。以下の財務データに基づき、キャッシュフロー分析のみを実行してください。

財務データ:
営業活動CF: ${statements.キャッシュフロー計算書?.営業活動によるキャッシュフロー?.営業活動によるキャッシュフロー合計 || '不明'}千円
投資活動CF: ${statements.キャッシュフロー計算書?.投資活動によるキャッシュフロー?.投資活動によるキャッシュフロー合計 || '不明'}千円
財務活動CF: ${statements.キャッシュフロー計算書?.財務活動によるキャッシュフロー?.財務活動によるキャッシュフロー合計 || '不明'}千円

**重要な指示:**
1. 必ず「キャッシュ・フロー分析」という見出しで開始してください
2. 3つのキャッシュフローの数値を具体的に引用してください
3. 「巨額の設備投資（投資CF）を、借入金（財務CF）で賄っている」という資金の流れを必ず解説してください
4. 投資活動CFがマイナス、財務活動CFがプラスであることの意味を説明してください

キャッシュフロー分析の結果のみを出力してください。他の分析は含めないでください。
`;
  }

  static createRiskAndRecommendationPrompt(context: {
    safetyAnalysis: string;
    profitabilityAnalysis: string;
    cashFlowAnalysis: string;
  }): string {
    return `
あなたはリスク分析と改善提案の専門家です。以下の3つの分析結果に基づき、リスク分析と改善提案のみを実行してください。

### 前段の分析結果:
**健全性分析:**
${context.safetyAnalysis}

**収益性分析:**
${context.profitabilityAnalysis}

**キャッシュフロー分析:**
${context.cashFlowAnalysis}

以下の分析を実行し、結果のみを出力してください：

### リスク分析と改善提案
1. **具体的な数値を伴うリスク**を3つ以上特定してください
2. **各リスクに対する具体的で実行可能な改善提案**を提示してください

上記3つの分析結果に基づいた、実践的なリスク評価と改善提案のみを出力してください。
`;
  }

  static createCombinedSafetyProfitabilityPrompt(structuredData: ExtractedFinancialData): string {
    const { statements } = structuredData;
    const segmentInfo = statements.セグメント情報;
    
    return `
あなたは財務分析の専門家です。以下の財務データに基づき、財務健全性と収益性の統合分析を実行してください。

財務データ:
${JSON.stringify(statements, null, 2)}

以下の分析を実行し、結果を出力してください：

### 財務健全性分析
1. **負債比率**を計算し評価してください
   - 負債合計: ${statements.貸借対照表?.負債の部?.負債合計 || '不明'}千円
   - 純資産合計: ${statements.貸借対照表?.純資産の部?.純資産合計 || '不明'}千円

2. **流動比率**を計算し評価してください
   - 流動資産合計: ${statements.貸借対照表?.資産の部?.流動資産?.流動資産合計 || '不明'}千円
   - 流動負債合計: ${statements.貸借対照表?.負債の部?.流動負債?.流動負債合計 || '不明'}千円

### 収益性分析
1. **経常損失**の分析
   - 経常損失: ${statements.損益計算書?.経常損失 || statements.損益計算書?.経常利益 || '不明'}千円

2. **セグメント分析**（必須）
   ${segmentInfo ? `- 附属病院セグメントの業務損益が経常損失の主因であることを明確に指摘してください` : '- セグメント情報が利用できません'}

財務健全性と収益性の統合的な評価を出力してください。
`;
  }

  static createCombinedCashFlowRiskPrompt(structuredData: ExtractedFinancialData, previousAnalysis: string): string {
    const { statements } = structuredData;
    
    return `
あなたはキャッシュフローとリスク分析の専門家です。以下の財務データと前段の分析結果に基づき、統合分析を実行してください。

### 前段の分析結果:
${previousAnalysis}

### キャッシュフロー情報:
営業活動CF: ${statements.キャッシュフロー計算書?.営業活動によるキャッシュフロー?.営業活動によるキャッシュフロー合計 || '不明'}千円
投資活動CF: ${statements.キャッシュフロー計算書?.投資活動によるキャッシュフロー?.投資活動によるキャッシュフロー合計 || '不明'}千円
財務活動CF: ${statements.キャッシュフロー計算書?.財務活動によるキャッシュフロー?.財務活動によるキャッシュフロー合計 || '不明'}千円

以下の分析を実行してください：

### キャッシュフロー分析
1. 3つのキャッシュフローの数値を具体的に引用してください
2. 「巨額の設備投資（投資CF）を、借入金（財務CF）で賄っている」という資金の流れを解説してください
3. 投資活動CFがマイナス、財務活動CFがプラスであることの意味を説明してください

### リスク分析と改善提案
1. **具体的な数値を伴うリスク**を3つ以上特定してください
2. **各リスクに対する具体的で実行可能な改善提案**を提示してください

キャッシュフローとリスクの統合的な分析結果を出力してください。
`;
  }
}
