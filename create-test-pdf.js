const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

async function createTestPDF() {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page to the document
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  
  // Get the font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Draw the title
  page.drawText('Financial Statement Sample', {
    x: 50,
    y: 800,
    size: 24,
    font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('AIBoard Corporation', {
    x: 50,
    y: 770,
    size: 16,
    font,
    color: rgb(0, 0, 0),
  });
  
  // Draw the balance sheet
  page.drawText('Balance Sheet', {
    x: 50,
    y: 730,
    size: 18,
    font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Assets', {
    x: 50,
    y: 700,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Current Assets: 10,000,000 JPY', {
    x: 70,
    y: 680,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Fixed Assets: 5,000,000 JPY', {
    x: 70,
    y: 660,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Total Assets: 15,000,000 JPY', {
    x: 70,
    y: 640,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });
  
  // Draw the income statement
  page.drawText('Income Statement', {
    x: 50,
    y: 600,
    size: 18,
    font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Revenue: 20,000,000 JPY', {
    x: 70,
    y: 580,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Operating Income: 5,000,000 JPY', {
    x: 70,
    y: 560,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Net Income: 3,500,000 JPY', {
    x: 70,
    y: 540,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });
  
  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();
  
  // Create the test-files directory if it doesn't exist
  const testFilesDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testFilesDir)) {
    fs.mkdirSync(testFilesDir, { recursive: true });
  }
  
  // Write the PDF to a file
  const pdfPath = path.join(testFilesDir, 'financial-sample.pdf');
  fs.writeFileSync(pdfPath, pdfBytes);
  
  console.log(`Test PDF created at: ${pdfPath}`);
  return pdfPath;
}

createTestPDF()
  .then(pdfPath => {
    console.log('Test PDF creation successful!');
  })
  .catch(error => {
    console.error('Error creating test PDF:', error);
  });
