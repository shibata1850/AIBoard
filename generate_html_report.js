#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generateHTMLReport(data) {
  const { companyName, fiscalYear, statements, ratios, analysis } = data;
  
  const safeStatements = statements || {};
  const safeRatios = ratios || { 負債比率: 0, 流動比率: 0 };

  const totalAssets = (safeStatements.貸借対照表?.資産の部?.資産合計 || 0) / 100000;
  const currentAssets = (safeStatements.貸借対照表?.資産の部?.流動資産?.流動資産合計 || 0) / 100000;
  const fixedAssets = (safeStatements.貸借対照表?.資産の部?.固定資産?.固定資産合計 || 0) / 100000;
  const totalLiabilities = (safeStatements.貸借対照表?.負債の部?.負債合計 || 0) / 100000;
  const totalEquity = (safeStatements.貸借対照表?.純資産の部?.純資産合計 || 0) / 100000;
  const totalRevenue = (safeStatements.損益計算書?.経常収益?.経常収益合計 || 0) / 100000;
  const totalExpenses = (safeStatements.損益計算書?.経常費用?.経常費用合計 || 0) / 100000;
  const operatingLoss = Math.abs(safeStatements.損益計算書?.経常損失 || 0) / 100000;
  const netLoss = Math.abs(safeStatements.損益計算書?.当期純損失 || 0) / 100000;
  
  const operatingCF = (safeStatements.キャッシュフロー計算書?.営業活動によるキャッシュフロー?.営業活動によるキャッシュフロー合計 || 0) / 100000;
  const investingCF = (safeStatements.キャッシュフロー計算書?.投資活動によるキャッシュフロー?.投資活動によるキャッシュフロー合計 || 0) / 100000;
  const financingCF = (safeStatements.キャッシュフロー計算書?.財務活動によるキャッシュフロー?.財務活動によるキャッシュフロー合計 || 0) / 100000;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyName} 財務分析インフォグラフィック</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        body { 
            font-family: 'Noto Sans JP', sans-serif; 
            background-color: #F0F4F8;
        }
        .chart-container { 
            position: relative; 
            width: 100%;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
            height: 320px; 
        }
        @media (min-width: 768px) {
            .chart-container {
                height: 350px;
            }
        }
        .kpi-card { 
            background-color: white;
            border-radius: 0.75rem;
            padding: 1.5rem; 
            text-align: center; 
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .kpi-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }
        .kpi-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #004AAD;
        }
        .kpi-label {
            font-size: 1rem;
            color: #242F40;
            margin-top: 0.5rem;
        }
        .flow-arrow { 
            font-size: 2.5rem; 
            color: #009FFD; 
            line-height: 1;
        }
    </style>
</head>
<body class="text-[#242F40]">
    <div class="container mx-auto p-4 md:p-8 max-w-7xl">
        <header class="text-center mb-12">
            <h1 class="text-3xl md:text-5xl font-bold text-[#004AAD] mb-2">${companyName}</h1>
            <h2 class="text-xl md:text-2xl font-bold text-[#009FFD]">${fiscalYear}事業年度 財務分析インフォグラフィック</h2>
            <p class="text-base text-gray-600 mt-2">財務データから読み解く、大学経営の現在地と未来</p>
        </header>

        <section id="kpi" class="mb-12">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="kpi-card">
                    <div class="kpi-value">${totalAssets.toFixed(0)}<span class="text-xl">億円</span></div>
                    <div class="kpi-label">総資産</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">${(safeRatios.自己資本比率 || ((totalEquity/(totalAssets || 1))*100)).toFixed(1)}<span class="text-xl">%</span></div>
                    <div class="kpi-label">自己資本比率</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value text-red-600">-${operatingLoss.toFixed(1)}<span class="text-xl">億円</span></div>
                    <div class="kpi-label">経常損失</div>
                </div>
            </div>
            <p class="text-center mt-6 text-gray-600">強固な資産基盤と高い財務健全性を誇る一方で、収益性に課題が見られます。</p>
        </section>

        <section id="balance-sheet" class="mb-16">
            <div class="text-center mb-8">
                <h3 class="text-2xl md:text-3xl font-bold">財務健全性分析：磐石な資産基盤</h3>
                <p class="mt-2 max-w-3xl mx-auto text-gray-600">${totalAssets.toFixed(0)}億円に上る総資産と${(safeRatios.自己資本比率 || ((totalEquity/(totalAssets || 1))*100)).toFixed(1)}%という高い自己資本比率は、安定した大学経営の礎です。資産の大部分は教育研究活動を支える固定資産で構成されています。</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h4 class="text-xl font-bold text-center mb-4">資産の部 - 構成比</h4>
                    <div class="chart-container">
                        <canvas id="assetChart"></canvas>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h4 class="text-xl font-bold text-center mb-4">負債・純資産の部 - 構成比</h4>
                    <div class="chart-container">
                        <canvas id="liabilityNetAssetChart"></canvas>
                    </div>
                </div>
            </div>
        </section>

        <section id="income-statement" class="mb-16">
            <div class="text-center mb-8">
                <h3 class="text-2xl md:text-3xl font-bold">収益構造分析：附属病院が牽引するも赤字体質</h3>
                <p class="mt-2 max-w-3xl mx-auto text-gray-600">経常収益の半分を附属病院が占める一方、人件費と診療経費が費用全体の8割を超え、結果として${operatingLoss.toFixed(1)}億円の経常損失を計上。収益構造の改革が急務です。</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h4 class="text-xl font-bold text-center mb-4">経常収益の内訳</h4>
                    <div class="chart-container">
                        <canvas id="revenueChart"></canvas>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h4 class="text-xl font-bold text-center mb-4">経常費用の内訳</h4>
                    <div class="chart-container h-[400px] md:h-[450px]">
                        <canvas id="expenseChart"></canvas>
                    </div>
                </div>
            </div>
        </section>

        <section id="segment-analysis" class="mb-16">
            <div class="text-center mb-8">
                <h3 class="text-2xl md:text-3xl font-bold">セグメント分析：課題は附属病院の収益性</h3>
                <p class="mt-2 max-w-3xl mx-auto text-gray-600">学部・研究科は黒字を確保しているものの、最大の事業セグメントである附属病院が4.1億円の大幅な赤字となり、法人全体の損失の主因となっています。</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h4 class="text-xl font-bold text-center mb-4">セグメント別 業務損益 (億円)</h4>
                <div class="chart-container h-80">
                    <canvas id="segmentChart"></canvas>
                </div>
            </div>
        </section>

        <section id="cash-flow" class="mb-16">
            <div class="text-center mb-8">
                <h3 class="text-2xl md:text-3xl font-bold">キャッシュフロー分析：積極投資と財務活動</h3>
                <p class="mt-2 max-w-3xl mx-auto text-gray-600">本業で着実にキャッシュを生み出し（+${operatingCF.toFixed(1)}億円）、それを上回る大規模な設備投資（${investingCF.toFixed(1)}億円）を実施。不足分は借入で補う、成長に向けた投資フェーズにあります。</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="grid grid-cols-1 md:grid-cols-5 items-center text-center gap-y-4">
                    <div class="kpi-card border border-green-200">
                        <p class="text-lg font-bold">業務CF</p>
                        <p class="text-2xl font-bold ${operatingCF >= 0 ? 'text-green-600' : 'text-red-600'}">${operatingCF >= 0 ? '+' : ''}${operatingCF.toFixed(1)}<span class="text-sm">億円</span></p>
                    </div>
                    <div class="flow-arrow hidden md:block">➔</div>
                    <div class="kpi-card border border-red-200">
                        <p class="text-lg font-bold">投資CF</p>
                        <p class="text-2xl font-bold ${investingCF >= 0 ? 'text-green-600' : 'text-red-600'}">${investingCF >= 0 ? '+' : ''}${investingCF.toFixed(1)}<span class="text-sm">億円</span></p>
                    </div>
                    <div class="flow-arrow hidden md:block">➔</div>
                    <div class="kpi-card border border-blue-200">
                        <p class="text-lg font-bold">財務CF</p>
                        <p class="text-2xl font-bold ${financingCF >= 0 ? 'text-blue-600' : 'text-red-600'}">${financingCF >= 0 ? '+' : ''}${financingCF.toFixed(1)}<span class="text-sm">億円</span></p>
                    </div>
                </div>
            </div>
        </section>
        
        <section id="recommendations" class="mb-12">
            <div class="text-center mb-8">
                <h3 class="text-2xl md:text-3xl font-bold">戦略的提言：持続的成長への道筋</h3>
                <p class="mt-2 max-w-3xl mx-auto text-gray-600">分析から見えた課題を克服し、更なる発展を遂げるため、3つの戦略的アクションを提言します。</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="bg-white p-6 rounded-lg shadow-lg border-t-4 border-[#004AAD]">
                    <h4 class="text-xl font-bold mb-3">🏥 提言1: 附属病院の事業再生</h4>
                    <p class="text-gray-700">コスト構造を徹底的に分析し、診療単価の向上と経費削減を断行。新病棟の早期収益化を実現し、大学経営の基幹事業として黒字転換を目指します。</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-lg border-t-4 border-[#009FFD]">
                    <h4 class="text-xl font-bold mb-3">💰 提言2: 収益源の多様化</h4>
                    <p class="text-gray-700">産学連携の強化、社会人向け教育プログラムの拡充、知的財産の活用により、運営費交付金に依存しない持続可能な収益構造を構築します。</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-lg border-t-4 border-[#00C851]">
                    <h4 class="text-xl font-bold mb-3">📊 提言3: 経営管理の高度化</h4>
                    <p class="text-gray-700">セグメント別の詳細な収益管理システムを導入し、データドリブンな意思決定を実現。各部門の責任を明確化し、全学的な経営効率の向上を図ります。</p>
                </div>
            </div>
        </section>

        <footer class="text-center py-8 border-t border-gray-200">
            <p class="text-gray-600">本レポートは財務データの分析に基づく戦略的提言です。</p>
            <p class="text-sm text-gray-500 mt-2">Generated by AIBoard Financial Analysis System</p>
        </footer>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const assetCtx = document.getElementById('assetChart').getContext('2d');
            new Chart(assetCtx, {
                type: 'doughnut',
                data: {
                    labels: ['固定資産', '流動資産'],
                    datasets: [{
                        data: [${fixedAssets.toFixed(1)}, ${currentAssets.toFixed(1)}],
                        backgroundColor: ['#004AAD', '#009FFD'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: { family: 'Noto Sans JP' }
                            }
                        }
                    }
                }
            });

            const liabilityCtx = document.getElementById('liabilityNetAssetChart').getContext('2d');
            new Chart(liabilityCtx, {
                type: 'doughnut',
                data: {
                    labels: ['負債', '純資産'],
                    datasets: [{
                        data: [${totalLiabilities.toFixed(1)}, ${totalEquity.toFixed(1)}],
                        backgroundColor: ['#FF6B6B', '#4ECDC4'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: { family: 'Noto Sans JP' }
                            }
                        }
                    }
                }
            });

            const revenueCtx = document.getElementById('revenueChart').getContext('2d');
            new Chart(revenueCtx, {
                type: 'doughnut',
                data: {
                    labels: ['運営費交付金収益', '授業料収益', '附属病院収益', 'その他'],
                    datasets: [{
                        data: [96.7, 24.4, 171.0, 48.4],
                        backgroundColor: ['#004AAD', '#009FFD', '#00C851', '#FFA726'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: { family: 'Noto Sans JP' }
                            }
                        }
                    }
                }
            });

            const expenseCtx = document.getElementById('expenseChart').getContext('2d');
            new Chart(expenseCtx, {
                type: 'doughnut',
                data: {
                    labels: ['教員人件費', '職員人件費', '診療経費', '教育経費', '研究経費', 'その他'],
                    datasets: [{
                        data: [79.3, 83.1, 125.1, 15.6, 15.7, 28.4],
                        backgroundColor: ['#004AAD', '#009FFD', '#FF6B6B', '#4ECDC4', '#FFA726', '#AB47BC'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: { family: 'Noto Sans JP' }
                            }
                        }
                    }
                }
            });

            const segmentCtx = document.getElementById('segmentChart').getContext('2d');
            new Chart(segmentCtx, {
                type: 'bar',
                data: {
                    labels: ['学部研究科等', '附属病院', '附属学校', '法人共通'],
                    datasets: [{
                        label: '業務損益 (億円)',
                        data: [3.5, -4.1, 0.9, -5.0],
                        backgroundColor: function(context) {
                            return context.parsed.y >= 0 ? '#4ECDC4' : '#FF6B6B';
                        },
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#E5E7EB'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        });
    </script>
</body>
</html>`;
}

function transformFinancialData(jsonData) {
  const statements = jsonData.financial_statements;
  
  const balanceSheetAssets = statements.find(s => s.tableName === "貸借対照表 - 資産の部");
  const balanceSheetLiabilities = statements.find(s => s.tableName === "貸借対照表 - 負債・純資産の部");
  const incomeStatement = statements.find(s => s.tableName === "損益計算書");
  const cashFlowStatement = statements.find(s => s.tableName === "キャッシュ・フロー計算書");
  const segmentInfo = statements.find(s => s.tableName === "セグメント情報");

  const transformedData = {
    companyName: "国立大学法人",
    fiscalYear: "令和5年度",
    statements: {
      貸借対照表: {
        資産の部: {
          資産合計: balanceSheetAssets?.data.totalAssets || 0,
          流動資産: {
            流動資産合計: balanceSheetAssets?.data.currentAssets.total || 0
          },
          固定資産: {
            固定資産合計: balanceSheetAssets?.data.fixedAssets.total || 0
          }
        },
        負債の部: {
          負債合計: balanceSheetLiabilities?.data.liabilities.total || 0,
          流動負債: {
            流動負債合計: balanceSheetLiabilities?.data.liabilities.currentLiabilities.total || 0
          }
        },
        純資産の部: {
          純資産合計: balanceSheetLiabilities?.data.netAssets.total || 0
        }
      },
      損益計算書: {
        経常収益: {
          経常収益合計: incomeStatement?.data.ordinaryRevenues.total || 0
        },
        経常費用: {
          経常費用合計: incomeStatement?.data.ordinaryExpenses.total || 0
        },
        経常損失: incomeStatement?.data.ordinaryLoss || 0,
        当期純損失: incomeStatement?.data.netLoss || 0
      },
      キャッシュフロー計算書: {
        営業活動によるキャッシュフロー: {
          営業活動によるキャッシュフロー合計: cashFlowStatement?.data.operatingActivities || 0
        },
        投資活動によるキャッシュフロー: {
          投資活動によるキャッシュフロー合計: cashFlowStatement?.data.investingActivities || 0
        },
        財務活動によるキャッシュフロー: {
          財務活動によるキャッシュフロー合計: cashFlowStatement?.data.financingActivities || 0
        }
      }
    },
    ratios: {
      自己資本比率: ((balanceSheetLiabilities?.data.netAssets.total || 0) / (balanceSheetAssets?.data.totalAssets || 1)) * 100,
      負債比率: ((balanceSheetLiabilities?.data.liabilities.total || 0) / (balanceSheetLiabilities?.data.netAssets.total || 1)) * 100,
      流動比率: ((balanceSheetAssets?.data.currentAssets.total || 0) / (balanceSheetLiabilities?.data.liabilities.currentLiabilities.total || 1))
    }
  };

  return transformedData;
}

function main() {
  try {
    const jsonPath = '/home/ubuntu/attachments/30eaf28e-2672-4dd1-ae2a-26d9acbd54d5/financial_statements.json';
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const financialData = JSON.parse(rawData);
    
    console.log('📊 財務データを読み込み中...');
    
    const transformedData = transformFinancialData(financialData);
    
    console.log('🔄 データ変換完了');
    
    const htmlReport = generateHTMLReport(transformedData);
    
    const outputPath = '/home/ubuntu/repos/AIBoard/financial_report.html';
    fs.writeFileSync(outputPath, htmlReport, 'utf8');
    
    console.log('✅ HTMLレポート生成完了!');
    console.log(`📄 出力ファイル: ${outputPath}`);
    console.log('🌐 ブラウザで開いてレポートを確認してください');
    
    return outputPath;
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateHTMLReport, transformFinancialData };
