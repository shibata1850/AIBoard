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

    def test_total_assets(self):
        """貸借対照表から「資産合計」を正しく抽出できるか"""
        expected = 71892602
        self.assertEqual(self.data.get('資産合計'), expected, "資産合計の抽出が不正確です")

    def test_current_assets(self):
        """貸借対照表から「流動資産合計」を正しく抽出できるか"""
        expected = 24000000
        self.assertEqual(self.data.get('流動資産合計'), expected, "流動資産合計の抽出が不正確です")

    def test_fixed_assets(self):
        """貸借対照表から「固定資産合計」を正しく抽出できるか"""
        expected = 47892602
        self.assertEqual(self.data.get('固定資産合計'), expected, "固定資産合計の抽出が不正確です")

    def test_total_equity(self):
        """貸借対照表から「純資産合計」を正しく抽出できるか"""
        expected = 43945344
        self.assertEqual(self.data.get('純資産合計'), expected, "純資産合計の抽出が不正確です")

    def test_total_revenue(self):
        """損益計算書から「経常収益合計」を正しく抽出できるか"""
        expected = 34312555
        self.assertEqual(self.data.get('経常収益合計'), expected, "経常収益合計の抽出が不正確です")

    def test_hospital_revenue(self):
        """損益計算書から「附属病院収益」を正しく抽出できるか"""
        expected = 17100000
        self.assertEqual(self.data.get('附属病院収益'), expected, "附属病院収益の抽出が不正確です")

    def test_operating_grant_revenue(self):
        """損益計算書から「運営費交付金収益」を正しく抽出できるか"""
        expected = 9670000
        self.assertEqual(self.data.get('運営費交付金収益'), expected, "運営費交付金収益の抽出が不正確です")

    def test_tuition_revenue(self):
        """損益計算書から「学生納付金等収益」を正しく抽出できるか"""
        expected = 2870000
        self.assertEqual(self.data.get('学生納付金等収益'), expected, "学生納付金等収益の抽出が不正確です")

    def test_research_revenue(self):
        """損益計算書から「受託研究等収益」を正しく抽出できるか"""
        expected = 1540000
        self.assertEqual(self.data.get('受託研究等収益'), expected, "受託研究等収益の抽出が不正確です")

    def test_personnel_costs(self):
        """損益計算書から「人件費」を正しく抽出できるか"""
        expected = 16320000
        self.assertEqual(self.data.get('人件費'), expected, "人件費の抽出が不正確です")

    def test_medical_costs(self):
        """損益計算書から「診療経費」を正しく抽出できるか"""
        expected = 12500000
        self.assertEqual(self.data.get('診療経費'), expected, "診療経費の抽出が不正確です")

    def test_education_costs(self):
        """損益計算書から「教育経費」を正しく抽出できるか"""
        expected = 1560000
        self.assertEqual(self.data.get('教育経費'), expected, "教育経費の抽出が不正確です")

    def test_research_costs(self):
        """損益計算書から「研究経費」を正しく抽出できるか"""
        expected = 1560000
        self.assertEqual(self.data.get('研究経費'), expected, "研究経費の抽出が不正確です")

    def test_operating_loss(self):
        """損益計算書から「経常損失」を正しく抽出できるか"""
        expected = -411000
        self.assertEqual(self.data.get('経常損失'), expected, "経常損失の抽出が不正確です")

    def test_net_loss(self):
        """損益計算書から「当期純損失」を正しく抽出できるか"""
        expected = -205500
        self.assertEqual(self.data.get('当期純損失'), expected, "当期純損失の抽出が不正確です")

    def test_operating_cash_flow(self):
        """キャッシュフロー計算書から「営業活動によるキャッシュフロー合計」を正しく抽出できるか"""
        expected = 1470000
        self.assertEqual(self.data.get('営業活動によるキャッシュフロー合計'), expected, "営業活動によるキャッシュフロー合計の抽出が不正確です")

    def test_investing_cash_flow(self):
        """キャッシュフロー計算書から「投資活動によるキャッシュフロー合計」を正しく抽出できるか"""
        expected = -10640000
        self.assertEqual(self.data.get('投資活動によるキャッシュフロー合計'), expected, "投資活動によるキャッシュフロー合計の抽出が不正確です")

    def test_financing_cash_flow(self):
        """キャッシュフロー計算書から「財務活動によるキャッシュフロー合計」を正しく抽出できるか"""
        expected = 4360000
        self.assertEqual(self.data.get('財務活動によるキャッシュフロー合計'), expected, "財務活動によるキャッシュフロー合計の抽出が不正確です")

    def test_academic_segment_profit(self):
        """セグメント情報から「学部・研究科等」の「業務損益」を正しく抽出できるか"""
        expected = 350000
        self.assertEqual(self.data.get('学部・研究科等業務損益'), expected, "学部・研究科等の業務損益の抽出が不正確です")

    def test_school_segment_loss(self):
        """セグメント情報から「附属学校」の「業務損益」を正しく抽出できるか"""
        expected = -90000
        self.assertEqual(self.data.get('附属学校業務損益'), expected, "附属学校の業務損益の抽出が不正確です")

if __name__ == '__main__':
    unittest.main()
