import { FinancialStatements, FinancialRatios } from '../types/financialStatements';

interface ReportData {
  companyName: string;
  fiscalYear: string;
  statements: FinancialStatements;
  ratios: FinancialRatios;
  analysis: string;
  extractedText: string;
}

export function generateHTMLReport(data: ReportData): string {
  const { companyName, fiscalYear, statements, ratios, analysis } = data;
  
  const totalAssets = (statements.貸借対照表?.資産の部?.資産合計 || 0) / 100000000;
  const currentAssets = (statements.貸借対照表?.資産の部?.流動資産?.流動資産合計 || 0) / 100000000;
  const fixedAssets = (statements.貸借対照表?.資産の部?.固定資産?.固定資産合計 || 0) / 100000000;
  const totalLiabilities = (statements.貸借対照表?.負債の部?.負債合計 || 0) / 100000000;
  const totalEquity = (statements.貸借対照表?.純資産の部?.純資産合計 || 0) / 100000000;
  const totalRevenue = (statements.損益計算書?.経常収益?.経常収益合計 || 0) / 100000000;
  const totalExpenses = (statements.損益計算書?.経常費用?.経常費用合計 || 0) / 100000000;
  const operatingLoss = (statements.損益計算書?.経常損失 || 0) / 100000000;
  const netLoss = (statements.損益計算書?.当期純損失 || 0) / 100000000;
  
  const operatingCF = (statements.キャッシュフロー計算書?.営業活動によるキャッシュフロー?.営業活動によるキャッシュフロー合計 || 0) / 100000000;
  const investingCF = (statements.キャッシュフロー計算書?.投資活動によるキャッシュフロー?.投資活動によるキャッシュフロー合計 || 0) / 100000000;
  const financingCF = (statements.キャッシュフロー計算書?.財務活動によるキャッシュフロー?.財務活動によるキャッシュフロー合計 || 0) / 100000000;
  
  const hospitalRevenue = (statements.損益計算書?.経常収益?.附属病院収益 || 0) / 100000000;
  const operatingGrantRevenue = (statements.損益計算書?.経常収益?.運営費交付金収益 || 0) / 100000000;
  const tuitionRevenue = (statements.損益計算書?.経常収益?.学生納付金等収益 || 0) / 100000000;
  const researchRevenue = (statements.損益計算書?.経常収益?.受託研究等収益 || 0) / 100000000;
  const otherRevenue = totalRevenue - hospitalRevenue - operatingGrantRevenue - tuitionRevenue - researchRevenue;
  
  const personnelCosts = (statements.損益計算書?.経常費用?.人件費 || 0) / 100000000;
  const medicalCosts = (statements.損益計算書?.経常費用?.診療経費 || 0) / 100000000;
  const educationCosts = (statements.損益計算書?.経常費用?.教育経費 || 0) / 100000000;
  const researchCosts = (statements.損益計算書?.経常費用?.研究経費 || 0) / 100000000;
  const otherExpenses = totalExpenses - personnelCosts - medicalCosts - educationCosts - researchCosts;
  
  const hospitalSegmentLoss = Math.abs((statements.セグメント情報?.附属病院?.業務損益 || 0) / 100000000);
  const academicSegmentProfit = (statements.セグメント情報?.['学部・研究科等']?.業務損益 || 0) / 100000000;
  const schoolSegmentLoss = Math.abs((statements.セグメント情報?.附属学校?.業務損益 || 0) / 100000000);
  
  const equityRatio = ((totalEquity / totalAssets) * 100).toFixed(1);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyName} 財務分析インフォグラフィック (${fiscalYear})</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
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
            <h2 class="text-xl md:text-2xl font-bold text-[#009FFD]">${fiscalYear} 財務分析インフォグラフィック</h2>
            <p class="text-base text-gray-600 mt-2">財務データから読み解く、大学経営の現在地と未来</p>
        </header>

        <section id="kpi" class="mb-12">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="kpi-card">
                    <div class="kpi-value">${totalAssets.toFixed(0)}<span class="text-xl">億円</span></div>
                    <div class="kpi-label">総資産</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">${equityRatio}<span class="text-xl">%</span></div>
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
                <p class="mt-2 max-w-3xl mx-auto text-gray-600">${totalAssets.toFixed(1)}億円に上る総資産と${equityRatio}%という高い自己資本比率は、安定した大学経営の礎です。資産の大部分は教育研究活動を支える固定資産で構成されています。</p>
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
                    <div class="kpi-card border ${operatingCF >= 0 ? 'border-green-200' : 'border-red-200'}">
                        <p class="text-lg font-bold">業務CF</p>
                        <p class="text-2xl font-bold ${operatingCF >= 0 ? 'text-green-600' : 'text-red-600'}">${operatingCF >= 0 ? '+' : ''}${operatingCF.toFixed(1)}<span class="text-sm">億円</span></p>
                    </div>
                    <div class="flow-arrow hidden md:block">➔</div>
                    <div class="kpi-card border ${investingCF >= 0 ? 'border-green-200' : 'border-red-200'}">
                        <p class="text-lg font-bold">投資CF</p>
                        <p class="text-2xl font-bold ${investingCF >= 0 ? 'text-green-600' : 'text-red-600'}">${investingCF >= 0 ? '+' : ''}${investingCF.toFixed(1)}<span class="text-sm">億円</span></p>
                    </div>
                     <div class="flow-arrow hidden md:block">➔</div>
                    <div class="kpi-card border ${financingCF >= 0 ? 'border-blue-200' : 'border-red-200'}">
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
                    <p class="text-gray-700">運営費交付金への依存から脱却するため、外部資金獲得の専門組織を強化。戦略的な寄附金獲得や知的財産の活用を推進し、自己収入比率を高めます。</p>
                </div>
                 <div class="bg-white p-6 rounded-lg shadow-lg border-t-4 border-[#242F40]">
                    <h4 class="text-xl font-bold mb-3">💡 提言3: 全学的な意識改革</h4>
                    <p class="text-gray-700">アセットマネジメントを導入し、遊休資産の活用を促進。全教職員がコスト意識を持つ文化を醸成し、法人共通経費の最適化を図ります。</p>
                </div>
            </div>
        </section>

        <section id="detailed-analysis" class="mb-12">
            <div class="text-center mb-8">
                <h3 class="text-2xl md:text-3xl font-bold">詳細分析レポート</h3>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="prose max-w-none">
                    ${analysis.split('\n').map(paragraph => 
                        paragraph.trim() ? `<p class="mb-4 text-gray-700">${paragraph.trim()}</p>` : ''
                    ).join('')}
                </div>
            </div>
        </section>

        <footer class="text-center mt-16 pt-8 border-t">
            <p class="text-sm text-gray-500">本インフォグラフィックは、${companyName}が公開した${fiscalYear}財務諸表に基づいて作成されました。</p>
            <p class="text-sm text-gray-500">作成日: ${new Date().toLocaleDateString('ja-JP')}</p>
        </footer>

    </div>

    <script>
        const brilliantBlues = ['#004AAD', '#009FFD', '#242F40', '#6B7280', '#D1D5DB'];
        
        function processLabels(labels) {
            const maxLen = 16;
            return labels.map(label => {
                if (label.length <= maxLen) {
                    return label;
                }
                const words = label.split(' ');
                let currentLine = '';
                const lines = [];
                words.forEach(word => {
                    if ((currentLine + ' ' + word).trim().length > maxLen) {
                        lines.push(currentLine.trim());
                        currentLine = word;
                    } else {
                        currentLine = (currentLine + ' ' + word).trim();
                    }
                });
                if (currentLine) {
                    lines.push(currentLine.trim());
                }
                return lines;
            });
        }
        
        const tooltipTitleCallback = (tooltipItems) => {
            const item = tooltipItems[0];
            let label = item.chart.data.labels[item.dataIndex];
            if (Array.isArray(label)) {
              return label.join(' ');
            } else {
              return label;
            }
        };

        const defaultChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                         font: {
                            family: "'Noto Sans JP', sans-serif"
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        title: tooltipTitleCallback
                    },
                    bodyFont: {
                        family: "'Noto Sans JP', sans-serif"
                    },
                    titleFont: {
                        family: "'Noto Sans JP', sans-serif"
                    }
                }
            }
        };

        new Chart(document.getElementById('assetChart'), {
            type: 'doughnut',
            data: {
                labels: ['固定資産', '流動資産'],
                datasets: [{
                    label: '資産構成',
                    data: [${fixedAssets.toFixed(1)}, ${currentAssets.toFixed(1)}],
                    backgroundColor: [brilliantBlues[0], brilliantBlues[1]],
                    borderColor: '#FFFFFF',
                    borderWidth: 2
                }]
            },
            options: defaultChartOptions
        });

        new Chart(document.getElementById('liabilityNetAssetChart'), {
            type: 'doughnut',
            data: {
                labels: ['純資産', '負債'],
                datasets: [{
                    label: '負債・純資産構成',
                    data: [${totalEquity.toFixed(1)}, ${totalLiabilities.toFixed(1)}],
                    backgroundColor: [brilliantBlues[0], brilliantBlues[3]],
                    borderColor: '#FFFFFF',
                    borderWidth: 2
                }]
            },
            options: defaultChartOptions
        });
        
        new Chart(document.getElementById('revenueChart'), {
            type: 'doughnut',
            data: {
                labels: processLabels(['附属病院収益', '運営費交付金収益', '学生納付金等収益', '受託研究等収益', 'その他']),
                datasets: [{
                    label: '経常収益 (億円)',
                    data: [${hospitalRevenue.toFixed(1)}, ${operatingGrantRevenue.toFixed(1)}, ${tuitionRevenue.toFixed(1)}, ${researchRevenue.toFixed(1)}, ${otherRevenue.toFixed(1)}],
                     backgroundColor: [brilliantBlues[0], brilliantBlues[1], '#5DA9E9', '#84C0EF', brilliantBlues[4]],
                    borderColor: '#FFFFFF',
                    borderWidth: 2
                }]
            },
            options: defaultChartOptions
        });
        
        new Chart(document.getElementById('expenseChart'), {
            type: 'bar',
            data: {
                labels: processLabels(['人件費', '診療経費', '教育経費', '研究経費', 'その他']),
                datasets: [{
                    label: '経常費用 (億円)',
                    data: [${personnelCosts.toFixed(1)}, ${medicalCosts.toFixed(1)}, ${educationCosts.toFixed(1)}, ${researchCosts.toFixed(1)}, ${otherExpenses.toFixed(1)}],
                    backgroundColor: [brilliantBlues[0], brilliantBlues[1], brilliantBlues[2], brilliantBlues[3], brilliantBlues[4]],
                    borderColor: [brilliantBlues[0], brilliantBlues[1], brilliantBlues[2], brilliantBlues[3], brilliantBlues[4]],
                    borderWidth: 1
                }]
            },
            options: {
                ...defaultChartOptions,
                indexAxis: 'y',
                plugins: {
                    ...defaultChartOptions.plugins,
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '金額 (億円)'
                        }
                    }
                }
            }
        });

        new Chart(document.getElementById('segmentChart'), {
            type: 'bar',
            data: {
                labels: processLabels(['学部・研究科等', '附属病院', '附属学校']),
                datasets: [{
                    label: '業務損益 (億円)',
                    data: [${academicSegmentProfit.toFixed(1)}, ${-hospitalSegmentLoss.toFixed(1)}, ${-schoolSegmentLoss.toFixed(1)}],
                    backgroundColor: (context) => {
                        const value = context.dataset.data[context.dataIndex];
                        return value >= 0 ? brilliantBlues[1] : '#EF4444';
                    }
                }]
            },
            options: {
                ...defaultChartOptions,
                indexAxis: 'y',
                 plugins: {
                    ...defaultChartOptions.plugins,
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '損益 (億円)'
                        }
                    }
                }
            }
        });

    </script>
</body>
</html>`;
}
