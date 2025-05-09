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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../components/AuthProvider';
import { useTheme } from '../components/ThemeProvider';
import { Logo } from '../components/Logo';

export default function SignUpScreen() {
  const { signUp, signInWithGoogle, signInWithApple, isLoading, error } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  async function handleSignUp() {
    if (!email || !password || !name) {
      Alert.alert('エラー', '名前、メールアドレス、パスワードは必須項目です');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const result = await signUp(email, password, {
        name,
        user_type: 'employee',
        role: 'user',
      });
      
      if (result.error && result.error.includes('メールアドレスの確認が必要')) {
        Alert.alert(
          '確認メールを送信しました',
          'アカウント登録を完了するには、メールに記載されたリンクをクリックしてください。',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      } else if (result.user) {
        router.replace('/');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert(
        'アカウント登録エラー',
        error instanceof Error ? error.message : '登録に失敗しました。もう一度お試しください。'
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  
  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
      Alert.alert(
        'Googleログインエラー',
        error instanceof Error ? error.message : 'Googleログインに失敗しました。もう一度お試しください。'
      );
    }
  }
  
  async function handleAppleSignIn() {
    try {
      await signInWithApple();
    } catch (error) {
      console.error('Apple sign in error:', error);
      Alert.alert(
        'Appleログインエラー',
        error instanceof Error ? error.message : 'Appleログインに失敗しました。もう一度お試しください。'
      );
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
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
              <Text style={[
                styles.formTitle,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                新規アカウント登録
              </Text>
              
              {/* Name Input */}
              <View style={[
                styles.inputContainer,
                { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }
              ]}>
                <TextInput
                  style={[
                    styles.input,
                    { color: isDark ? '#FFFFFF' : '#000000' }
                  ]}
                  placeholder="お名前"
                  placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
                  value={name}
                  onChangeText={setName}
                />
              </View>
              
              {/* Email Input */}
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
              
              {/* Password Input */}
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
              
              {/* Company Input (Optional) */}
              <View style={[
                styles.inputContainer,
                { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }
              ]}>
                <TextInput
                  style={[
                    styles.input,
                    { color: isDark ? '#FFFFFF' : '#000000' }
                  ]}
                  placeholder="会社名（任意）"
                  placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
                  value={company}
                  onChangeText={setCompany}
                />
              </View>
              
              {/* Position Input (Optional) */}
              <View style={[
                styles.inputContainer,
                { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }
              ]}>
                <TextInput
                  style={[
                    styles.input,
                    { color: isDark ? '#FFFFFF' : '#000000' }
                  ]}
                  placeholder="役職（任意）"
                  placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
                  value={position}
                  onChangeText={setPosition}
                />
              </View>
              
              {error && (
                <Text style={styles.errorText}>
                  {error}
                </Text>
              )}
              
              {/* Sign Up Button */}
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: isDark ? '#0A84FF' : '#007AFF' },
                  (isLoading || isSubmitting) && styles.disabledButton
                ]}
                onPress={handleSignUp}
                disabled={isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>アカウント登録</Text>
                )}
              </TouchableOpacity>
              
              {/* Social Login Divider */}
              <View style={styles.dividerContainer}>
                <View style={[
                  styles.divider,
                  { backgroundColor: isDark ? '#333333' : '#E5E5EA' }
                ]} />
                <Text style={[
                  styles.dividerText,
                  { color: isDark ? '#8E8E93' : '#8E8E93' }
                ]}>
                  または
                </Text>
                <View style={[
                  styles.divider,
                  { backgroundColor: isDark ? '#333333' : '#E5E5EA' }
                ]} />
              </View>
              
              {/* Google Sign In Button */}
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }
                ]}
                onPress={handleGoogleSignIn}
              >
                <Text style={[
                  styles.socialButtonText,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  Googleでログイン
                </Text>
              </TouchableOpacity>
              
              {/* Apple Sign In Button */}
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }
                ]}
                onPress={handleAppleSignIn}
              >
                <Text style={[
                  styles.socialButtonText,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  Appleでログイン
                </Text>
              </TouchableOpacity>
              
              {/* Login Link */}
              <View style={styles.loginLinkContainer}>
                <Text style={[
                  styles.loginLinkText,
                  { color: isDark ? '#8E8E93' : '#8E8E93' }
                ]}>
                  すでにアカウントをお持ちですか？
                </Text>
                <Link href="/login" asChild>
                  <TouchableOpacity>
                    <Text style={[
                      styles.loginLink,
                      { color: isDark ? '#0A84FF' : '#007AFF' }
                    ]}>
                      ログイン
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  button: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
  },
  socialButton: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginLinkText: {
    fontSize: 14,
    marginRight: 5,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
