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


if __name__ == '__main__':
    unittest.main()
