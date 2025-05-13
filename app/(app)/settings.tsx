import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../components/ThemeProvider';
import { useAuth } from '../../components/AuthProvider';
import { AuthWrapper } from '../../components/AuthWrapper';
import { Moon, Sun, LogOut, User, Shield, Bell, Globe } from 'lucide-react-native';

export default function SettingsPage() {
  const { isDark, themeMode, setThemeMode } = useTheme();
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('ja');

  const handleSignOut = async () => {
    console.log('Settings: handleSignOut called');
    try {
      if (typeof signOut !== 'function') {
        console.error('Settings: signOut is not a function:', typeof signOut);
        Alert.alert('エラー', 'ログアウト機能が正しく設定されていません');
        return;
      }
      
      console.log('Settings: Calling signOut function');
      await signOut();
      console.log('Settings: signOut succeeded');
    } catch (error) {
      console.error('Settings: signOut error:', error);
      Alert.alert('エラー', 'ログアウト中にエラーが発生しました');
    }
  };

  const confirmSignOut = () => {
    console.log('Settings: confirmSignOut called');
    Alert.alert(
      'ログアウトの確認',
      'ログアウトしてもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'ログアウト', onPress: () => {
          console.log('Settings: Logout button pressed');
          handleSignOut();
        }}
      ]
    );
  };

  return (
    <AuthWrapper>
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}>
        <View style={styles.content}>
          <View style={styles.userSection}>
            <View style={[
              styles.userAvatar,
              { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }
            ]}>
              <User size={32} color={isDark ? '#FFFFFF' : '#000000'} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[
                styles.userName,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                {user?.name || 'ユーザー'}
              </Text>
              <Text style={[
                styles.userEmail,
                { color: isDark ? '#8E8E93' : '#8E8E93' }
              ]}>
                {user?.email || ''}
              </Text>
              <View style={styles.userRole}>
                <Shield size={14} color={isDark ? '#0A84FF' : '#007AFF'} />
                <Text style={[
                  styles.userRoleText,
                  { color: isDark ? '#0A84FF' : '#007AFF' }
                ]}>
                  {user?.role === 'admin' ? '管理者' : 'ユーザー'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionTitle}>
            <Text style={[
              styles.sectionTitleText,
              { color: isDark ? '#8E8E93' : '#8E8E93' }
            ]}>
              アプリ設定
            </Text>
          </View>

          <View style={[
            styles.settingsGroup,
            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
          ]}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  {isDark ? (
                    <Moon size={22} color="#0A84FF" />
                  ) : (
                    <Sun size={22} color="#FF9500" />
                  )}
                </View>
                <Text style={[
                  styles.settingText,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  ダークモード
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
                trackColor={{ false: '#767577', true: '#0A84FF' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[
              styles.separator,
              { backgroundColor: isDark ? '#38383A' : '#E5E5EA' }
            ]} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Bell size={22} color={isDark ? '#FF9F0A' : '#FF9500'} />
                </View>
                <Text style={[
                  styles.settingText,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  通知
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: '#0A84FF' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[
              styles.separator,
              { backgroundColor: isDark ? '#38383A' : '#E5E5EA' }
            ]} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                setLanguage(language === 'ja' ? 'en' : 'ja');
              }}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Globe size={22} color={isDark ? '#5E5CE6' : '#5856D6'} />
                </View>
                <Text style={[
                  styles.settingText,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  言語
                </Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[
                  styles.settingValue,
                  { color: isDark ? '#8E8E93' : '#8E8E93' }
                ]}>
                  {language === 'ja' ? '日本語' : 'English'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.signOutButton,
              { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
            ]}
            onPress={confirmSignOut}
          >
            <LogOut size={22} color={isDark ? '#FF453A' : '#FF3B30'} />
            <Text style={[
              styles.signOutText,
              { color: isDark ? '#FF453A' : '#FF3B30' }
            ]}>
              ログアウト
            </Text>
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
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  userRole: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRoleText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  sectionTitle: {
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  settingsGroup: {
    borderRadius: 12,
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
  },
  settingRight: {},
  settingValue: {
    fontSize: 16,
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
