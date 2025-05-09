import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../components/ThemeProvider';
import { AuthWrapper } from '../components/AuthWrapper';
import { getChatHistory } from '../utils/chatStorage';
import { useRouter } from 'expo-router';
import { Clock, MessageSquare } from 'lucide-react-native';
import { ChatHistory, ChatContext } from '../types/chat';

export default function HistoryPage() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [chatHistory, setChatHistory] = React.useState<ChatHistory>({ contexts: [] });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadHistory() {
      try {
        const history = await getChatHistory();
        setChatHistory(history);
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, []);

  function formatDate(timestamp: number) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <AuthWrapper>
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}>
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={{ color: isDark ? '#FFFFFF' : '#000000' }}>
                読み込み中...
              </Text>
            </View>
          ) : chatHistory.contexts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MessageSquare size={48} color={isDark ? '#8E8E93' : '#8E8E93'} />
              <Text style={[
                styles.emptyText,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                チャット履歴がありません
              </Text>
            </View>
          ) : (
            <FlatList
              data={chatHistory.contexts}
              keyExtractor={(item) => item.contextId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.historyItem,
                    { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
                  ]}
                  onPress={() => router.push(`/chat/${item.contextId}`)}
                >
                  <View style={styles.historyContent}>
                    <Text style={[
                      styles.historyTitle,
                      { color: isDark ? '#FFFFFF' : '#000000' }
                    ]}>
                      {item.title || '無題の会話'}
                    </Text>
                    <Text style={[
                      styles.historyPreview,
                      { color: isDark ? '#8E8E93' : '#8E8E93' }
                    ]}>
                      {item.messages[item.messages.length - 1]?.text.substring(0, 50) || ''}
                      {item.messages[item.messages.length - 1]?.text.length > 50 ? '...' : ''}
                    </Text>
                  </View>
                  <View style={styles.historyMeta}>
                    <Clock size={16} color={isDark ? '#8E8E93' : '#8E8E93'} />
                    <Text style={[
                      styles.historyDate,
                      { color: isDark ? '#8E8E93' : '#8E8E93' }
                    ]}>
                      {formatDate(item.lastUpdated)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View style={[
                  styles.separator,
                  { backgroundColor: isDark ? '#38383A' : '#E5E5EA' }
                ]} />
              )}
              contentContainerStyle={styles.listContent}
            />
          )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContent: {
    padding: 16,
  },
  historyItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyPreview: {
    fontSize: 14,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  historyDate: {
    fontSize: 12,
    marginLeft: 4,
  },
  separator: {
    height: 1,
    marginVertical: 8,
  },
});
