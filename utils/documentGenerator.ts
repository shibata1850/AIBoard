import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface DocumentOptions {
  title: string;
  analysisContent: string;
  fileName?: string;
  documentType?: string;
}

export async function generatePDFReport(options: DocumentOptions): Promise<string> {
  const { title, analysisContent, fileName, documentType } = options;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  
  let yPosition = 30;
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, yPosition);
  yPosition += 15;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`生成日時: ${new Date().toLocaleString('ja-JP')}`, margin, yPosition);
  yPosition += 10;
  
  if (fileName) {
    doc.text(`ファイル名: ${fileName}`, margin, yPosition);
    yPosition += 10;
  }
  
  if (documentType) {
    doc.text(`資料種別: ${documentType}`, margin, yPosition);
    yPosition += 15;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('分析結果', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const lines = doc.splitTextToSize(analysisContent, maxWidth);
  
  for (let i = 0; i < lines.length; i++) {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 30;
    }
    doc.text(lines[i], margin, yPosition);
    yPosition += 6;
  }
  
  const pdfOutput = doc.output('datauristring');
  
  if (Platform.OS === 'web') {
    const link = document.createElement('a');
    link.href = pdfOutput;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    link.click();
    return pdfOutput;
  } else {
    const fileUri = `${FileSystem.documentDirectory}${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const base64Data = pdfOutput.split(',')[1];
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return fileUri;
  }
}

export async function generateWordReport(options: DocumentOptions): Promise<string> {
  const { title, analysisContent, fileName, documentType } = options;
  
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `生成日時: ${new Date().toLocaleString('ja-JP')}`,
                size: 24,
              }),
            ],
          }),
          ...(fileName ? [new Paragraph({
            children: [
              new TextRun({
                text: `ファイル名: ${fileName}`,
                size: 24,
              }),
            ],
          })] : []),
          ...(documentType ? [new Paragraph({
            children: [
              new TextRun({
                text: `資料種別: ${documentType}`,
                size: 24,
              }),
            ],
          })] : []),
          new Paragraph({
            text: '分析結果',
            heading: HeadingLevel.HEADING_1,
          }),
          ...analysisContent.split('\n').map(line => 
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 22,
                }),
              ],
            })
          ),
        ],
      },
    ],
  });
  
  const buffer = await Packer.toBuffer(doc);
  
  if (Platform.OS === 'web') {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
    link.click();
    URL.revokeObjectURL(url);
    return url;
  } else {
    const fileUri = `${FileSystem.documentDirectory}${title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
    const base64Data = buffer.toString('base64');
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return fileUri;
  }
}
