#!/usr/bin/env python3

import os
import sys
import subprocess
import time
import requests

def ensure_server_running():
    """Ensure Node.js server is running for API tests"""
    try:
        response = requests.get('http://localhost:3000', timeout=2)
        print("✅ Node.js server is already running")
        return True
    except:
        print("🚀 Starting Node.js server...")
        subprocess.Popen(['node', 'server.js'], cwd=os.getcwd())
        time.sleep(3)
        
        try:
            response = requests.get('http://localhost:3000', timeout=2)
            print("✅ Node.js server started successfully")
            return True
        except:
            print("⚠️  Node.js server may not be fully ready, but continuing with tests...")
            return True

def main():
    print("🧪 Financial Data Extractor - Comprehensive Test Suite")
    print("=" * 60)
    
    if not os.getenv('EXPO_PUBLIC_GEMINI_API_KEY'):
        print("❌ EXPO_PUBLIC_GEMINI_API_KEY not set")
        print("Please set the environment variable and try again.")
        sys.exit(1)
    
    target_pdf = './b67155c2806c76359d1b3637d7ff2ac7.pdf'
    if not os.path.exists(target_pdf):
        print(f"❌ Target PDF not found: {target_pdf}")
        print("Please ensure the PDF file is in the current directory.")
        sys.exit(1)
    
    print("✅ Environment setup completed")
    print(f"📄 Target PDF: {target_pdf}")
    print(f"📊 PDF Size: {os.path.getsize(target_pdf) / 1024:.2f} KB")
    print()
    
    ensure_server_running()
    
    print("🐍 Running Python test suite...")
    result = subprocess.run([sys.executable, 'test_financial_extractor.py'], cwd=os.getcwd())
    
    if result.returncode == 0:
        print("\n🎉 All Python tests completed successfully!")
    else:
        print("\n⚠️  Some Python tests may have failed. Check the output above.")
    
    print("\n📋 Test execution completed.")
    return result.returncode

if __name__ == '__main__':
    sys.exit(main())
