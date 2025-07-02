import { ExtractedFinancialData, FinancialStatements } from '../../types/financialStatements';

export interface VerificationResult {
  isValid: boolean;
  checks: {
    balanceSheetBalance: {
      passed: boolean;
      expected: number;
      actual: number;
      difference: number;
    };
    incomeStatementCalculations: {
      passed: boolean;
      checks: Array<{
        name: string;
        expected: number;
        actual: number;
        difference: number;
        passed: boolean;
      }>;
    };
    cashFlowCalculations: {
      passed: boolean;
      checks: Array<{
        name: string;
        expected: number;
        actual: number;
        difference: number;
        passed: boolean;
      }>;
    };
  };
  overallScore: number;
  warnings: string[];
}

export interface VerifiedFinancialData extends ExtractedFinancialData {
  verification: VerificationResult;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verifiedAt?: string;
  verifiedBy?: string;
}

export function performAutomaticIntegrityCheck(data: ExtractedFinancialData): VerificationResult {
  const warnings: string[] = [];
  const tolerance = 1000; // 1,000円の許容誤差

  const balanceSheet = data.statements.貸借対照表;
  const totalAssets = balanceSheet.資産の部.資産合計;
  const totalLiabilitiesAndEquity = balanceSheet.負債の部.負債合計 + balanceSheet.純資産の部.純資産合計;
  const balanceDifference = Math.abs(totalAssets - totalLiabilitiesAndEquity);
  const balanceSheetPassed = balanceDifference <= tolerance;

  if (!balanceSheetPassed) {
    warnings.push(`貸借対照表のバランスが取れていません。差額: ${balanceDifference.toLocaleString()}円`);
  }

  const incomeStatement = data.statements.損益計算書;
  const incomeChecks: Array<{
    name: string;
    expected: number;
    actual: number;
    difference: number;
    passed: boolean;
  }> = [];
  
  const expectedOrdinaryIncome = incomeStatement.経常収益.経常収益合計 - incomeStatement.経常費用.経常費用合計;
  const actualOrdinaryIncome = incomeStatement.経常利益;
  const ordinaryIncomeDiff = Math.abs(expectedOrdinaryIncome - actualOrdinaryIncome);
  const ordinaryIncomePassed = ordinaryIncomeDiff <= tolerance;

  incomeChecks.push({
    name: '経常利益計算',
    expected: expectedOrdinaryIncome,
    actual: actualOrdinaryIncome,
    difference: ordinaryIncomeDiff,
    passed: ordinaryIncomePassed
  });

  if (!ordinaryIncomePassed) {
    warnings.push(`経常利益の計算に誤差があります。差額: ${ordinaryIncomeDiff.toLocaleString()}円`);
  }

  const cashFlow = data.statements.キャッシュフロー計算書;
  const cashFlowChecks: Array<{
    name: string;
    expected: number;
    actual: number;
    difference: number;
    passed: boolean;
  }> = [];

  const expectedCashChange = 
    cashFlow.営業活動によるキャッシュフロー.営業活動によるキャッシュフロー合計 +
    cashFlow.投資活動によるキャッシュフロー.投資活動によるキャッシュフロー合計 +
    cashFlow.財務活動によるキャッシュフロー.財務活動によるキャッシュフロー合計;
  const actualCashChange = cashFlow.現金及び現金同等物の増減額;
  const cashChangeDiff = Math.abs(expectedCashChange - actualCashChange);
  const cashChangePassed = cashChangeDiff <= tolerance;

  cashFlowChecks.push({
    name: '現金増減額計算',
    expected: expectedCashChange,
    actual: actualCashChange,
    difference: cashChangeDiff,
    passed: cashChangePassed
  });

  if (!cashChangePassed) {
    warnings.push(`現金増減額の計算に誤差があります。差額: ${cashChangeDiff.toLocaleString()}円`);
  }

  const currentAssets = balanceSheet.資産の部.流動資産.流動資産合計;
  const fixedAssets = balanceSheet.資産の部.固定資産.固定資産合計;
  const calculatedTotalAssets = currentAssets + fixedAssets;
  const assetCalculationDiff = Math.abs(calculatedTotalAssets - totalAssets);
  const assetCalculationPassed = assetCalculationDiff <= tolerance;

  if (!assetCalculationPassed) {
    warnings.push(`資産合計の内訳計算に誤差があります。差額: ${assetCalculationDiff.toLocaleString()}円`);
  }

  const currentLiabilities = balanceSheet.負債の部.流動負債.流動負債合計;
  const fixedLiabilities = balanceSheet.負債の部.固定負債.固定負債合計;
  const calculatedTotalLiabilities = currentLiabilities + fixedLiabilities;
  const liabilityCalculationDiff = Math.abs(calculatedTotalLiabilities - balanceSheet.負債の部.負債合計);
  const liabilityCalculationPassed = liabilityCalculationDiff <= tolerance;

  if (!liabilityCalculationPassed) {
    warnings.push(`負債合計の内訳計算に誤差があります。差額: ${liabilityCalculationDiff.toLocaleString()}円`);
  }

  const allChecks = [
    balanceSheetPassed,
    ordinaryIncomePassed,
    cashChangePassed,
    assetCalculationPassed,
    liabilityCalculationPassed
  ];
  const passedChecks = allChecks.filter(check => check).length;
  const overallScore = (passedChecks / allChecks.length) * 100;

  const isValid = overallScore >= 80; // 80%以上で合格とする

  return {
    isValid,
    checks: {
      balanceSheetBalance: {
        passed: balanceSheetPassed,
        expected: totalAssets,
        actual: totalLiabilitiesAndEquity,
        difference: balanceDifference
      },
      incomeStatementCalculations: {
        passed: incomeChecks.every(check => check.passed),
        checks: incomeChecks
      },
      cashFlowCalculations: {
        passed: cashFlowChecks.every(check => check.passed),
        checks: cashFlowChecks
      }
    },
    overallScore,
    warnings
  };
}

export function addVerificationMetadata(
  data: ExtractedFinancialData,
  verification: VerificationResult
): VerifiedFinancialData {
  return {
    ...data,
    verification,
    verificationStatus: 'pending',
    extractionMetadata: {
      ...data.extractionMetadata,
      warnings: [...data.extractionMetadata.warnings, ...verification.warnings]
    }
  };
}
