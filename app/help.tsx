import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../components/ThemeProvider';
import { AuthWrapper } from '../components/AuthWrapper';
import { ChevronRight, HelpCircle, MessageSquare, FileText, BookMarked, Users } from 'lucide-react-native';

export default function HelpPage() {
  const { isDark } = useTheme();
  
  const helpSections = [
    {
      id: 'chat',
      title: 'チャット機能',
      icon: <MessageSquare size={24} color={isDark ? '#0A84FF' : '#007AFF'} />,
      description: 'AIとのチャット機能の使い方について説明します。',
    },
    {
      id: 'documents',
      title: '書類分析',
      icon: <FileText size={24} color={isDark ? '#0A84FF' : '#007AFF'} />,
      description: '財務書類のアップロードと分析方法について説明します。',
    },
    {
      id: 'prompts',
      title: 'プロンプト管理',
      icon: <BookMarked size={24} color={isDark ? '#0A84FF' : '#007AFF'} />,
      description: 'よく使うプロンプトの保存と管理方法について説明します。',
    },
    {
      id: 'groups',
      title: 'グループ機能',
      icon: <Users size={24} color={isDark ? '#0A84FF' : '#007AFF'} />,
      description: 'チームでの共同作業のためのグループ機能について説明します。',
    },
  ];

  return (
    <AuthWrapper>
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}>
        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <HelpCircle size={48} color={isDark ? '#0A84FF' : '#007AFF'} />
            <Text style={[
              styles.title,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              AIボードヘルプセンター
            </Text>
            <Text style={[
              styles.subtitle,
              { color: isDark ? '#8E8E93' : '#8E8E93' }
            ]}>
              AIボードの使い方について説明します
            </Text>
          </View>

          <View style={styles.sectionsContainer}>
            {helpSections.map((section) => (
              <TouchableOpacity
                key={section.id}
                style={[
                  styles.sectionItem,
                  { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
                ]}
                onPress={() => {
                }}
              >
                <View style={styles.sectionIcon}>
                  {section.icon}
                </View>
                <View style={styles.sectionContent}>
                  <Text style={[
                    styles.sectionTitle,
                    { color: isDark ? '#FFFFFF' : '#000000' }
                  ]}>
                    {section.title}
                  </Text>
                  <Text style={[
                    styles.sectionDescription,
                    { color: isDark ? '#8E8E93' : '#8E8E93' }
                  ]}>
                    {section.description}
                  </Text>
                </View>
                <ChevronRight size={20} color={isDark ? '#8E8E93' : '#8E8E93'} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={[
            styles.contactContainer,
            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
          ]}>
            <Text style={[
              styles.contactTitle,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              お問い合わせ
            </Text>
            <Text style={[
              styles.contactText,
              { color: isDark ? '#8E8E93' : '#8E8E93' }
            ]}>
              ご質問やご不明点がございましたら、以下のメールアドレスまでお問い合わせください。
            </Text>
            <Text style={[
              styles.contactEmail,
              { color: isDark ? '#0A84FF' : '#007AFF' }
            ]}>
              support@aiboard.jp
            </Text>
          </View>

          <View style={styles.versionContainer}>
            <Text style={[
              styles.versionText,
              { color: isDark ? '#8E8E93' : '#8E8E93' }
            ]}>
              バージョン 1.0.0
            </Text>
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
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  sectionsContainer: {
    padding: 16,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 16,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
  },
  contactContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    marginBottom: 8,
  },
  contactEmail: {
    fontSize: 16,
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 24,
  },
  versionText: {
    fontSize: 14,
  },
});
