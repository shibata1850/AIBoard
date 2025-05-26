const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

async function createJapanesePDF() {
  try {
    console.log('=== 日本語PDFテストファイルの作成 ===');
    
    const pdfDoc = await PDFDocument.create();
    
    pdfDoc.registerFontkit(fontkit);
    
    const fontPath = path.join(__dirname, 'test-files', 'fonts', 'NotoSansJP-Regular.otf');
    
    if (!fs.existsSync(fontPath)) {
      console.error(`フォントファイルが見つかりません: ${fontPath}`);
      return;
    }
    
    console.log(`フォントファイル: ${fontPath}`);
    
    const fontBytes = fs.readFileSync(fontPath);
    const japaneseFont = await pdfDoc.embedFont(fontBytes);
    
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    
    page.drawText('財務諸表サンプル', {
      x: 50,
      y: 800,
      size: 24,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('株式会社AIBoard', {
      x: 50,
      y: 770,
      size: 16,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('貸借対照表', {
      x: 50,
      y: 730,
      size: 18,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('資産の部', {
      x: 50,
      y: 700,
      size: 14,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('流動資産: 10,000,000円', {
      x: 70,
      y: 680,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('固定資産: 5,000,000円', {
      x: 70,
      y: 660,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('資産合計: 15,000,000円', {
      x: 70,
      y: 640,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('負債の部', {
      x: 50,
      y: 620,
      size: 14,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('流動負債: 3,000,000円', {
      x: 70,
      y: 600,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('固定負債: 2,000,000円', {
      x: 70,
      y: 580,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('負債合計: 5,000,000円', {
      x: 70,
      y: 560,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('純資産の部', {
      x: 50,
      y: 540,
      size: 14,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('資本金: 5,000,000円', {
      x: 70,
      y: 520,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('利益剰余金: 5,000,000円', {
      x: 70,
      y: 500,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('純資産合計: 10,000,000円', {
      x: 70,
      y: 480,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('損益計算書', {
      x: 50,
      y: 440,
      size: 18,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('売上高: 20,000,000円', {
      x: 70,
      y: 420,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('売上原価: 12,000,000円', {
      x: 70,
      y: 400,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('売上総利益: 8,000,000円', {
      x: 70,
      y: 380,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('販売費及び一般管理費: 3,000,000円', {
      x: 70,
      y: 360,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('営業利益: 5,000,000円', {
      x: 70,
      y: 340,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('経常利益: 4,800,000円', {
      x: 70,
      y: 320,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('当期純利益: 3,500,000円', {
      x: 70,
      y: 300,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('財務指標', {
      x: 50,
      y: 260,
      size: 18,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('自己資本比率: 66.7%', {
      x: 70,
      y: 240,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('流動比率: 333.3%', {
      x: 70,
      y: 220,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('売上高営業利益率: 25.0%', {
      x: 70,
      y: 200,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('ROA（総資産利益率）: 23.3%', {
      x: 70,
      y: 180,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('ROE（自己資本利益率）: 35.0%', {
      x: 70,
      y: 160,
      size: 12,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    });
    
    const pdfBytes = await pdfDoc.save();
    
    const testFilesDir = path.join(__dirname, 'test-files');
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
    }
    
    const pdfPath = path.join(testFilesDir, 'japanese-financial-sample.pdf');
    fs.writeFileSync(pdfPath, pdfBytes);
    
    console.log(`日本語PDFファイルを作成しました: ${pdfPath}`);
    return pdfPath;
  } catch (error) {
    console.error('日本語PDFファイルの作成中にエラーが発生しました:', error);
    throw error;
  }
}

createJapanesePDF()
  .then(pdfPath => {
    console.log('日本語PDFファイルの作成に成功しました!');
  })
  .catch(error => {
    console.error('日本語PDFファイルの作成に失敗しました:', error);
    process.exit(1);
  });
