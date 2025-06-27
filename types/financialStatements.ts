export interface FinancialStatements {
  貸借対照表: BalanceSheet;
  損益計算書: IncomeStatement;
  キャッシュフロー計算書: CashFlowStatement;
  セグメント情報?: SegmentInformation;
}

export interface BalanceSheet {
  資産の部: {
    流動資産: {
      流動資産合計: number;
      現金及び預金?: number;
      有価証券?: number;
      未収金?: number;
      [key: string]: number | undefined;
    };
    固定資産: {
      固定資産合計: number;
      有形固定資産?: number;
      無形固定資産?: number;
      投資その他の資産?: number;
      [key: string]: number | undefined;
    };
    資産合計: number;
  };
  負債の部: {
    流動負債: {
      流動負債合計: number;
      短期借入金?: number;
      未払金?: number;
      賞与引当金?: number;
      [key: string]: number | undefined;
    };
    固定負債: {
      固定負債合計: number;
      長期借入金?: number;
      退職給付引当金?: number;
      [key: string]: number | undefined;
    };
    負債合計: number;
  };
  純資産の部: {
    純資産合計: number;
    資本金?: number;
    利益剰余金?: number;
    [key: string]: number | undefined;
  };
}

export interface IncomeStatement {
  経常収益: {
    経常収益合計: number;
    運営費交付金収益?: number;
    授業料収益?: number;
    附属病院収益?: number;
    [key: string]: number | undefined;
  };
  経常費用: {
    経常費用合計: number;
    教育経費?: number;
    研究経費?: number;
    診療経費?: number;
    人件費?: number;
    [key: string]: number | undefined;
  };
  経常利益: number;
  経常損失?: number;
  当期純利益?: number;
  当期純損失?: number;
}

export interface CashFlowStatement {
  営業活動によるキャッシュフロー: {
    営業活動によるキャッシュフロー合計: number;
    [key: string]: number | undefined;
  };
  投資活動によるキャッシュフロー: {
    投資活動によるキャッシュフロー合計: number;
    有形固定資産の取得による支出?: number;
    [key: string]: number | undefined;
  };
  財務活動によるキャッシュフロー: {
    財務活動によるキャッシュフロー合計: number;
    [key: string]: number | undefined;
  };
  現金及び現金同等物の増減額: number;
}

export interface SegmentInformation {
  [segmentName: string]: {
    業務損益?: number;
    セグメント資産?: number;
    セグメント負債?: number;
    [key: string]: number | undefined;
  };
}

export interface FinancialRatios {
  負債比率: number;
  流動比率: number;
  固定比率: number;
  自己資本比率: number;
  総資産利益率?: number;
}

export interface ExtractedFinancialData {
  statements: FinancialStatements;
  ratios: FinancialRatios;
  extractionMetadata: {
    extractedAt: string;
    tablesFound: number;
    confidence: 'high' | 'medium' | 'low';
    warnings: string[];
  };
}
