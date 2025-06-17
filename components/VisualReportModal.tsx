import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { X, Download } from 'lucide-react-native';
import { useTheme } from './ThemeProvider';
interface BusinessDocument {
  id: string;
  title: string;
  content: string;
  type?: string;
  createdAt: number;
}

interface DocumentAnalysis {
  id: string;
  documentId: string;
  analysisType: 'financial' | 'business' | 'strategy';
  content: string;
  createdAt: number;
  summary: string;
}
// import { BarChart, PieChart, LineChart } from 'react-native-gifted-charts';
import { generateStructuredAnalysis } from '../utils/structuredAnalysis';
import { exportReportAsPDF } from '../utils/reportExport';

const { width: screenWidth } = Dimensions.get('window');

interface VisualReportModalProps {
  document: BusinessDocument | null;
  analysis: string | null;
  visible: boolean;
  onClose: () => void;
}

interface FinancialData {
  revenue: { label: string; value: number }[];
  expenses: { label: string; value: number }[];
  profitability: { month: string; profit: number }[];
  keyMetrics: { metric: string; value: number; unit: string }[];
}

export function VisualReportModal({
  document,
  analysis,
  visible,
  onClose,
}: VisualReportModalProps) {
  const { isDark } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && document && analysis) {
      generateVisualData();
    } else {
      setFinancialData(null);
      setError(null);
    }
  }, [visible, document, analysis]);

  async function generateVisualData() {
    if (!document || !analysis) return;
    
    try {
      setIsGenerating(true);
      setError(null);
      
      const structuredData = await generateStructuredAnalysis(analysis);
      setFinancialData(structuredData);
    } catch (error) {
      console.error('Error generating visual data:', error);
      setError(error instanceof Error ? error.message : 'ビジュアルデータの生成中にエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleExportPDF() {
    if (!document || !financialData) return;
    
    try {
      await exportReportAsPDF(document, financialData);
      Alert.alert('成功', 'レポートがPDFとして保存されました');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('エラー', 'PDFエクスポート中にエラーが発生しました');
    }
  }

  const chartWidth = screenWidth - 80;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[
        styles.modalContainer,
        { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)' }
      ]}>
        <View style={[
          styles.modalContent,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              ビジュアルレポート
            </Text>
            <View style={styles.headerButtons}>
              {financialData && (
                <TouchableOpacity
                  onPress={handleExportPDF}
                  style={[
                    styles.exportButton,
                    { backgroundColor: isDark ? '#0A84FF' : '#007AFF' }
                  ]}
                >
                  <Download size={20} color="#FFFFFF" />
                  <Text style={styles.exportButtonText}>PDF出力</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDark ? '#0A84FF' : '#007AFF'} />
                <Text style={[
                  styles.loadingText,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  ビジュアルレポートを生成中...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={[
                  styles.errorText,
                  { color: isDark ? '#FF453A' : '#FF3B30' }
                ]}>
                  {error}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.retryButton,
                    { backgroundColor: isDark ? '#0A84FF' : '#007AFF' }
                  ]}
                  onPress={generateVisualData}
                >
                  <Text style={styles.retryButtonText}>再試行</Text>
                </TouchableOpacity>
              </View>
            ) : financialData ? (
              <View style={styles.chartsContainer}>
                <Text style={[
                  styles.documentTitle,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  {document?.title}
                </Text>

                {/* Revenue Chart */}
                {financialData.revenue.length > 0 && (
                  <View style={styles.chartSection}>
                    <Text style={[
                      styles.chartTitle,
                      { color: isDark ? '#FFFFFF' : '#000000' }
                    ]}>
                      収益構成
                    </Text>
                    <View style={styles.chartContainer}>
                      <Text style={[
                        styles.placeholderText,
                        { color: isDark ? '#8E8E93' : '#8E8E93' }
                      ]}>
                        収益チャート (実装中)
                      </Text>
                      {financialData.revenue.map((item, index) => (
                        <Text key={index} style={[
                          styles.dataText,
                          { color: isDark ? '#FFFFFF' : '#000000' }
                        ]}>
                          {item.label}: {item.value.toLocaleString()}円
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                {/* Expenses Chart */}
                {financialData.expenses.length > 0 && (
                  <View style={styles.chartSection}>
                    <Text style={[
                      styles.chartTitle,
                      { color: isDark ? '#FFFFFF' : '#000000' }
                    ]}>
                      費用構成
                    </Text>
                    <View style={styles.chartContainer}>
                      <Text style={[
                        styles.placeholderText,
                        { color: isDark ? '#8E8E93' : '#8E8E93' }
                      ]}>
                        費用チャート (実装中)
                      </Text>
                      {financialData.expenses.map((item, index) => (
                        <Text key={index} style={[
                          styles.dataText,
                          { color: isDark ? '#FFFFFF' : '#000000' }
                        ]}>
                          {item.label}: {item.value.toLocaleString()}円
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                {/* Profitability Trend */}
                {financialData.profitability.length > 0 && (
                  <View style={styles.chartSection}>
                    <Text style={[
                      styles.chartTitle,
                      { color: isDark ? '#FFFFFF' : '#000000' }
                    ]}>
                      収益性推移
                    </Text>
                    <View style={styles.chartContainer}>
                      <Text style={[
                        styles.placeholderText,
                        { color: isDark ? '#8E8E93' : '#8E8E93' }
                      ]}>
                        収益性推移チャート (実装中)
                      </Text>
                      {financialData.profitability.map((item, index) => (
                        <Text key={index} style={[
                          styles.dataText,
                          { color: isDark ? '#FFFFFF' : '#000000' }
                        ]}>
                          {item.month}: {item.profit.toLocaleString()}円
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                {/* Key Metrics */}
                {financialData.keyMetrics.length > 0 && (
                  <View style={styles.chartSection}>
                    <Text style={[
                      styles.chartTitle,
                      { color: isDark ? '#FFFFFF' : '#000000' }
                    ]}>
                      主要指標
                    </Text>
                    <View style={styles.metricsContainer}>
                      {financialData.keyMetrics.map((metric, index) => (
                        <View
                          key={index}
                          style={[
                            styles.metricCard,
                            { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
                          ]}
                        >
                          <Text style={[
                            styles.metricLabel,
                            { color: isDark ? '#8E8E93' : '#8E8E93' }
                          ]}>
                            {metric.metric}
                          </Text>
                          <Text style={[
                            styles.metricValue,
                            { color: isDark ? '#FFFFFF' : '#000000' }
                          ]}>
                            {metric.value.toLocaleString()}{metric.unit}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <Text style={[
                styles.placeholderText,
                { color: isDark ? '#8E8E93' : '#8E8E93' }
              ]}>
                ビジュアルデータがありません
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 800,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.3)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chartsContainer: {
    paddingBottom: 20,
  },
  documentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  chartSection: {
    marginBottom: 32,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  dataText: {
    fontSize: 14,
    marginVertical: 4,
    paddingHorizontal: 16,
  },
});
