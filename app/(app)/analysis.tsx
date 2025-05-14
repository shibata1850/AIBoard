import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../components/ThemeProvider';
import { AuthWrapper } from '../../components/AuthWrapper';
import { FileUp } from 'lucide-react-native';
import { analyzeDocument } from '../../utils/gemini';
import { FileUploadButton } from '../../components/FileUploadButton';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../components/AuthProvider';
import { extractTextFromPdf, isPdfFile } from '../../utils/pdfUtils';

type DocumentType = '財務諸表' | '貸借対照表' | '損益計算書' | 'キャッシュフロー計算書' | '事業計画書' | 'その他';

export default function AnalysisPage() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [documentType, setDocumentType] = useState<DocumentType>('財務諸表');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const documentTypes: DocumentType[] = [
    '財務諸表',
    '貸借対照表',
    '損益計算書',
    'キャッシュフロー計算書',
    '事業計画書',
    'その他'
  ];


  async function handleFileUpload(fileData: { name: string; content: string; type: string }) {
    try {
      setIsAnalyzing(true);
      setError(null);
      setFileName(fileData.name);
      
      const fileSizeKB = Math.round((fileData.content.length * 3) / 4 / 1024);
      console.log(`Processing file: ${fileData.name}, size: ${fileSizeKB}KB, type: ${fileData.type}`);
      
      if (fileSizeKB > 5000) {
        console.warn(`Large file detected: ${fileSizeKB}KB`);
        setError(`ファイルサイズが大きすぎます (${fileSizeKB}KB)。5MB以下のファイルを使用してください。処理を続行しますが、時間がかかる場合があります。`);
        await sleep(2000); // ユーザーがエラーメッセージを読む時間を確保
      }
      
      let contentToAnalyze = fileData.content;
      
      if (isPdfFile(fileData.type)) {
        try {
          console.log('PDF file detected, extracting text...');
          contentToAnalyze = await extractTextFromPdf(fileData.content);
          console.log(`Extracted ${contentToAnalyze.length} characters of text from PDF`);
          
          if (!contentToAnalyze || contentToAnalyze.trim().length === 0) {
            throw new Error('PDFからテキストを抽出できませんでした。別のファイルを試してください。');
          }
        } catch (pdfError) {
          console.error('PDF text extraction error:', pdfError);
          setError(pdfError instanceof Error ? pdfError.message : 'PDFからテキストを抽出できませんでした');
          setIsAnalyzing(false);
          return;
        }
      }
      
      const result = await analyzeDocument(contentToAnalyze);
      setAnalysisResult(result);
      setError(null); // 成功したらエラーをクリア
      
      if (user) {
        const analysisId = uuidv4();
        const documentId = uuidv4();
        
        try {
          const documentContent = isPdfFile(fileData.type) 
            ? JSON.stringify({ 
                originalBase64: fileData.content.substring(0, 100) + '...', // 一部だけ保存
                extractedText: contentToAnalyze 
              })
            : fileData.content;
            
          await supabase
            .from('business_documents')
            .insert({
              id: documentId,
              title: fileData.name,
              content: documentContent,
              file_type: documentType,
              user_id: user.id,
            });
          
          await supabase
            .from('document_analyses')
            .insert({
              id: analysisId,
              document_id: documentId,
              analysis_type: 'financial',
              content: result,
              summary: result.substring(0, 200) + '...',
              user_id: user.id,
            });
        } catch (dbError) {
          console.error('Database error:', dbError);
        }
      }
    } catch (error) {
      console.error('File analysis error:', error);
      setError(error instanceof Error ? error.message : 'ファイル分析中にエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
    }
  }
  
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  function resetAnalysis() {
    setAnalysisResult(null);
    setFileName(null);
  }

  return (
    <AuthWrapper>
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={[
              styles.title,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              経営資料分析
            </Text>
            <Text style={[
              styles.subtitle,
              { color: isDark ? '#8E8E93' : '#8E8E93' }
            ]}>
              財務諸表や事業計画書の内容を入力して、AIによる分析を受けることができます
            </Text>
          </View>

          {!analysisResult ? (
            <View style={styles.inputContainer}>
              {/* Title input field has been removed as requested */}

              <View style={styles.formGroup}>
                <Text style={[
                  styles.label,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  資料の種類を選択
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.typeScrollView}
                >
                  <View style={styles.typeContainer}>
                    {documentTypes.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeButton,
                          { 
                            backgroundColor: documentType === type 
                              ? (isDark ? '#0A84FF' : '#007AFF') 
                              : (isDark ? '#1C1C1E' : '#F2F2F7')
                          }
                        ]}
                        onPress={() => setDocumentType(type)}
                      >
                        <Text style={[
                          styles.typeButtonText,
                          { 
                            color: documentType === type 
                              ? '#FFFFFF' 
                              : (isDark ? '#FFFFFF' : '#000000')
                          }
                        ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Text input area has been removed as requested */}

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.actionContainer}>
                <View style={styles.uploadContainer}>
                  <Text style={[
                    styles.uploadLabel,
                    { color: isDark ? '#FFFFFF' : '#000000' }
                  ]}>
                    ファイルをアップロードして分析
                  </Text>
                  <FileUploadButton
                    onFileSelected={handleFileUpload}
                    isDark={isDark}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={[
                  styles.resultTitle,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  {fileName || '無題の文書'} の分析結果
                </Text>
                <TouchableOpacity
                  style={[
                    styles.newAnalysisButton,
                    { backgroundColor: isDark ? '#0A84FF' : '#007AFF' }
                  ]}
                  onPress={resetAnalysis}
                >
                  <Text style={styles.newAnalysisButtonText}>新しい分析</Text>
                </TouchableOpacity>
              </View>

              <View style={[
                styles.resultContent,
                { 
                  backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
                }
              ]}>
                <Text style={[
                  styles.resultText,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  {analysisResult}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {isAnalyzing && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={isDark ? '#0A84FF' : '#007AFF'} />
            <Text style={[
              styles.loadingText,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              分析中...
            </Text>
          </View>
        )}
      </SafeAreaView>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  typeScrollView: {
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  textArea: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  actionContainer: {
    marginTop: 16,
  },
  analyzeButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadLabel: {
    marginRight: 16,
    fontSize: 16,
  },
  resultContainer: {
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  newAnalysisButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newAnalysisButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resultContent: {
    borderRadius: 8,
    padding: 16,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
});
