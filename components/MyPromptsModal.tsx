import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { X, Plus, Search } from 'lucide-react-native';
import { useTheme } from './ThemeProvider';
import { Prompt } from '../types/prompts';
import { supabase } from '../utils/supabase';

interface MyPromptsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
}

export function MyPromptsModal({ visible, onClose, onSelect }: MyPromptsModalProps) {
  const { isDark } = useTheme();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (visible) {
      loadPrompts();
    }
  }, [visible]);
  
  async function loadPrompts() {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('my_prompts')
        .select('*')
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
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
              マイプロンプト
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>
          
          <View style={[
            styles.searchContainer,
            { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
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
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={isDark ? '#0A84FF' : '#007AFF'} />
            </View>
          ) : (
            <FlatList
              data={filteredPrompts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.promptItem,
                    { borderBottomColor: isDark ? '#38383A' : '#E5E5EA' }
                  ]}
                  onPress={() => onSelect(item.content)}
                >
                  <View>
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
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[
                    styles.emptyText,
                    { color: isDark ? '#8E8E93' : '#8E8E93' }
                  ]}>
                    プロンプトがありません
                  </Text>
                </View>
              }
            />
          )}
          
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: isDark ? '#0A84FF' : '#007AFF' }
            ]}
            onPress={() => {
              onClose();
            }}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  promptCategory: {
    fontSize: 14,
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
    bottom: 30,
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
