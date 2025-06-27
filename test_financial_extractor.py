#!/usr/bin/env python3

import unittest
import os
import base64
import time
import google.generativeai as genai
from typing import Dict, Any, Optional

class FinancialDataExtractor:
    """Python implementation of financial data extraction using Gemini API"""
    
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    def extract_segment_profit_loss(self, pdf_path: str) -> Dict[str, Any]:
        prompt = """このPDFファイルの24ページにある「(19) 開示すべきセグメント情報」という表から、「附属病院」行の「業務損益」の値を正確に抽出してください。

重要な指示：
1. 24ページの「(19) 開示すべきセグメント情報」表を探してください
2. その表の中で「附属病院」という行を見つけてください
3. 「附属病院」行の「業務損益」列の値を抽出してください
4. 値が△記号で始まっている場合は、それは負の値を意味します
5. 抽出した値をそのまま返してください（例：△410,984）

回答は抽出した値のみを返してください。説明は不要です。"""
        
        return self._extract_value(pdf_path, prompt)
    
    def extract_total_liabilities(self, pdf_path: str) -> Dict[str, Any]:
        prompt = """このPDFファイルの貸借対照表から「負債合計」の値を正確に抽出してください。

重要な指示：
1. 貸借対照表の「負債の部」セクションを探してください
2. 「負債の部」の最後にある「負債合計」という項目を特定してください
3. 「純資産合計」ではなく、必ず「負債合計」の値を抽出してください
4. 「負債合計」に対応する金額（千円単位）を抽出してください
5. 値が△記号で始まっている場合は、それは負の値を意味します
6. 抽出した値をそのまま返してください（例：27,947,258）

注意：「純資産合計」や「資産合計」ではなく、必ず「負債の部」の「負債合計」を抽出してください。

回答は抽出した値のみを返してください。説明は不要です。"""
        
        return self._extract_value(pdf_path, prompt)
    
    def extract_current_liabilities(self, pdf_path: str) -> Dict[str, Any]:
        prompt = """このPDFファイルの貸借対照表から「流動負債合計」の値を正確に抽出してください。

重要な指示：
1. 貸借対照表の「負債の部」セクションを探してください
2. 「負債の部」の中の「流動負債」サブセクションを特定してください
3. 「流動負債」サブセクションの最後にある「流動負債合計」という項目を見つけてください
4. 「固定負債合計」「負債合計」「純資産合計」ではなく、必ず「流動負債合計」の値を抽出してください
5. 「流動負債合計」に対応する金額（千円単位）を抽出してください
6. 値が△記号で始まっている場合は、それは負の値を意味します
7. 抽出した値をそのまま返してください

注意：「固定負債合計」「負債合計」「純資産合計」ではなく、必ず「流動負債」セクションの「流動負債合計」を抽出してください。

回答は抽出した値のみを返してください。説明は不要です。"""
        
        return self._extract_value(pdf_path, prompt)
    
    def extract_ordinary_expenses(self, pdf_path: str) -> Dict[str, Any]:
        prompt = """このPDFファイルの損益計算書から「経常費用合計」の値を正確に抽出してください。

重要な指示：
1. 損益計算書（収支計算書）を探してください
2. 損益計算書の「経常費用」セクションを特定してください
3. 「経常費用」セクションの最後にある「経常費用合計」という項目を見つけてください
4. 「経常収益合計」「当期純利益」「負債合計」ではなく、必ず「経常費用合計」の値を抽出してください
5. 「経常費用合計」に対応する金額（千円単位）を抽出してください
6. 値が△記号で始まっている場合は、それは負の値を意味します
7. 抽出した値をそのまま返してください

注意：「経常収益合計」「当期純利益」「負債合計」ではなく、必ず損益計算書の「経常費用合計」を抽出してください。

回答は抽出した値のみを返してください。説明は不要です。"""
        
        return self._extract_value(pdf_path, prompt)
    
    def _extract_value(self, pdf_path: str, prompt: str) -> Dict[str, Any]:
        try:
            with open(pdf_path, 'rb') as f:
                pdf_content = f.read()
            
            response = self.model.generate_content([
                prompt,
                {
                    "mime_type": "application/pdf",
                    "data": pdf_content
                }
            ])
            
            extracted_value = response.text.strip()
            numeric_value = self._parse_japanese_number(extracted_value)
            
            return {
                'raw_string': extracted_value,
                'numeric_value': numeric_value,
                'success': numeric_value is not None
            }
        except Exception as error:
            return {
                'raw_string': None,
                'numeric_value': None,
                'success': False,
                'error': str(error)
            }
    
    def _parse_japanese_number(self, value: str) -> Optional[int]:
        if not value or not isinstance(value, str):
            return None
        
        clean_value = value.strip()
        
        is_negative = False
        if clean_value.startswith('△'):
            is_negative = True
            clean_value = clean_value[1:]
        elif clean_value.startswith('-'):
            is_negative = True
            clean_value = clean_value[1:]
        
        clean_value = clean_value.replace(',', '')
        clean_value = ''.join(c for c in clean_value if c.isdigit())
        
        try:
            numeric_value = int(clean_value)
            return -numeric_value if is_negative else numeric_value
        except ValueError:
            return None


class FinancialExtractorTestSuite(unittest.TestCase):
    """Comprehensive test suite for financial data extraction"""
    
    def setUp(self):
        self.api_key = os.getenv('EXPO_PUBLIC_GEMINI_API_KEY')
        self.target_pdf = './b67155c2806c76359d1b3637d7ff2ac7.pdf'
        
        if not self.api_key:
            self.skipTest('EXPO_PUBLIC_GEMINI_API_KEY not configured')
        
        if not os.path.exists(self.target_pdf):
            self.skipTest(f'Target PDF not found: {self.target_pdf}')
        
        self.extractor = FinancialDataExtractor(self.api_key)
        
        self.expected_results = {
            'segment_profit_loss': {'raw': '△410,984', 'numeric': -410984, 'description': '附属病院 業務損益'},
            'total_liabilities': {'raw': '27,947,258', 'numeric': 27947258, 'description': '負債合計'},
            'current_liabilities': {'raw': '7,020,870', 'numeric': 7020870, 'description': '流動負債合計'},
            'ordinary_expenses': {'raw': '34,723,539', 'numeric': 34723539, 'description': '経常費用合計'}
        }
    
    def test_segment_profit_loss_extraction(self):
        """Test extraction of 附属病院 業務損益"""
        print(f"\n🧪 Testing: Segment Profit/Loss ({self.expected_results['segment_profit_loss']['description']})")
        
        start_time = time.time()
        result = self.extractor.extract_segment_profit_loss(self.target_pdf)
        duration = time.time() - start_time
        
        expected = self.expected_results['segment_profit_loss']
        
        self.assertTrue(result['success'], f"Extraction failed: {result.get('error', 'Unknown error')}")
        self.assertEqual(result['raw_string'], expected['raw'], 
                        f"Raw string mismatch. Expected: '{expected['raw']}', Got: '{result['raw_string']}'")
        self.assertEqual(result['numeric_value'], expected['numeric'],
                        f"Numeric value mismatch. Expected: {expected['numeric']}, Got: {result['numeric_value']}")
        
        print(f"✅ PASSED: Segment Profit/Loss ({duration:.2f}s)")
        print(f"   Raw String: \"{result['raw_string']}\"")
        print(f"   Numeric Value: {result['numeric_value']}")
    
    def test_total_liabilities_extraction(self):
        """Test extraction of 負債合計"""
        print(f"\n🧪 Testing: Total Liabilities ({self.expected_results['total_liabilities']['description']})")
        
        start_time = time.time()
        result = self.extractor.extract_total_liabilities(self.target_pdf)
        duration = time.time() - start_time
        
        expected = self.expected_results['total_liabilities']
        
        self.assertTrue(result['success'], f"Extraction failed: {result.get('error', 'Unknown error')}")
        self.assertEqual(result['raw_string'], expected['raw'],
                        f"Raw string mismatch. Expected: '{expected['raw']}', Got: '{result['raw_string']}'")
        self.assertEqual(result['numeric_value'], expected['numeric'],
                        f"Numeric value mismatch. Expected: {expected['numeric']}, Got: {result['numeric_value']}")
        
        print(f"✅ PASSED: Total Liabilities ({duration:.2f}s)")
        print(f"   Raw String: \"{result['raw_string']}\"")
        print(f"   Numeric Value: {result['numeric_value']}")
    
    def test_current_liabilities_extraction(self):
        """Test extraction of 流動負債合計"""
        print(f"\n🧪 Testing: Current Liabilities ({self.expected_results['current_liabilities']['description']})")
        
        start_time = time.time()
        result = self.extractor.extract_current_liabilities(self.target_pdf)
        duration = time.time() - start_time
        
        expected = self.expected_results['current_liabilities']
        
        self.assertTrue(result['success'], f"Extraction failed: {result.get('error', 'Unknown error')}")
        self.assertEqual(result['raw_string'], expected['raw'],
                        f"Raw string mismatch. Expected: '{expected['raw']}', Got: '{result['raw_string']}'")
        self.assertEqual(result['numeric_value'], expected['numeric'],
                        f"Numeric value mismatch. Expected: {expected['numeric']}, Got: {result['numeric_value']}")
        
        print(f"✅ PASSED: Current Liabilities ({duration:.2f}s)")
        print(f"   Raw String: \"{result['raw_string']}\"")
        print(f"   Numeric Value: {result['numeric_value']}")
    
    def test_ordinary_expenses_extraction(self):
        """Test extraction of 経常費用合計"""
        print(f"\n🧪 Testing: Ordinary Expenses ({self.expected_results['ordinary_expenses']['description']})")
        
        start_time = time.time()
        result = self.extractor.extract_ordinary_expenses(self.target_pdf)
        duration = time.time() - start_time
        
        expected = self.expected_results['ordinary_expenses']
        
        self.assertTrue(result['success'], f"Extraction failed: {result.get('error', 'Unknown error')}")
        self.assertEqual(result['raw_string'], expected['raw'],
                        f"Raw string mismatch. Expected: '{expected['raw']}', Got: '{result['raw_string']}'")
        self.assertEqual(result['numeric_value'], expected['numeric'],
                        f"Numeric value mismatch. Expected: {expected['numeric']}, Got: {result['numeric_value']}")
        
        print(f"✅ PASSED: Ordinary Expenses ({duration:.2f}s)")
        print(f"   Raw String: \"{result['raw_string']}\"")
        print(f"   Numeric Value: {result['numeric_value']}")
    
    def test_all_extractions_comprehensive(self):
        """Run all extraction tests and verify consistency"""
        print("\n🔍 Running comprehensive extraction test...")
        
        test_methods = [
            ('segment_profit_loss', self.extractor.extract_segment_profit_loss),
            ('total_liabilities', self.extractor.extract_total_liabilities),
            ('current_liabilities', self.extractor.extract_current_liabilities),
            ('ordinary_expenses', self.extractor.extract_ordinary_expenses)
        ]
        
        results = {}
        total_start_time = time.time()
        
        for item_type, method in test_methods:
            with self.subTest(item_type=item_type):
                start_time = time.time()
                result = method(self.target_pdf)
                duration = time.time() - start_time
                
                expected = self.expected_results[item_type]
                
                self.assertTrue(result['success'], f"Extraction failed for {item_type}: {result.get('error', 'Unknown error')}")
                self.assertEqual(result['raw_string'], expected['raw'],
                               f"{item_type}: Raw string mismatch. Expected: '{expected['raw']}', Got: '{result['raw_string']}'")
                self.assertEqual(result['numeric_value'], expected['numeric'],
                               f"{item_type}: Numeric value mismatch. Expected: {expected['numeric']}, Got: {result['numeric_value']}")
                
                results[item_type] = {'result': result, 'duration': duration, 'expected': expected}
        
        total_duration = time.time() - total_start_time
        self._print_comprehensive_summary(results, total_duration)
    
    def _print_comprehensive_summary(self, results: Dict, total_duration: float):
        print("\n" + "=" * 80)
        print("COMPREHENSIVE TEST SUMMARY")
        print("=" * 80)
        
        passed_tests = len([r for r in results.values() if r['result']['success']])
        total_tests = len(results)
        
        print(f"📊 Results: {passed_tests}/{total_tests} tests passed")
        print(f"⏱️  Total Duration: {total_duration:.2f}s")
        print()
        
        for item_type, data in results.items():
            result = data['result']
            duration = data['duration']
            expected = data['expected']
            
            status = '✅ PASS' if result['success'] else '❌ FAIL'
            print(f"   {status} {expected['description']} ({duration:.2f}s)")
            if result['success']:
                print(f"        Raw: \"{result['raw_string']}\" | Numeric: {result['numeric_value']}")
        
        print()
        
        if passed_tests == total_tests:
            print('🎉 ALL TESTS PASSED! Financial data extraction is working correctly.')
        else:
            print('⚠️  SOME TESTS FAILED. Please review the extraction logic.')
        
        print("=" * 80)


def main():
    print('=' * 80)
    print('FINANCIAL DATA EXTRACTOR - PYTHON TEST SUITE')
    print('=' * 80)
    print()
    
    if not os.getenv('EXPO_PUBLIC_GEMINI_API_KEY'):
        print('❌ SETUP FAILED: Gemini API key not configured')
        print('Please set EXPO_PUBLIC_GEMINI_API_KEY environment variable')
        return False
    
    target_pdf = './b67155c2806c76359d1b3637d7ff2ac7.pdf'
    if not os.path.exists(target_pdf):
        print(f'❌ SETUP FAILED: Target PDF not found: {target_pdf}')
        return False
    
    print('✅ Setup completed successfully')
    print(f'📄 Target PDF: {target_pdf}')
    print(f'📊 PDF Size: {os.path.getsize(target_pdf) / 1024:.2f} KB')
    print()
    
    unittest.main(verbosity=2, exit=False)
    return True


if __name__ == '__main__':
    main()
