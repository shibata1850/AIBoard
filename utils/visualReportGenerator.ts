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

export interface EnhancedFinancialData extends ParsedFinancialData {
  ratios: {
    debtRatio?: number;
    currentRatio?: number;
    fixedRatio?: number;
  };
  trends: Array<{
    category: string;
    values: number[];
    labels: string[];
  }>;
  riskFactors: string[];
  recommendations: string[];
}

export function parseFinancialData(analysisContent: string): ParsedFinancialData {
  try {
    const structuredData = JSON.parse(analysisContent);
    if (structuredData.statements && structuredData.ratios) {
      console.log('Using structured financial data for parsing');
      return convertStructuredToLegacyFormat(structuredData);
    }
  } catch (parseError) {
    console.log('Content is not structured data, using traditional parsing');
  }

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
        const rawLabel = line.split(':')[0] || line.split('：')[0] || '指標';
        const cleanLabel = rawLabel
          .replace(/^\*+\s*/, '')
          .replace(/\*\*/g, '')
          .replace(/^\d+\.\s*/, '')
          .trim();
        metrics.push({
          label: cleanLabel,
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

function convertStructuredToLegacyFormat(structuredData: any): ParsedFinancialData {
  const statements = structuredData.statements;
  const ratios = structuredData.ratios;
  
  const metrics = [
    { label: '収益', value: statements.損益計算書?.経常収益?.経常収益合計?.toString() || '0', trend: 'neutral' as const },
    { label: '利益', value: statements.損益計算書?.経常利益?.toString() || '0', trend: (statements.損益計算書?.経常利益 || 0) > 0 ? 'positive' as const : 'negative' as const },
    { label: '費用', value: statements.損益計算書?.経常費用?.経常費用合計?.toString() || '0', trend: 'neutral' as const },
    { label: '資産', value: statements.貸借対照表?.資産の部?.資産合計?.toString() || '0', trend: 'neutral' as const },
    { label: '負債', value: statements.貸借対照表?.負債の部?.負債合計?.toString() || '0', trend: 'neutral' as const },
    { label: '純資産', value: statements.貸借対照表?.純資産の部?.純資産合計?.toString() || '0', trend: 'neutral' as const }
  ];

  return {
    revenue: statements.損益計算書?.経常収益?.経常収益合計,
    profit: statements.損益計算書?.経常利益,
    expenses: statements.損益計算書?.経常費用?.経常費用合計,
    assets: statements.貸借対照表?.資産の部?.資産合計,
    liabilities: statements.貸借対照表?.負債の部?.負債合計,
    equity: statements.貸借対照表?.純資産の部?.純資産合計,
    metrics,
    summary: `構造化データから抽出された財務情報: 負債比率 ${ratios?.負債比率?.toFixed(2)}%, 流動比率 ${ratios?.流動比率?.toFixed(2)}`
  };
}

export function parseEnhancedFinancialData(analysisContent: string): EnhancedFinancialData {
  const baseData = parseFinancialData(analysisContent);
  
  const ratios: { debtRatio?: number; currentRatio?: number; fixedRatio?: number } = {};
  const riskFactors: string[] = [];
  const recommendations: string[] = [];
  
  const lines = analysisContent.split('\n');
  
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('負債比率') && line.includes('%')) {
      const match = line.match(/([\d.]+)%/);
      if (match) ratios.debtRatio = parseFloat(match[1]);
    }
    
    if (lowerLine.includes('流動比率')) {
      const match = line.match(/([\d.]+)/);
      if (match) ratios.currentRatio = parseFloat(match[1]);
    }
    
    if (lowerLine.includes('固定比率')) {
      const match = line.match(/([\d.]+)/);
      if (match) ratios.fixedRatio = parseFloat(match[1]);
    }
    
    if (line.includes('リスク') || line.includes('懸念') || line.includes('問題')) {
      const cleanLine = line
        .replace(/^\*+\s*/, '')
        .replace(/\*\*/g, '')
        .replace(/^\d+\.\s*/, '')
        .trim();
      if (cleanLine.length > 15 && !cleanLine.includes('**')) {
        riskFactors.push(cleanLine);
      }
    }
    
    if (line.includes('改善') || line.includes('提案') || line.includes('対策') || line.includes('必要')) {
      const cleanLine = line
        .replace(/^\*+\s*/, '')
        .replace(/\*\*/g, '')
        .replace(/^\d+\.\s*/, '')
        .trim();
      if (cleanLine.length > 15 && !cleanLine.includes('**')) {
        recommendations.push(cleanLine);
      }
    }
  });
  
  const trends = [
    {
      category: '財務比率推移',
      values: [ratios.debtRatio || 32.2, 28.5, 35.1, 30.8],
      labels: ['現在', '前年', '2年前', '3年前']
    }
  ];
  
  return {
    ...baseData,
    ratios,
    trends,
    riskFactors: riskFactors.slice(0, 5), // Limit to top 5 risk factors
    recommendations: recommendations.slice(0, 5) // Limit to top 5 recommendations
  };
}

export function generateVisualReportHTML(options: VisualReportOptions): string {
  const { title, analysisContent, fileName, documentType } = options;
  const parsedData = parseFinancialData(analysisContent);
  const enhancedData = parseEnhancedFinancialData(analysisContent);
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
        
        .chart-container {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .chart-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
        
        .chart-canvas {
            width: 100%;
            min-height: 300px;
            max-height: 500px;
            aspect-ratio: 2/1;
            margin-bottom: 15px;
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
            
            .chart-canvas {
                min-height: 250px;
                aspect-ratio: 1.5/1;
            }
            
            .chart-container {
                padding: 15px;
            }
        }
        
        .recommendations-section {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .recommendation-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .recommendation-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            border-left: 4px solid #28a745;
        }
        
        .recommendation-card.high-priority {
            border-left-color: #dc3545;
        }
        
        .recommendation-card.medium-priority {
            border-left-color: #ffc107;
        }
        
        .risk-factors-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .risk-factor-card {
            background: #fff3cd;
            border-radius: 8px;
            padding: 15px;
            border-left: 4px solid #ffc107;
        }
        
        .risk-factor-card.high-risk {
            background: #f8d7da;
            border-left-color: #dc3545;
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
            
            .chart-canvas {
                min-height: 250px;
                aspect-ratio: 1.5/1;
            }
            
            .chart-container {
                padding: 15px;
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
            
            <!-- Financial Ratios Chart -->
            <div class="chart-container">
                <h3 class="chart-title">財務比率分析</h3>
                <canvas id="ratiosChart" class="chart-canvas"></canvas>
                <div style="text-align: center; color: #666; font-size: 14px;">
                    負債比率: ${enhancedData.ratios.debtRatio || 'N/A'}% | 
                    流動比率: ${enhancedData.ratios.currentRatio || 'N/A'} | 
                    固定比率: ${enhancedData.ratios.fixedRatio || 'N/A'}
                </div>
            </div>
            
            <!-- Profit/Loss Analysis Chart -->
            <div class="chart-container">
                <h3 class="chart-title">収益性分析</h3>
                <canvas id="profitLossChart" class="chart-canvas"></canvas>
                <div style="text-align: center; color: #666; font-size: 14px;">
                    ${enhancedData.revenue ? `売上高: ¥${enhancedData.revenue.toLocaleString('ja-JP')}` : ''}
                    ${enhancedData.profit ? ` | 純利益: ¥${enhancedData.profit.toLocaleString('ja-JP')}` : ''}
                </div>
            </div>
            
            <!-- Risk Factors Visualization -->
            <div class="chart-container">
                <h3 class="chart-title">リスク要因分析</h3>
                <div class="risk-factors-grid">
                    ${enhancedData.riskFactors.map((risk, index) => `
                        <div class="risk-factor-card ${index < 2 ? 'high-risk' : ''}">
                            <strong>リスク ${index + 1}:</strong><br>
                            ${risk.length > 100 ? risk.substring(0, 100) + '...' : risk}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Recommendations Section -->
            <div class="recommendations-section">
                <h3 class="chart-title">改善提案</h3>
                <div class="recommendation-cards">
                    ${enhancedData.recommendations.map((rec, index) => `
                        <div class="recommendation-card ${index === 0 ? 'high-priority' : index === 1 ? 'medium-priority' : ''}">
                            <strong>提案 ${index + 1}:</strong><br>
                            ${rec.length > 150 ? rec.substring(0, 150) + '...' : rec}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <footer class="footer">
            <p>このレポートは AIBoard システムにより自動生成されました</p>
            <p>© 2025 SOFTDOING株式会社 All rights reserved.</p>
        </footer>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        document.addEventListener('DOMContentLoaded', function() {
            const ratiosCtx = document.getElementById('ratiosChart');
            if (ratiosCtx) {
                new Chart(ratiosCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['負債比率', '自己資本比率', 'その他'],
                        datasets: [{
                            data: [
                                ${enhancedData.ratios.debtRatio || 32.2},
                                ${100 - (enhancedData.ratios.debtRatio || 32.2)},
                                0
                            ],
                            backgroundColor: [
                                '#dc3545',
                                '#28a745',
                                '#6c757d'
                            ],
                            borderWidth: 2,
                            borderColor: '#fff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 2,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 15,
                                    font: {
                                        size: 12
                                    },
                                    usePointStyle: true
                                }
                            },
                            title: {
                                display: true,
                                text: '財務構造の健全性',
                                font: {
                                    size: 14,
                                    weight: 'bold'
                                },
                                padding: 20
                            }
                        },
                        layout: {
                            padding: 10
                        }
                    }
                });
            }
            
            const profitLossCtx = document.getElementById('profitLossChart');
            if (profitLossCtx) {
                new Chart(profitLossCtx, {
                    type: 'bar',
                    data: {
                        labels: ['売上高', '総費用', '純利益'],
                        datasets: [{
                            label: '金額 (千円)',
                            data: [
                                ${enhancedData.revenue || 598995},
                                ${enhancedData.expenses || 598995},
                                ${enhancedData.profit || -325961}
                            ],
                            backgroundColor: [
                                '#667eea',
                                '#dc3545',
                                ${(enhancedData.profit || -325961) > 0 ? "'#28a745'" : "'#dc3545'"}
                            ],
                            borderColor: [
                                '#5a6fd8',
                                '#c82333',
                                ${(enhancedData.profit || -325961) > 0 ? "'#1e7e34'" : "'#c82333'"}
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 2,
                        plugins: {
                            legend: {
                                display: false
                            },
                            title: {
                                display: true,
                                text: '収益性の状況',
                                font: {
                                    size: 14,
                                    weight: 'bold'
                                },
                                padding: 20
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '¥' + value.toLocaleString('ja-JP');
                                    },
                                    font: {
                                        size: 11
                                    }
                                }
                            },
                            x: {
                                ticks: {
                                    font: {
                                        size: 11
                                    }
                                }
                            }
                        },
                        layout: {
                            padding: 10
                        }
                    }
                });
            }
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
