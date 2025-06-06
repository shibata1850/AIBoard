import jsPDF from 'jspdf';
import { BusinessDocument } from '../types/documents';
import { FinancialData } from './structuredAnalysis';

export async function exportReportAsPDF(
  document: BusinessDocument,
  financialData: FinancialData
): Promise<void> {
  try {
    const pdf = new jsPDF();
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text('財務分析レポート', 20, 30);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.text(`文書名: ${document.title}`, 20, 50);
    pdf.text(`作成日: ${new Date().toLocaleDateString('ja-JP')}`, 20, 65);
    
    let yPosition = 90;
    
    if (financialData.revenue.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('収益構成', 20, yPosition);
      yPosition += 15;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      financialData.revenue.forEach((item) => {
        pdf.text(`${item.label}: ${item.value.toLocaleString()}円`, 25, yPosition);
        yPosition += 10;
      });
      yPosition += 10;
    }
    
    if (financialData.expenses.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('費用構成', 20, yPosition);
      yPosition += 15;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      financialData.expenses.forEach((item) => {
        pdf.text(`${item.label}: ${item.value.toLocaleString()}円`, 25, yPosition);
        yPosition += 10;
      });
      yPosition += 10;
    }
    
    if (financialData.keyMetrics.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('主要指標', 20, yPosition);
      yPosition += 15;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      financialData.keyMetrics.forEach((metric) => {
        pdf.text(`${metric.metric}: ${metric.value.toLocaleString()}${metric.unit}`, 25, yPosition);
        yPosition += 10;
      });
    }
    
    const fileName = `financial_report_${document.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
    pdf.save(fileName);
    
    console.log(`PDF exported: ${fileName}`);
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('PDFエクスポート中にエラーが発生しました');
  }
}
