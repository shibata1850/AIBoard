#!/usr/bin/env python3

import os
import sys
import json
import subprocess
from data_extractor import extract_financial_data

def generate_html_infographic():
    """Generate the final HTML infographic using extracted financial data"""
    
    print("🎨 Final HTML Infographic Generation")
    print("=" * 50)
    
    print("1. Extracting financial data...")
    financial_data = extract_financial_data()
    
    temp_data_file = './temp_financial_data.json'
    with open(temp_data_file, 'w', encoding='utf-8') as f:
        json.dump(financial_data, f, ensure_ascii=False, indent=2)
    
    print("2. Generating HTML infographic...")
    
    node_script = '''
const fs = require('fs');
const { generateHTMLReport } = require('./utils/htmlReportGenerator');

// Load extracted financial data
const financialData = JSON.parse(fs.readFileSync('./temp_financial_data.json', 'utf8'));

console.log('📊 Generating HTML with extracted data...');
const htmlContent = generateHTMLReport(financialData);

// Save to final output
fs.writeFileSync('./final-extracted-infographic.html', htmlContent);

console.log('✅ Final infographic generated: final-extracted-infographic.html');
console.log(`📄 File size: ${fs.statSync('./final-extracted-infographic.html').size} bytes`);

// Cleanup
fs.unlinkSync('./temp_financial_data.json');
'''
    
    with open('./generate_infographic.js', 'w') as f:
        f.write(node_script)
    
    try:
        result = subprocess.run(['node', 'generate_infographic.js'], 
                              capture_output=True, text=True, check=True)
        print(result.stdout)
        
        os.remove('./generate_infographic.js')
        
        print("🎉 Final HTML infographic generation completed!")
        print("📄 Output: final-extracted-infographic.html")
        
        if os.path.exists('./final-extracted-infographic.html'):
            file_size = os.path.getsize('./final-extracted-infographic.html')
            print(f"📊 Generated file size: {file_size} bytes")
            
            if file_size > 10000:  # Reasonable size check
                print("✅ HTML file appears to be properly generated")
                return True
            else:
                print("⚠️ HTML file seems too small, may be incomplete")
                return False
        else:
            print("❌ HTML file was not created")
            return False
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Node.js execution failed: {e}")
        print(f"stdout: {e.stdout}")
        print(f"stderr: {e.stderr}")
        
        if os.path.exists('./generate_infographic.js'):
            os.remove('./generate_infographic.js')
        if os.path.exists('./temp_financial_data.json'):
            os.remove('./temp_financial_data.json')
            
        sys.exit(1)

if __name__ == '__main__':
    success = generate_html_infographic()
    if not success:
        sys.exit(1)
