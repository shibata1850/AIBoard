console.log('=== Testing HTML Infographic Generation ===\n');

const fs = require('fs');
const path = require('path');

async function testHTMLInfographicGeneration() {
  try {
    const { generateHTMLReport } = require('./utils/htmlReportGenerator');
    
    const mockData = {
      companyName: '国立大学法人山梨大学',
      fiscalYear: '平成27年度',
      statements: {
        貸借対照表: {
          資産の部: {
            流動資産: { 流動資産合計: 8838001000 },
            固定資産: { 固定資産合計: 63054601000 },
            資産合計: 71892602000
          },
          負債の部: {
            流動負債: { 流動負債合計: 7020870000 },
            固定負債: { 固定負債合計: 20926388000 },
            負債合計: 27947258000
          },
          純資産の部: { 純資産合計: 43945344000 }
        },
        損益計算書: {
          経常収益: { 
            経常収益合計: 34069533000,
            附属病院収益: 17100000000,
            運営費交付金収益: 9670000000,
            学生納付金等収益: 2870000000,
            受託研究等収益: 1540000000
          },
          経常費用: { 
            経常費用合計: 34723539000,
            人件費: 16360000000,
            診療経費: 12510000000,
            教育経費: 1560000000,
            研究経費: 1570000000
          },
          経常損失: 654006000,
          当期純損失: 325961000
        },
        キャッシュフロー計算書: {
          営業活動によるキャッシュフロー: { 営業活動によるキャッシュフロー合計: 1470000000 },
          投資活動によるキャッシュフロー: { 投資活動によるキャッシュフロー合計: -10489748000 },
          財務活動によるキャッシュフロー: { 財務活動によるキャッシュフロー合計: 4340000000 }
        },
        セグメント情報: {
          '学部・研究科等': { 業務損益: 350000000 },
          '附属病院': { 業務損益: -410984000 },
          '附属学校': { 業務損益: -90000000 }
        }
      },
      ratios: {
        負債比率: 63.62,
        流動比率: 1.2588,
        固定比率: 143.5,
        自己資本比率: 61.1
      },
      analysis: 'Test analysis',
      extractedText: 'Test extracted text'
    };
    
    console.log('Generating HTML infographic...');
    const htmlContent = generateHTMLReport(mockData);
    
    const outputPath = path.join(__dirname, 'generated-infographic.html');
    fs.writeFileSync(outputPath, htmlContent);
    
    console.log('✅ HTML infographic generated successfully');
    console.log(`📄 Output saved to: ${outputPath}`);
    console.log(`📊 File size: ${fs.statSync(outputPath).size} bytes`);
    
    const hasChartJS = htmlContent.includes('chart.js');
    const hasTailwind = htmlContent.includes('tailwindcss');
    const hasKPICards = htmlContent.includes('kpi-card');
    const hasChartContainers = htmlContent.includes('chart-container');
    const hasBrilliantBlues = htmlContent.includes('brilliantBlues');
    const hasProcessLabels = htmlContent.includes('processLabels');
    const hasSegmentChart = htmlContent.includes('segmentChart');
    const hasCashFlowSection = htmlContent.includes('cash-flow');
    const hasRecommendations = htmlContent.includes('recommendations');
    
    console.log(`Chart.js included: ${hasChartJS ? '✅' : '❌'}`);
    console.log(`Tailwind CSS included: ${hasTailwind ? '✅' : '❌'}`);
    console.log(`KPI cards present: ${hasKPICards ? '✅' : '❌'}`);
    console.log(`Chart containers present: ${hasChartContainers ? '✅' : '❌'}`);
    console.log(`Brilliant Blues color scheme: ${hasBrilliantBlues ? '✅' : '❌'}`);
    console.log(`Process Labels function: ${hasProcessLabels ? '✅' : '❌'}`);
    console.log(`Segment chart present: ${hasSegmentChart ? '✅' : '❌'}`);
    console.log(`Cash flow section: ${hasCashFlowSection ? '✅' : '❌'}`);
    console.log(`Strategic recommendations: ${hasRecommendations ? '✅' : '❌'}`);
    
    console.log('\n=== Content Analysis ===');
    console.log(`Total content length: ${htmlContent.length} characters`);
    console.log(`Number of chart configurations: ${(htmlContent.match(/new Chart/g) || []).length}`);
    console.log(`Color scheme references: ${(htmlContent.match(/brilliantBlues/g) || []).length}`);
    
    return outputPath;
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Error details:', error);
    return null;
  }
}

testHTMLInfographicGeneration().then(result => {
  if (result) {
    console.log('\n🎉 HTML infographic generation test completed successfully!');
    console.log('Ready for integration with PDF analysis pipeline.');
  } else {
    console.log('\n❌ HTML infographic generation test failed');
  }
}).catch(console.error);
