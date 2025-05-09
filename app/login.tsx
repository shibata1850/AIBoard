import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../components/AuthProvider';
import { useTheme } from '../components/ThemeProvider';
import { Alert as RNAlert } from 'react-native';
import { Logo } from '../components/Logo';

export default function LoginScreen() {
  const { signIn, isLoading, error } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }
    
    console.log('Login attempt with:', { email });
    
    try {
      setIsSubmitting(true);
      console.log('Calling signIn function...');
      await signIn(email, password);
      console.log('SignIn successful, redirecting...');
      router.replace('/');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'ログインエラー',
        error instanceof Error ? error.message : '認証に失敗しました。もう一度お試しください。'
      );
      console.error('Authentication error details:', error);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
    ]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Logo size="large" />
            <Text style={[
              styles.title,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              AIボード
            </Text>
            <Text style={[
              styles.subtitle,
              { color: isDark ? '#8E8E93' : '#8E8E93' }
            ]}>
              中小企業向け財務分析・アドバイスツール
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={[
              styles.inputContainer,
              { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }
            ]}>
              <TextInput
                style={[
                  styles.input,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}
                placeholder="メールアドレス"
                placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            
            <View style={[
              styles.inputContainer,
              { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }
            ]}>
              <TextInput
                style={[
                  styles.input,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}
                placeholder="パスワード"
                placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            {error && (
              <Text style={styles.errorText}>
                {error}
              </Text>
            )}
            
            <TouchableOpacity
              style={[
                styles.loginButton,
                { backgroundColor: isDark ? '#0A84FF' : '#007AFF' },
                (isLoading || isSubmitting) && styles.disabledButton
              ]}
              onPress={handleLogin}
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>ログイン</Text>
              )}
            </TouchableOpacity>
            
            {/* Sign Up Link */}
            <View style={styles.signupLinkContainer}>
              <Text style={[
                styles.signupLinkText,
                { color: isDark ? '#8E8E93' : '#8E8E93' }
              ]}>
                アカウントをお持ちでないですか？
              </Text>
              <Link href="/signup" asChild>
                <TouchableOpacity>
                  <Text style={[
                    styles.signupLink,
                    { color: isDark ? '#0A84FF' : '#007AFF' }
                  ]}>
                    新規登録
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    fontSize: 16,
  },
  errorText: {
    color: '#FF453A',
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signupLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupLinkText: {
    fontSize: 14,
    marginRight: 5,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
