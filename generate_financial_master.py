#!/usr/bin/env python3

import json
import sys
from data_extractor import extract_structured_financial_tables

def main():
    """Generate comprehensive financial data master JSON file"""
    
    pdf_path = sys.argv[1] if len(sys.argv) > 1 else './b67155c2806c76359d1b3637d7ff2ac7.pdf'
    
    print("🔍 Generating 財務データマスター...")
    print(f"📄 Target PDF: {pdf_path}")
    
    try:
        financial_tables = extract_structured_financial_tables(pdf_path)
        
        financial_master = {
            "companyName": "国立大学法人山梨大学",
            "fiscalYear": "平成27事業年度", 
            "extractionDate": "2025-07-02",
            "totalTables": len(financial_tables),
            "financialStatements": financial_tables
        }
        
        output_file = "financial_data_master.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(financial_master, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 財務データマスター generated: {output_file}")
        print(f"📊 Total financial statements extracted: {len(financial_tables)}")
        
        print("\n" + "=" * 60)
        print("FINANCIAL DATA MASTER SUMMARY")
        print("=" * 60)
        
        for table in financial_tables:
            print(f"📋 {table['tableName']}: {len(table['data'])} items ({table['unit']})")
        
        print("=" * 60)
        print("✅ All financial data extracted successfully!")
        
        balance_sheet = next((t for t in financial_tables if t['tableName'] == '貸借対照表'), None)
        if balance_sheet:
            total_assets = next((item for item in balance_sheet['data'] if item['account'] == '資産合計'), None)
            if total_assets and total_assets['amount'] == 71892603:
                print("✅ Total assets verification: PASSED")
            else:
                print("❌ Total assets verification: FAILED")
        
        segment_info = next((t for t in financial_tables if t['tableName'] == '開示すべきセグメント情報'), None)
        if segment_info:
            hospital_loss = next((item for item in segment_info['data'] if item['account'] == '附属病院業務損益'), None)
            if hospital_loss and hospital_loss['amount'] == -410984:
                print("✅ Hospital segment loss verification: PASSED")
            else:
                print("❌ Hospital segment loss verification: FAILED")
        
        return financial_master
        
    except Exception as error:
        print(f"❌ Error generating financial master: {error}")
        sys.exit(1)

if __name__ == '__main__':
    main()
