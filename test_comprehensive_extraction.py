#!/usr/bin/env python3
"""
Comprehensive test suite for the enhanced PDF extraction system
"""

import unittest
import json
import os
from data_extractor import extract_financial_data, convert_to_required_format

class ComprehensiveExtractionTestSuite(unittest.TestCase):
    
    def setUp(self):
        """Set up test environment"""
        self.pdf_path = './b67155c2806c76359d1b3637d7ff2ac7.pdf'
        self.assertTrue(os.path.exists(self.pdf_path), "Test PDF file must exist")
        
        os.environ['EXPO_PUBLIC_GEMINI_API_KEY'] = 'AIzaSyC_K60DXMMupIhvjJtkOF7R5GG9B_ekcBo'
    
    def test_individual_revenue_items_extraction(self):
        """Test extraction of individual revenue line items"""
        print("🧪 Testing individual revenue items extraction...")
        
        financial_data = extract_financial_data(self.pdf_path)
        revenue_items = financial_data['statements']['損益計算書']['経常収益']
        
        self.assertIn('経常収益合計', revenue_items)
        self.assertIn('運営費交付金収益', revenue_items)
        self.assertIn('附属病院収益', revenue_items)
        
        individual_sum = sum(
            amount for key, amount in revenue_items.items() 
            if key != '経常収益合計' and isinstance(amount, (int, float))
        )
        
        total_revenue = revenue_items['経常収益合計']
        difference = abs(individual_sum - total_revenue)
        
        print(f"   Individual revenue sum: {individual_sum:,}")
        print(f"   Total revenue: {total_revenue:,}")
        print(f"   Difference: {difference:,}")
        
        self.assertLess(difference, 1000000, "Individual revenue items should sum to total within 1,000,000円")
    
    def test_individual_expense_items_extraction(self):
        """Test extraction of individual expense line items"""
        print("🧪 Testing individual expense items extraction...")
        
        financial_data = extract_financial_data(self.pdf_path)
        expense_items = financial_data['statements']['損益計算書']['経常費用']
        
        self.assertIn('経常費用合計', expense_items)
        self.assertIn('人件費', expense_items)
        self.assertIn('診療経費', expense_items)
        
        individual_sum = sum(
            amount for key, amount in expense_items.items() 
            if key != '経常費用合計' and isinstance(amount, (int, float))
        )
        
        total_expenses = expense_items['経常費用合計']
        difference = abs(individual_sum - total_expenses)
        
        print(f"   Individual expense sum: {individual_sum:,}")
        print(f"   Total expenses: {total_expenses:,}")
        print(f"   Difference: {difference:,}")
        
        self.assertLess(difference, 1000000, "Individual expense items should sum to total within 1,000,000円")
    
    def test_supplementary_schedules_extraction(self):
        """Test extraction of supplementary schedules"""
        print("🧪 Testing supplementary schedules extraction...")
        
        financial_data = extract_financial_data(self.pdf_path)
        statements = financial_data['statements']
        
        self.assertIn('固定資産の明細', statements)
        self.assertIn('借入金の明細', statements)
        self.assertIn('業務費及び一般管理費の明細', statements)
        
        print(f"   Fixed assets schedule: {'✅' if statements['固定資産の明細'] else '❌'}")
        print(f"   Borrowings schedule: {'✅' if statements['借入金の明細'] else '❌'}")
        print(f"   Operating expenses schedule: {'✅' if statements['業務費及び一般管理費の明細'] else '❌'}")
    
    def test_json_format_conversion(self):
        """Test conversion to required tableName/sourcePage/unit/data format"""
        print("🧪 Testing JSON format conversion...")
        
        financial_data = extract_financial_data(self.pdf_path)
        converted_data = convert_to_required_format(financial_data)
        
        self.assertIsInstance(converted_data, list)
        for table in converted_data:
            self.assertIn('tableName', table)
            self.assertIn('sourcePage', table)
            self.assertIn('unit', table)
            self.assertIn('data', table)
            self.assertIsInstance(table['data'], list)
            
            for item in table['data']:
                self.assertIn('category', item)
                self.assertIn('account', item)
                self.assertIn('amount', item)
                self.assertIsInstance(item['amount'], (int, float))
        
        print(f"   Converted tables: {len(converted_data)}")
        for table in converted_data:
            print(f"   - {table['tableName']}: {len(table['data'])} items")
    
    def test_existing_metrics_accuracy(self):
        """Test that existing 4 key metrics maintain 100% accuracy"""
        print("🧪 Testing existing metrics accuracy...")
        
        financial_data = extract_financial_data(self.pdf_path)
        
        expected_values = {
            '総資産': 71892603000,
            '負債合計': 27947258000,
            '流動負債合計': 7020870000,
            '経常費用合計': 34723539000
        }
        
        actual_values = {
            '総資産': financial_data['statements']['貸借対照表']['資産の部']['資産合計'],
            '負債合計': financial_data['statements']['貸借対照表']['負債の部']['負債合計'],
            '流動負債合計': financial_data['statements']['貸借対照表']['負債の部']['流動負債']['流動負債合計'],
            '経常費用合計': financial_data['statements']['損益計算書']['経常費用']['経常費用合計']
        }
        
        for metric, expected in expected_values.items():
            actual = actual_values[metric]
            self.assertEqual(actual, expected, f"{metric} should maintain 100% accuracy")
            print(f"   ✅ {metric}: {actual:,} (expected: {expected:,})")
    
    def test_generate_required_json_output(self):
        """Generate the required JSON output file for the user"""
        print("🧪 Generating required JSON output file...")
        
        financial_data = extract_financial_data(self.pdf_path)
        converted_data = convert_to_required_format(financial_data)
        
        output_file = 'extracted_financial_data_required_format.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(converted_data, f, ensure_ascii=False, indent=2)
        
        print(f"   ✅ JSON output saved to: {output_file}")
        print(f"   📊 Total tables: {len(converted_data)}")
        
        self.assertTrue(os.path.exists(output_file), "JSON output file should be created")


if __name__ == '__main__':
    print("=" * 80)
    print("COMPREHENSIVE PDF EXTRACTION TEST SUITE")
    print("=" * 80)
    
    unittest.main(verbosity=2)
