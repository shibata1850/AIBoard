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
import { generateVisualReport, VisualReportOptions } from '../utils/visualReportGenerator';
import { FileText, Eye } from 'lucide-react-native';

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

  const handleGenerateVisualReport = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    setIsGenerating(true);
    
    try {
      const options: VisualReportOptions = {
        title: title.trim(),
        analysisContent,
        fileName,
        documentType,
      };

      const result = await generateVisualReport(options);

      if (Platform.OS !== 'web') {
        Alert.alert(
          '成功',
          'ビジュアルレポートが生成されました',
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        Alert.alert(
          '成功',
          'ビジュアルレポートのダウンロードが開始されました',
          [{ text: 'OK', onPress: onClose }]
        );
      }
    } catch (error) {
      console.error('Visual report generation error:', error);
      Alert.alert(
        'エラー',
        'ビジュアルレポートの生成中にエラーが発生しました'
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
            ビジュアルレポート作成
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
            onPress={handleGenerateVisualReport}
            disabled={isGenerating}
          >
            <Eye size={20} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>ビジュアルレポート生成</Text>
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
