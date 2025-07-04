#!/usr/bin/env python3
import sys
import os
sys.path.append('.')
from data_extractor import FinancialDataExtractor

print('Testing FinancialDataExtractor...')
extractor = FinancialDataExtractor()
result = extractor.extract_financial_data()
print('Result type:', type(result))
print('Result keys:', list(result.keys()) if isinstance(result, dict) else 'Not a dict')
print('Sample data:', str(result)[:500] + '...' if len(str(result)) > 500 else str(result))
