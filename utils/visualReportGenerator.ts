import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export interface VisualReportOptions {
  title: string;
  analysisContent: string;
  fileName?: string;
  documentType?: string;
}

export interface ParsedFinancialData {
  revenue?: number;
  profit?: number;
  expenses?: number;
  assets?: number;
  liabilities?: number;
  equity?: number;
  metrics: Array<{
    label: string;
    value: string;
    trend: 'positive' | 'negative' | 'neutral';
  }>;
  summary: string;
}

export function parseFinancialData(analysisContent: string): ParsedFinancialData {
  const metrics: Array<{
    label: string;
    value: string;
    trend: 'positive' | 'negative' | 'neutral';
  }> = [];

  const lines = analysisContent.split('\n');
  let revenue: number | undefined, profit: number | undefined, expenses: number | undefined;
  let assets: number | undefined, liabilities: number | undefined, equity: number | undefined;

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('売上') || lowerLine.includes('収益')) {
      const match = line.match(/[\d,]+/);
      if (match) revenue = parseInt(match[0].replace(/,/g, ''), 10);
    }
    
    if (lowerLine.includes('利益') || lowerLine.includes('純利益')) {
      const match = line.match(/[\d,]+/);
      if (match) profit = parseInt(match[0].replace(/,/g, ''), 10);
    }
    
    if (lowerLine.includes('費用') || lowerLine.includes('支出')) {
      const match = line.match(/[\d,]+/);
      if (match) expenses = parseInt(match[0].replace(/,/g, ''), 10);
    }

    if (line.includes('%')) {
      const percentMatch = line.match(/([\d.]+)%/);
      if (percentMatch) {
        const value = parseFloat(percentMatch[1]);
        const trend = value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral';
        metrics.push({
          label: line.split(':')[0] || line.split('：')[0] || '指標',
          value: `${value}%`,
          trend
        });
      }
    }
  });

  if (revenue !== undefined) {
    metrics.push({
      label: '売上高',
      value: `¥${revenue.toLocaleString('ja-JP')}`,
      trend: 'neutral'
    });
  }

  if (profit !== undefined) {
    metrics.push({
      label: '純利益',
      value: `¥${profit.toLocaleString('ja-JP')}`,
      trend: profit > 0 ? 'positive' : 'negative'
    });
  }

  return {
    revenue,
    profit,
    expenses,
    assets,
    liabilities,
    equity,
    metrics,
    summary: analysisContent.substring(0, 200) + '...'
  };
}

export function generateVisualReportHTML(options: VisualReportOptions): string {
  const { title, analysisContent, fileName, documentType } = options;
  const parsedData = parseFinancialData(analysisContent);
  const currentDate = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .header-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        .company-info {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .date-info {
            font-size: 14px;
            opacity: 0.8;
        }
        
        .nav-tabs {
            display: flex;
            background-color: #f1f3f4;
            border-radius: 8px;
            padding: 5px;
            margin-bottom: 30px;
            overflow-x: auto;
        }
        
        .nav-tab {
            flex: 1;
            text-align: center;
            padding: 12px 20px;
            background-color: transparent;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            white-space: nowrap;
        }
        
        .nav-tab.active {
            background-color: white;
            color: #667eea;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-left: 4px solid #667eea;
        }
        
        .metric-card.positive {
            border-left-color: #28a745;
        }
        
        .metric-card.negative {
            border-left-color: #dc3545;
        }
        
        .metric-card.neutral {
            border-left-color: #6c757d;
        }
        
        .metric-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
        }
        
        .metric-value {
            font-size: 24px;
            font-weight: 700;
            color: #333;
        }
        
        .metric-value.positive {
            color: #28a745;
        }
        
        .metric-value.negative {
            color: #dc3545;
        }
        
        .data-table {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .table-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            font-size: 18px;
            font-weight: 600;
        }
        
        .table-content {
            padding: 20px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }
        
        th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #495057;
        }
        
        .analysis-section {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
        
        .analysis-text {
            font-size: 16px;
            line-height: 1.8;
            color: #555;
            white-space: pre-wrap;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #e9ecef;
            margin-top: 30px;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 15px;
            }
            
            .header {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .header-info {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .metrics-grid {
                grid-template-columns: 1fr;
            }
            
            .nav-tabs {
                flex-direction: column;
            }
            
            .nav-tab {
                margin-bottom: 5px;
            }
        }
        
        @media print {
            body {
                background-color: white;
            }
            
            .container {
                box-shadow: none;
                max-width: none;
            }
            
            .nav-tabs {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>${title}</h1>
            <div class="header-info">
                <div class="company-info">
                    <strong>SOFTDOING株式会社</strong>
                    ${fileName ? ` • ${fileName}` : ''}
                    ${documentType ? ` • ${documentType}` : ''}
                </div>
                <div class="date-info">
                    生成日時: ${currentDate}
                </div>
            </div>
        </header>

        <nav class="nav-tabs">
            <button class="nav-tab active">概要</button>
            <button class="nav-tab">財務分析</button>
            <button class="nav-tab">業績評価</button>
            <button class="nav-tab">推奨事項</button>
        </nav>

        <div class="metrics-grid">
            ${parsedData.metrics.map(metric => `
                <div class="metric-card ${metric.trend}">
                    <div class="metric-label">${metric.label}</div>
                    <div class="metric-value ${metric.trend}">${metric.value}</div>
                </div>
            `).join('')}
        </div>

        <div class="data-table">
            <div class="table-header">
                財務データ概要
            </div>
            <div class="table-content">
                <table>
                    <thead>
                        <tr>
                            <th>項目</th>
                            <th>金額</th>
                            <th>前年比</th>
                            <th>評価</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${parsedData.revenue !== undefined ? `
                        <tr>
                            <td>売上高</td>
                            <td>¥${parsedData.revenue.toLocaleString('ja-JP')}</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                        ` : ''}
                        ${parsedData.profit !== undefined ? `
                        <tr>
                            <td>純利益</td>
                            <td>¥${parsedData.profit.toLocaleString('ja-JP')}</td>
                            <td>-</td>
                            <td>${parsedData.profit > 0 ? '良好' : '要改善'}</td>
                        </tr>
                        ` : ''}
                        ${parsedData.expenses !== undefined ? `
                        <tr>
                            <td>総費用</td>
                            <td>¥${parsedData.expenses.toLocaleString('ja-JP')}</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                        ` : ''}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="analysis-section">
            <h2 class="section-title">詳細分析結果</h2>
            <div class="analysis-text">${analysisContent}</div>
        </div>

        <footer class="footer">
            <p>このレポートは AIBoard システムにより自動生成されました</p>
            <p>© 2025 SOFTDOING株式会社 All rights reserved.</p>
        </footer>
    </div>

    <script>
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    </script>
</body>
</html>`;
}

export async function generateVisualReport(options: VisualReportOptions): Promise<string> {
  const htmlContent = generateVisualReportHTML(options);
  const fileName = `${options.title.replace(/[^a-zA-Z0-9]/g, '_')}_visual_report.html`;
  
  if (Platform.OS === 'web') {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    return url;
  } else {
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return fileUri;
  }
}
