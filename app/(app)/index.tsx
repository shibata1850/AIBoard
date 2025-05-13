import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ChatScreen from '../../components/ChatScreen';
import { useTheme } from '../../components/ThemeProvider';
import { DirectFileAnalysis } from '../../components/DirectFileAnalysis';

export default function MainChatScreen() {
  const { isDark } = useTheme();
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
    ]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            { color: isDark ? '#FFFFFF' : '#333333' }
          ]}>AIボード</Text>
          <Text style={[
            styles.subtitle,
            { color: isDark ? '#CCCCCC' : '#666666' }
          ]}>中小企業向け財務分析・アドバイスツール</Text>
        </View>
        
        <View style={styles.fileAnalysisContainer}>
          <DirectFileAnalysis />
        </View>
        
        <View style={styles.chatContainer}>
          <ChatScreen />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  fileAnalysisContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  chatContainer: {
    flex: 1,
    marginTop: 16,
  },
});
