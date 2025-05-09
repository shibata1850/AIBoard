import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../components/ThemeProvider';
import ChatScreen from '../components/ChatScreen';
import { AuthWrapper } from '../components/AuthWrapper';

export default function HomePage() {
  const { isDark } = useTheme();
  
  return (
    <AuthWrapper>
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}>
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
        
        <View style={styles.chatContainer}>
          <ChatScreen />
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
  chatContainer: {
    flex: 1,
  },
});
