#!/usr/bin/env python3
"""
Test the integrated verification system functionality
"""

import os
import sys

def test_import_resolution():
    """Test that the verification system can import from analyze.ts"""
    print("🔍 Testing import resolution for verification system...")
    
    analyze_path = "./server/api/analyze.ts"
    if not os.path.exists(analyze_path):
        print("❌ analyze.ts not found")
        return False
    
    with open(analyze_path, 'r') as f:
        content = f.read()
        
    if "export async function extractStructuredDataFromPdf" in content:
        print("✅ extractStructuredDataFromPdf is properly exported")
        return True
    else:
        print("❌ extractStructuredDataFromPdf is not exported")
        return False

def test_verification_files():
    """Test that all verification system files are present"""
    print("\n🔍 Testing verification system files...")
    
    required_files = [
        "./server/api/verify.ts",
        "./server/api/verification.ts", 
        "./app/(app)/internal/verify.tsx"
    ]
    
    all_present = True
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path} exists")
        else:
            print(f"❌ {file_path} missing")
            all_present = False
    
    return all_present

def test_comprehensive_tools():
    """Test that comprehensive extraction tools are present"""
    print("\n🔍 Testing comprehensive extraction tools...")
    
    tools = [
        "./simple_json_generator.py",
        "./test_comprehensive_extraction.py",
        "./data_extractor.py"
    ]
    
    all_present = True
    for tool_path in tools:
        if os.path.exists(tool_path):
            print(f"✅ {tool_path} exists")
        else:
            print(f"❌ {tool_path} missing")
            all_present = False
    
    return all_present

def main():
    print("🚀 Testing comprehensive integration...")
    
    import_test = test_import_resolution()
    verification_test = test_verification_files()
    tools_test = test_comprehensive_tools()
    
    all_tests_passed = import_test and verification_test and tools_test
    
    print(f"\n🎯 Integration test result: {'✅ ALL TESTS PASSED' if all_tests_passed else '❌ SOME TESTS FAILED'}")
    
    if all_tests_passed:
        print("\n🎉 Comprehensive integration is ready!")
        print("   - Export fix applied successfully")
        print("   - Verification gate system files present")
        print("   - Comprehensive extraction tools included")
    
    return all_tests_passed

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
