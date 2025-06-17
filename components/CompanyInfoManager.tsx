import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { Plus, Edit, Trash2, FileText } from 'lucide-react-native';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthProvider';
import { CompanyInfo, CompanyInfoCategory, CompanyInfoInsert, CompanyInfoUpdate } from '../types/companyInfo';
import { getCompanyInfo, createCompanyInfo, updateCompanyInfo, deleteCompanyInfo } from '../utils/companyInfo';

const CATEGORIES: CompanyInfoCategory[] = ['社訓', 'ポリシー', '手順', 'FAQ'];

export function CompanyInfoManager() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [companyInfoList, setCompanyInfoList] = useState<CompanyInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<CompanyInfo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '社訓' as CompanyInfoCategory,
  });

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    try {
      setIsLoading(true);
      const data = await getCompanyInfo();
      setCompanyInfoList(data);
    } catch (error) {
      console.error('Error loading company info:', error);
      Alert.alert('エラー', '社内情報の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ title: '', content: '', category: '社訓' });
    setIsModalVisible(true);
  };

  const handleEdit = (item: CompanyInfo) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
    });
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      Alert.alert('エラー', 'タイトルと内容を入力してください');
      return;
    }

    if (!user) {
      Alert.alert('エラー', 'ユーザー情報が見つかりません');
      return;
    }

    try {
      if (editingItem) {
        const updates: CompanyInfoUpdate = {
          title: formData.title,
          content: formData.content,
          category: formData.category,
        };
        await updateCompanyInfo(editingItem.id, updates);
      } else {
        const newItem: CompanyInfoInsert = {
          title: formData.title,
          content: formData.content,
          category: formData.category,
          created_by: user.id,
        };
        await createCompanyInfo(newItem);
      }

      setIsModalVisible(false);
      loadCompanyInfo();
    } catch (error) {
      console.error('Error saving company info:', error);
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  const handleDelete = (item: CompanyInfo) => {
    Alert.alert(
      '削除確認',
      `「${item.title}」を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCompanyInfo(item.id);
              loadCompanyInfo();
            } catch (error) {
              console.error('Error deleting company info:', error);
              Alert.alert('エラー', '削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  const getCategoryColor = (category: CompanyInfoCategory) => {
    const colors = {
      '社訓': '#FF6B6B',
      'ポリシー': '#4ECDC4',
      '手順': '#45B7D1',
      'FAQ': '#96CEB4',
    };
    return colors[category];
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          社内情報管理
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <Text style={[styles.loadingText, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
            読み込み中...
          </Text>
        ) : companyInfoList.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={48} color={isDark ? '#8E8E93' : '#8E8E93'} />
            <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
              社内情報がありません
            </Text>
          </View>
        ) : (
          companyInfoList.map((item) => (
            <View
              key={item.id}
              style={[styles.itemCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
            >
              <View style={styles.itemHeader}>
                <View style={styles.itemTitleRow}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: getCategoryColor(item.category) },
                    ]}
                  >
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                  <Text style={[styles.itemTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    {item.title}
                  </Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(item)}
                  >
                    <Edit size={20} color={isDark ? '#0A84FF' : '#007AFF'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(item)}
                  >
                    <Trash2 size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text
                style={[styles.itemContent, { color: isDark ? '#8E8E93' : '#8E8E93' }]}
                numberOfLines={3}
              >
                {item.content}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
          <View style={[styles.modalHeader, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={[styles.cancelButton, { color: isDark ? '#0A84FF' : '#007AFF' }]}>
                キャンセル
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              {editingItem ? '編集' : '新規作成'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={[styles.saveButton, { color: isDark ? '#0A84FF' : '#007AFF' }]}>
                保存
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                カテゴリ
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categorySelector}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        {
                          backgroundColor:
                            formData.category === category
                              ? getCategoryColor(category)
                              : isDark
                              ? '#2C2C2E'
                              : '#F2F2F7',
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, category })}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          {
                            color:
                              formData.category === category
                                ? '#FFFFFF'
                                : isDark
                                ? '#FFFFFF'
                                : '#000000',
                          },
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                タイトル
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
                    color: isDark ? '#FFFFFF' : '#000000',
                  },
                ]}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="タイトルを入力"
                placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                内容
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
                    color: isDark ? '#FFFFFF' : '#000000',
                  },
                ]}
                value={formData.content}
                onChangeText={(text) => setFormData({ ...formData, content: text })}
                placeholder="内容を入力"
                placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
                multiline
                numberOfLines={10}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#C6C6C8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  itemCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  itemContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#C6C6C8',
  },
  cancelButton: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  categorySelector: {
    flexDirection: 'row',
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#C6C6C8',
  },
  textArea: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#C6C6C8',
    minHeight: 200,
  },
});
