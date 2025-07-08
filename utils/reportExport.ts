import jsPDF from 'jspdf';
import { downloadPDFReport } from './downloadUtils';

import { FinancialData } from './structuredAnalysis';

export async function exportReportAsPDF(
  document: any,
  financialData: FinancialData
): Promise<void> {
  try {
    const pdf = new jsPDF();
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text('Financial Analysis Report', 20, 30);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.text(`Document: ${document.title || 'Financial Analysis'}`, 20, 50);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 65);
    
    let yPosition = 90;
    
    if (financialData.revenue.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Revenue Composition', 20, yPosition);
      yPosition += 15;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      financialData.revenue.forEach((item) => {
        pdf.text(`${item.label}: ${item.value.toLocaleString()} yen`, 25, yPosition);
        yPosition += 10;
      });
      yPosition += 10;
    }
    
    if (financialData.expenses.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Expense Composition', 20, yPosition);
      yPosition += 15;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      financialData.expenses.forEach((item) => {
        pdf.text(`${item.label}: ${item.value.toLocaleString()} yen`, 25, yPosition);
        yPosition += 10;
      });
      yPosition += 10;
    }
    
    if (financialData.keyMetrics.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Key Metrics', 20, yPosition);
      yPosition += 15;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      financialData.keyMetrics.forEach((metric) => {
        pdf.text(`${metric.metric}: ${metric.value.toLocaleString()}${metric.unit}`, 25, yPosition);
        yPosition += 10;
      });
    }
    
    const fileName = `financial_report_${(document.title || 'analysis').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
    const pdfOutput = pdf.output('datauristring');
    
    await downloadPDFReport(pdfOutput.split(',')[1], fileName);
    
    console.log(`PDF exported: ${fileName}`);
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('PDFエクスポート中にエラーが発生しました');
  }
}
