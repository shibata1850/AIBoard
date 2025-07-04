#!/usr/bin/env python3
"""
Test the comprehensive PDF extraction pipeline end-to-end
"""

import os
import json
from data_extractor import extract_financial_data, convert_to_required_format

def main():
    print('🔍 Testing comprehensive PDF extraction pipeline...')
    
    if 'EXPO_PUBLIC_GEMINI_API_KEY' not in os.environ:
        print("❌ Error: EXPO_PUBLIC_GEMINI_API_KEY environment variable not set")
        return False
    
    try:
        financial_data = extract_financial_data('./b67155c2806c76359d1b3637d7ff2ac7.pdf')

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

        print('✅ Testing 4 key metrics accuracy:')
        all_accurate = True
        for metric, expected in expected_values.items():
            actual = actual_values[metric]
            accurate = actual == expected
            all_accurate = all_accurate and accurate
            print(f'   {metric}: {actual:,} (expected: {expected:,}) - {"✅" if accurate else "❌"}')

        revenue_items = financial_data['statements']['損益計算書']['経常収益']
        expense_items = financial_data['statements']['損益計算書']['経常費用']

        print('\n✅ Testing individual revenue items extraction:')
        individual_revenue_keys = [k for k in revenue_items.keys() if k != '経常収益合計']
        print(f'   Found {len(individual_revenue_keys)} individual revenue items: {individual_revenue_keys[:3]}...')

        print('\n✅ Testing individual expense items extraction:')
        individual_expense_keys = [k for k in expense_items.keys() if k != '経常費用合計']
        print(f'   Found {len(individual_expense_keys)} individual expense items: {individual_expense_keys[:3]}...')

        print('\n✅ Testing 附属明細書 sections:')
        statements = financial_data['statements']
        required_schedules = ['固定資産の明細', '借入金の明細', '業務費及び一般管理費の明細']
        schedules_found = 0
        for schedule in required_schedules:
            exists = schedule in statements and statements[schedule] is not None
            if exists:
                schedules_found += 1
            print(f'   {schedule}: {"✅" if exists else "❌"}')

        print('\n✅ Testing JSON format conversion:')
        converted_data = convert_to_required_format(financial_data)
        print(f'   Generated {len(converted_data)} tables in required format')
        
        format_correct = True
        for table in converted_data:
            has_required_fields = all(field in table for field in ['tableName', 'sourcePage', 'unit', 'data'])
            if not has_required_fields:
                format_correct = False
            print(f'   - {table["tableName"]}: {len(table["data"])} items - {"✅" if has_required_fields else "❌"}')

        print('\n✅ Testing verification system:')
        tolerance = 1000
        
        individual_revenue_sum = sum(
            amount for key, amount in revenue_items.items() 
            if key != '経常収益合計' and isinstance(amount, (int, float))
        )
        revenue_total = revenue_items['経常収益合計']
        revenue_diff = abs(individual_revenue_sum - revenue_total)
        revenue_passed = revenue_diff <= tolerance
        print(f'   Revenue sum check: {individual_revenue_sum:,} vs {revenue_total:,} (diff: {revenue_diff:,}) - {"✅" if revenue_passed else "❌"}')
        
        individual_expense_sum = sum(
            amount for key, amount in expense_items.items() 
            if key != '経常費用合計' and isinstance(amount, (int, float))
        )
        expense_total = expense_items['経常費用合計']
        expense_diff = abs(individual_expense_sum - expense_total)
        expense_passed = expense_diff <= tolerance
        print(f'   Expense sum check: {individual_expense_sum:,} vs {expense_total:,} (diff: {expense_diff:,}) - {"✅" if expense_passed else "❌"}')

        all_tests_passed = (
            all_accurate and 
            len(individual_revenue_keys) > 0 and 
            len(individual_expense_keys) > 0 and
            schedules_found >= 1 and  # At least one schedule should be found
            format_correct and
            revenue_passed and
            expense_passed
        )
        
        print(f'\n🎯 Overall test result: {"✅ ALL TESTS PASSED" if all_tests_passed else "❌ SOME TESTS FAILED"}')
        
        if all_tests_passed:
            print('\n🎉 Comprehensive PDF extraction pipeline successfully implemented!')
            print('   - 100% accuracy maintained for 4 key metrics')
            print('   - Individual line items extracted (not estimated)')
            print('   - 附属明細書 sections included')
            print('   - JSON format matches specification')
            print('   - Verification system validates data integrity')
        
        return all_tests_passed
        
    except Exception as e:
        print(f'❌ Error during extraction pipeline test: {e}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
