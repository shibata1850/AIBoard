import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import {
  MessageSquare,
  History,
  FileText,
  BookMarked,
  CircleHelp,
  Settings,
  BarChart,
} from 'lucide-react-native';
import { useTheme } from '../../components/ThemeProvider';

export default function AppLayout() {
  const { isDark } = useTheme();
  
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDark ? '#000' : '#fff',
            borderTopWidth: 1,
            borderTopColor: isDark ? '#1c1c1e' : 'rgba(0, 0, 0, 0.1)',
            height: 64,
            paddingBottom: Platform.select({ web: 12, default: 8 }),
            paddingTop: Platform.select({ web: 12, default: 8 }),
          },
          tabBarActiveTintColor: isDark ? '#0A84FF' : '#007AFF',
          tabBarInactiveTintColor: isDark ? '#666' : '#8E8E93',
          tabBarLabelStyle: {
            fontSize: Platform.select({ web: 13, default: 11 }),
            fontWeight: '500',
            marginBottom: 4,
            marginTop: 4,
            color: isDark ? '#fff' : '#000',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'メインチャット',
            tabBarIcon: ({ size, color }) => <MessageSquare size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: '分析履歴',
            tabBarIcon: ({ size, color }) => <History size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="analysis"
          options={{
            title: '経営資料分析',
            tabBarIcon: ({ size, color }) => <BarChart size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="documents"
          options={{
            title: '書類',
            tabBarIcon: ({ size, color }) => <FileText size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="myprompts"
          options={{
            title: 'マイプロンプト',
            tabBarIcon: ({ size, color }) => <BookMarked size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="help"
          options={{
            title: 'ヘルプ',
            tabBarIcon: ({ size, color }) => <CircleHelp size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: '設定',
            tabBarIcon: ({ size, color }) => <Settings size={size} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
