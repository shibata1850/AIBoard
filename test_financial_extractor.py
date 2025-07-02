#!/usr/bin/env python3

import unittest
from data_extractor import extract_financial_data

class TestFinancialDataExtraction(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        pdf_path = 'b67155c2806c76359d1b3637d7ff2ac7.pdf'
        cls.data = extract_financial_data(pdf_path)

    def test_total_liabilities(self):
        """貸借対照表から「負債合計」を正しく抽出できるか"""
        expected = 27947258
        self.assertEqual(self.data.get('負債合計'), expected, "負債合計の抽出が不正確です")

    def test_current_liabilities(self):
        """貸借対照表から「流動負債合計」を正しく抽出できるか"""
        expected = 7020870
        self.assertEqual(self.data.get('流動負債合計'), expected, "流動負債合計の抽出が不正確です")

    def test_ordinary_expenses(self):
        """損益計算書から「経常費用合計」を正しく抽出できるか"""
        expected = 34723539
        self.assertEqual(self.data.get('経常費用合計'), expected, "経常費用合計の抽出が不正確です")

    def test_hospital_segment_loss(self):
        """セグメント情報から「附属病院」の「業務損益」を正しく抽出できるか（最重要）"""
        expected = -410984
        self.assertEqual(self.data.get('附属病院業務損益'), expected, "附属病院の業務損益の抽出が不正確です")

if __name__ == '__main__':
    unittest.main()
