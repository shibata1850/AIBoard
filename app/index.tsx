import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '../components/ThemeProvider';

import { AuthWrapper } from '../components/AuthWrapper';
import { DirectFileAnalysis } from '../components/DirectFileAnalysis';

export default function HomePage() {
  const { isDark } = useTheme();
  
  return (
    <AuthWrapper>
      <SafeAreaView style={[
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
          

        </ScrollView>
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
  fileAnalysisContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  chatContainer: {
    flex: 1,
    marginTop: 16,
  },
});
