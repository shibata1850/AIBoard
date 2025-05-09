import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from './AuthProvider';

interface AuthWrapperProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export function AuthWrapper({ children, requiredRole = 'user' }: AuthWrapperProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
