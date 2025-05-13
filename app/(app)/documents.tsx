import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../components/ThemeProvider';
import { AuthWrapper } from '../../components/AuthWrapper';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../components/AuthProvider';
import { BusinessDocument } from '../../types/documents';
import { FileText, Plus, FileUp, Trash2 } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';

export default function DocumentsPage() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('business_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedDocuments: BusinessDocument[] = data.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        fileType: item.file_type,
        createdAt: new Date(item.created_at).getTime(),
        userId: item.user_id,
      }));
      
      setDocuments(formattedDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
      Alert.alert('エラー', '書類の読み込み中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }

  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) return;
      
      const file = result.assets[0];
      const fileContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const newDocument: BusinessDocument = {
        id: uuidv4(),
        title: file.name,
        content: fileContent,
        fileType: file.mimeType || 'application/octet-stream',
        createdAt: Date.now(),
        userId: user?.id || '',
      };
      
      const { error } = await supabase
        .from('business_documents')
        .insert({
          id: newDocument.id,
          title: newDocument.title,
          content: newDocument.content,
          file_type: newDocument.fileType,
          user_id: newDocument.userId,
        });
      
      if (error) throw error;
      
      setDocuments(prev => [newDocument, ...prev]);
      Alert.alert('成功', '書類がアップロードされました');
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('エラー', '書類のアップロード中にエラーが発生しました');
    }
  }

  function formatDate(timestamp: number) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  }

  return (
    <AuthWrapper>
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}>
        <View style={styles.content}>
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.documentItem,
                  { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
                ]}
                onPress={() => {
                }}
              >
                <View style={styles.documentIcon}>
                  <FileText size={32} color={isDark ? '#0A84FF' : '#007AFF'} />
                </View>
                <View style={styles.documentContent}>
                  <Text style={[
                    styles.documentTitle,
                    { color: isDark ? '#FFFFFF' : '#000000' }
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={[
                    styles.documentDate,
                    { color: isDark ? '#8E8E93' : '#8E8E93' }
                  ]}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.documentAction}
                  onPress={() => {
                    Alert.alert(
                      '削除の確認',
                      'この書類を削除してもよろしいですか？',
                      [
                        { text: 'キャンセル', style: 'cancel' },
                        { 
                          text: '削除', 
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              const { error } = await supabase
                                .from('business_documents')
                                .delete()
                                .eq('id', item.id);
                              
                              if (error) throw error;
                              
                              setDocuments(prev => prev.filter(d => d.id !== item.id));
                            } catch (error) {
                              console.error('Error deleting document:', error);
                              Alert.alert('エラー', '書類の削除中にエラーが発生しました');
                            }
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Trash2 size={20} color={isDark ? '#FF453A' : '#FF3B30'} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <FileText size={48} color={isDark ? '#8E8E93' : '#8E8E93'} />
                <Text style={[
                  styles.emptyText,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  {isLoading ? '読み込み中...' : '書類がありません'}
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />

          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: isDark ? '#0A84FF' : '#007AFF' }
            ]}
            onPress={pickDocument}
          >
            <FileUp size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 80,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  documentIcon: {
    marginRight: 16,
  },
  documentContent: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 14,
  },
  documentAction: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
