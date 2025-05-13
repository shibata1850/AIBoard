import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../components/ThemeProvider';
import { AuthWrapper } from '../../components/AuthWrapper';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../components/AuthProvider';
import { Prompt } from '../../types/prompts';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react-native';
import { v4 as uuidv4 } from 'uuid';

export default function MyPromptsPage() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPrompts();
  }, []);

  async function loadPrompts() {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('my_prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedPrompts: Prompt[] = data.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        userId: item.user_id,
        createdAt: new Date(item.created_at).getTime(),
        updatedAt: new Date(item.updated_at).getTime(),
      }));
      
      setPrompts(formattedPrompts);
    } catch (error) {
      console.error('Error loading prompts:', error);
      Alert.alert('エラー', 'プロンプトの読み込み中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }

  const filteredPrompts = prompts.filter(prompt => 
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AuthWrapper>
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}>
        <View style={styles.content}>
          <View style={[
            styles.searchContainer,
            { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }
          ]}>
            <Search size={20} color={isDark ? '#8E8E93' : '#8E8E93'} />
            <TextInput
              style={[
                styles.searchInput,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}
              placeholder="検索..."
              placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredPrompts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[
                styles.promptItem,
                { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
              ]}>
                <View style={styles.promptContent}>
                  <Text style={[
                    styles.promptTitle,
                    { color: isDark ? '#FFFFFF' : '#000000' }
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={[
                    styles.promptCategory,
                    { color: isDark ? '#8E8E93' : '#8E8E93' }
                  ]}>
                    {item.category}
                  </Text>
                  <Text style={[
                    styles.promptPreview,
                    { color: isDark ? '#AEAEB2' : '#3A3A3C' }
                  ]}>
                    {item.content.substring(0, 100)}
                    {item.content.length > 100 ? '...' : ''}
                  </Text>
                </View>
                <View style={styles.promptActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                    }}
                  >
                    <Edit2 size={20} color={isDark ? '#0A84FF' : '#007AFF'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      Alert.alert(
                        '削除の確認',
                        'このプロンプトを削除してもよろしいですか？',
                        [
                          { text: 'キャンセル', style: 'cancel' },
                          { 
                            text: '削除', 
                            style: 'destructive',
                            onPress: async () => {
                              try {
                                const { error } = await supabase
                                  .from('my_prompts')
                                  .delete()
                                  .eq('id', item.id);
                                
                                if (error) throw error;
                                
                                setPrompts(prev => prev.filter(p => p.id !== item.id));
                              } catch (error) {
                                console.error('Error deleting prompt:', error);
                                Alert.alert('エラー', 'プロンプトの削除中にエラーが発生しました');
                              }
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Trash2 size={20} color={isDark ? '#FF453A' : '#FF3B30'} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[
                  styles.emptyText,
                  { color: isDark ? '#8E8E93' : '#8E8E93' }
                ]}>
                  {isLoading ? '読み込み中...' : 'プロンプトがありません'}
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
            onPress={() => {
            }}
          >
            <Plus size={24} color="#FFFFFF" />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 80,
  },
  promptItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
  },
  promptContent: {
    flex: 1,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  promptCategory: {
    fontSize: 14,
    marginBottom: 8,
  },
  promptPreview: {
    fontSize: 14,
  },
  promptActions: {
    justifyContent: 'center',
  },
  actionButton: {
    padding: 8,
    marginBottom: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
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
