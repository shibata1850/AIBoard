console.log('=== Testing Final HTML Infographic Generation ===\n');

const fs = require('fs');
const path = require('path');

async function testFinalHTMLInfographic() {
  console.log('1. Testing HTML infographic generation with accurate data...');
  
  try {
    const { generateHTMLReport } = require('./utils/htmlReportGenerator');
    
    const testData = {
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
      analysis: 'Professional financial analysis',
      extractedText: 'Extracted financial data'
    };
    
    console.log('2. Generating HTML infographic...');
    const htmlContent = generateHTMLReport(testData);
    
    const outputPath = path.join(__dirname, 'final-infographic-output.html');
    fs.writeFileSync(outputPath, htmlContent);
    
    console.log('✅ HTML infographic generated successfully');
    console.log(`📄 Output saved to: ${outputPath}`);
    console.log(`📊 File size: ${fs.statSync(outputPath).size} bytes`);
    
    console.log('\n3. Verifying target format compliance...');
    
    const hasCorrectTitle = htmlContent.includes('国立大学法人山梨大学');
    const hasKPICards = htmlContent.includes('kpi-card');
    const hasChartJS = htmlContent.includes('chart.js');
    const hasTailwind = htmlContent.includes('tailwindcss');
    const hasBrilliantBlues = htmlContent.includes('brilliantBlues');
    const hasProcessLabels = htmlContent.includes('processLabels');
    const hasSegmentAnalysis = htmlContent.includes('セグメント分析');
    const hasCashFlowAnalysis = htmlContent.includes('キャッシュフロー分析');
    const hasStrategicRecommendations = htmlContent.includes('戦略的提言');
    
    console.log(`University name: ${hasCorrectTitle ? '✅' : '❌'}`);
    console.log(`KPI cards: ${hasKPICards ? '✅' : '❌'}`);
    console.log(`Chart.js integration: ${hasChartJS ? '✅' : '❌'}`);
    console.log(`Tailwind CSS: ${hasTailwind ? '✅' : '❌'}`);
    console.log(`Brilliant Blues color scheme: ${hasBrilliantBlues ? '✅' : '❌'}`);
    console.log(`Process Labels function: ${hasProcessLabels ? '✅' : '❌'}`);
    console.log(`Segment analysis: ${hasSegmentAnalysis ? '✅' : '❌'}`);
    console.log(`Cash flow analysis: ${hasCashFlowAnalysis ? '✅' : '❌'}`);
    console.log(`Strategic recommendations: ${hasStrategicRecommendations ? '✅' : '❌'}`);
    
    console.log('\n4. Checking financial accuracy...');
    
    const has719Assets = htmlContent.includes('719') && htmlContent.includes('億円');
    const has61EquityRatio = htmlContent.includes('61.1') && htmlContent.includes('%');
    const has6OperatingLoss = htmlContent.includes('6.5') || htmlContent.includes('6.54');
    const has4HospitalLoss = htmlContent.includes('4.1') || htmlContent.includes('4.11');
    
    console.log(`Total assets (719億円): ${has719Assets ? '✅' : '❌'}`);
    console.log(`Equity ratio (61.1%): ${has61EquityRatio ? '✅' : '❌'}`);
    console.log(`Operating loss (~6.5億円): ${has6OperatingLoss ? '✅' : '❌'}`);
    console.log(`Hospital segment loss (~4.1億円): ${has4HospitalLoss ? '✅' : '❌'}`);
    
    const formatCompliance = [hasCorrectTitle, hasKPICards, hasChartJS, hasTailwind, hasBrilliantBlues, hasProcessLabels, hasSegmentAnalysis, hasCashFlowAnalysis, hasStrategicRecommendations].filter(Boolean).length;
    const accuracyScore = [has719Assets, has61EquityRatio, has6OperatingLoss, has4HospitalLoss].filter(Boolean).length;
    
    console.log(`\n📊 Format Compliance: ${formatCompliance}/9`);
    console.log(`📈 Financial Accuracy: ${accuracyScore}/4`);
    
    if (formatCompliance >= 8 && accuracyScore >= 3) {
      console.log('🎉 HTML infographic meets target format requirements!');
      return true;
    } else {
      console.log('⚠️ HTML infographic needs further refinement');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Error details:', error);
    return false;
  }
}

testFinalHTMLInfographic().then(success => {
  if (success) {
    console.log('\n✅ Final HTML infographic test completed successfully!');
    console.log('Ready for production deployment.');
  } else {
    console.log('\n❌ Final HTML infographic test failed');
    console.log('Additional refinements needed.');
  }
}).catch(console.error);
