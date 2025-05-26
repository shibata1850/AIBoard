/**
 * Fix Japanese encoding issues in text
 * @param text Text with potential encoding issues
 * @returns Fixed text
 */
function fixJapaneseEncoding(text) {
  if (!text) return text;
  
  let fixedText = text;
  
  // Direct term replacements for common financial terms
  const directReplacements = [
    { from: 'å£†ä‚Ø«', to: '売上高' },
    { from: 'å£²ä¸Š', to: '売上' },
    { from: 'å£²ä¸Šé«˜', to: '売上高' },
    { from: 'å©ç', to: '利益' },
    { from: 'å–¶æ¥­åˆ©ç›Š', to: '営業利益' },
    { from: 'ç´"åˆ©ç›Š', to: '純利益' },
    { from: 'è³‡ç£', to: '資産' },
    { from: 'è² å‚µ', to: '負債' },
    { from: 'ç·è³‡ç£', to: '総資産' },
    { from: 'ç´"è³‡ç£', to: '純資産' },
    { from: 'è²¸å€Ÿå¯¾ç…§è¡¨', to: '貸借対照表' },
    { from: 'æ•ä¸Šè¨ˆç®—æ›¸', to: '損益計算書' },
    { from: 'ã‚­ãƒ£ãƒƒã‚·ãƒ¥ãƒ•ãƒ­ãƒ¼', to: 'キャッシュフロー' },
    { from: 'ä‚å', to: '万円' }
  ];
  
  // Apply direct replacements
  for (const { from, to } of directReplacements) {
    try {
      fixedText = fixedText.replace(new RegExp(escapeRegExp(from), 'g'), to);
    } catch (error) {
      console.warn(`Error replacing term ${from}:`, error);
    }
  }
  
  // Character-by-character replacements for common patterns
  const charReplacements = [
    { from: 'å', to: '売' },
    { from: 'ç', to: '資' },
    { from: 'è', to: '負' },
    { from: 'é', to: '高' },
    { from: 'ä‚', to: '万' },
    { from: 'æ', to: '損' },
    { from: 'è²', to: '貸' },
    { from: 'å€', to: '借' },
    { from: 'ç…§', to: '照' },
    { from: 'è¡¨', to: '表' },
    { from: 'è¨ˆ', to: '計' },
    { from: 'ç®—', to: '算' },
    { from: 'æ›¸', to: '書' },
    { from: 'åˆ©', to: '利' },
    { from: 'ç›Š', to: '益' }
  ];
  
  // Apply character replacements
  for (const { from, to } of charReplacements) {
    try {
      fixedText = fixedText.replace(new RegExp(escapeRegExp(from), 'g'), to);
    } catch (error) {
      console.warn(`Error replacing char ${from}:`, error);
    }
  }
  
  return fixedText;
}

/**
 * Escape special characters in a string for use in a regular expression
 * @param string String to escape
 * @returns Escaped string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { fixJapaneseEncoding };
