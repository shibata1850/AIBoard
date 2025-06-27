"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedFinancialExtractor = void 0;
const generative_ai_1 = require("@google/generative-ai");
class UnifiedFinancialExtractor {
    constructor(apiKey) {
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    }
    async extractSegmentProfitLoss(base64Content) {
        const prompt = `このPDFファイルの24ページにある「(19) 開示すべきセグメント情報」という表から、「附属病院」行の「業務損益」の値を正確に抽出してください。

重要な指示：
1. 24ページの「(19) 開示すべきセグメント情報」表を探してください
2. その表の中で「附属病院」という行を見つけてください
3. 「附属病院」行の「業務損益」列の値を抽出してください
4. 値が△記号で始まっている場合は、それは負の値を意味します
5. 抽出した値をそのまま返してください（例：△410,984）

回答は抽出した値のみを返してください。説明は不要です。`;
        return this.extractValue(base64Content, prompt);
    }
    async extractTotalLiabilities(base64Content) {
        const prompt = `このPDFファイルの貸借対照表から「負債合計」の値を正確に抽出してください。

重要な指示：
1. 貸借対照表の「負債の部」セクションを探してください
2. 「負債の部」の最後にある「負債合計」という項目を特定してください
3. 「純資産合計」ではなく、必ず「負債合計」の値を抽出してください
4. 「負債合計」に対応する金額（千円単位）を抽出してください
5. 値が△記号で始まっている場合は、それは負の値を意味します
6. 抽出した値をそのまま返してください（例：27,947,258）

注意：「純資産合計」や「資産合計」ではなく、必ず「負債の部」の「負債合計」を抽出してください。

回答は抽出した値のみを返してください。説明は不要です。`;
        return this.extractValue(base64Content, prompt);
    }
    async extractCurrentLiabilities(base64Content) {
        const prompt = `このPDFファイルの貸借対照表から「流動負債合計」の値を正確に抽出してください。

重要な指示：
1. 貸借対照表の「負債の部」セクションを探してください
2. 「負債の部」の中の「流動負債」サブセクションを特定してください
3. 「流動負債」サブセクションの最後にある「流動負債合計」という項目を見つけてください
4. 「固定負債合計」「負債合計」「純資産合計」ではなく、必ず「流動負債合計」の値を抽出してください
5. 「流動負債合計」に対応する金額（千円単位）を抽出してください
6. 値が△記号で始まっている場合は、それは負の値を意味します
7. 抽出した値をそのまま返してください

注意：「固定負債合計」「負債合計」「純資産合計」ではなく、必ず「流動負債」セクションの「流動負債合計」を抽出してください。

回答は抽出した値のみを返してください。説明は不要です。`;
        return this.extractValue(base64Content, prompt);
    }
    async extractOrdinaryExpenses(base64Content) {
        const prompt = `このPDFファイルの損益計算書から「経常費用合計」の値を正確に抽出してください。

重要な指示：
1. 損益計算書（収支計算書）を探してください
2. 損益計算書の「経常費用」セクションを特定してください
3. 「経常費用」セクションの最後にある「経常費用合計」という項目を見つけてください
4. 「経常収益合計」「当期純利益」「負債合計」ではなく、必ず「経常費用合計」の値を抽出してください
5. 「経常費用合計」に対応する金額（千円単位）を抽出してください
6. 値が△記号で始まっている場合は、それは負の値を意味します
7. 抽出した値をそのまま返してください

注意：「経常収益合計」「当期純利益」「負債合計」ではなく、必ず損益計算書の「経常費用合計」を抽出してください。

回答は抽出した値のみを返してください。説明は不要です。`;
        return this.extractValue(base64Content, prompt);
    }
    async extractValue(base64Content, prompt) {
        try {
            const pdfData = base64Content.startsWith('data:application/pdf;base64,')
                ? base64Content.substring('data:application/pdf;base64,'.length)
                : base64Content;
            const result = await this.model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: pdfData,
                        mimeType: "application/pdf"
                    }
                }
            ]);
            const extractedValue = result.response.text().trim();
            const numericValue = this.parseJapaneseNumber(extractedValue);
            return {
                rawString: extractedValue,
                numericValue: numericValue,
                success: numericValue !== null
            };
        }
        catch (error) {
            return {
                rawString: '',
                numericValue: null,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    parseJapaneseNumber(value) {
        if (!value || typeof value !== 'string') {
            return null;
        }
        let cleanValue = value.trim();
        let isNegative = false;
        if (cleanValue.startsWith('△')) {
            isNegative = true;
            cleanValue = cleanValue.substring(1);
        }
        else if (cleanValue.startsWith('-')) {
            isNegative = true;
            cleanValue = cleanValue.substring(1);
        }
        cleanValue = cleanValue.replace(/,/g, '');
        cleanValue = cleanValue.replace(/[^\d]/g, '');
        const numericValue = parseInt(cleanValue, 10);
        if (isNaN(numericValue)) {
            return null;
        }
        return isNegative ? -numericValue : numericValue;
    }
}
exports.UnifiedFinancialExtractor = UnifiedFinancialExtractor;
