#!/usr/bin/env python3
"""
Generate the required JSON output file for the user
"""

import os
import json
from data_extractor import extract_financial_data, convert_to_required_format

def main():
    if 'EXPO_PUBLIC_GEMINI_API_KEY' not in os.environ:
        print("❌ Error: EXPO_PUBLIC_GEMINI_API_KEY environment variable not set")
        return False
    
    pdf_path = './b67155c2806c76359d1b3637d7ff2ac7.pdf'
    
    print("🔍 Extracting financial data from PDF...")
    try:
        financial_data = extract_financial_data(pdf_path)
        
        print("📊 Converting to required JSON format...")
        converted_data = convert_to_required_format(financial_data)
        
        output_file = 'extracted_financial_data_required_format.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(converted_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ JSON output saved to: {output_file}")
        print(f"📊 Total tables: {len(converted_data)}")
        
        for table in converted_data:
            print(f"   - {table['tableName']}: {len(table['data'])} items")
            
        print("\n🎯 Verifying key metrics:")
        for table in converted_data:
            if table['tableName'] == '貸借対照表':
                for item in table['data']:
                    if item['account'] == '資産合計':
                        print(f"   ✅ 総資産: {item['amount']:,}")
                    elif item['account'] == '負債合計':
                        print(f"   ✅ 負債合計: {item['amount']:,}")
                    elif item['account'] == '流動負債合計':
                        print(f"   ✅ 流動負債合計: {item['amount']:,}")
            elif table['tableName'] == '損益計算書':
                for item in table['data']:
                    if item['account'] == '経常費用合計':
                        print(f"   ✅ 経常費用合計: {item['amount']:,}")
        
        print("\n🎉 JSON generation completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during extraction: {e}")
        return False
    
    return True

if __name__ == '__main__':
    main()
