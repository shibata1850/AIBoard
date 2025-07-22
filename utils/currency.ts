/**
 * 日本語通貨・数値解析ユーティリティ
 * 億/万/千の単位、カンマ、全角数字、マイナス記号などを正しく解釈する
 */

/**
 * 日本語の数値文字列を数値に変換する
 * @param value 解析対象の文字列
 * @returns 数値または null（解析できない場合）
 */
export function parseJapaneseCurrency(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  let normalized = value
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xFEE0))
    .replace(/[，、]/g, ',')
    .replace(/[－−]/g, '-')
    .replace(/\s+/g, '')
    .replace(/[円¥]/g, '');

  const isNegative = normalized.includes('-') || normalized.includes('▲') || normalized.includes('△');
  normalized = normalized.replace(/[-▲△]/g, '');

  let multiplier = 1;

  if (normalized.includes('億')) {
    multiplier *= 100000000;
    normalized = normalized.replace(/億/g, '');
  }
  
  if (normalized.includes('万')) {
    multiplier *= 10000;
    normalized = normalized.replace(/万/g, '');
  }
  
  if (normalized.includes('千')) {
    multiplier *= 1000;
    normalized = normalized.replace(/千/g, '');
  }

  normalized = normalized.replace(/,/g, '');

  const numericValue = parseFloat(normalized);
  
  if (isNaN(numericValue)) {
    return null;
  }

  let result = numericValue * multiplier;
  
  if (isNegative) {
    result = -result;
  }

  return result;
}

/**
 * 数値を日本語形式の文字列に変換する
 * @param value 数値
 * @param showUnit 単位を表示するかどうか
 * @returns フォーマットされた文字列
 */
export function formatJapaneseCurrency(value, showUnit = true) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'データなし';
  }

  const isNegative = value < 0;
  const absValue = Math.abs(value);

  let result = '';
  
  if (absValue >= 100000000) {
    const oku = Math.floor(absValue / 100000000);
    const remainder = absValue % 100000000;
    
    if (remainder >= 10000) {
      const man = Math.floor(remainder / 10000);
      result = `${oku}億${man}万`;
    } else {
      result = `${oku}億`;
    }
  } else if (absValue >= 10000) {
    const man = Math.floor(absValue / 10000);
    const remainder = absValue % 10000;
    
    if (remainder >= 1000) {
      const sen = Math.floor(remainder / 1000);
      result = `${man}万${sen}千`;
    } else {
      result = `${man}万`;
    }
  } else if (absValue >= 1000) {
    const sen = Math.floor(absValue / 1000);
    result = `${sen}千`;
  } else {
    result = absValue.toLocaleString('ja-JP');
  }

  if (showUnit) {
    result += '円';
  }

  if (isNegative) {
    result = `▲${result}`;
  }

  return result;
}

/**
 * 文字列から数値を抽出する（複数の数値が含まれる場合）
 * @param text 対象テキスト
 * @returns 抽出された数値の配列
 */
export function extractNumbers(text) {
  if (!text) return [];

  const numbers = [];
  
  const patterns = [
    /[▲△-]?[\d,]+億[\d,]*万?[\d,]*千?円?/g,
    /[▲△-]?[\d,]+万[\d,]*千?円?/g,
    /[▲△-]?[\d,]+千円?/g,
    /[▲△-]?[\d,]+円/g,
    /[▲△-]?[\d,]+/g
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const parsed = parseJapaneseCurrency(match);
        if (parsed !== null && numbers.indexOf(parsed) === -1) {
          numbers.push(parsed);
        }
      }
    }
  }

  return numbers.sort((a, b) => Math.abs(b) - Math.abs(a));
}

/**
 * 財務諸表の項目名を正規化する
 * @param itemName 項目名
 * @returns 正規化された項目名
 */
export function normalizeFinancialItemName(itemName) {
  if (!itemName) return '';

  return itemName
    .replace(/\s+/g, '')
    .replace(/[（）()]/g, '')
    .replace(/[：:]/g, '')
    .trim();
}
