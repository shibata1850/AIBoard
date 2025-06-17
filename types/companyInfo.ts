export type CompanyInfoCategory = '社訓' | 'ポリシー' | '手順' | 'FAQ';

export interface CompanyInfo {
  id: string;
  title: string;
  content: string;
  category: CompanyInfoCategory;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyInfoInsert {
  title: string;
  content: string;
  category: CompanyInfoCategory;
  created_by: string;
}

export interface CompanyInfoUpdate {
  title?: string;
  content?: string;
  category?: CompanyInfoCategory;
}
