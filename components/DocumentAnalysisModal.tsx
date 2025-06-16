import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../components/ThemeProvider';
import { BusinessDocument, DocumentAnalysis } from '../types/documents';
import { analyzeDocument } from '../utils/gemini';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthProvider';
import { VisualReportModal } from './VisualReportModal';
import { v4 as uuidv4 } from 'uuid';

interface DocumentAnalysisModalProps {
  document: BusinessDocument | null;
  visible: boolean;
  onClose: () => void;
  existingAnalysis?: string;
}

export function DocumentAnalysisModal({
  document,
  visible,
  onClose,
  existingAnalysis,
}: DocumentAnalysisModalProps) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVisualReport, setShowVisualReport] = useState(false);

  useEffect(() => {
    if (visible && document) {
      if (existingAnalysis) {
        setAnalysis(existingAnalysis);
        setIsLoading(false);
        setError(null);
      } else {
        performAnalysis();
      }
    } else {
      setAnalysis(null);
      setError(null);
    }
  }, [visible, document, existingAnalysis]);

  async function performAnalysis() {
    if (!document) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: existingAnalyses, error: fetchError } = await supabase
        .from('document_analyses')
        .select('*')
        .eq('document_id', document.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      if (existingAnalyses && existingAnalyses.length > 0) {
        setAnalysis(existingAnalyses[0].content);
      } else {
        const result = await analyzeDocument(document.content);
        
        const newAnalysis: DocumentAnalysis = {
          id: uuidv4(),
          documentId: document.id,
          analysisType: 'financial',
          content: result,
          createdAt: Date.now(),
          summary: result.substring(0, 100) + '...',
          userId: user?.id || '',
        };
        
        const { error: insertError } = await supabase
          .from('document_analyses')
          .insert({
            id: newAnalysis.id,
            document_id: newAnalysis.documentId,
            analysis_type: newAnalysis.analysisType,
            content: newAnalysis.content,
            summary: newAnalysis.summary,
            user_id: user?.id,
          });
        
        if (insertError) throw insertError;
        
        setAnalysis(result);
      }
    } catch (error) {
      console.error('Error analyzing document:', error);
      setError(error instanceof Error ? error.message : '文書の分析中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }

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
              {document?.title || '文書分析'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
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
                  onPress={performAnalysis}
                >
                  <Text style={styles.retryButtonText}>再試行</Text>
                </TouchableOpacity>
              </View>
            ) : analysis ? (
              <View>
                <Text style={[
                  styles.analysisText,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  {analysis}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.createReportButton,
                    { backgroundColor: isDark ? '#34C759' : '#30D158' }
                  ]}
                  onPress={() => {
                    setShowVisualReport(true);
                  }}
                >
                  <Text style={styles.createReportButtonText}>これを資料化する</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[
                styles.placeholderText,
                { color: isDark ? '#8E8E93' : '#8E8E93' }
              ]}>
                分析結果がありません
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
      
      <VisualReportModal
        document={document}
        analysis={analysis}
        visible={showVisualReport}
        onClose={() => setShowVisualReport(false)}
      />
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
    maxWidth: 600,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%',
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
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  loadingContainer: {
    padding: 20,
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
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  createReportButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  createReportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
