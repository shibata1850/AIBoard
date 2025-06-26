import { FinancialStatements, BalanceSheet, IncomeStatement, CashFlowStatement, SegmentInformation, FinancialRatios, ExtractedFinancialData } from '../types/financialStatements';

interface TableRow {
  [key: string]: string | number;
}

export class FinancialDataConverter {
  private tables: any[][];
  private warnings: string[] = [];

  constructor(tables: any[][]) {
    this.tables = tables;
  }

  public convertToStructuredData(): ExtractedFinancialData {
    const statements = this.extractFinancialStatements();
    const ratios = this.calculateFinancialRatios(statements);

    return {
      statements,
      ratios,
      extractionMetadata: {
        extractedAt: new Date().toISOString(),
        tablesFound: this.tables.length,
        confidence: this.warnings.length === 0 ? 'high' : this.warnings.length < 3 ? 'medium' : 'low',
        warnings: this.warnings
      }
    };
  }

  private extractFinancialStatements(): FinancialStatements {
    const balanceSheet = this.extractBalanceSheet();
    const incomeStatement = this.extractIncomeStatement();
    const cashFlowStatement = this.extractCashFlowStatement();
    const segmentInformation = this.extractSegmentInformation();

    return {
      貸借対照表: balanceSheet,
      損益計算書: incomeStatement,
      キャッシュフロー計算書: cashFlowStatement,
      セグメント情報: segmentInformation
    };
  }

  private extractBalanceSheet(): BalanceSheet {
    const balanceSheetTable = this.findTableByKeywords(['貸借対照表', '資産', '負債', '純資産']);
    
    if (!balanceSheetTable) {
      this.warnings.push('貸借対照表が見つかりませんでした');
      return this.createEmptyBalanceSheet();
    }

    const assets = this.extractAssets(balanceSheetTable);
    const liabilities = this.extractLiabilities(balanceSheetTable);
    const equity = this.extractEquity(balanceSheetTable);

    return {
      資産の部: assets,
      負債の部: liabilities,
      純資産の部: equity
    };
  }

  private extractIncomeStatement(): IncomeStatement {
    const incomeTable = this.findTableByKeywords(['損益計算書', '経常収益', '経常費用', '経常利益']);
    
    if (!incomeTable) {
      this.warnings.push('損益計算書が見つかりませんでした');
      return this.createEmptyIncomeStatement();
    }

    const revenue = this.extractRevenue(incomeTable);
    const expenses = this.extractExpenses(incomeTable);
    const operatingProfit = this.extractValue(incomeTable, ['経常利益']) || 0;
    const operatingLoss = this.extractValue(incomeTable, ['経常損失']) || 0;
    const netProfit = this.extractValue(incomeTable, ['当期純利益']) || 0;
    const netLoss = this.extractValue(incomeTable, ['当期純損失']) || 0;

    return {
      経常収益: revenue,
      経常費用: expenses,
      経常利益: operatingProfit - operatingLoss,
      経常損失: operatingLoss > 0 ? operatingLoss : undefined,
      当期純利益: netProfit > 0 ? netProfit : undefined,
      当期純損失: netLoss > 0 ? netLoss : undefined
    };
  }

  private extractCashFlowStatement(): CashFlowStatement {
    const cashFlowTable = this.findTableByKeywords(['キャッシュ', 'フロー', '営業活動', '投資活動', '財務活動']);
    
    if (!cashFlowTable) {
      this.warnings.push('キャッシュフロー計算書が見つかりませんでした');
      return this.createEmptyCashFlowStatement();
    }

    const operatingCF = this.extractValue(cashFlowTable, ['営業活動によるキャッシュフロー']) || 0;
    const investingCF = this.extractValue(cashFlowTable, ['投資活動によるキャッシュフロー']) || 0;
    const financingCF = this.extractValue(cashFlowTable, ['財務活動によるキャッシュフロー']) || 0;
    const netCashFlow = this.extractValue(cashFlowTable, ['現金及び現金同等物の増減額']) || (operatingCF + investingCF + financingCF);

    return {
      営業活動によるキャッシュフロー: {
        営業活動によるキャッシュフロー合計: operatingCF
      },
      投資活動によるキャッシュフロー: {
        投資活動によるキャッシュフロー合計: investingCF,
        有形固定資産の取得による支出: this.extractValue(cashFlowTable, ['有形固定資産の取得', '設備投資'])
      },
      財務活動によるキャッシュフロー: {
        財務活動によるキャッシュフロー合計: financingCF
      },
      現金及び現金同等物の増減額: netCashFlow
    };
  }

  private extractSegmentInformation(): SegmentInformation | undefined {
    const segmentTable = this.findTableByKeywords(['セグメント', '附属病院', '業務損益']);
    
    if (!segmentTable) {
      return undefined;
    }

    const segments: SegmentInformation = {};
    
    const hospitalSegmentLoss = this.extractValue(segmentTable, ['附属病院', '業務損益']);
    if (hospitalSegmentLoss !== null) {
      segments['附属病院'] = {
        業務損益: hospitalSegmentLoss
      };
    }

    return Object.keys(segments).length > 0 ? segments : undefined;
  }

  private extractAssets(table: any[][]): BalanceSheet['資産の部'] {
    const currentAssets = this.extractValue(table, ['流動資産合計', '流動資産']) || 0;
    const fixedAssets = this.extractValue(table, ['固定資産合計', '固定資産']) || 0;
    const totalAssets = this.extractValue(table, ['資産合計', '資産の部合計']) || (currentAssets + fixedAssets);

    return {
      流動資産: {
        流動資産合計: currentAssets,
        現金及び預金: this.extractValue(table, ['現金及び預金']),
        有価証券: this.extractValue(table, ['有価証券']),
        未収金: this.extractValue(table, ['未収金'])
      },
      固定資産: {
        固定資産合計: fixedAssets,
        有形固定資産: this.extractValue(table, ['有形固定資産']),
        無形固定資産: this.extractValue(table, ['無形固定資産']),
        投資その他の資産: this.extractValue(table, ['投資その他の資産'])
      },
      資産合計: totalAssets
    };
  }

  private extractLiabilities(table: any[][]): BalanceSheet['負債の部'] {
    const currentLiabilities = this.extractValue(table, ['流動負債合計', '流動負債']) || 0;
    const fixedLiabilities = this.extractValue(table, ['固定負債合計', '固定負債']) || 0;
    const totalLiabilities = this.extractValue(table, ['負債合計', '負債の部合計']) || (currentLiabilities + fixedLiabilities);

    return {
      流動負債: {
        流動負債合計: currentLiabilities,
        短期借入金: this.extractValue(table, ['短期借入金']),
        未払金: this.extractValue(table, ['未払金']),
        賞与引当金: this.extractValue(table, ['賞与引当金'])
      },
      固定負債: {
        固定負債合計: fixedLiabilities,
        長期借入金: this.extractValue(table, ['長期借入金']),
        退職給付引当金: this.extractValue(table, ['退職給付引当金'])
      },
      負債合計: totalLiabilities
    };
  }

  private extractEquity(table: any[][]): BalanceSheet['純資産の部'] {
    const totalEquity = this.extractValue(table, ['純資産合計', '純資産の部合計']) || 0;

    return {
      純資産合計: totalEquity,
      資本金: this.extractValue(table, ['資本金']),
      利益剰余金: this.extractValue(table, ['利益剰余金'])
    };
  }

  private extractRevenue(table: any[][]): IncomeStatement['経常収益'] {
    const totalRevenue = this.extractValue(table, ['経常収益合計', '経常収益']) || 0;

    return {
      経常収益合計: totalRevenue,
      運営費交付金収益: this.extractValue(table, ['運営費交付金収益', '運営費交付金']),
      授業料収益: this.extractValue(table, ['授業料収益', '授業料']),
      附属病院収益: this.extractValue(table, ['附属病院収益', '病院収益'])
    };
  }

  private extractExpenses(table: any[][]): IncomeStatement['経常費用'] {
    const totalExpenses = this.extractValue(table, ['経常費用合計', '経常費用']) || 0;

    return {
      経常費用合計: totalExpenses,
      教育経費: this.extractValue(table, ['教育経費']),
      研究経費: this.extractValue(table, ['研究経費']),
      診療経費: this.extractValue(table, ['診療経費']),
      人件費: this.extractValue(table, ['人件費'])
    };
  }

  private calculateFinancialRatios(statements: FinancialStatements): FinancialRatios {
    const balanceSheet = statements.貸借対照表;
    const totalAssets = balanceSheet.資産の部.資産合計;
    const currentAssets = balanceSheet.資産の部.流動資産.流動資産合計;
    const currentLiabilities = balanceSheet.負債の部.流動負債.流動負債合計;
    const totalLiabilities = balanceSheet.負債の部.負債合計;
    const totalEquity = balanceSheet.純資産の部.純資産合計;
    const fixedAssets = balanceSheet.資産の部.固定資産.固定資産合計;

    const debtRatio = totalLiabilities > 0 && totalEquity > 0 ? (totalLiabilities / totalEquity) * 100 : 0;
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const fixedRatio = totalEquity > 0 ? fixedAssets / totalEquity : 0;
    const equityRatio = totalAssets > 0 ? (totalEquity / totalAssets) * 100 : 0;

    return {
      負債比率: Math.round(debtRatio * 100) / 100,
      流動比率: Math.round(currentRatio * 100) / 100,
      固定比率: Math.round(fixedRatio * 100) / 100,
      自己資本比率: Math.round(equityRatio * 100) / 100
    };
  }

  private findTableByKeywords(keywords: string[]): any[][] | null {
    for (const table of this.tables) {
      if (this.tableContainsKeywords(table, keywords)) {
        return table;
      }
    }
    return null;
  }

  private tableContainsKeywords(table: any[][], keywords: string[]): boolean {
    const tableText = table.flat().join(' ').toLowerCase();
    return keywords.some(keyword => tableText.includes(keyword.toLowerCase()));
  }

  private extractValue(table: any[][], keywords: string[]): number | undefined {
    for (let i = 0; i < table.length; i++) {
      const row = table[i];
      for (let j = 0; j < row.length; j++) {
        const cell = String(row[j]).toLowerCase();
        if (keywords.some(keyword => cell.includes(keyword.toLowerCase()))) {
          for (let k = j + 1; k < row.length; k++) {
            const value = this.parseNumber(row[k]);
            if (value !== null) {
              return value;
            }
          }
          if (i + 1 < table.length) {
            for (let k = 0; k < table[i + 1].length; k++) {
              const value = this.parseNumber(table[i + 1][k]);
              if (value !== null) {
                return value;
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  private parseNumber(value: any): number | null {
    if (typeof value === 'number') {
      return value;
    }
    
    if (typeof value === 'string') {
      const cleanValue = value.replace(/[,\s千円万円億円]/g, '');
      const numMatch = cleanValue.match(/^[△▲-]?[\d.]+$/);
      if (numMatch) {
        let num = parseFloat(cleanValue.replace(/[△▲-]/, ''));
        if (value.includes('千円')) {
          num *= 1000;
        } else if (value.includes('万円')) {
          num *= 10000;
        } else if (value.includes('億円')) {
          num *= 100000000;
        }
        if (cleanValue.startsWith('△') || cleanValue.startsWith('▲') || cleanValue.startsWith('-')) {
          num = -num;
        }
        return num;
      }
    }
    
    return null;
  }

  private createEmptyBalanceSheet(): BalanceSheet {
    return {
      資産の部: {
        流動資産: { 流動資産合計: 0 },
        固定資産: { 固定資産合計: 0 },
        資産合計: 0
      },
      負債の部: {
        流動負債: { 流動負債合計: 0 },
        固定負債: { 固定負債合計: 0 },
        負債合計: 0
      },
      純資産の部: { 純資産合計: 0 }
    };
  }

  private createEmptyIncomeStatement(): IncomeStatement {
    return {
      経常収益: { 経常収益合計: 0 },
      経常費用: { 経常費用合計: 0 },
      経常利益: 0
    };
  }

  private createEmptyCashFlowStatement(): CashFlowStatement {
    return {
      営業活動によるキャッシュフロー: { 営業活動によるキャッシュフロー合計: 0 },
      投資活動によるキャッシュフロー: { 投資活動によるキャッシュフロー合計: 0 },
      財務活動によるキャッシュフロー: { 財務活動によるキャッシュフロー合計: 0 },
      現金及び現金同等物の増減額: 0
    };
  }
}
