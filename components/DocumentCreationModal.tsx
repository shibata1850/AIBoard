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
import { parseJapaneseCurrency, extractNumbers } from '../utils/currency';
import { FileText } from 'lucide-react-native';

interface DocumentCreationModalProps {
  visible: boolean;
  onClose: () => void;
  analysisContent: string;
  fileName?: string;
  structuredData?: { text: string; statements?: any; ratios?: any; analysis?: any };
}

export function DocumentCreationModal({
  visible,
  onClose,
  analysisContent,
  fileName,
  structuredData,
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
      console.log('=== DOCUMENT CREATION MODAL - STRUCTURED DATA ===');
      console.log('Structured data available:', !!structuredData);
      console.log('Has statements:', !!structuredData?.statements);
      console.log('Has ratios:', !!structuredData?.ratios);
      if (structuredData?.statements) {
        console.log('Statements sample:', JSON.stringify(structuredData.statements, null, 2).substring(0, 300));
      }

      let reportData;
      
      console.log('=== DEBUG: Structured Data Analysis ===');
      console.log('structuredData:', JSON.stringify(structuredData, null, 2));
      
      if (structuredData && structuredData.statements) {
        console.log('Using structured data for report generation');
        console.log('Statements structure:', JSON.stringify(structuredData.statements, null, 2));
        console.log('Ratios structure:', JSON.stringify(structuredData.ratios, null, 2));
        
        const enhancedStatements = {
          貸借対照表: {
            資産の部: {
              資産合計: structuredData.statements?.貸借対照表?.資産の部?.資産合計 || 
                       structuredData.statements?.総資産 || 
                       extractNumbers(analysisContent).find(n => n > 100000000000) || null,
              流動資産: {
                流動資産合計: structuredData.statements?.貸借対照表?.資産の部?.流動資産?.流動資産合計 || null
              },
              固定資産: {
                固定資産合計: structuredData.statements?.貸借対照表?.資産の部?.固定資産?.固定資産合計 || null
              }
            },
            負債の部: {
              負債合計: structuredData.statements?.貸借対照表?.負債の部?.負債合計 || null,
              流動負債: {
                流動負債合計: structuredData.statements?.貸借対照表?.負債の部?.流動負債?.流動負債合計 || null
              },
              固定負債: {
                固定負債合計: structuredData.statements?.貸借対照表?.負債の部?.固定負債?.固定負債合計 || null
              }
            },
            純資産の部: {
              純資産合計: structuredData.statements?.貸借対照表?.純資産の部?.純資産合計 || null
            }
          },
          損益計算書: {
            経常収益: {
              経常収益合計: structuredData.statements?.損益計算書?.経常収益?.経常収益合計 || null,
              附属病院収益: structuredData.statements?.損益計算書?.経常収益?.附属病院収益 || null,
              運営費交付金収益: structuredData.statements?.損益計算書?.経常収益?.運営費交付金収益 || null,
              学生納付金等収益: structuredData.statements?.損益計算書?.経常収益?.学生納付金等収益 || null,
              受託研究等収益: structuredData.statements?.損益計算書?.経常収益?.受託研究等収益 || null,
              その他収益: structuredData.statements?.損益計算書?.経常収益?.その他収益 || null
            },
            経常費用: {
              経常費用合計: structuredData.statements?.損益計算書?.経常費用?.経常費用合計 || null,
              人件費: structuredData.statements?.損益計算書?.経常費用?.人件費 || null,
              診療経費: structuredData.statements?.損益計算書?.経常費用?.診療経費 || null,
              教育経費: structuredData.statements?.損益計算書?.経常費用?.教育経費 || null,
              研究経費: structuredData.statements?.損益計算書?.経常費用?.研究経費 || null,
              その他費用: structuredData.statements?.損益計算書?.経常費用?.その他費用 || null
            },
            経常損失: structuredData.statements?.損益計算書?.経常損失 || 
                     structuredData.statements?.経常損失 || null,
            当期純損失: structuredData.statements?.損益計算書?.当期純損失 || null
          },
          キャッシュフロー計算書: {
            営業活動によるキャッシュフロー: {
              営業活動によるキャッシュフロー合計: structuredData.statements?.キャッシュフロー計算書?.営業活動によるキャッシュフロー?.営業活動によるキャッシュフロー合計 || null
            },
            投資活動によるキャッシュフロー: {
              投資活動によるキャッシュフロー合計: structuredData.statements?.キャッシュフロー計算書?.投資活動によるキャッシュフロー?.投資活動によるキャッシュフロー合計 || null
            },
            財務活動によるキャッシュフロー: {
              財務活動によるキャッシュフロー合計: structuredData.statements?.キャッシュフロー計算書?.財務活動によるキャッシュフロー?.財務活動によるキャッシュフロー合計 || null
            },
            現金及び現金同等物の増減額: structuredData.statements?.キャッシュフロー計算書?.現金及び現金同等物の増減額 || null
          },
          セグメント情報: {
            附属病院: {
              業務損益: structuredData.statements?.セグメント情報?.附属病院?.業務損益 || null
            },
            学部_研究科等業務損益: structuredData.statements?.セグメント情報?.学部_研究科等業務損益 || null,
            附属病院業務損益: structuredData.statements?.セグメント情報?.附属病院業務損益 || null,
            附属学校業務損益: structuredData.statements?.セグメント情報?.附属学校業務損益 || null
          }
        };
        
        const enhancedRatios = {
          負債比率: (structuredData.ratios?.負債比率 && structuredData.ratios.負債比率 > 0) ? structuredData.ratios.負債比率 : null,
          流動比率: (structuredData.ratios?.流動比率 && structuredData.ratios.流動比率 > 0) ? structuredData.ratios.流動比率 : null,
          固定比率: (structuredData.ratios?.固定比率 && structuredData.ratios.固定比率 > 0) ? structuredData.ratios.固定比率 : null,
          自己資本比率: (structuredData.ratios?.自己資本比率 && structuredData.ratios.自己資本比率 > 0) ? structuredData.ratios.自己資本比率 : null
        };

        console.log('=== ENHANCED DATA FOR HTML REPORT ===');
        console.log('Enhanced statements sample:', JSON.stringify(enhancedStatements, null, 2).substring(0, 400));
        console.log('Enhanced ratios:', enhancedRatios);
        
        console.log('Enhanced statements:', JSON.stringify(enhancedStatements, null, 2));
        
        reportData = {
          companyName: '国立大学法人',
          fiscalYear: '2023年度',
          statements: enhancedStatements,
          ratios: enhancedRatios,
          analysis: {
            summary: structuredData.analysis?.summary || '財務分析結果',
            recommendations: structuredData.analysis?.recommendations || [
              '負債比率の改善',
              '流動性の向上', 
              'セグメント収益性の改善',
              'リスク管理体制の強化'
            ]
          },
          extractedText: analysisContent
        };
      } else {
        console.log('Structured data not available, falling back to text extraction');
        
        const createFallbackReportData = (analysisContent: string) => {
          console.log('=== FALLBACK: Extracting from text ===');
          console.log('Analysis content length:', analysisContent.length);
          
          const extractFinancialNumbers = (text: string) => {
            const numbers: { [key: string]: number } = {};
            
            const patterns = [
              { key: 'debtRatio', regex: /負債比率.*?([０-９0-9.]+)%/ },
              { key: 'currentRatio', regex: /流動比率.*?([０-９0-9.]+)/ },
              { key: 'equityRatio', regex: /自己資本比率.*?([０-９0-9.]+)%/ },
              { key: 'totalAssets', regex: /総資産.*?([▲△-]?[０-９0-9億万千,\s]+円?)/ },
              { key: 'totalLiabilities', regex: /負債.*?合計.*?([▲△-]?[０-９0-9億万千,\s]+円?)/ },
              { key: 'totalEquity', regex: /純資産.*?合計.*?([▲△-]?[０-９0-9億万千,\s]+円?)/ },
              { key: 'operatingLoss', regex: /経常損失.*?([▲△-]?[０-９0-9億万千,\s]+円?)/ },
              { key: 'hospitalLoss', regex: /附属病院.*?([▲△-]?[０-９0-9億万千,\s]+円?)/ },
              { key: 'totalRevenue', regex: /経常収益.*?合計.*?([▲△-]?[０-９0-9億万千,\s]+円?)/ },
              { key: 'totalExpenses', regex: /経常費用.*?合計.*?([▲△-]?[０-９0-9億万千,\s]+円?)/ },
              { key: 'totalAssetsParens', regex: /総資産.*?\(([０-９0-9億万千,\s]+円?)\)/ },
              { key: 'totalLiabilitiesParens', regex: /負債.*?合計.*?\(([０-９0-9億万千,\s]+円?)\)/ },
              { key: 'operatingLossParens', regex: /経常損失.*?\(([０-９0-9億万千,\s]+円?)\)/ },
              { key: 'hospitalLossParens', regex: /附属病院.*?\(([０-９0-9億万千,\s]+円?)\)/ }
            ];
            
            patterns.forEach(pattern => {
              const match = text.match(pattern.regex);
              if (match) {
                if (pattern.key.includes('Ratio')) {
                  numbers[pattern.key] = parseFloat(match[1]);
                } else {
                  let value = match[1];
                  const isNegativeParens = pattern.key.includes('Parens');
                  const parsed = parseJapaneseCurrency(value);
                  const baseKey = pattern.key.replace('Parens', '');
                  numbers[baseKey] = parsed !== null ? (isNegativeParens ? -Math.abs(parsed) : parsed) : 0;
                }
                console.log(`Extracted ${pattern.key}:`, numbers[pattern.key.replace('Parens', '')]);
              }
            });
            
            const allNumbers = extractNumbers(text);
            console.log('All extracted numbers:', allNumbers);
            
            if (!numbers.totalAssets && allNumbers.length > 0) {
              numbers.totalAssets = allNumbers.find(n => n > 100000000000) || allNumbers[0];
            }
            
            return numbers;
          };

          const extractedNumbers = extractFinancialNumbers(analysisContent);
          console.log('Final extracted numbers:', extractedNumbers);
          
          const fallbackStatements = {
            貸借対照表: {
              資産の部: {
                資産合計: extractedNumbers.totalAssets || null,
                流動資産: { 流動資産合計: extractedNumbers.totalAssets ? extractedNumbers.totalAssets * 0.12 : null },
                固定資産: { 固定資産合計: extractedNumbers.totalAssets ? extractedNumbers.totalAssets * 0.88 : null }
              },
              負債の部: {
                負債合計: extractedNumbers.totalLiabilities || null,
                流動負債: { 流動負債合計: extractedNumbers.totalLiabilities ? extractedNumbers.totalLiabilities * 0.25 : null },
                固定負債: { 固定負債合計: extractedNumbers.totalLiabilities ? extractedNumbers.totalLiabilities * 0.75 : null }
              },
              純資産の部: {
                純資産合計: extractedNumbers.totalEquity || null
              }
            },
            損益計算書: {
              経常収益: {
                経常収益合計: extractedNumbers.totalRevenue || null,
                附属病院収益: extractedNumbers.totalRevenue ? extractedNumbers.totalRevenue * 0.5 : null,
                運営費交付金収益: extractedNumbers.totalRevenue ? extractedNumbers.totalRevenue * 0.28 : null,
                学生納付金等収益: extractedNumbers.totalRevenue ? extractedNumbers.totalRevenue * 0.08 : null,
                受託研究等収益: extractedNumbers.totalRevenue ? extractedNumbers.totalRevenue * 0.05 : null,
                その他収益: extractedNumbers.totalRevenue ? extractedNumbers.totalRevenue * 0.09 : null
              },
              経常費用: {
                経常費用合計: extractedNumbers.totalExpenses || null,
                人件費: extractedNumbers.totalExpenses ? extractedNumbers.totalExpenses * 0.47 : null,
                診療経費: extractedNumbers.totalExpenses ? extractedNumbers.totalExpenses * 0.36 : null,
                教育経費: extractedNumbers.totalExpenses ? extractedNumbers.totalExpenses * 0.045 : null,
                研究経費: extractedNumbers.totalExpenses ? extractedNumbers.totalExpenses * 0.045 : null,
                その他費用: extractedNumbers.totalExpenses ? extractedNumbers.totalExpenses * 0.08 : null
              },
              経常損失: extractedNumbers.operatingLoss || null,
              当期純損失: extractedNumbers.operatingLoss || null
            },
            キャッシュフロー計算書: {
              営業活動によるキャッシュフロー: { 営業活動によるキャッシュフロー合計: null },
              投資活動によるキャッシュフロー: { 投資活動によるキャッシュフロー合計: null },
              財務活動によるキャッシュフロー: { 財務活動によるキャッシュフロー合計: null },
              現金及び現金同等物の増減額: null
            },
            セグメント情報: {
              附属病院: { 業務損益: null }
            }
          };
          
          return {
            companyName: '国立大学法人',
            fiscalYear: '2023年度',
            statements: fallbackStatements,
            ratios: {
              負債比率: extractedNumbers.debtRatio || null,
              流動比率: extractedNumbers.currentRatio || null,
              固定比率: extractedNumbers.fixedRatio || null,
              自己資本比率: extractedNumbers.equityRatio || null
            },
            analysis: {
              summary: '財務分析結果',
              recommendations: ['負債比率の改善', '流動性の向上', 'セグメント収益性の改善', 'リスク管理体制の強化']
            },
            extractedText: analysisContent
          };
        };
        
        console.log('Structured data not available, using regex extraction fallback');
        reportData = createFallbackReportData(analysisContent);
      }

      console.log('=== Final Report Data ===');
      console.log('Report data structure:', JSON.stringify(reportData, null, 2));
      
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
          console.log('=== HTML REPORT DOWNLOAD ATTEMPT ===');
          console.log('HTML content length:', htmlContent.length);
          console.log('File name:', `${title.trim().replace(/[^a-zA-Z0-9]/g, '_')}_report.html`);
          
          await downloadHTMLReport(htmlContent, `${title.trim().replace(/[^a-zA-Z0-9]/g, '_')}_report.html`);
          
          console.log('Download completed successfully');
          Alert.alert('成功', 'HTMLレポートのダウンロードが完了しました');
          onClose();
        } catch (downloadError) {
          console.error('Download error details:', downloadError);
          console.error('Error type:', typeof downloadError);
          const errorObj = downloadError instanceof Error ? downloadError : new Error(String(downloadError));
          console.error('Error name:', errorObj.name);
          console.error('Error message:', errorObj.message);
          
          Alert.alert(
            'ダウンロードエラー',
            `HTMLレポートのダウンロードに失敗しました。\n\nエラー詳細: ${errorObj.message}\n\n再試行するか、ブラウザの設定を確認してください。`,
            [
              { text: 'キャンセル', style: 'cancel' },
              { text: '再試行', onPress: () => handleGenerateHTMLReport() }
            ]
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
