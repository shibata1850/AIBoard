import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from './ThemeProvider';
import { generateHTMLReport } from '../utils/htmlReportGenerator';
import { downloadHTMLReport } from '../utils/downloadUtils';
import { FileText } from 'lucide-react-native';

interface DocumentCreationModalProps {
  visible: boolean;
  onClose: () => void;
  analysisContent: string;
  fileName?: string;
  documentType?: string;
}

export function DocumentCreationModal({
  visible,
  onClose,
  analysisContent,
  fileName,
  documentType,
}: DocumentCreationModalProps) {
  const { isDark } = useTheme();
  const [title, setTitle] = useState('財務分析レポート');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateHTMLReport = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    setIsGenerating(true);
    
    try {
      let reportData;
      
      try {
        const parsedContent = JSON.parse(analysisContent);
        if (parsedContent.financial_statements) {
          console.log('Using structured financial_statements data');
          reportData = {
            companyName: '国立大学法人',
            fiscalYear: '2023年度',
            statements: parsedContent.financial_statements,
            ratios: parsedContent.ratios || {},
            analysis: {
              summary: parsedContent.summary || '財務分析結果',
              recommendations: parsedContent.recommendations || []
            },
            extractedText: parsedContent.text || analysisContent
          };
        } else if (parsedContent.statements && parsedContent.ratios) {
          console.log('Using structured statements and ratios data');
          reportData = {
            companyName: '国立大学法人',
            fiscalYear: '2023年度',
            statements: parsedContent.statements,
            ratios: parsedContent.ratios,
            analysis: {
              summary: parsedContent.analysis?.summary || '財務分析結果',
              recommendations: parsedContent.analysis?.recommendations || []
            },
            extractedText: parsedContent.text || analysisContent
          };
        } else if (parsedContent.analysis && parsedContent.analysis.summary) {
          console.log('Using analysis object data');
          reportData = {
            companyName: '国立大学法人',
            fiscalYear: '2023年度',
            statements: parsedContent.statements || {},
            ratios: parsedContent.ratios || {},
            analysis: {
              summary: parsedContent.analysis.summary,
              recommendations: Array.isArray(parsedContent.analysis.recommendations) ? 
                parsedContent.analysis.recommendations : [
                '財務健全性の向上',
                '収益性の改善',
                '効率性の向上',
                'リスク管理の強化',
                '成長戦略の策定',
                '資金調達の最適化',
                'コスト管理の徹底',
                '業務プロセスの改善',
                '人材育成の推進',
                'デジタル化の促進',
                '持続可能性の確保',
                'ガバナンス体制の強化',
                '附属病院事業の効率化と収益向上',
                '運営費交付金以外の収益源多様化',
                '経営管理システムの高度化'
              ].filter(rec => typeof rec === 'string' && rec.length > 0)
            },
            extractedText: typeof (parsedContent.text || analysisContent) === 'string' ? (parsedContent.text || analysisContent) : JSON.stringify(parsedContent.text || analysisContent)
          };
        } else if (parsedContent.text && typeof parsedContent.text === 'string') {
          console.log('Using text-only analysis data');
          reportData = {
            companyName: '国立大学法人',
            fiscalYear: '2023年度',
            statements: {},
            ratios: {},
            analysis: {
              summary: 'テキスト形式の分析データ',
              recommendations: ['データ構造の改善', '分析精度の向上']
            },
            extractedText: parsedContent.text
          };
        } else {
          throw new Error('Unknown data format');
        }
      } catch (parseError) {
        console.log('Using fallback data due to parse error:', parseError);
        reportData = {
          companyName: '国立大学法人',
          fiscalYear: '2023年度',
          statements: {},
          ratios: {},
          analysis: {
            summary: 'テキスト形式の分析データ',
            recommendations: ['データ構造の改善', '分析精度の向上'].filter(rec => typeof rec === 'string' && rec.length > 0)
          },
          extractedText: analysisContent
        };
      }

      if (analysisContent.includes('負債比率') || analysisContent.includes('流動比率')) {
        const parseJapaneseCurrency = (currencyStr: string): number => {
          let cleanStr = currencyStr.replace(/[円,\s]/g, '');
          let value = 0;
          let isNegative = cleanStr.includes('-') || cleanStr.includes('△');
          cleanStr = cleanStr.replace(/[-△]/g, '');
          
          const okuMatch = cleanStr.match(/(\d+)億/);
          if (okuMatch) value += parseInt(okuMatch[1]) * 100000000;
          
          const manMatch = cleanStr.match(/(\d+)万/);
          if (manMatch) value += parseInt(manMatch[1]) * 10000;
          
          const senMatch = cleanStr.match(/(\d+)千/);
          if (senMatch) value += parseInt(senMatch[1]) * 1000;
          
          return isNegative ? -value : value;
        };

        const extractFinancialNumbers = (text: string, structuredData?: any) => {
          const numbers: { [key: string]: number } = {};
          
          if (structuredData && structuredData.statements) {
            const statements = structuredData.statements;
            numbers.totalAssets = statements.貸借対照表?.資産の部?.資産合計 || 0;
            numbers.totalLiabilities = statements.貸借対照表?.負債の部?.負債合計 || 0;
            numbers.currentAssets = statements.貸借対照表?.資産の部?.流動資産?.流動資産合計 || 0;
            numbers.currentLiabilities = statements.貸借対照表?.負債の部?.流動負債?.流動負債合計 || 0;
            numbers.operatingLoss = Math.abs(statements.損益計算書?.経常損失 || statements.損益計算書?.経常利益 || 0);
            numbers.hospitalLoss = Math.abs(statements.セグメント情報?.附属病院?.業務損益 || 0);
            
            if (numbers.totalLiabilities && numbers.totalAssets) {
              numbers.debtRatio = (numbers.totalLiabilities / numbers.totalAssets) * 100;
            }
            if (numbers.currentAssets && numbers.currentLiabilities) {
              numbers.currentRatio = numbers.currentAssets / numbers.currentLiabilities;
            }
          }
          
          const debtRatioMatch = text.match(/負債比率.*?=\s*([0-9.]+)\s*\(([0-9.]+)%\)/);
          if (debtRatioMatch && !numbers.debtRatio) numbers.debtRatio = parseFloat(debtRatioMatch[2]);
          
          const currentRatioMatch = text.match(/流動比率.*?=\s*([0-9.]+)/);
          if (currentRatioMatch && !numbers.currentRatio) numbers.currentRatio = parseFloat(currentRatioMatch[1]);
          
          const totalLiabilitiesMatch = text.match(/([0-9,]+)\[引用: data\.totalLiabilities\]/);
          if (totalLiabilitiesMatch && !numbers.totalLiabilities) numbers.totalLiabilities = parseInt(totalLiabilitiesMatch[1].replace(/,/g, ''), 10) * 1000;
          
          const totalAssetsMatch = text.match(/([0-9,]+)\[引用: data\.totalNetAssets\]/);
          if (totalAssetsMatch && !numbers.totalAssets) numbers.totalAssets = parseInt(totalAssetsMatch[1].replace(/,/g, ''), 10) * 1000;
          
          const currentAssetsMatch = text.match(/([0-9,]+)\[引用: data\.currentAssets\]/);
          if (currentAssetsMatch && !numbers.currentAssets) numbers.currentAssets = parseInt(currentAssetsMatch[1].replace(/,/g, ''), 10) * 1000;
          
          const currentLiabilitiesMatch = text.match(/([0-9,]+)\[引用: data\.currentLiabilities\]/);
          if (currentLiabilitiesMatch && !numbers.currentLiabilities) numbers.currentLiabilities = parseInt(currentLiabilitiesMatch[1].replace(/,/g, ''), 10) * 1000;
          
          const operatingLossMatch = text.match(/経常損失.*?(-?[0-9億万千,]+円)/);
          if (operatingLossMatch && !numbers.operatingLoss) {
            const amount = operatingLossMatch[1];
            numbers.operatingLoss = parseJapaneseCurrency(amount);
          }
          
          const hospitalLossMatch = text.match(/附属病院セグメント.*?(-?[0-9億万千,]+円)/);
          if (hospitalLossMatch && !numbers.hospitalLoss) {
            const amount = hospitalLossMatch[1];
            numbers.hospitalLoss = parseJapaneseCurrency(amount);
          }
          
          return numbers;
        };
        
        const extractedNumbers = extractFinancialNumbers(analysisContent, reportData);
        
        reportData = {
          companyName: '国立大学法人',
          fiscalYear: '2023年度',
          statements: {
            貸借対照表: {
              資産の部: {
                資産合計: extractedNumbers.totalAssets || 0
              },
              負債の部: {
                負債合計: extractedNumbers.totalLiabilities || 0,
                流動負債合計: extractedNumbers.currentLiabilities || 0
              }
            },
            損益計算書: {
              経常損失: extractedNumbers.operatingLoss || 0
            },
            セグメント情報: {
              附属病院: {
                業務損益: extractedNumbers.hospitalLoss || 0
              }
            }
          },
          ratios: {
            負債比率: extractedNumbers.debtRatio || 0,
            流動比率: extractedNumbers.currentRatio || 0
          },
          analysis: {
            summary: '財務分析結果',
            recommendations: [
              '負債比率の改善',
              '流動性の向上',
              'セグメント収益性の改善',
              'リスク管理体制の強化'
            ].filter(rec => typeof rec === 'string' && rec.length > 0)
          },
          extractedText: analysisContent
        };
      }

      const htmlContent = generateHTMLReport(reportData as any);
      
      const fileName = `${title.trim().replace(/[^a-zA-Z0-9]/g, '_')}_report.html`;
      
      if (Platform.OS !== 'web') {
        const FileSystem = require('expo-file-system');
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        
        Alert.alert(
          '成功',
          'HTMLレポートが生成されました',
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        try {
          await downloadHTMLReport(htmlContent, `${title.trim().replace(/[^a-zA-Z0-9]/g, '_')}_report.html`);
          Alert.alert('成功', 'HTMLレポートのダウンロードが開始されました');
          onClose();
        } catch (downloadError) {
          console.error('Download error:', downloadError);
          Alert.alert(
            'エラー',
            'ダウンロード中にエラーが発生しました。ブラウザの設定を確認してください。'
          );
        }
      }
    } catch (error) {
      console.error('HTML report generation error:', error);
      Alert.alert(
        'エラー',
        'HTMLレポートの生成中にエラーが発生しました'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.modal,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]}>
          <Text style={[
            styles.modalTitle,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            HTMLレポート作成
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[
              styles.label,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              ドキュメントタイトル
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                  color: isDark ? '#FFFFFF' : '#000000',
                  borderColor: isDark ? '#3A3A3C' : '#C6C6C8',
                }
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="ドキュメントのタイトルを入力"
              placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.generateButton,
              { backgroundColor: isDark ? '#0A84FF' : '#007AFF' }
            ]}
            onPress={handleGenerateHTMLReport}
            disabled={isGenerating}
          >
            <FileText size={20} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>HTMLレポート生成</Text>
          </TouchableOpacity>

          {isGenerating && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={isDark ? '#0A84FF' : '#007AFF'} />
              <Text style={[
                styles.loadingText,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                ドキュメント生成中...
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.cancelButton,
              { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
            ]}
            onPress={onClose}
            disabled={isGenerating}
          >
            <Text style={[
              styles.cancelButtonText,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              キャンセル
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
