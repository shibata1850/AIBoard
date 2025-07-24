import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../components/ThemeProvider';
import { AuthWrapper } from '../../../components/AuthWrapper';
import { useLocalSearchParams, router } from 'expo-router';
import { VerifiedFinancialData } from '../../../server/api/verification';

export default function VerifyPage() {
  const { isDark } = useTheme();
  const params = useLocalSearchParams();
  const [pdfData, setPdfData] = useState<string>('');
  const [verifiedData, setVerifiedData] = useState<VerifiedFinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editedData, setEditedData] = useState<any>({});

  useEffect(() => {
    if (params.pdfBase64 && params.verificationData) {
      setPdfData(params.pdfBase64 as string);
      const parsedData = JSON.parse(params.verificationData as string);
      setVerifiedData(parsedData);
      setEditedData(parsedData);
    }
  }, [params]);

  const handleApproveAndAnalyze = async () => {
    if (!editedData) return;
    
    setIsLoading(true);
    try {
      const baseUrl = process.env.EXPO_PUBLIC_CHAT_API_BASE_URL || '';
      const apiUrl = baseUrl ? `${baseUrl}/api/verify` : '/api/verify';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'approve',
          verifiedData: editedData 
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        router.push({
          pathname: '/(app)/analysis',
          params: { analysisResult: result.analysis }
        });
      } else {
        Alert.alert('エラー', result.error || '分析の実行中にエラーが発生しました');
      }
    } catch (error) {
      Alert.alert('エラー', '分析の実行中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFinancialValue = (path: string[], value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newData = { ...editedData };
    let current = newData;
    
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    current[path[path.length - 1]] = numericValue;
    
    setEditedData(newData);
  };

  const renderFinancialInput = (label: string, path: string[], value: number) => (
    <View style={styles.inputRow} key={path.join('.')}>
      <Text style={[styles.inputLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
            color: isDark ? '#FFFFFF' : '#000000',
            borderColor: isDark ? '#3A3A3C' : '#C7C7CC'
          }
        ]}
        value={value.toString()}
        onChangeText={(text) => updateFinancialValue(path, text)}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
      />
    </View>
  );

  return (
    <AuthWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            データ検証・承認
          </Text>
        </View>
        
        <View style={styles.content}>
          <View style={[styles.leftPane, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
            <Text style={[styles.paneTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              元文書
            </Text>
            <View style={styles.pdfContainer}>
              {Platform.OS === 'web' && pdfData ? (
                <iframe
                  src={`data:application/pdf;base64,${pdfData}`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="PDF Document"
                />
              ) : (
                <Text style={[styles.pdfPlaceholder, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
                  PDF表示はWebでのみ利用可能です
                </Text>
              )}
            </View>
          </View>
          
          <View style={[styles.rightPane, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
            <Text style={[styles.paneTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              抽出データ確認・修正
            </Text>
            
            {verifiedData && (
              <ScrollView style={styles.formContainer}>
                <View style={styles.verificationStatus}>
                  <Text style={[styles.statusTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    自動検証結果
                  </Text>
                  <Text style={[
                    styles.statusText,
                    { color: verifiedData.verification.isValid ? '#34C759' : '#FF3B30' }
                  ]}>
                    {verifiedData.verification.isValid ? '✅ 検証合格' : '❌ 検証不合格'}
                  </Text>
                  <Text style={[styles.scoreText, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
                    スコア: {verifiedData.verification.overallScore.toFixed(1)}%
                  </Text>
                  
                  {verifiedData.verification.warnings.length > 0 && (
                    <View style={styles.warningsContainer}>
                      <Text style={[styles.warningsTitle, { color: '#FF9500' }]}>警告:</Text>
                      {verifiedData.verification.warnings.map((warning, index) => (
                        <Text key={index} style={[styles.warningText, { color: '#FF9500' }]}>
                          • {warning}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
                
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    貸借対照表
                  </Text>
                  {renderFinancialInput('資産合計', ['statements', '貸借対照表', '資産の部', '資産合計'], 
                    editedData.statements?.貸借対照表?.資産の部?.資産合計 || 0)}
                  {renderFinancialInput('流動資産合計', ['statements', '貸借対照表', '資産の部', '流動資産', '流動資産合計'], 
                    editedData.statements?.貸借対照表?.資産の部?.流動資産?.流動資産合計 || 0)}
                  {renderFinancialInput('固定資産合計', ['statements', '貸借対照表', '資産の部', '固定資産', '固定資産合計'], 
                    editedData.statements?.貸借対照表?.資産の部?.固定資産?.固定資産合計 || 0)}
                  {renderFinancialInput('負債合計', ['statements', '貸借対照表', '負債の部', '負債合計'], 
                    editedData.statements?.貸借対照表?.負債の部?.負債合計 || 0)}
                  {renderFinancialInput('流動負債合計', ['statements', '貸借対照表', '負債の部', '流動負債', '流動負債合計'], 
                    editedData.statements?.貸借対照表?.負債の部?.流動負債?.流動負債合計 || 0)}
                  {renderFinancialInput('固定負債合計', ['statements', '貸借対照表', '負債の部', '固定負債', '固定負債合計'], 
                    editedData.statements?.貸借対照表?.負債の部?.固定負債?.固定負債合計 || 0)}
                  {renderFinancialInput('純資産合計', ['statements', '貸借対照表', '純資産の部', '純資産合計'], 
                    editedData.statements?.貸借対照表?.純資産の部?.純資産合計 || 0)}
                </View>

                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    損益計算書
                  </Text>
                  {renderFinancialInput('経常収益合計', ['statements', '損益計算書', '経常収益', '経常収益合計'], 
                    editedData.statements?.損益計算書?.経常収益?.経常収益合計 || 0)}
                  {renderFinancialInput('経常費用合計', ['statements', '損益計算書', '経常費用', '経常費用合計'], 
                    editedData.statements?.損益計算書?.経常費用?.経常費用合計 || 0)}
                  {renderFinancialInput('経常利益', ['statements', '損益計算書', '経常利益'], 
                    editedData.statements?.損益計算書?.経常利益 || 0)}
                </View>

                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    キャッシュフロー計算書
                  </Text>
                  {renderFinancialInput('営業活動によるキャッシュフロー合計', ['statements', 'キャッシュフロー計算書', '営業活動によるキャッシュフロー', '営業活動によるキャッシュフロー合計'], 
                    editedData.statements?.キャッシュフロー計算書?.営業活動によるキャッシュフロー?.営業活動によるキャッシュフロー合計 || 0)}
                  {renderFinancialInput('投資活動によるキャッシュフロー合計', ['statements', 'キャッシュフロー計算書', '投資活動によるキャッシュフロー', '投資活動によるキャッシュフロー合計'], 
                    editedData.statements?.キャッシュフロー計算書?.投資活動によるキャッシュフロー?.投資活動によるキャッシュフロー合計 || 0)}
                  {renderFinancialInput('財務活動によるキャッシュフロー合計', ['statements', 'キャッシュフロー計算書', '財務活動によるキャッシュフロー', '財務活動によるキャッシュフロー合計'], 
                    editedData.statements?.キャッシュフロー計算書?.財務活動によるキャッシュフロー?.財務活動によるキャッシュフロー合計 || 0)}
                  {renderFinancialInput('現金及び現金同等物の増減額', ['statements', 'キャッシュフロー計算書', '現金及び現金同等物の増減額'], 
                    editedData.statements?.キャッシュフロー計算書?.現金及び現金同等物の増減額 || 0)}
                </View>
                
                <TouchableOpacity
                  style={[styles.approveButton, { backgroundColor: '#34C759' }]}
                  onPress={handleApproveAndAnalyze}
                  disabled={isLoading}
                >
                  <Text style={styles.approveButtonText}>
                    {isLoading ? '処理中...' : '承認して分析実行'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </SafeAreaView>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
  },
  leftPane: {
    flex: Platform.OS === 'web' ? 1 : 0.4,
    padding: 16,
    margin: 8,
    borderRadius: 12,
  },
  rightPane: {
    flex: Platform.OS === 'web' ? 1 : 0.6,
    padding: 16,
    margin: 8,
    borderRadius: 12,
  },
  paneTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  pdfContainer: {
    flex: 1,
    minHeight: 400,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pdfPlaceholder: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
  },
  verificationStatus: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 14,
  },
  warningsContainer: {
    marginTop: 12,
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputRow: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  approveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
