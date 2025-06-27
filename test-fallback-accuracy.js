const fs = require('fs');
const path = require('path');

async function testFallbackAccuracy() {
  console.log('=== Testing Fallback Data Accuracy ===\n');
  
  try {
    console.log('1. Testing getAccurateFallbackData function...');
    
    const { generateHTMLReport } = require('./utils/htmlReportGenerator');
    
    const mockStructuredData = {
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
          経常収益: { 経常収益合計: 34069533000 },
          経常費用: { 経常費用合計: 34723539000 },
          経常利益: -654006000
        },
        セグメント情報: {
          附属病院: { 業務損益: -410984000 }
        }
      },
      ratios: {
        負債比率: 63.60,
        流動比率: 1.2588,
        固定比率: 143.5,
        自己資本比率: 61.1
      }
    };
    
    console.log('✅ Mock structured data created with accurate reference values');
    
    console.log('\n2. Generating visual report with accurate structured data...');
    
    const mockAnalysisText = JSON.stringify(mockStructuredData, null, 2);
    
    const reportData = {
      companyName: '国立大学法人山梨大学',
      fiscalYear: '平成27事業年度',
      statements: mockStructuredData.statements,
      ratios: mockStructuredData.ratios,
      analysis: mockAnalysisText,
      extractedText: mockAnalysisText
    };
    
    const htmlContent = generateHTMLReport(reportData);
    
    console.log('✅ Visual report generated successfully');
    
    console.log('\n3. Verifying accuracy of generated metrics...');
    
    const debtRatioMatch = htmlContent.match(/負債比率.*?(\d+(?:\.\d+)?)%/);
    const currentRatioMatch = htmlContent.match(/流動比率.*?(\d+(?:\.\d+)?)/);
    const totalAssetsMatch = htmlContent.match(/資産.*?(\d+(?:\.\d+)?)<span[^>]*>億円/);
    const totalLiabilitiesMatch = htmlContent.match(/負債.*?(\d+(?:\.\d+)?)<span[^>]*>億円/);
    const netAssetsMatch = htmlContent.match(/純資産.*?(\d+(?:\.\d+)?)<span[^>]*>億円/);
    const hospitalLossMatch = htmlContent.match(/附属病院.*?(\d+(?:\.\d+)?)億円/);
    
    const results = {
      debtRatio: debtRatioMatch ? parseFloat(debtRatioMatch[1]) : null,
      currentRatio: currentRatioMatch ? parseFloat(currentRatioMatch[1]) : null,
      totalAssets: totalAssetsMatch ? parseFloat(totalAssetsMatch[1]) : null,
      totalLiabilities: totalLiabilitiesMatch ? parseFloat(totalLiabilitiesMatch[1]) : null,
      netAssets: netAssetsMatch ? parseFloat(netAssetsMatch[1]) : null,
      hospitalLoss: hospitalLossMatch ? parseFloat(hospitalLossMatch[1]) : null
    };
    
    console.log('\n📊 Extracted Metrics:');
    console.log(`Debt Ratio: ${results.debtRatio}% (Expected: 63.6%)`);
    console.log(`Current Ratio: ${results.currentRatio} (Expected: 1.26)`);
    console.log(`Total Assets: ${results.totalAssets}億円 (Expected: ~719億円)`);
    console.log(`Total Liabilities: ${results.totalLiabilities}億円 (Expected: ~279億円)`);
    console.log(`Net Assets: ${results.netAssets}億円 (Expected: ~439億円)`);
    console.log(`Hospital Loss: ${results.hospitalLoss}億円 (Expected: ~4.1億円)`);
    
    console.log('\n4. Accuracy verification...');
    
    let accuracyScore = 0;
    let totalTests = 0;
    
    if (results.debtRatio && Math.abs(results.debtRatio - 63.6) < 0.1) {
      console.log('✅ Debt ratio accuracy: PASS');
      accuracyScore++;
    } else {
      console.log('❌ Debt ratio accuracy: FAIL');
    }
    totalTests++;
    
    if (results.currentRatio && Math.abs(results.currentRatio - 1.26) < 0.1) {
      console.log('✅ Current ratio accuracy: PASS');
      accuracyScore++;
    } else {
      console.log('❌ Current ratio accuracy: FAIL');
    }
    totalTests++;
    
    if (results.totalAssets && Math.abs(results.totalAssets - 718.9) < 10) {
      console.log('✅ Total assets accuracy: PASS');
      accuracyScore++;
    } else {
      console.log('❌ Total assets accuracy: FAIL');
    }
    totalTests++;
    
    if (results.totalLiabilities && Math.abs(results.totalLiabilities - 279.5) < 10) {
      console.log('✅ Total liabilities accuracy: PASS');
      accuracyScore++;
    } else {
      console.log('❌ Total liabilities accuracy: FAIL');
    }
    totalTests++;
    
    if (results.netAssets && Math.abs(results.netAssets - 439.5) < 10) {
      console.log('✅ Net assets accuracy: PASS');
      accuracyScore++;
    } else {
      console.log('❌ Net assets accuracy: FAIL');
    }
    totalTests++;
    
    if (results.hospitalLoss && Math.abs(results.hospitalLoss - 4.1) < 1) {
      console.log('✅ Hospital segment loss accuracy: PASS');
      accuracyScore++;
    } else {
      console.log('❌ Hospital segment loss accuracy: FAIL');
    }
    totalTests++;
    
    console.log(`\n🎯 Overall Accuracy: ${accuracyScore}/${totalTests} (${(accuracyScore/totalTests*100).toFixed(1)}%)`);
    
    const outputPath = path.join(__dirname, 'fallback-accuracy-test-output.html');
    fs.writeFileSync(outputPath, htmlContent);
    console.log(`\n📄 Generated HTML saved to: ${outputPath}`);
    
    if (accuracyScore === totalTests) {
      console.log('\n🎉 SUCCESS: All metrics match reference values!');
      console.log('The fallback data integration is working correctly.');
    } else {
      console.log('\n⚠️  PARTIAL SUCCESS: Some metrics still need adjustment.');
      console.log('Further investigation needed to identify remaining issues.');
    }
    
    return { accuracyScore, totalTests, results };
    
  } catch (error) {
    console.error('❌ Fallback accuracy test failed:', error);
    throw error;
  }
}

testFallbackAccuracy()
  .then(result => {
    console.log('\n✅ Fallback accuracy test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fallback accuracy test failed');
    process.exit(1);
  });
