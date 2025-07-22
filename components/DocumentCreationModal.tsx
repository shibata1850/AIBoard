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
      let reportData;
      
      if (structuredData && structuredData.statements) {
        console.log('Using structured data for report generation');
        reportData = {
          companyName: '国立大学法人',
          fiscalYear: '2023年度',
          statements: structuredData.statements,
          ratios: structuredData.ratios || {},
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
          const extractFinancialNumbers = (text: string) => {
            const numbers: { [key: string]: number } = {};
            
            const debtRatioMatch = text.match(/負債比率.*?([0-9.]+)%/);
            if (debtRatioMatch) numbers.debtRatio = parseFloat(debtRatioMatch[1]);
            
            const currentRatioMatch = text.match(/流動比率.*?([0-9.]+)/);
            if (currentRatioMatch) numbers.currentRatio = parseFloat(currentRatioMatch[1]);
            
            const operatingLossMatch = text.match(/経常損失.*?(-?[0-9億万千,]+円)/);
            if (operatingLossMatch) {
              const parsed = parseJapaneseCurrency(operatingLossMatch[1]);
              numbers.operatingLoss = parsed !== null ? parsed : 0;
            }
            
            const hospitalLossMatch = text.match(/附属病院.*?(-?[0-9億万千,]+円)/);
            if (hospitalLossMatch) {
              const parsed = parseJapaneseCurrency(hospitalLossMatch[1]);
              numbers.hospitalLoss = parsed !== null ? parsed : 0;
            }
            
            return numbers;
          };

          const extractedNumbers = extractFinancialNumbers(analysisContent);
          
          return {
            companyName: '国立大学法人',
            fiscalYear: '2023年度',
            statements: {
              貸借対照表: {
                資産の部: { 資産合計: extractedNumbers.totalAssets || 0 },
                負債の部: { 負債合計: extractedNumbers.totalLiabilities || 0 }
              },
              損益計算書: { 経常損失: extractedNumbers.operatingLoss || 0 },
              セグメント情報: { 附属病院: { 業務損益: extractedNumbers.hospitalLoss || 0 } }
            },
            ratios: {
              負債比率: extractedNumbers.debtRatio || 0,
              流動比率: extractedNumbers.currentRatio || 0
            },
            analysis: {
              summary: '財務分析結果',
              recommendations: ['負債比率の改善', '流動性の向上', 'セグメント収益性の改善']
            },
            extractedText: analysisContent
          };
        };
        
        reportData = createFallbackReportData(analysisContent);
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
