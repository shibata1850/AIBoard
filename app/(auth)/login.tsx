import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../components/AuthProvider';
import { Logo } from '../../components/Logo';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signIn, isLoading, error: authError } = useAuth();

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    try {
      setError(null);
      await signIn(email, password);
    } catch (err) {
      console.error('Login error:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('Invalid login credentials')) {
          setError('メールアドレスまたはパスワードが正しくありません');
        } else if (err.message.includes('Email not confirmed')) {
          setError('メールアドレスの確認が必要です。メールをご確認ください');
        } else if (err.message.includes('rate limit')) {
          setError('ログイン試行回数が多すぎます。しばらく時間をおいてから再度お試しください');
        } else {
          setError(err.message);
        }
      } else {
        setError('ログインに失敗しました。もう一度お試しください');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo size={100} />
        <Text style={styles.title}>AIボード</Text>
        <Text style={styles.subtitle}>中小企業向け財務分析・アドバイスツール</Text>
      </View>

      <View style={styles.formContainer}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.label}>メールアドレス</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="メールアドレスを入力"
          autoCapitalize="none"
          keyboardType="email-address"
          accessibilityLabel="メールアドレス入力欄"
        />

        <Text style={styles.label}>パスワード</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="パスワードを入力"
          secureTextEntry
          accessibilityLabel="パスワード入力欄"
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          accessibilityLabel="ログインボタン"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>ログイン</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>アカウントをお持ちでない方は</Text>
          <Link href="/signup" asChild>
            <TouchableOpacity accessibilityLabel="新規登録リンク">
              <Text style={styles.signupLink}>新規登録</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: Platform.OS === 'web' ? 12 : 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#0A84FF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#99c5ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  signupText: {
    color: '#666',
    marginRight: 5,
  },
  signupLink: {
    color: '#0A84FF',
    fontWeight: '600',
  },
});
