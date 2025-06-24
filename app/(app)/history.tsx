import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../components/ThemeProvider';
import { AuthWrapper } from '../../components/AuthWrapper';
import { useAuth } from '../../components/AuthProvider';
import { FileText, Clock } from 'lucide-react-native';
import { AnalysisHistoryItem } from '../../types/documents';
import { supabase } from '../../utils/supabase';


export default function HistoryPage() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [analysisHistory, setAnalysisHistory] = React.useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = React.useState<AnalysisHistoryItem | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = React.useState(false);

  React.useEffect(() => {
    console.log('History useEffect triggered, user:', user);
    if (user) {
      console.log('User found, loading analysis history...');
      loadAnalysisHistory();
    } else {
      console.log('No user found in history component');
    }
  }, [user]);

  async function loadAnalysisHistory() {
    console.log('loadAnalysisHistory called, user:', user);
    if (!user) {
      console.log('No user in loadAnalysisHistory, returning');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Attempting to query document_analyses table...');
      const { data, error: fetchError } = await supabase
        .from('document_analyses')
        .select(`
          id,
          document_id,
          analysis_type,
          insights,
          created_at,
          business_documents!inner(title)
        `)
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('Supabase error:', fetchError);
        throw fetchError;
      }
      
      console.log('Raw data from document_analyses table:', data);
      console.log('Available columns:', data && data.length > 0 ? Object.keys(data[0]) : 'No data');
      
      const formattedHistory: AnalysisHistoryItem[] = data?.map(item => {
        let content = '';
        let summary = '';
        
        if (typeof item.insights === 'string') {
          content = item.insights;
          summary = item.insights.length > 100 ? item.insights.substring(0, 100) + '...' : item.insights;
        } else if (typeof item.insights === 'object' && item.insights) {
          const insightsObj = item.insights as any;
          content = insightsObj.summary || JSON.stringify(item.insights);
          summary = insightsObj.summary || '分析結果が利用可能です';
          if (summary.length > 100) {
            summary = summary.substring(0, 100) + '...';
          }
        } else {
          content = '分析結果なし';
          summary = '分析結果なし';
        }
        
        return {
          id: item.id,
          documentId: item.document_id,
          documentTitle: (item.business_documents as any)?.title || 'Unknown Document',
          analysisType: item.analysis_type,
          content,
          summary,
          createdAt: new Date(item.created_at).getTime(),
          userId: user?.id || '',
        };
      }) || [];
      
      setAnalysisHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading analysis history:', error);
      setError(error instanceof Error ? error.message : '分析履歴の読み込み中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }

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

  function getAnalysisTypeLabel(type: string) {
    switch (type) {
      case 'financial': return '財務分析';
      case 'business': return '事業分析';
      case 'strategy': return '戦略分析';
      default: return '分析';
    }
  }

  function handleAnalysisClick(item: AnalysisHistoryItem) {
    setSelectedAnalysis(item);
    setShowAnalysisModal(true);
  }

  function handleCloseModal() {
    setShowAnalysisModal(false);
    setSelectedAnalysis(null);
  }

  return (
    <AuthWrapper>
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            分析履歴
          </Text>
        </View>
        
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={isDark ? '#0A84FF' : '#007AFF'} />
              <Text style={[
                styles.loadingText,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                読み込み中...
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
                onPress={loadAnalysisHistory}
              >
                <Text style={styles.retryButtonText}>再試行</Text>
              </TouchableOpacity>
            </View>
          ) : analysisHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FileText size={48} color={isDark ? '#8E8E93' : '#8E8E93'} />
              <Text style={[
                styles.emptyText,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                分析履歴がありません
              </Text>
              <Text style={[
                styles.emptySubtext,
                { color: isDark ? '#8E8E93' : '#8E8E93' }
              ]}>
                文書を分析すると、ここに履歴が表示されます
              </Text>
            </View>
          ) : (
            <FlatList
              data={analysisHistory}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.historyItem,
                    { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
                  ]}
                  onPress={() => handleAnalysisClick(item)}
                >
                  <View style={styles.historyContent}>
                    <Text style={[
                      styles.historyTitle,
                      { color: isDark ? '#FFFFFF' : '#000000' }
                    ]}>
                      {item.documentTitle}
                    </Text>
                    <Text style={[
                      styles.analysisType,
                      { color: isDark ? '#0A84FF' : '#007AFF' }
                    ]}>
                      {getAnalysisTypeLabel(item.analysisType)}
                    </Text>
                    <Text style={[
                      styles.historyPreview,
                      { color: isDark ? '#8E8E93' : '#8E8E93' }
                    ]}>
                      {item.summary}
                    </Text>
                  </View>
                  <View style={styles.historyMeta}>
                    <Clock size={16} color={isDark ? '#8E8E93' : '#8E8E93'} />
                    <Text style={[
                      styles.historyDate,
                      { color: isDark ? '#8E8E93' : '#8E8E93' }
                    ]}>
                      {formatDate(item.createdAt)}
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  historyItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  analysisType: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  historyPreview: {
    fontSize: 14,
    lineHeight: 20,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
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
