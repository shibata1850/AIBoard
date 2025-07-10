import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { FileUp, FileText } from 'lucide-react-native';
import { useTheme } from './ThemeProvider';
import { analyzeDocument } from '../utils/gemini';
import { readFileAsBase64, getMimeTypeFromFileName } from '../utils/fileUpload';
import * as DocumentPicker from 'expo-document-picker';
import { v4 as uuidv4 } from 'uuid';
import { DocumentCreationModal } from './DocumentCreationModal';

export function DirectFileAnalysis() {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  async function handleFileUpload() {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        setIsLoading(false);
        return;
      }
      
      const file = result.assets[0];
      setFileName(file.name);
      
      const fileContent = await readFileAsBase64(file.uri);
      
      const analysisResult = await analyzeDocument(fileContent);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Error analyzing file:', error);
      setError(error instanceof Error ? error.message : '文書の分析中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[
        styles.card,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}>
        <Text style={[
          styles.title,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          ファイル直接分析
        </Text>
        
        <Text style={[
          styles.description,
          { color: isDark ? '#EBEBF5' : '#3C3C43' }
        ]}>
          財務書類をアップロードして、AIによる分析を直接行います。
        </Text>
        
        {!isLoading && !analysis ? (
          <TouchableOpacity
            style={[
              styles.uploadButton,
              { backgroundColor: isDark ? '#0A84FF' : '#007AFF' }
            ]}
            onPress={handleFileUpload}
          >
            <FileUp size={20} color="#FFFFFF" style={styles.uploadIcon} />
            <Text style={styles.uploadText}>ファイルをアップロード</Text>
          </TouchableOpacity>
        ) : null}
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={isDark ? '#0A84FF' : '#007AFF'} />
            <Text style={[
              styles.loadingText,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              分析中...
            </Text>
          </View>
        ) : null}
        
        {error ? (
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
              onPress={handleFileUpload}
            >
              <Text style={styles.retryButtonText}>再試行</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        
        {analysis ? (
          <View style={styles.analysisContainer}>
            <View style={styles.fileInfoContainer}>
              <Text style={[
                styles.fileNameText,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                {fileName}
              </Text>
              <TouchableOpacity
                style={[
                  styles.newAnalysisButton,
                  { backgroundColor: isDark ? '#0A84FF' : '#007AFF' }
                ]}
                onPress={() => {
                  setAnalysis(null);
                  setFileName(null);
                }}
              >
                <Text style={styles.newAnalysisButtonText}>新しい分析</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.analysisScrollView}>
              <Text style={[
                styles.analysisText,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                {analysis}
              </Text>
            </ScrollView>
            
            <TouchableOpacity
              style={[
                styles.documentButton,
                { backgroundColor: isDark ? '#0A84FF' : '#007AFF' }
              ]}
              onPress={() => setShowDocumentModal(true)}
            >
              <FileText size={20} color="#FFFFFF" style={styles.documentButtonIcon} />
              <Text style={styles.documentButtonText}>ビジュアルレポート作成</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <DocumentCreationModal
          visible={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          analysisContent={analysis || ''}
          fileName={fileName || undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.7,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  uploadIcon: {
    marginRight: 8,
  },
  uploadText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 16,
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
  analysisContainer: {
    marginTop: 16,
  },
  fileInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileNameText: {
    fontSize: 16,
    fontWeight: '500',
  },
  newAnalysisButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  newAnalysisButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  analysisScrollView: {
    maxHeight: 400,
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  documentButtonIcon: {
    marginRight: 8,
  },
  documentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
