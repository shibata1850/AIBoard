const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class FinancialDataExtractor {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async extractSegmentProfitLoss(pdfPath) {
    const prompt = `このPDFファイルの24ページにある「(19) 開示すべきセグメント情報」という表から、「附属病院」行の「業務損益」の値を正確に抽出してください。

重要な指示：
1. 24ページの「(19) 開示すべきセグメント情報」表を探してください
2. その表の中で「附属病院」という行を見つけてください
3. 「附属病院」行の「業務損益」列の値を抽出してください
4. 値が△記号で始まっている場合は、それは負の値を意味します
5. 抽出した値をそのまま返してください（例：△410,984）

回答は抽出した値のみを返してください。説明は不要です。`;

    return await this.extractValue(pdfPath, prompt);
  }

  async extractTotalLiabilities(pdfPath) {
    const prompt = `このPDFファイルの貸借対照表から「負債合計」の値を正確に抽出してください。

重要な指示：
1. 貸借対照表の「負債の部」セクションを探してください
2. 「負債の部」の最後にある「負債合計」という項目を特定してください
3. 「純資産合計」ではなく、必ず「負債合計」の値を抽出してください
4. 「負債合計」に対応する金額（千円単位）を抽出してください
5. 値が△記号で始まっている場合は、それは負の値を意味します
6. 抽出した値をそのまま返してください（例：27,947,258）

注意：「純資産合計」や「資産合計」ではなく、必ず「負債の部」の「負債合計」を抽出してください。

回答は抽出した値のみを返してください。説明は不要です。`;

    return await this.extractValue(pdfPath, prompt);
  }

  async extractCurrentLiabilities(pdfPath) {
    const prompt = `このPDFファイルの貸借対照表から「流動負債合計」の値を正確に抽出してください。

重要な指示：
1. 貸借対照表の「負債の部」セクションを探してください
2. 「負債の部」の中の「流動負債」サブセクションを特定してください
3. 「流動負債」サブセクションの最後にある「流動負債合計」という項目を見つけてください
4. 「固定負債合計」「負債合計」「純資産合計」ではなく、必ず「流動負債合計」の値を抽出してください
5. 「流動負債合計」に対応する金額（千円単位）を抽出してください
6. 値が△記号で始まっている場合は、それは負の値を意味します
7. 抽出した値をそのまま返してください

注意：「固定負債合計」「負債合計」「純資産合計」ではなく、必ず「流動負債」セクションの「流動負債合計」を抽出してください。

回答は抽出した値のみを返してください。説明は不要です。`;

    return await this.extractValue(pdfPath, prompt);
  }

  async extractOrdinaryExpenses(pdfPath) {
    const prompt = `このPDFファイルの損益計算書から「経常費用合計」の値を正確に抽出してください。

重要な指示：
1. 損益計算書（収支計算書）を探してください
2. 損益計算書の「経常費用」セクションを特定してください
3. 「経常費用」セクションの最後にある「経常費用合計」という項目を見つけてください
4. 「経常収益合計」「当期純利益」「負債合計」ではなく、必ず「経常費用合計」の値を抽出してください
5. 「経常費用合計」に対応する金額（千円単位）を抽出してください
6. 値が△記号で始まっている場合は、それは負の値を意味します
7. 抽出した値をそのまま返してください

注意：「経常収益合計」「当期純利益」「負債合計」ではなく、必ず損益計算書の「経常費用合計」を抽出してください。

回答は抽出した値のみを返してください。説明は不要です。`;

    return await this.extractValue(pdfPath, prompt);
  }

  async extractValue(pdfPath, prompt) {
    try {
      const pdfBuffer = fs.readFileSync(pdfPath);
      const base64Content = pdfBuffer.toString('base64');

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Content,
            mimeType: "application/pdf"
          }
        }
      ]);

      const extractedValue = result.response.text().trim();
      const numericValue = this.parseJapaneseNumber(extractedValue);

      return {
        rawString: extractedValue,
        numericValue: numericValue,
        success: numericValue !== null
      };
    } catch (error) {
      return {
        rawString: null,
        numericValue: null,
        success: false,
        error: error.message
      };
    }
  }

  parseJapaneseNumber(value) {
    if (!value || typeof value !== 'string') {
      return null;
    }
    
    let cleanValue = value.trim();
    
    let isNegative = false;
    if (cleanValue.startsWith('△')) {
      isNegative = true;
      cleanValue = cleanValue.substring(1);
    } else if (cleanValue.startsWith('-')) {
      isNegative = true;
      cleanValue = cleanValue.substring(1);
    }
    
    cleanValue = cleanValue.replace(/,/g, '');
    cleanValue = cleanValue.replace(/[^\d]/g, '');
    
    const numericValue = parseInt(cleanValue, 10);
    
    if (isNaN(numericValue)) {
      return null;
    }
    
    return isNegative ? -numericValue : numericValue;
  }
}

class FinancialExtractorTestSuite {
  constructor() {
    this.testResults = [];
    this.apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    this.extractor = new FinancialDataExtractor(this.apiKey);
    this.targetPdf = './b67155c2806c76359d1b3637d7ff2ac7.pdf';
    
    this.expectedResults = {
      segmentProfitLoss: {
        rawString: '△410,984',
        numericValue: -410984,
        description: '附属病院 業務損益'
      },
      totalLiabilities: {
        rawString: '27,947,258',
        numericValue: 27947258,
        description: '負債合計'
      },
      currentLiabilities: {
        rawString: '7,020,870',
        numericValue: 7020870,
        description: '流動負債合計'
      },
      ordinaryExpenses: {
        rawString: '34,723,539',
        numericValue: 34723539,
        description: '経常費用合計'
      }
    };
  }

  async runAllTests() {
    console.log('='.repeat(80));
    console.log('FINANCIAL DATA EXTRACTOR - AUTOMATED TEST SUITE');
    console.log('='.repeat(80));
    console.log();

    if (!this.apiKey) {
      console.error('❌ SETUP FAILED: Gemini API key not configured');
      console.error('Please set EXPO_PUBLIC_GEMINI_API_KEY environment variable');
      return false;
    }

    if (!fs.existsSync(this.targetPdf)) {
      console.error(`❌ SETUP FAILED: Target PDF not found: ${this.targetPdf}`);
      return false;
    }

    console.log('✅ Setup completed successfully');
    console.log(`📄 Target PDF: ${this.targetPdf}`);
    console.log(`📊 PDF Size: ${(fs.statSync(this.targetPdf).size / 1024).toFixed(2)} KB`);
    console.log();

    const tests = [
      { name: 'Segment Profit/Loss', method: 'extractSegmentProfitLoss', expected: 'segmentProfitLoss' },
      { name: 'Total Liabilities', method: 'extractTotalLiabilities', expected: 'totalLiabilities' },
      { name: 'Current Liabilities', method: 'extractCurrentLiabilities', expected: 'currentLiabilities' },
      { name: 'Ordinary Expenses', method: 'extractOrdinaryExpenses', expected: 'ordinaryExpenses' }
    ];

    let allTestsPassed = true;

    for (const test of tests) {
      const result = await this.runSingleTest(test);
      this.testResults.push(result);
      if (!result.passed) {
        allTestsPassed = false;
      }
    }

    this.printSummary(allTestsPassed);
    return allTestsPassed;
  }

  async runSingleTest(test) {
    console.log(`🧪 Testing: ${test.name} (${this.expectedResults[test.expected].description})`);
    
    try {
      const startTime = Date.now();
      const result = await this.extractor[test.method](this.targetPdf);
      const duration = Date.now() - startTime;

      const expected = this.expectedResults[test.expected];
      
      if (!result.success) {
        console.log(`❌ FAILED: ${test.name}`);
        console.log(`   Error: ${result.error || 'Unknown extraction error'}`);
        console.log();
        return { name: test.name, passed: false, error: result.error, duration };
      }

      const rawStringMatch = result.rawString === expected.rawString;
      const numericValueMatch = result.numericValue === expected.numericValue;
      const testPassed = rawStringMatch && numericValueMatch;

      if (testPassed) {
        console.log(`✅ PASSED: ${test.name} (${duration}ms)`);
        console.log(`   Raw String: "${result.rawString}"`);
        console.log(`   Numeric Value: ${result.numericValue}`);
      } else {
        console.log(`❌ FAILED: ${test.name} (${duration}ms)`);
        console.log(`   Expected Raw: "${expected.rawString}" | Got: "${result.rawString}" | Match: ${rawStringMatch ? '✅' : '❌'}`);
        console.log(`   Expected Numeric: ${expected.numericValue} | Got: ${result.numericValue} | Match: ${numericValueMatch ? '✅' : '❌'}`);
      }
      
      console.log();
      
      return {
        name: test.name,
        passed: testPassed,
        duration,
        result,
        expected,
        rawStringMatch,
        numericValueMatch
      };

    } catch (error) {
      console.log(`❌ FAILED: ${test.name}`);
      console.log(`   Exception: ${error.message}`);
      console.log();
      return { name: test.name, passed: false, error: error.message, duration: 0 };
    }
  }

  printSummary(allTestsPassed) {
    console.log('='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));

    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalTests = this.testResults.length;
    const totalDuration = this.testResults.reduce((sum, r) => sum + (r.duration || 0), 0);

    console.log(`📊 Results: ${passedTests}/${totalTests} tests passed`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log();

    this.testResults.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const duration = result.duration ? `(${result.duration}ms)` : '';
      console.log(`   ${status} ${result.name} ${duration}`);
    });

    console.log();
    
    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED! Financial data extraction is working correctly.');
    } else {
      console.log('⚠️  SOME TESTS FAILED. Please review the extraction logic.');
    }

    console.log('='.repeat(80));
  }
}

async function main() {
  const testSuite = new FinancialExtractorTestSuite();
  const success = await testSuite.runAllTests();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { FinancialDataExtractor, FinancialExtractorTestSuite };
