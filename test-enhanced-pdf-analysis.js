const fs = require('fs');
const path = require('path');

async function testEnhancedPdfAnalysis() {
  console.log('=== Enhanced PDF Analysis Pipeline Test ===\n');

  console.log('Test 1: Testing PDF table extraction API...');
  
  try {
    const testPdfContent = await createTestFinancialPdf();
    
    const response = await fetch('http://localhost:3000/api/extract-pdf-tables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        base64Content: testPdfContent 
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ PDF table extraction API working');
      console.log(`   Tables found: ${result.metadata?.tablesFound || 0}`);
      console.log(`   Confidence: ${result.metadata?.confidence || 'unknown'}`);
    } else {
      console.log('❌ PDF table extraction API failed:', response.status);
    }
  } catch (error) {
    console.log('❌ PDF table extraction test failed:', error.message);
  }

  console.log('\nTest 2: Testing financial data converter...');
  
  try {
    const { FinancialDataConverter } = require('./utils/financialDataConverter');
    
    const mockTables = [
      [
        ['項目', '金額（千円）'],
        ['流動資産合計', '8,838,001'],
        ['固定資産合計', '63,054,601'],
        ['資産合計', '71,892,602'],
        ['流動負債合計', '7,020,870'],
        ['固定負債合計', '20,926,388'],
        ['負債合計', '27,947,258'],
        ['純資産合計', '43,945,344']
      ]
    ];

    const converter = new FinancialDataConverter(mockTables);
    const structuredData = converter.convertToStructuredData();

    console.log('✅ Financial data converter working');
    console.log(`   Confidence: ${structuredData.extractionMetadata.confidence}`);
    console.log(`   Tables processed: ${structuredData.extractionMetadata.tablesFound}`);
    console.log(`   Debt ratio: ${structuredData.ratios.負債比率}%`);
    console.log(`   Current ratio: ${structuredData.ratios.流動比率}`);
    
    const expectedDebtRatio = (27947258 / 43945344) * 100;
    const expectedCurrentRatio = 8838001 / 7020870;
    
    console.log(`   Expected debt ratio: ${expectedDebtRatio.toFixed(2)}%`);
    console.log(`   Expected current ratio: ${expectedCurrentRatio.toFixed(2)}`);
    
  } catch (error) {
    console.log('❌ Financial data converter test failed:', error.message);
  }

  console.log('\nTest 3: Testing Chain of Thought prompt generation...');
  
  try {
    const { ChainOfThoughtPrompts } = require('./utils/chainOfThoughtPrompts');
    
    const mockStructuredData = {
      statements: {
        貸借対照表: {
          資産の部: {
            流動資産: { 流動資産合計: 8838001 },
            固定資産: { 固定資産合計: 63054601 },
            資産合計: 71892602
          },
          負債の部: {
            流動負債: { 流動負債合計: 7020870 },
            固定負債: { 固定負債合計: 20926388 },
            負債合計: 27947258
          },
          純資産の部: { 純資産合計: 43945344 }
        },
        損益計算書: {
          経常収益: { 経常収益合計: 50000000 },
          経常費用: { 経常費用合計: 52000000 },
          経常利益: -2000000,
          当期純損失: 1500000
        },
        キャッシュフロー計算書: {
          営業活動によるキャッシュフロー: { 営業活動によるキャッシュフロー合計: 1000000 },
          投資活動によるキャッシュフロー: { 
            投資活動によるキャッシュフロー合計: -10489748,
            有形固定資産の取得による支出: -6739139
          },
          財務活動によるキャッシュフロー: { 財務活動によるキャッシュフロー合計: 500000 },
          現金及び現金同等物の増減額: -8989748
        },
        セグメント情報: {
          附属病院: {
            業務損益: -410984
          }
        }
      },
      ratios: {
        負債比率: 63.58,
        流動比率: 1.26,
        固定比率: 1.43,
        自己資本比率: 61.12
      },
      extractionMetadata: {
        extractedAt: new Date().toISOString(),
        tablesFound: 3,
        confidence: 'high',
        warnings: []
      }
    };

    const calculationPrompt = ChainOfThoughtPrompts.createFinancialCalculationPrompt(mockStructuredData);
    const qualitativePrompt = ChainOfThoughtPrompts.createQualitativeAnalysisPrompt(mockStructuredData, {});
    const finalPrompt = ChainOfThoughtPrompts.createFinalReportPrompt({}, {});

    console.log('✅ Chain of Thought prompts generated successfully');
    console.log(`   Calculation prompt length: ${calculationPrompt.length} characters`);
    console.log(`   Qualitative prompt length: ${qualitativePrompt.length} characters`);
    console.log(`   Final report prompt length: ${finalPrompt.length} characters`);
    
    const hasJapaneseTerms = calculationPrompt.includes('負債比率') && 
                            calculationPrompt.includes('流動比率') &&
                            qualitativePrompt.includes('附属病院');
    
    if (hasJapaneseTerms) {
      console.log('✅ Prompts contain required Japanese financial terms');
    } else {
      console.log('❌ Prompts missing required Japanese financial terms');
    }
    
  } catch (error) {
    console.log('❌ Chain of Thought prompts test failed:', error.message);
  }

  console.log('\n=== Test Summary ===');
  console.log('Enhanced PDF analysis pipeline components tested.');
  console.log('Ready for integration testing with actual PDF files.');
}

async function createTestFinancialPdf() {
  return 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRkCijotKLlgJ/lr77nhaXooajvvIkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDUgMDAwMDAgbiAKMDAwMDAwMDMxNCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQwOAolJUVPRg==';
}

if (require.main === module) {
  testEnhancedPdfAnalysis().catch(console.error);
}

module.exports = { testEnhancedPdfAnalysis };
