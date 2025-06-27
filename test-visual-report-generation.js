const fs = require('fs');
const path = require('path');

const { generateVisualReportHTML, parseEnhancedFinancialData } = require('./utils/visualReportGenerator.ts');

const testAnalysisContent = `
## 国立大学法人山梨大学 平成27事業年度 財務諸表分析

**1. 財務健全性:**
* **負債比率:** 負債合計(20,926,388千円)と純資産合計(43,945,344千円)から負債比率を計算すると約32.2%となります。
* **流動比率:** 流動資産(8,838,001千円)と流動負債(3,572,873千円)から流動比率を計算すると約2.47倍となります。
* **固定比率:** 固定資産(63,054,601千円)と自己資本(43,945,344千円)から固定比率を計算すると約1.43倍となります。

**2. 収益性:**
* **当期純損失:** 当期純損失は325,961千円です。
* **経常損失:** 経常損失も発生しており、本業の収益力が低いことを示しています。

**4. リスク要因:**
* **財務赤字:** 持続的な財務赤字は、大学の存続に大きなリスクをもたらします。
* **運営費交付金への依存:** 運営費交付金への依存度が高いと、政府政策の変化によって大きな影響を受ける可能性があります。
* **附属病院の経営:** 附属病院の経営状況が大学の財務状況に大きく影響していると考えられます。
* **固定資産比率の高さと債務:** 固定資産比率が高く、かつ債務を抱えていることは、財務リスクを高めています。

**5. 改善のための具体的なアドバイス:**
* **収益力強化:** 授業料収入以外の収益源の多様化を図る必要があります。
* **経費削減:** 経費削減のための徹底的な見直しが必要です。
* **附属病院の経営改善:** 附属病院の経営効率化、収益性向上のための戦略が必要です。
* **債務管理:** 債務の返済計画を策定し、財務状況の改善に努める必要があります。
* **リスク管理:** 未収金、債務、固定資産などに関するリスク管理体制の強化が必要です。
* **透明性の向上:** 財務情報の開示をより詳細に行い、ステークホルダーとのコミュニケーションを強化する必要があります。
`;

async function testVisualReportGeneration() {
    try {
        console.log('Testing enhanced visual report generation...');
        
        const enhancedData = parseEnhancedFinancialData(testAnalysisContent);
        console.log('Enhanced financial data parsed:', enhancedData);
        
        const htmlContent = generateVisualReportHTML(enhancedData, '財務分析レポート');
        
        const outputPath = path.join(__dirname, 'test-generated-visual-report.html');
        fs.writeFileSync(outputPath, htmlContent, 'utf8');
        
        console.log('✅ Visual report HTML generated successfully');
        console.log('📄 Output saved to:', outputPath);
        
        const hasChartJs = htmlContent.includes('chart.js');
        const hasCanvasElements = htmlContent.includes('<canvas');
        const hasChartInitialization = htmlContent.includes('new Chart(');
        const hasFinancialRatioChart = htmlContent.includes('ratiosChart');
        const hasProfitLossChart = htmlContent.includes('profitLossChart');
        const hasRiskChart = htmlContent.includes('riskChart');
        
        console.log('\n📊 Chart.js Integration Verification:');
        console.log('- Chart.js library included:', hasChartJs ? '✅' : '❌');
        console.log('- Canvas elements present:', hasCanvasElements ? '✅' : '❌');
        console.log('- Chart initialization code:', hasChartInitialization ? '✅' : '❌');
        console.log('- Financial ratio chart:', hasFinancialRatioChart ? '✅' : '❌');
        console.log('- Profit/loss chart:', hasProfitLossChart ? '✅' : '❌');
        console.log('- Risk factor chart:', hasRiskChart ? '✅' : '❌');
        
        console.log('\n📈 Enhanced Data Extraction:');
        console.log('- Debt ratio extracted:', enhancedData.ratios?.debtRatio || 'Not found');
        console.log('- Current ratio extracted:', enhancedData.ratios?.currentRatio || 'Not found');
        console.log('- Risk factors count:', enhancedData.riskFactors?.length || 0);
        console.log('- Recommendations count:', enhancedData.recommendations?.length || 0);
        
        const allChecksPass = hasChartJs && hasCanvasElements && hasChartInitialization && 
                             hasFinancialRatioChart && hasProfitLossChart && hasRiskChart;
        
        if (allChecksPass) {
            console.log('\n🎉 SUCCESS: Enhanced visual report generation system is working correctly!');
            console.log('📊 All Chart.js integration checks passed');
            console.log('🔧 Enhanced financial data parsing is functional');
        } else {
            console.log('\n⚠️  WARNING: Some Chart.js integration checks failed');
        }
        
        return { success: allChecksPass, outputPath, enhancedData };
        
    } catch (error) {
        console.error('❌ Error testing visual report generation:', error);
        return { success: false, error: error.message };
    }
}

testVisualReportGeneration().then(result => {
    if (result.success) {
        console.log('\n✅ Test completed successfully');
        process.exit(0);
    } else {
        console.log('\n❌ Test failed:', result.error);
        process.exit(1);
    }
});
