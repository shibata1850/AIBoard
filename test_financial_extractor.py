import unittest

from data_extractor import extract_financial_data

class TestFinancialDataExtraction(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        pdf_path = 'b67155c2806c76359d1b3637d7ff2ac7.pdf'
        cls.data = extract_financial_data(pdf_path)

    def test_total_liabilities(self):
        self.assertEqual(self.data.get('負債合計'), 27947258)

    def test_current_liabilities(self):
        self.assertEqual(self.data.get('流動負債合計'), 7020870)

    def test_ordinary_expenses(self):
        self.assertEqual(self.data.get('経常費用合計'), 34723539)

    def test_hospital_segment_loss(self):
        self.assertEqual(self.data.get('附属病院業務損益'), -410984)

    def test_total_assets(self):
        self.assertEqual(self.data.get('資産合計'), 71892603)

    def test_current_assets(self):
        self.assertEqual(self.data.get('流動資産合計'), 8838001)

    def test_fixed_assets(self):
        self.assertEqual(self.data.get('固定資産合計'), 63054601)

    def test_total_equity(self):
        self.assertEqual(self.data.get('純資産合計'), 43945344)

    def test_total_revenue(self):
        self.assertEqual(self.data.get('経常収益合計'), 34069533)

    def test_hospital_revenue(self):
        self.assertEqual(self.data.get('附属病院収益'), 17100614)

    def test_operating_grant_revenue(self):
        self.assertEqual(self.data.get('運営費交付金収益'), 9665735)

    def test_net_loss(self):
        self.assertEqual(self.data.get('当期純損失'), -598995)

    def test_structured_format(self):
        """Test new structured JSON format with tableName, unit, data arrays"""
        from data_extractor import extract_structured_financial_tables
        structured_data = extract_structured_financial_tables('b67155c2806c76359d1b3637d7ff2ac7.pdf')
        
        self.assertIsInstance(structured_data, list)
        self.assertGreaterEqual(len(structured_data), 8)
        
        for table in structured_data:
            self.assertIn('tableName', table)
            self.assertIn('unit', table) 
            self.assertIn('data', table)
            self.assertEqual(table['unit'], '千円')
            self.assertIsInstance(table['data'], list)
            
            for item in table['data']:
                self.assertIn('category', item)
                self.assertIn('account', item)
                self.assertIn('amount', item)
                self.assertIsInstance(item['amount'], (int, float))

    def test_all_eight_financial_statements(self):
        """Test that all 8 required financial statements are extracted"""
        from data_extractor import extract_structured_financial_tables
        structured_data = extract_structured_financial_tables('b67155c2806c76359d1b3637d7ff2ac7.pdf')
        
        table_names = [table['tableName'] for table in structured_data]
        required_tables = [
            '貸借対照表',
            '損益計算書', 
            'キャッシュフロー計算書',
            '国立大学法人等業務実施コスト計算書',
            '固定資産の取得及び処分並びに減価償却費及び減損損失の明細',
            '借入金の明細',
            '業務費及び一般管理費の明細',
            '開示すべきセグメント情報'
        ]
        
        for required_table in required_tables:
            self.assertIn(required_table, table_names, f"Missing required table: {required_table}")

    def test_json_output_validation(self):
        """Test that JSON output can be serialized and contains expected structure"""
        from data_extractor import extract_structured_financial_tables
        import json
        
        structured_data = extract_structured_financial_tables('b67155c2806c76359d1b3637d7ff2ac7.pdf')
        
        json_output = json.dumps(structured_data, ensure_ascii=False, indent=2)
        self.assertIsInstance(json_output, str)
        
        parsed_data = json.loads(json_output)
        self.assertEqual(len(parsed_data), len(structured_data))
        
        balance_sheet = next((table for table in parsed_data if table['tableName'] == '貸借対照表'), None)
        self.assertIsNotNone(balance_sheet)
        
        total_assets_item = next((item for item in balance_sheet['data'] if item['account'] == '資産合計'), None)
        self.assertIsNotNone(total_assets_item)
        self.assertEqual(total_assets_item['amount'], 71892603)


if __name__ == '__main__':
    unittest.main()
